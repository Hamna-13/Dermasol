from sentence_transformers import SentenceTransformer
from ml_models.dermasol_RAG.config import EMBEDDING_MODEL_NAME

# Load once (singleton style)
_model = None


def get_embedding_model():
    global _model
    if _model is None:
        print("🔹 Loading embedding model...")
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _model


def embed_query(text: str):
    model = get_embedding_model()
    embedding = model.encode(
        text,
        convert_to_numpy=True,
        normalize_embeddings=True
    )
    return embedding
