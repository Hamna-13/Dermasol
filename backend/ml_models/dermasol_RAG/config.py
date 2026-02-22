from pathlib import Path

# =============================
# EMBEDDING CONFIG
# =============================

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# Good balance of speed + accuracy
# Works well on CPU

# =============================
# CHUNK CONFIG (Medical)
# =============================

MEDICAL_CHUNK_SIZE = 500
MEDICAL_CHUNK_OVERLAP = 80

# =============================
# RETRIEVAL CONFIG
# =============================

TOP_K = 30

# =============================
# PATHS
# =============================

BASE_DIR = Path(__file__).parent

MEDICAL_INDEX_DIR = BASE_DIR / "medical_index"
MEDICAL_CORPUS_DIR = MEDICAL_INDEX_DIR / "medical_corpus"

MEDICAL_FAISS_PATH = MEDICAL_INDEX_DIR / "faiss_index.bin"
MEDICAL_METADATA_PATH = MEDICAL_INDEX_DIR / "metadata.pkl"
MEDICAL_INDEX_CONFIG_PATH = MEDICAL_INDEX_DIR / "index_config.json"


# =============================
# SKINCARE PATHS
# =============================

SKINCARE_INDEX_DIR = BASE_DIR / "skincare_index"
SKINCARE_CORPUS_DIR = SKINCARE_INDEX_DIR / "skin_care_corpus"

SKINCARE_FAISS_PATH = SKINCARE_INDEX_DIR / "faiss_index.bin"
SKINCARE_METADATA_PATH = SKINCARE_INDEX_DIR / "metadata.pkl"
SKINCARE_INDEX_CONFIG_PATH = SKINCARE_INDEX_DIR / "index_config.json"
