import os
import uuid
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

KEY_TO_USE = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
if not SUPABASE_URL or not KEY_TO_USE:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)")

supabase = create_client(SUPABASE_URL, KEY_TO_USE)

BUCKET_NAME = os.getenv("CONSULTATION_BUCKET", "consultation_images")


def _ext_from_content_type(content_type: str) -> str:
    if content_type == "image/png":
        return "png"
    # treat jpg + jpeg same
    return "jpg"


def upload_consultation_image(
    file_bytes: bytes,
    filename: str | None = None,        # ✅ accept filename (optional)
    content_type: str = "image/jpeg",
    user_id: str | None = None,         # ✅ allow user folder routing
) -> tuple[str, str]:
    """
    Upload image to Supabase storage.
    Returns (bucket, path).
    """

    ext = _ext_from_content_type(content_type)

    # keep original name only for reference; storage path uses uuid to avoid collisions
    key = f"{uuid.uuid4()}.{ext}"

    if user_id:
        path = f"{user_id}/{key}"
    else:
        path = key

    supabase.storage.from_(BUCKET_NAME).upload(
        path,
        file_bytes,
        {"content-type": content_type, "upsert": "true"},
    )

    return BUCKET_NAME, path


def get_image_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    res = supabase.storage.from_(bucket).create_signed_url(path, expires_in)
    return res.get("signedURL") or res.get("signedUrl") or res.get("signed_url") or ""

def delete_storage_object(bucket: str, path: str) -> None:
    """
    Uses Supabase Storage API (allowed), not direct SQL deletion.
    Safe to call even if object doesn't exist.
    """
    if not bucket or not path:
        return
    try:
        supabase.storage.from_(bucket).remove([path])
    except Exception:
        # don't fail the whole request if image deletion fails
        pass