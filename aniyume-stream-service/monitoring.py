from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, APIRouter, Response
import time

router = APIRouter()

# Метрики
requests_total = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
request_duration = Histogram('request_duration_seconds', 'Request duration')
errors_total = Counter('errors_total', 'Total errors', ['type'])

async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    try:
        response = await call_next(request)
        requests_total.labels(method=request.method, endpoint=request.url.path).inc()
        duration = time.time() - start_time
        request_duration.observe(duration)
        return response
    except Exception as e:
        errors_total.labels(type=type(e).__name__).inc()
        raise

# Эндпоинт метрик
@router.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
