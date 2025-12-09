from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from anicli_api.source.animego import Extractor
from difflib import SequenceMatcher
import asyncio
import re
from datetime import datetime, timedelta
from collections import OrderedDict
import logging
from cache_manager import cache
from monitoring import router as monitoring_router, metrics_middleware

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aniyume Streams Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Monitoring
app.include_router(monitoring_router)
app.middleware("http")(metrics_middleware)

extractor = Extractor()

# ========== MODELS ==========
class StreamingEpisode(BaseModel):
    title: str
    num: str
    url: str
    quality: Optional[str] = "default"
    duration: Optional[int] = 0
    thumbnail: Optional[str] = ""
    ready: bool = False

class StreamingResponseModel(BaseModel):
    anime_title: str
    total_episodes: int
    streaming_episodes: List[StreamingEpisode]
    load_time: float

# ========== SMART SEARCH ==========
def normalize_title(title: str) -> str:
    """Нормализация названия"""
    title = title.lower().strip()
    title = re.sub(r'\s+', ' ', title)
    title = re.sub(r'[^\w\s]', '', title)
    return title

def is_movie(title: str) -> bool:
    """Определение фильма"""
    movie_keywords = [
        'фильм', 'movie', 'film', 'поезд', 'бесконечный',
        'train', 'infinity', 'муген', 'mugen', 'часть', 'part'
    ]
    return any(kw in title.lower() for kw in movie_keywords)

def calculate_similarity(query: str, title: str) -> float:
    """Улучшенный расчет схожести"""
    query_norm = normalize_title(query)
    title_norm = normalize_title(title)
    
    # Штраф за фильм если ищется сериал
    penalty = 0.3 if is_movie(title) and not is_movie(query) else 0
    
    # Базовая схожесть
    base_ratio = SequenceMatcher(None, query_norm, title_norm).ratio()
    
    # Бонус за совпадение слов
    query_words = set(query_norm.split())
    title_words = set(title_norm.split())
    word_overlap = len(query_words & title_words) / max(len(query_words), 1)
    
    return max(0, (base_ratio * 0.6 + word_overlap * 0.4) - penalty)

def find_best_match(results, query):
    """Умный выбор лучшего результата"""
    if not results:
        return None
    
    scored = [(res, calculate_similarity(query, res.title)) for res in results]
    scored.sort(key=lambda x: x[1], reverse=True)
    
    logger.info(f"🔍 Search results for '{query}':")
    for res, score in scored[:3]:
        logger.info(f"  • {res.title} - Score: {score:.2f}")
    
    best_match, best_score = scored[0]
    
    # Если лучший результат - фильм с низкой оценкой, ищем сериал
    if is_movie(best_match.title) and best_score < 0.8:
        for res, score in scored:
            if not is_movie(res.title) and score > 0.5:
                logger.info(f"✅ Selected series over movie: {res.title}")
                return res
    
    logger.info(f"✅ Selected: {best_match.title}")
    return best_match

# ========== CORE FUNCTIONS ==========
async def get_anime_episodes(title: str):
    """Получение эпизодов с Redis кэшированием (Safe Mode)"""
    # Caching removed for anime objects due to pickle serialization issues with RLock
    # cache_key = f"anime:{normalize_title(title)}"
    # try:
    #     cached = cache.get(cache_key)
    #     if cached:
    #         logger.info(f"⚡ Redis Cache HIT for: {title}")
    #         return cached
    # except Exception as e:
    #     logger.error(f"⚠️ Cache GET failed: {e}")
    
    logger.info(f"🔄 Fetching anime: {title}")
    results = await extractor.a_search(title)
    
    if not results:
        raise HTTPException(status_code=404, detail="Anime not found")
    
    anime_card = find_best_match(results, title)
    anime_details = await anime_card.a_get_anime()
    episodes = anime_details.get_episodes()
    
    result = (anime_details, episodes)
    
    # Caching of complex objects is disabled
    # try:
    #     cache.set(cache_key, result, ttl_seconds=7200)
    #     logger.info(f"📦 Cached {len(episodes)} episodes for: {anime_details.title}")
    # except Exception as e:
    #     logger.error(f"⚠️ Cache SET failed (Serialization Error): {e}")
    
    return result

async def resolve_video_url_fast(episode, title: str, ep_num: str):
    """Быстрое разрешение URL с кэшированием (Safe Mode)"""
    cache_key = f"video:{normalize_title(title)}:{ep_num}"
    
    try:
        cached = cache.get(cache_key)
        if cached:
            logger.info(f"⚡ Video cache HIT: EP{ep_num}")
            return tuple(cached) if isinstance(cached, list) else cached
    except Exception as e:
        logger.error(f"⚠️ Cache GET failed: {e}")
    
    logger.info(f"🎬 Resolving video: EP{ep_num}")
    
    try:
        sources = await episode.a_get_sources()
        if not sources:
            return "", "no_sources"
        
        videos = await sources[0].a_get_videos()
        if not videos:
            return "", "no_videos"
        
        # Сортировка по качеству
        def quality_score(v):
            q = str(v.quality).lower()
            scores = {'1080': 1080, '720': 720, '480': 480, '360': 360, '240': 240}
            for key, val in scores.items():
                if key in q:
                    return val
            return 0
        
        videos.sort(key=quality_score, reverse=True)
        best = videos[0]
        
        result = (best.url, str(best.quality))
        
        try:
            cache.set(cache_key, result, ttl_seconds=10800)
        except Exception as e:
            logger.error(f"⚠️ Cache SET failed: {e}")
            
        logger.info(f"✅ Resolved EP{ep_num}: {result[1]}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error resolving EP{ep_num}: {e}")
        return "", "error"

# ========== ENDPOINTS ==========
@app.get("/streams", response_model=StreamingResponseModel)
async def get_streams(
    title: str = Query(..., description="Anime title"),
    preload: int = Query(1, ge=0, le=5, description="Number of episodes to preload")
):
    """Основной эндпоинт с предзагрузкой первых эпизодов"""
    start_time = datetime.now()
    
    try:
        anime_details, episodes = await get_anime_episodes(title)
        items: List[StreamingEpisode] = []
        
        # Параллельная загрузка первых N эпизодов
        preload_count = min(preload, len(episodes))
        preload_tasks = []
        
        for i, ep in enumerate(episodes):
            if i < preload_count:
                preload_tasks.append(
                    resolve_video_url_fast(ep, anime_details.title, str(ep.num))
                )
        
        # Ждем загрузки всех preload эпизодов
        preloaded_urls = await asyncio.gather(*preload_tasks, return_exceptions=True)
        
        # Формируем список эпизодов
        for i, ep in enumerate(episodes):
            url = ""
            quality = "default"
            ready = False
            
            if i < preload_count:
                result = preloaded_urls[i]
                if isinstance(result, tuple):
                    url, quality = result
                    ready = bool(url)
            
            items.append(
                StreamingEpisode(
                    title=ep.title or f"Эпизод {ep.num}",
                    num=str(ep.num),
                    url=url,
                    quality=quality,
                    ready=ready,
                    duration=0,
                    thumbnail=""
                )
            )
        
        load_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"⏱️ Total load time: {load_time:.2f}s")
        
        return StreamingResponseModel(
            anime_title=anime_details.title,
            total_episodes=len(items),
            streaming_episodes=items,
            load_time=round(load_time, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in get_streams: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stream/episode")
async def get_episode_stream(
    title: str = Query(...),
    episode_num: str = Query(...)
):
    """Загрузка конкретного эпизода"""
    try:
        logger.info(f"📥 Request: {title} - EP{episode_num}")
        
        _, episodes = await get_anime_episodes(title)
        
        target_ep = next((ep for ep in episodes if str(ep.num) == episode_num), None)
        
        if not target_ep:
            raise HTTPException(status_code=404, detail="Episode not found")
        
        url, quality = await resolve_video_url_fast(target_ep, title, episode_num)
        
        if not url:
            raise HTTPException(status_code=404, detail="Video source unavailable")
        
        return {
            "url": url,
            "quality": quality,
            "num": episode_num,
            "ready": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cache/clear")
async def clear_cache(title: Optional[str] = None):
    """Очистка кэша"""
    if title:
        key = f"anime:{normalize_title(title)}"
        cache.delete(key)
        return {"message": f"Cache cleared for: {title}"}
    
    cache.clear_all()
    return {"message": "All caches cleared"}

@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса"""
    return {
        "status": "ok",
        "service": "aniyume-streams",
        "redis": cache.use_redis
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000, log_level="info")