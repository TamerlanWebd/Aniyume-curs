from anicli_api.source.animego import Extractor
import asyncio

async def test_search(query):
    extractor = Extractor()
    print(f"Searching for: '{query}'")
    results = await extractor.a_search(query)
    
    print(f"Found {len(results)} results:")
    for i, res in enumerate(results):
        print(f"{i}: {res.title} (URL: {res.url})")

if __name__ == "__main__":
    print("--- Testing Death Note ---")
    asyncio.run(test_search("Death Note"))
    print("\n--- Testing One Piece ---")
    asyncio.run(test_search("One Piece"))
    print("\n--- Testing Kimetsu no Yaiba ---")
    asyncio.run(test_search("Kimetsu no Yaiba"))
