import requests
import time

def test_title(title):
    print(f"Testing title: {title}")
    start = time.time()
    try:
        url = f"http://127.0.0.1:9000/streams?title={title}"
        print(f"Requesting: {url}")
        response = requests.get(url, timeout=120) # 2 minute timeout
        duration = time.time() - start
        print(f"Status: {response.status_code}")
        print(f"Duration: {duration:.2f}s")
        if response.status_code != 200:
            print(f"Error: {response.text[:500]}")
        else:
            print("Success!")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_title("Naruto")
    print("-" * 20)
    test_title("Tokyo Ghoul")
    print("-" * 20)
    test_title("Shingeki no Kyojin")
