import json
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from supabase import create_client

# -----------------------
# CONFIG
# -----------------------

SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"  # use service key, not anon

CHUNKS_PATH = "Dermasol-RAG/chunking/chunks/dermnet_chunks.json"

# -----------------------
# LOAD MODELS
# -----------------------

embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# -----------------------
# LOAD CHUNKS
# -----------------------

with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
    chunks = json.load(f)

print(f"Loaded {len(chunks)} chunks")

# -----------------------
# EMBED & INSERT
# -----------------------

for chunk in tqdm(chunks):
    embedding = embedder.encode(chunk["text"]).tolist()

    record = {
        "id": chunk["id"],
        "content": chunk["text"],
        "embedding": embedding,
        "disease": chunk["metadata"]["disease"],
        "section": chunk["metadata"]["section"],
        "source": chunk["metadata"]["source"],
        "file": chunk["metadata"]["file"]
    }

    supabase.table("dermnet_embeddings").insert(record).execute()

print("✅ All embeddings stored in Supabase")
