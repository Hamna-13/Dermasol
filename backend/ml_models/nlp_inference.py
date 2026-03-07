"""
nlp_inference.py

Stable NLP extraction layer.

Architecture:
- Ask Groq to extract in a labelled format (NOT JSON)
- Parse strictly line-by-line
- Add deterministic fallback logic
- Return clean structured JSON
"""

import os
import re
from typing import Dict, Any, List
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROK_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROK_API_KEY not found in environment variables")

client = Groq(api_key=GROQ_API_KEY)

MODEL_NAME = "qwen/qwen3-32b"
MAX_INPUT_LENGTH = 2000


# -------------------------------------------------
# Utility Functions
# -------------------------------------------------

def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _canonicalize_symptoms(symptoms: List[str]) -> List[str]:
    mapping = {
        "itching": "itch",
        "itch": "itch",
        "burning": "burn",
        "burn": "burn",
        "rashes": "rash",
        "rash": "rash",
        "pain": "pain",
        "redness": "redness",
        "swelling": "swelling",
        "dryness": "dry"
    }

    cleaned = []
    for s in symptoms:
        s = s.strip().lower()
        if s in mapping:
            cleaned.append(mapping[s])
        else:
            cleaned.append(s)

    return list(set(cleaned))


def _parse_labelled_output(llm_text: str):
    symptoms = []
    allergies = []
    severity = None

    lines = llm_text.splitlines()

    for line in lines:
        line = line.strip()

        if line.lower().startswith("symptoms:"):
            content = line.split(":", 1)[1].strip()
            if content.lower() != "none":
                symptoms = [x.strip() for x in content.split(",") if x.strip()]

        elif line.lower().startswith("allergies:"):
            content = line.split(":", 1)[1].strip()
            if content.lower() != "none":
                allergies = [x.strip() for x in content.split(",") if x.strip()]

        elif line.lower().startswith("severity:"):
            content = line.split(":", 1)[1].strip().lower()
            if content in ["mild", "moderate", "severe"]:
                severity = content

    return symptoms, allergies, severity


def _fallback_symptoms(user_text: str) -> List[str]:
    keywords = [
        "itch", "burn", "pain",
        "rash", "redness",
        "swelling", "dry"
    ]

    text = _normalize(user_text)

    found = []
    for word in keywords:
        if word in text:
            found.append(word)

    return list(set(found))


def _fallback_allergies(user_text: str) -> List[str]:
    text = user_text.lower()

    patterns = [
        r"allergic to ([a-zA-Z\s]+)",
        r"allergy to ([a-zA-Z\s]+)",
        r"reaction to ([a-zA-Z\s]+)",
        r"sensitive to ([a-zA-Z\s]+)"
    ]

    allergies = []

    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            match = match.strip()
            match = match.split(".")[0]
            match = match.replace("any ", "")
            allergies.append(match.strip())

    return list(set(allergies))


def _fallback_severity(user_text: str) -> str | None:
    text = user_text.lower()

    if "severe" in text:
        return "severe"
    if "moderate" in text:
        return "moderate"
    if "mild" in text:
        return "mild"

    return None


def _decide_goal(user_text: str) -> str:
    text = user_text.lower()

    medical_keywords = [
        "rash", "itch", "burn",
        "pain", "infection",
        "eczema", "psoriasis",
        "lupus", "inflammation"
    ]

    for word in medical_keywords:
        if word in text:
            return "medical"

    return "skincare"


def _extract_intent(user_text: str) -> str | None:
    text = user_text.lower()

    intent_map = {
        "brightening": ["bright", "glow", "dull", "whiten"],
        "anti_aging": ["wrinkle", "fine line", "aging"],
        "oil_control": ["oily", "shine"],
        "hydration": ["dry", "dehydrated"],
        "barrier_repair": ["barrier"],
        "sensitive_skin": ["sensitive", "irritated"],
        "sunscreen_protection": ["spf", "sun"],
        "under_eye": ["dark circle"],
        "pore_minimize": ["pore"],
        "hyperpigmentation": ["pigment", "dark spot"],
        "acne": ["acne"],
        "acne_scars": ["scar"],
        "korean_glass_skin": ["glass skin"]
    }

    for topic, keywords in intent_map.items():
        for word in keywords:
            if word in text:
                return topic

    return None


# -------------------------------------------------
# MAIN EXTRACTION FUNCTION
# -------------------------------------------------

def extract_from_history(user_text: str) -> Dict[str, Any]:

    if not user_text or len(user_text.strip()) < 3:
        return {
            "goal": None,
            "intent": None,
            "symptoms": [],
            "allergies": [],
            "severity": None
        }

    if len(user_text) > MAX_INPUT_LENGTH:
        user_text = user_text[:MAX_INPUT_LENGTH]

    # -----------------------------
    # STEP 1 — Ask Groq (Labelled Output)
    # -----------------------------

    prompt = f"""
Extract the following information from the user statement.

Return your answer in exactly this format:

Symptoms: <comma separated list or None>
Allergies: <comma separated list or None>
Severity: <mild / moderate / severe / None>

User Statement:
\"\"\"{user_text}\"\"\"
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You extract structured dermatology information clearly."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        llm_answer = response.choices[0].message.content.strip()

    except Exception as e:
        print("LLM ERROR:", e)
        llm_answer = ""

    # -----------------------------
    # STEP 2 — Parse LLM Output
    # -----------------------------

    symptoms, allergies, severity = _parse_labelled_output(llm_answer)

    # -----------------------------
    # STEP 3 — Fallback Safety
    # -----------------------------

    if not symptoms:
        symptoms = _fallback_symptoms(user_text)

    if not allergies:
        allergies = _fallback_allergies(user_text)

    if not severity:
        severity = _fallback_severity(user_text)

    # Canonicalize symptoms
    symptoms = _canonicalize_symptoms(symptoms)

    # Remove duplicates
    symptoms = list(set(symptoms))
    allergies = list(set(allergies))

    # -----------------------------
    # STEP 4 — Goal & Intent
    # -----------------------------

    goal = _decide_goal(user_text)
    intent = None

    if goal == "skincare":
        intent = _extract_intent(user_text)

    print("Extracted NLP Data:", {
        "goal": goal,
        "intent": intent,
        "symptoms": symptoms,
        "allergies": allergies,
        "severity": severity
    })

    return {
        "goal": goal,
        "intent": intent,
        "symptoms": symptoms,
        "allergies": allergies,
        "severity": severity
    }