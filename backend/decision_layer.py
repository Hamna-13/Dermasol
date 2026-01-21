"""
decision_layer.py

Purpose:
- Combine CV and NLP outputs
- Resolve conflicts
- Produce a structured, LLM-ready context
- Enforce CV > NLP rule
"""

from typing import Dict, Any


# -----------------------------
# CONFIG (tunable, but stable)
# -----------------------------

CV_CONFIDENCE_THRESHOLD = 0.70
NLP_CONFIDENCE_THRESHOLD = 0.60


# -----------------------------
# CORE DECISION FUNCTION
# -----------------------------

def decide_context(
    cv_result: Dict[str, Any],
    nlp_result: Dict[str, Any] | None,
    user_text: str,
) -> Dict[str, Any]:
    """
    Inputs:
    - cv_result: {label, confidence}
    - nlp_result: {label, confidence, reliable}
    - user_text: raw user symptoms/history

    Output:
    - LLM-ready structured context
    """

    cv_label = cv_result.get("label")
    cv_conf = cv_result.get("confidence", 0.0)

    nlp_label = None
    nlp_conf = 0.0
    nlp_reliable = False

    if nlp_result:
        nlp_label = nlp_result.get("label")
        nlp_conf = nlp_result.get("confidence", 0.0)
        nlp_reliable = nlp_result.get("reliable", False)

    # -----------------------------
    # PRIMARY DECISION: CV FIRST
    # -----------------------------

    final_condition = cv_label
    final_source = "CV"
    conflict = False

    # Detect conflict (CV vs NLP disagree)
    if (
        nlp_reliable
        and nlp_label
        and nlp_label != cv_label
        and cv_conf >= CV_CONFIDENCE_THRESHOLD
    ):
        conflict = True

    # If CV confidence is weak, allow NLP as support (NOT override)
    if cv_conf < CV_CONFIDENCE_THRESHOLD and nlp_reliable:
        final_condition = cv_label  # still CV label
        final_source = "CV (low confidence, NLP supportive)"

    # -----------------------------
    # BUILD LLM CONTEXT
    # -----------------------------

    context = {
        "final_condition": final_condition,
        "primary_source": final_source,
        "cv": {
            "label": cv_label,
            "confidence": round(cv_conf, 3),
        },
        "nlp": {
            "label": nlp_label,
            "confidence": round(nlp_conf, 3),
            "reliable": nlp_reliable,
        },
        "user_text": user_text,
        "flags": {
            "conflict_detected": conflict,
            "low_cv_confidence": cv_conf < CV_CONFIDENCE_THRESHOLD,
        },
        "instructions_for_llm": {
            "no_diagnosis": True,
            "no_prescriptions": True,
            "focus_on": [
                "education",
                "explanation",
                "skincare guidance",
                "reassurance if appropriate",
            ],
        },
    }

    return context
