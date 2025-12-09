import redis
import pickle
from typing import Optional, Any
import os
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        try:
            # decode_responses=False ensures we get bytes for pickle
            self.redis_client = redis.from_url(redis_url, decode_responses=False)
            self.redis_client.ping()
            self.use_redis = True
            print("✅ Redis connected (Pickle mode)")
        except Exception as e:
            self.use_redis = False
            self.memory_cache = {}
            print(f"⚠️ Redis unavailable, using memory cache. Error: {e}")
    
    def get(self, key: str) -> Optional[Any]:
        try:
            if self.use_redis:
                data = self.redis_client.get(key)
                return pickle.loads(data) if data else None
            return self.memory_cache.get(key)
        except Exception as e:
            print(f"❌ Cache GET error: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 3600):
        try:
            if self.use_redis:
                # Store as bytes
                self.redis_client.setex(key, ttl_seconds, pickle.dumps(value))
            else:
                self.memory_cache[key] = value
        except Exception as e:
            print(f"❌ Cache SET error: {e}")
            # Don't crash main thread if cache fails
    
    def delete(self, key: str):
        if self.use_redis:
            self.redis_client.delete(key)
        else:
            self.memory_cache.pop(key, None)
    
    def clear_all(self):
        if self.use_redis:
            self.redis_client.flushdb()
        else:
            self.memory_cache.clear()

cache = CacheManager()
