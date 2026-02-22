import faiss
import pickle

from ml_models.dermasol_RAG.config import (
    MEDICAL_FAISS_PATH,
    MEDICAL_METADATA_PATH,
    SKINCARE_FAISS_PATH,
    SKINCARE_METADATA_PATH,
    TOP_K
)

from ml_models.dermasol_RAG.embeddings import embed_query


# ===============================
# 🔹 Load indexes once
# ===============================

_medical_index = None
_medical_metadata = None

_skincare_index = None
_skincare_metadata = None


def _load_medical():
    global _medical_index, _medical_metadata

    if _medical_index is None:
        print("🔹 Loading medical FAISS index...")
        _medical_index = faiss.read_index(str(MEDICAL_FAISS_PATH))

        with open(MEDICAL_METADATA_PATH, "rb") as f:
            _medical_metadata = pickle.load(f)


def _load_skincare():
    global _skincare_index, _skincare_metadata

    if _skincare_index is None:
        print("🔹 Loading skincare FAISS index...")
        _skincare_index = faiss.read_index(str(SKINCARE_FAISS_PATH))

        with open(SKINCARE_METADATA_PATH, "rb") as f:
            _skincare_metadata = pickle.load(f)


# ===============================
# 🔹 MEDICAL RETRIEVAL (STRICT DISEASE CONTROLLED)
# ===============================

def retrieve_medical(query: str, final_condition: str):
    """
    Strict disease-controlled retrieval.

    - Ignores symptoms
    - Ignores skin_type
    - Retrieves ONLY chunks where metadata["disease"] == final_condition
    """

    _load_medical()

    query_vector = embed_query(query).reshape(1, -1)

    # 🔹 Search entire index space so we can manually filter
    scores, indices = _medical_index.search(
        query_vector,
        len(_medical_metadata)  # search full space
    )

    filtered_results = []

    for idx in indices[0]:
        chunk = _medical_metadata[idx]

        # STRICT disease filtering
        if chunk.get("disease") != final_condition:
            continue

        filtered_results.append(chunk)

        if len(filtered_results) >= TOP_K:
            break

    return filtered_results


# ===============================
# 🔹 SKINCARE RETRIEVAL (UPDATED)
# ===============================

def retrieve_skincare(query: str, intent: str, skin_type: str = None):
    """
    Metadata-aware skincare retrieval.

    Args:
        query: embedding query string
        intent: brightening / barrier_repair / etc
        skin_type:
            - "dry", "oily", etc → retrieve specific sections
            - None → retrieve general sections only
    """

    _load_skincare()

    query_vector = embed_query(query).reshape(1, -1)

    # Search full index but rank all results
    scores, indices = _skincare_index.search(
        query_vector,
        len(_skincare_metadata)  # search full space for filtering
    )

    filtered_results = []

    for idx in indices[0]:
        chunk = _skincare_metadata[idx]

        # 1️⃣ Intent must match
        if chunk.get("intent") != intent:
            continue

        # 2️⃣ Skin type filtering
        if skin_type is None:
            # Only general chunks
            if chunk.get("skin_type") is not None:
                continue
        else:
            # Only matching skin type
            if chunk.get("skin_type") != skin_type:
                continue

        filtered_results.append(chunk)

        if len(filtered_results) >= TOP_K:
            break

    return filtered_results
