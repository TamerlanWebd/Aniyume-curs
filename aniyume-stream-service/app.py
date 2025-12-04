from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
# Импортируем парсер AnimeGO (он работает стабильно)
from anicli_api.source.animego import Extractor

app = FastAPI(title="Aniyume Streams Service")

# Инициализируем экстрактор
extractor = Extractor()

class StreamingEpisode(BaseModel):
    title: str
    num: str
    url: str
    quality: Optional[str] = "default"

class StreamingResponse(BaseModel):
    anime_title: str
    streaming_episodes: List[StreamingEpisode]

async def build_streams_by_title(title: str) -> StreamingResponse:
    try:
        # 1. Поиск аниме
        results = await extractor.search(title)
        
        if not results:
            raise HTTPException(status_code=404, detail="Anime not found")

        # Берем первый результат
        anime_card = results[0]
        
        # 2. Получаем детальную информацию
        anime_details = await anime_card.a_get_anime()
        
        items: List[StreamingEpisode] = []
        
        # Получаем список эпизодов
        episodes = anime_details.get_episodes()

        # ОПТИМИЗАЦИЯ: Обрабатываем только первые 3 эпизода для быстрого ответа
        for ep in episodes[:3]:
            try:
                # 3. Получаем ссылки на видео (синхронный метод)
                sources = ep.get_sources()
                
                if not sources:
                    # Если нет источников, добавляем placeholder
                    items.append(
                        StreamingEpisode(
                            title=ep.title or f"Episode {ep.num}",
                            num=str(ep.num),
                            url="",
                            quality="unavailable"
                        )
                    )
                    continue

                # Берем первый доступный плеер
                first_source = sources[0]
                
                items.append(
                    StreamingEpisode(
                        title=ep.title or f"Episode {ep.num}",
                        num=str(ep.num),
                        url=first_source.url,
                        quality=first_source.name
                    )
                )
            except Exception as ep_error:
                print(f"Error processing episode {ep.num}: {ep_error}")
                # Добавляем эпизод с ошибкой
                items.append(
                    StreamingEpisode(
                        title=ep.title or f"Episode {ep.num}",
                        num=str(ep.num),
                        url="",
                        quality="error"
                    )
                )

        if not items:
            raise HTTPException(status_code=404, detail="No episodes found")

        return StreamingResponse(
            anime_title=anime_details.title,
            streaming_episodes=items
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/streams", response_model=StreamingResponse)
async def get_streams(title: str = Query(..., description="Anime title")):
    return await build_streams_by_title(title)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "aniyume-streams"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)