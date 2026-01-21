import os
import json
from pathlib import Path
from transformers import AutoTokenizer

# --------------------
# CONFIG
# --------------------

CORPUS_DIR = "../dermnet_corpus"
OUTPUT_DIR = "chunks"
MAX_TOKENS = 400
OVERLAP = 80

os.makedirs(OUTPUT_DIR, exist_ok=True)

tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")

# --------------------
# HELPERS
# --------------------

def split_by_tokens(text, max_tokens, overlap):
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + max_tokens
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += max_tokens - overlap

    return chunks


def parse_markdown(md_text):
    sections = {}
    current_section = "General"
    buffer = []

    for line in md_text.splitlines():
        if line.startswith("## "):
            if buffer:
                sections[current_section] = "\n".join(buffer)
                buffer = []
            current_section = line.replace("## ", "").strip()
        else:
            buffer.append(line)

    if buffer:
        sections[current_section] = "\n".join(buffer)

    return sections

# --------------------
# MAIN CHUNKING LOOP
# --------------------

all_chunks = []
chunk_id = 0

for md_file in Path(CORPUS_DIR).glob("*.md"):
    disease = md_file.stem.replace("_", " ").title()

    with open(md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    sections = parse_markdown(md_text)

    for section, text in sections.items():
        token_chunks = split_by_tokens(text, MAX_TOKENS, OVERLAP)

        for chunk in token_chunks:
            all_chunks.append({
                "id": f"chunk_{chunk_id}",
                "text": chunk.strip(),
                "metadata": {
                    "disease": disease,
                    "section": section,
                    "source": "DermNet NZ",
                    "file": md_file.name
                }
            })
            chunk_id += 1

# --------------------
# SAVE CHUNKS
# --------------------

output_path = os.path.join(OUTPUT_DIR, "dermnet_chunks.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(all_chunks, f, indent=2)

print(f"✅ Chunking complete. Total chunks: {len(all_chunks)}")
print(f"📄 Saved to {output_path}")
