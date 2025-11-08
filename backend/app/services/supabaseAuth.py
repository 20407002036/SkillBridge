from supabase import create_client, Client

class SupabaseAuth():
    def create_client(self, supabase_key, supabase_url):
        supabase: Client = create_client(supabase_url, supabase_key)

        return supabase
