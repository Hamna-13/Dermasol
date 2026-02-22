"""
llm_response.py

Purpose:
- Execute LLM prompt built by RAG layer
- Enforce strict JSON output
- Support:
    - Skincare case schema
    - Medical case schema
- Normalize output safely
- Never hallucinate outside provided context
"""

import os
import json
import requests
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

# -------------------------------------------------
# CONFIG
# -------------------------------------------------

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_URL = os.getenv("GROK_API_URL")
GROK_MODEL = os.getenv("GROK_MODEL", "llama-3.3-70b-versatile")

if not GROK_API_KEY or not GROK_API_URL:
    raise RuntimeError("Missing GROK_API_KEY or GROK_API_URL")

HEADERS = {
    "Authorization": f"Bearer {GROK_API_KEY}",
    "Content-Type": "application/json",
}


# -------------------------------------------------
# SAFE JSON PARSER
# -------------------------------------------------

def _safe_json_parse(content: str) -> Dict:
    """
    Safely extract JSON even if model wraps it in markdown.
    """

    content = content.strip()

    # Remove ```json fences if present
    if content.startswith("```"):
        content = content.strip("`")
        content = content.replace("json", "", 1).strip()

    try:
        parsed = json.loads(content)
    except Exception as e:
        raise RuntimeError(f"LLM did not return valid JSON. Raw output:\n{content}")

    return parsed


# -------------------------------------------------
# NORMALIZATION LAYER
# -------------------------------------------------

def _normalize_skincare(parsed: Dict) -> Dict:
    parsed.setdefault("case_type", "skincare")
    parsed.setdefault("analysis", "")
    parsed.setdefault("skin_type", "")
    parsed.setdefault("intent", "")
    parsed.setdefault("routine", "")
    parsed.setdefault("ingredients", "")
    parsed.setdefault("recommended_products", [])
    parsed.setdefault("disclaimer", "")

    return parsed


def _normalize_medical(parsed: Dict) -> Dict:
    parsed.setdefault("case_type", "medical")
    parsed.setdefault("analysis", "")
    parsed.setdefault("skin_type", "")
    parsed.setdefault("symptoms", "")
    parsed.setdefault("causes", "")
    parsed.setdefault("precautions", "")
    parsed.setdefault("treatment", "")
    parsed.setdefault("when_to_see_doctor", "")
    parsed.setdefault("disclaimer", "")

    return parsed


# -------------------------------------------------
# MAIN LLM EXECUTION
# -------------------------------------------------

def generate_llm_response(prompt: str) -> Dict:
    """
    Accepts fully constructed RAG prompt.
    Returns normalized structured JSON for frontend.
    """

    payload = {
        "model": GROK_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a cautious dermatologist assistant. "
                    "Return ONLY valid JSON. Do NOT include markdown. "
                    "Follow the schema exactly."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        "temperature": 0.2,
    }

    response = requests.post(
        GROK_API_URL,
        headers=HEADERS,
        json=payload,
        timeout=60,
    )

    if response.status_code != 200:
        raise RuntimeError(f"Grok API error: {response.text}")

    data = response.json()

    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )

    parsed = _safe_json_parse(content)

    # -------------------------------------------------
    # CASE TYPE NORMALIZATION
    # -------------------------------------------------

    case_type = parsed.get("case_type")

    if case_type == "skincare":
        return _normalize_skincare(parsed)

    elif case_type == "medical":
        return _normalize_medical(parsed)

    else:
        # Fallback detection
        if "routine" in parsed:
            return _normalize_skincare(parsed)
        else:
            return _normalize_medical(parsed)
