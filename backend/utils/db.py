from supabase import create_client, Client
from backend.config import get_config

# Lazy initialization to avoid errors on import
_supabase_client = None
_supabase_admin_client = None

def get_supabase_client() -> Client:
    """Get standard Supabase client (lazy initialization)"""
    global _supabase_client
    if _supabase_client is None:
        config = get_config()
        _supabase_client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_KEY
        )
    return _supabase_client

def get_supabase_admin() -> Client:
    """Get admin Supabase client with service role key (lazy initialization)"""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        config = get_config()
        _supabase_admin_client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_SERVICE_KEY
        )
    return _supabase_admin_client
