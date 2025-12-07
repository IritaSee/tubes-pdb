from supabase import create_client, Client
from backend.config import get_config

config = get_config()

# Initialize Supabase client
supabase: Client = create_client(
    config.SUPABASE_URL,
    config.SUPABASE_KEY
)

# Service role client for admin operations (bypasses RLS)
supabase_admin: Client = create_client(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY
)

def get_supabase_client() -> Client:
    """Get standard Supabase client"""
    return supabase

def get_supabase_admin() -> Client:
    """Get admin Supabase client with service role key"""
    return supabase_admin
