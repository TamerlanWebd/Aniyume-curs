import asyncio
import httpx
from anicli_api.source.animego import Extractor

async def main():
    print("1. Fetching fresh video URL...")
    extractor = Extractor()
    results = await extractor.a_search("Shinma Maou no Testament BURST")
    if not results:
        print("No results found")
        return

    anime = await results[0].a_get_anime()
    episodes = anime.get_episodes()
    if not episodes:
        print("No episodes found")
        return

    sources = await episodes[0].a_get_sources()
    if not sources:
        print("No sources found")
        return

    videos = await sources[0].a_get_videos()
    if not videos:
        print("No videos found")
        return

    # Find a 1080p or best quality video
    target_video = videos[0]
    for v in videos:
        if '1080' in str(v.quality):
            target_video = v
            break
    
    video_url = target_video.url
    print(f"Found video URL: {video_url}")

    print("\n2. Testing Proxy with this URL...")
    proxy_url = "http://localhost:9000/proxy"
    
    async with httpx.AsyncClient() as client:
        try:
            # Try to get the first 100 bytes
            headers = {"Range": "bytes=0-100"}
            response = await client.get(proxy_url, params={"url": video_url}, headers=headers)
            
            print(f"Proxy Status: {response.status_code}")
            print(f"Proxy Headers: {response.headers}")
            print(f"Proxy Content Length: {len(response.content)}")
            
            if response.status_code in [200, 206]:
                print("SUCCESS: Proxy is working!")
            else:
                print("FAILURE: Proxy returned error.")
                print(f"Response body: {response.text}")
                
        except Exception as e:
            print(f"Error calling proxy: {e}")

if __name__ == "__main__":
    asyncio.run(main())
