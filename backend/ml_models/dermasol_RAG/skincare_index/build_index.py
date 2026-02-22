import faiss
import json
import pickle
from datetime import datetime
from sentence_transformers import SentenceTransformer

from .chunker import chunk_documents

from ml_models.dermasol_RAG.config import (
    EMBEDDING_MODEL_NAME,
    SKINCARE_FAISS_PATH,
    SKINCARE_METADATA_PATH,
    SKINCARE_INDEX_CONFIG_PATH
)


def build_index():
    print("🔹 Loading embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    print("🔹 Chunking skincare documents...")
    chunks = chunk_documents()

    if not chunks:
        raise ValueError("❌ No chunks generated. Check chunker.")

    print(f"🔹 Total chunks created: {len(chunks)}")

    # Debug preview
    print("🔹 Example chunk metadata:")
    print({
        "intent": chunks[0].get("intent"),
        "skin_type": chunks[0].get("skin_type"),
        "source": chunks[0].get("source")
    })

    texts = [chunk["text"] for chunk in chunks]

    print("🔹 Creating embeddings...")
    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    dimension = embeddings.shape[1]

    print("🔹 Building FAISS index (Inner Product)...")
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    print("🔹 Saving FAISS index...")
    faiss.write_index(index, str(SKINCARE_FAISS_PATH))

    print("🔹 Saving metadata...")
    with open(SKINCARE_METADATA_PATH, "wb") as f:
        pickle.dump(chunks, f)

    print("🔹 Saving index config...")
    index_config = {
        "embedding_model": EMBEDDING_MODEL_NAME,
        "dimension": dimension,
        "total_chunks": len(chunks),
        "created_on": datetime.now().isoformat(),
        "index_type": "skincare",
        "chunking_strategy": "H2-section-based-with-metadata"
    }

    with open(SKINCARE_INDEX_CONFIG_PATH, "w") as f:
        json.dump(index_config, f, indent=4)

    print("✅ Skincare index built successfully.")


if __name__ == "__main__":
    build_index()
