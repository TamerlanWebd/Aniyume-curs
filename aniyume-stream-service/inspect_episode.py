from anicli_api.source.animego import Extractor
import asyncio

async def inspect_episode():
    extractor = Extractor()
    results = await extractor.a_search("Death Note")
    # Let's find the real Death Note
    target = None
    for res in results:
        if "Тетрадь смерти" in res.title or "Death Note" in res.title:
            target = res
            break
            
    if not target:
        print("Could not find Death Note in results")
        return

    print(f"Selected: {target.title}")
    anime = await target.a_get_anime()
    episodes = anime.get_episodes()
    
    if episodes:
        ep = episodes[0]
        print(f"First Episode: {ep}")
        print(f"Attributes: {dir(ep)}")
        # Check if we can get a direct link or ID
        # usually they have .url or similar
        print(f"Num: {ep.num}")
        print(f"Title: {ep.title}")

if __name__ == "__main__":
    asyncio.run(inspect_episode())
