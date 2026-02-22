import re
from pathlib import Path
from typing import List, Dict

BASE_DIR = Path(__file__).resolve().parent
CORPUS_DIR = BASE_DIR / "medical_corpus"

CHUNK_SIZE = 1400
OVERLAP = 200


# ---------------------------------------
# Minimal cleaning
# ---------------------------------------
def clean_text(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ---------------------------------------
# Extract H1 Disease Name
# ---------------------------------------
def extract_disease_name(text: str) -> str:
    match = re.search(r"^#\s*(.+)", text, re.MULTILINE)
    return match.group(1).strip() if match else "Unknown"


# ---------------------------------------
# Split by H2 while preserving H3
# ---------------------------------------
def split_by_h2_preserve_subsections(text: str) -> List[Dict]:
    """
    Splits markdown by H2 headers.
    Keeps all H3 content inside its parent H2.
    """

    pattern = r"(##\s+.+)"
    parts = re.split(pattern, text)

    sections = []
    current_title = None

    for part in parts:
        if part.startswith("##"):
            current_title = part.replace("##", "").strip()
        else:
            if current_title and part.strip():
                sections.append({
                    "section_title": current_title,
                    "content": part.strip()
                })

    return sections


# ---------------------------------------
# Normalize Section Category
# ---------------------------------------
def normalize_category(section_title: str) -> str:
    s = section_title.lower()

    if "treatment" in s:
        return "treatment"
    if "clinical" in s or "feature" in s:
        return "symptoms"
    if "cause" in s:
        return "causes"
    if "complication" in s:
        return "complications"
    if "diagnosis" in s:
        return "diagnosis"
    if "prevention" in s:
        return "precautions"
    if "outcome" in s or "outlook" in s:
        return "outlook"
    if "who gets" in s:
        return "risk_factors"
    if "differential" in s:
        return "differential"
    if "what is" in s:
        return "overview"

    return "general"


# ---------------------------------------
# Split Large Sections Safely
# ---------------------------------------
def split_large_section(text: str) -> List[str]:
    chunks = []
    start = 0
    length = len(text)

    while start < length:
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start += CHUNK_SIZE - OVERLAP

    return chunks


# ---------------------------------------
# Main Chunker
# ---------------------------------------
def chunk_documents() -> List[Dict]:

    all_chunks = []

    for file in CORPUS_DIR.glob("*.md"):
        with open(file, "r", encoding="utf-8") as f:
            raw_text = f.read()

        cleaned = clean_text(raw_text)
        disease_name = extract_disease_name(cleaned)

        sections = split_by_h2_preserve_subsections(cleaned)

        chunk_id = 0

        for section in sections:
            section_title = section["section_title"]
            content = section["content"]

            category = normalize_category(section_title)

            # Split only if too large
            if len(content) > CHUNK_SIZE:
                sub_chunks = split_large_section(content)
            else:
                sub_chunks = [content]

            for chunk in sub_chunks:
                all_chunks.append({
                    "text": chunk,
                    "disease": disease_name,
                    "section": section_title,
                    "category": category,
                    "source": file.name,
                    "chunk_id": chunk_id
                })

                chunk_id += 1

    print(f"✅ Created {len(all_chunks)} medical chunks")
    return all_chunks


if __name__ == "__main__":
    chunk_documents()