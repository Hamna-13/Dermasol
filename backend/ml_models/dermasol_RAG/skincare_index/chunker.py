import os
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent
CORPUS_DIR = BASE_DIR / "skin_care_corpus"


def extract_intent_from_filename(filename: str):
    """
    brightening.md → brightening
    barrier_repair.md → barrier_repair
    """
    return filename.replace(".md", "").lower()


def extract_skin_type_from_header(header: str):
    """
    Detect skin type from header text.
    """

    header = header.lower()

    if "dry" in header:
        return "dry"
    if "oily" in header:
        return "oily"
    if "normal" in header:
        return "normal"
    if "sensitive" in header:
        return "sensitive"

    return None


def chunk_markdown_by_h2(text: str, source_file: str):
    """
    Split markdown by H2 sections.
    Attach intent + skin_type metadata.
    """

    intent = extract_intent_from_filename(source_file)

    # Split by H2 while keeping structure clean
    sections = re.split(r"\n## ", text)

    chunks = []

    for section in sections:
        section = section.strip()
        if not section:
            continue

        chunk_text = "## " + section

        first_line = section.split("\n")[0]
        skin_type = extract_skin_type_from_header(first_line)

        chunks.append({
            "text": chunk_text.strip(),
            "source": source_file,
            "intent": intent,
            "skin_type": skin_type
        })

    return chunks


def chunk_documents():
    """
    Main entry point for build_index.
    Returns list of chunk dictionaries.
    """

    all_chunks = []

    for file in os.listdir(CORPUS_DIR):
        if not file.endswith(".md"):
            continue

        file_path = CORPUS_DIR / file

        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        file_chunks = chunk_markdown_by_h2(text, file)
        all_chunks.extend(file_chunks)

    print(f"✅ Created {len(all_chunks)} skincare chunks")

    return all_chunks


if __name__ == "__main__":
    chunk_documents()
