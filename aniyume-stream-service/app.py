from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from anicli_api.source.animego import Extractor
from difflib import SequenceMatcher

app = FastAPI(title="Aniyume Streams Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

extractor = Extractor()

class StreamingEpisode(BaseModel):
    title: str
    num: str
    url: str
    quality: Optional[str] = "default"
    original_url: Optional[str] = ""

class StreamingResponseModel(BaseModel):
    anime_title: str
    streaming_episodes: List[StreamingEpisode]

def find_best_match(results, query):
    if not results:
        return None
        
    best_match = results[0]
    highest_ratio = 0
    
    # Simple normalization
    query_norm = query.lower()
    
    for res in results:
        title_norm = res.title.lower()
        
        # Exact substring match preference
        if query_norm == title_norm:
            return res
            
        ratio = SequenceMatcher(None, query_norm, title_norm).ratio()
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match = res
            
    return best_match

async def get_anime_episodes(title: str):
    results = await extractor.a_search(title)
    if not results:
        raise HTTPException(status_code=404, detail="Anime not found")

    # Smart matching
    anime_card = find_best_match(results, title)
    anime_details = await anime_card.a_get_anime()
    episodes = anime_details.get_episodes()
    return anime_details, episodes

async def resolve_video_url(episode):
    sources = await episode.a_get_sources()
    if not sources:
        return "", "no_sources"
        
    first_source = sources[0]
    videos = await first_source.a_get_videos()
    
    if not videos:
        return "", "no_videos"
        
    def quality_score(v):
        q = str(v.quality).lower()
        if '1080' in q: return 1080
        if '720' in q: return 720
        if '480' in q: return 480
        if '360' in q: return 360
        if '240' in q: return 240
        if '144' in q: return 144
        return 0
    
    videos.sort(key=quality_score, reverse=True)
    best_video = videos[0]
    return best_video.url, str(best_video.quality)

@app.get("/streams", response_model=StreamingResponseModel)
async def get_streams(title: str = Query(..., description="Anime title")):
    try:
        anime_details, episodes = await get_anime_episodes(title)
        
        items: List[StreamingEpisode] = []
        
        # Process first episode fully so player can start
        # Use simple iteration for others to avoid blocking
        for i, ep in enumerate(episodes):
            url = ""
            quality = "default"
            
            # Only resolve first episode to speed up loading
            if i == 0:
                try:
                    url, quality = await resolve_video_url(ep)
                except Exception as e:
                    print(f"Error resolving first episode: {e}")
                    
            items.append(
                StreamingEpisode(
                    title=ep.title or f"Episode {ep.num}",
                    num=str(ep.num),
                    url=url,
                    original_url=url,
                    quality=quality
                )
            )

        return StreamingResponseModel(
            anime_title=anime_details.title,
            streaming_episodes=items
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stream/episode")
async def get_episode_stream(title: str = Query(...), episode_num: str = Query(...)):
    try:
        # Re-fetch logic (stateless)
        _, episodes = await get_anime_episodes(title)
        
        target_ep = None
        for ep in episodes:
            if str(ep.num) == episode_num:
                target_ep = ep
                break
                
        if not target_ep:
            raise HTTPException(status_code=404, detail="Episode not found")
            
        url, quality = await resolve_video_url(target_ep)
        
        return {
            "url": url,
            "quality": quality,
            "num": episode_num
        }

    except Exception as e:
        print(f"Error resolving episode: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "aniyume-streams"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)