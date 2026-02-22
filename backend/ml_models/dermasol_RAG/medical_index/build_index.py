import faiss
import json
import pickle
import numpy as np
from datetime import datetime
from sentence_transformers import SentenceTransformer

from .chunker import chunk_documents
from ml_models.dermasol_RAG.config import (
    EMBEDDING_MODEL_NAME,
    MEDICAL_FAISS_PATH,
    MEDICAL_METADATA_PATH,
    MEDICAL_INDEX_CONFIG_PATH
)


def build_index():
    print("🔹 Loading embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    print("🔹 Chunking medical documents...")
    chunks = chunk_documents()

    if not chunks:
        raise ValueError("❌ No chunks found. Check medical_corpus directory.")

    texts = [chunk["text"] for chunk in chunks]

    print(f"🔹 Creating embeddings for {len(texts)} chunks...")

    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True  # Required for cosine via inner product
    )

    if embeddings.shape[0] == 0:
        raise ValueError("❌ Embedding generation failed.")

    dimension = embeddings.shape[1]

    print("🔹 Building FAISS index (IndexFlatIP)...")

    # Since embeddings are normalized, IP == cosine similarity
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    print("🔹 Saving FAISS index...")
    faiss.write_index(index, str(MEDICAL_FAISS_PATH))

    print("🔹 Saving metadata...")
    with open(MEDICAL_METADATA_PATH, "wb") as f:
        pickle.dump(chunks, f)

    print("🔹 Saving index configuration...")

    index_config = {
        "embedding_model": EMBEDDING_MODEL_NAME,
        "dimension": dimension,
        "total_chunks": len(chunks),
        "created_on": datetime.now().isoformat(),
        "index_type": "IndexFlatIP (cosine similarity)",
        "notes": "Medical index - disease filtered retrieval recommended"
    }

    with open(MEDICAL_INDEX_CONFIG_PATH, "w") as f:
        json.dump(index_config, f, indent=4)

    print("✅ Medical FAISS index built successfully.")


if __name__ == "__main__":
    build_index()