# Aniyume Stream Service

Python FastAPI service for fetching anime streaming episodes using anicli-api.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/macOS: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running

Start the service:
```bash
uvicorn app:app --host 127.0.0.1 --port 9000
```

The service will be available at `http://127.0.0.1:9000`

## API Endpoints

### GET /streams
Fetch streaming episodes for an anime by title.

**Query Parameters:**
- `title` (required): Anime title (romaji, english, or native)

**Example:**
```bash
curl "http://127.0.0.1:9000/streams?title=Shingeki%20no%20Kyojin"
```

**Response:**
```json
{
  "streaming_episodes": [
    {
      "title": "Episode 1 - To You, 2,000 Years in the Future",
      "thumbnail": null,
      "url": "http://..."
    }
  ]
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "aniyume-streams"
}
```
