import asyncio
from anicli_api.source.animego import Extractor

async def main():
    print("Initializing Extractor...")
    extractor = Extractor()
    
    search_term = "Shinma Maou no Testament BURST"
    print(f"Searching for '{search_term}'...")
    
    try:
        # Try async search
        results = await extractor.a_search(search_term)
        print(f"Search results type: {type(results)}")
        if results:
            print(f"Found {len(results)} results.")
            anime_card = results[0]
            print(f"First result type: {type(anime_card)}")
            
            print("Getting anime details...")
            anime_details = await anime_card.a_get_anime()
            print(f"Anime details type: {type(anime_details)}")
            
            episodes = anime_details.get_episodes()
            print(f"Episodes type: {type(episodes)}")
            print(f"Episodes count: {len(episodes)}")
            
            if episodes:
                ep = episodes[0]
                print(f"First episode type: {type(ep)}")
                
                print("Getting sources for first episode...")
                try:
                    # Try async get_sources
                    sources = await ep.a_get_sources()
                    print(f"Sources (async) type: {type(sources)}")
                    print(f"Sources count: {len(sources)}")
                    if sources:
                        print(f"First source: {sources[0]}")
                        print("Getting videos from first source...")
                        try:
                            videos = await sources[0].a_get_videos()
                            print(f"Videos type: {type(videos)}")
                            print(f"Videos count: {len(videos)}")
                            for v in videos:
                                print(f"Video: {v.url} ({v.quality})")
                        except Exception as ve:
                            print(f"Error getting videos: {ve}")
                except AttributeError:
                    print("a_get_sources method not found. Trying sync get_sources...")
                    sources = ep.get_sources()
                    print(f"Sources (sync) type: {type(sources)}")
                except Exception as e:
                    print(f"Error getting sources: {e}")
                    
    except Exception as e:
        print(f"Global error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
