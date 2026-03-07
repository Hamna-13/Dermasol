"""
decision_layer.py

Purpose:
- Combine CV output with NLP output
- STRICT CV AUTHORITY for case routing
- Disease detection ALWAYS overrides skincare intent
- NLP is contextual only (never affects routing)
- Produce clean structured context for RAG
"""

from typing import Dict, Any

# -----------------------------
# CORE DECISION FUNCTION
# -----------------------------
def decide_context(
    cv_result: Dict[str, Any],
    nlp_result: Dict[str, Any] | None,
    user_text: str,
) -> Dict[str, Any]:

    # -----------------------------------------
    # Extract CV data
    # -----------------------------------------
    cv_label = cv_result.get("label")
    cv_conf = float(cv_result.get("confidence", 0.0))
    is_skin = cv_result.get("is_skin", True)

    skin_type = cv_result.get("skin_type")

    # -----------------------------------------
    # HARD EXIT: NO SKIN DETECTED
    # -----------------------------------------
    if not is_skin:
        return {
            "context_type": None,
            "final_condition": None,
            "disease_confidence": round(cv_conf, 4),
            "skin_type": None,
            "cv_label": cv_label,
            "nlp": None,
            "user_text": user_text,
            "flags": {
                "no_skin_detected": True
            }
        }

    # -----------------------------------------
    # STRUCTURED NLP (SECONDARY CONTEXT ONLY)
    # -----------------------------------------
    structured_nlp = None

    if nlp_result:
        structured_nlp = {
            "symptoms": nlp_result.get("symptoms", []),
            "allergies": nlp_result.get("allergies", []),
            "severity": nlp_result.get("severity"),
            "intent": nlp_result.get("intent"),
        }

    # -----------------------------------------
    # STRICT CASE TYPE DECISION (CV AUTHORITY)
    # -----------------------------------------
    # RULE:
    # If CV label is NOT "Unknown/Normal" → MEDICAL
    # If CV label is "Unknown/Normal" → SKINCARE

    if cv_label and cv_label != "Unknown/Normal":
        context_type = "medical"
        final_condition = cv_label
    else:
        context_type = "skincare"
        final_condition = None

    # -----------------------------------------
    # BUILD CLEAN CONTEXT FOR RAG
    # -----------------------------------------
    context = {
        "context_type": context_type,          # Controls corpus routing
        "final_condition": final_condition,    # Disease name if medical
        "disease_confidence": round(cv_conf, 4),

        "skin_type": skin_type,

        # NLP is contextual only (never affects routing)
        "nlp": structured_nlp,

        "user_text": user_text,

        "flags": {
            "low_confidence": cv_conf < 0.20
        }
    }

    return context