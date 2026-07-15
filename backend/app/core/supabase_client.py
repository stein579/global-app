from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    if not settings.has_supabase:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_KEY is not configured. "
            "Copy backend/.env.example to backend/.env and fill in your project credentials."
        )
    return create_client(settings.supabase_url, settings.supabase_key)
