"""
llm_response.py

Purpose:
- Call Grok LLM with structured medical context
- Generate safe, user-centric explanations
- NEVER diagnose or prescribe
"""

import os
from typing import Dict, Any
import requests
from dotenv import load_dotenv
import json

load_dotenv()

# -------------------------------------------------
# CONFIG
# -------------------------------------------------

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_URL = os.getenv("GROK_API_URL")  # e.g. https://api.x.ai/v1/chat/completions
GROK_MODEL = os.getenv("GROK_MODEL", "llama-3.3-70b-versatile")

if not GROK_API_KEY or not GROK_API_URL:
    raise RuntimeError("Missing GROK_API_KEY or GROK_API_URL in .env")

HEADERS = {
    "Authorization": f"Bearer {GROK_API_KEY}",
    "Content-Type": "application/json",
}

# -------------------------------------------------
# PROMPT BUILDER
# -------------------------------------------------

def _build_prompt(context: Dict[str, Any]) -> str:
    """
    Convert decision-layer context into a strict, safe LLM prompt.
    """

    return f"""
You are a dermatology assistant for an AI system called Dermasol.

STRICT RULES (DO NOT BREAK):
- Do NOT diagnose diseases.
- Do NOT prescribe medications.
- Do NOT contradict computer vision results.
- Do NOT mention model names or confidence thresholds.
- Speak in calm, supportive, non-alarming language.

SYSTEM CONTEXT:
- Final condition (from vision): {context['final_condition']}
- CV confidence: {context['cv']['confidence']}
- NLP interpretation (supportive only): {context['nlp']['label']} (confidence {context['nlp']['confidence']})

USER DESCRIPTION:
{context['user_text']}

TASK:
- Explain what this condition generally means (educational only).
- If CV confidence is high, focus on skincare guidance and monitoring.
- If conflict is detected, reassure the user and suggest professional evaluation if symptoms persist.
- Include a short medical disclaimer.
- Keep the response structured and user-friendly.

OUTPUT FORMAT (JSON):
{{
  "summary": "...",
  "what_this_means": "...",
  "skincare_guidance": "...",
  "when_to_seek_help": "...",
  "disclaimer": "..."
}}
"""

# -------------------------------------------------
# MAIN LLM CALL
# -------------------------------------------------

def generate_llm_response(decision_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls Grok LLM and returns structured response for frontend.
    """

    payload = {
        "model": GROK_MODEL,
        "messages": [
            {"role": "system", "content": "You are a medical AI assistant."},
            {"role": "user", "content": _build_prompt(decision_context)},
        ],
        "temperature": 0.3,
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
    print("LLM RESPONSE TYPE:", type(response))
    print("LLM RESPONSE:", response)

    # Defensive parsing (Grok-compatible OpenAI-style schema)
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    # Parse JSON returned by LLM
    try:
        parsed = json.loads(content)
    except Exception:
        raise RuntimeError("LLM did not return valid JSON")

    return parsed
    # return {
    #     "llm_output": content,
    #     "source": "Grok",
    # }
