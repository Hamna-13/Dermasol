# utils/auth_admin.py
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

admin = create_client(SUPABASE_URL, SERVICE_KEY)

def delete_auth_user(user_id: str):
    # supabase-py v2 supports admin auth via:
    return admin.auth.admin.delete_user(user_id)