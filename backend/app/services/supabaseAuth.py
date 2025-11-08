from supabase import create_client, Client

class SupabaseAuth():
    _client_cache = {}

    def create_client(self, supabase_key, supabase_url):
        cache_key = (supabase_url, supabase_key)
        if cache_key in self._client_cache:
            return self._client_cache[cache_key]
        supabase: Client = create_client(supabase_url, supabase_key)
        self._client_cache[cache_key] = supabase
        return supabase
