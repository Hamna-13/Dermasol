# """
# decision_layer.py

# Purpose:
# - Combine CV output (disease + skin type) with structured NLP
# - STRICT CV AUTHORITY for case type (medical vs skincare)
# - NLP is contextual only (never overrides CV)
# - Produce LLM-ready context
# - Keep medical reasoning cautious
# """

# from typing import Dict, Any

# # -----------------------------
# # CONFIG (TUNABLE)
# # -----------------------------
# CV_CONFIDENCE_THRESHOLD = 0.70


# # -----------------------------
# # CORE DECISION FUNCTION
# # -----------------------------
# def decide_context(
#     cv_result: Dict[str, Any],
#     nlp_result: Dict[str, Any] | None,
#     user_text: str,
# ) -> Dict[str, Any]:

#     # -----------------------------------------
#     # Extract CV data
#     # -----------------------------------------
#     cv_label = cv_result.get("label")
#     cv_conf = float(cv_result.get("confidence", 0.0))
#     is_skin = cv_result.get("is_skin", True)

#     skin_type = cv_result.get("skin_type")
#     skin_type_conf = cv_result.get("skin_type_confidence")

#     cv_confident = cv_conf >= CV_CONFIDENCE_THRESHOLD

#     # -----------------------------------------
#     # HARD EXIT: NO SKIN DETECTED
#     # -----------------------------------------
#     if not is_skin:
#         return {
#             "context_type": None,
#             "final_condition": None,
#             "primary_source": "CV",
#             "cv": {
#                 "label": cv_label,
#                 "confidence": round(cv_conf, 3),
#                 "cv_confident": False,
#                 "skin_type": None,
#                 "skin_type_confidence": None,
#             },
#             "nlp": None,
#             "user_text": user_text,
#             "flags": {
#                 "no_skin_detected": True,
#             },
#             "instructions_for_llm": {
#                 "cv_priority": True,
#                 "tone": "professional_neutral",
#                 "no_diagnosis": True,
#                 "no_prescriptions": True,
#                 "message": (
#                     "The uploaded image does not clearly show skin. "
#                     "Ask the user to upload a clearer image of the affected skin area."
#                 ),
#             },
#         }

#     # -----------------------------------------
#     # STRUCTURED NLP CONTEXT (SECONDARY ONLY)
#     # -----------------------------------------
#     structured_nlp = None

#     if nlp_result:
#         structured_nlp = {
#             "reported_symptoms": nlp_result.get("symptoms", []),
#             "allergies": nlp_result.get("allergies", []),
#             "severity": nlp_result.get("severity"),
#             "intent": nlp_result.get("skincare_intent"),
#         }

#     # -----------------------------------------
#     # STRICT CASE TYPE DECISION (CV ONLY)
#     # -----------------------------------------
#     # RULE:
#     # If CV detects ANY disease label (not Unknown/Normal) AND confident → MEDICAL
#     # If CV says Unknown/Normal OR low confidence → SKINCARE

#     if cv_confident and cv_label and cv_label != "Unknown/Normal":
#         context_type = "medical"
#         final_condition = cv_label
#         primary_source = "CV"
#     else:
#         context_type = "skincare"
#         final_condition = None
#         primary_source = "CV"

#     # -----------------------------------------
#     # BUILD LLM CONTEXT
#     # -----------------------------------------
#     context = {
#         "context_type": context_type,   # <-- THIS controls RAG routing
#         "final_condition": final_condition,
#         "primary_source": primary_source,

#         "cv": {
#             "label": cv_label,
#             "confidence": round(cv_conf, 3),
#             "cv_confident": cv_confident,
#             "skin_type": skin_type,
#             "skin_type_confidence": skin_type_conf,
#         },

#         # NLP is contextual only (does NOT affect routing)
#         "nlp": structured_nlp,

#         "user_text": user_text,

#         "flags": {
#             "low_cv_confidence": not cv_confident,
#         },

#         "instructions_for_llm": {

#             # Authority
#             "cv_priority": True,
#             "nlp_secondary": True,

#             # Tone
#             "tone": "medical_professional_cautious"
#                     if context_type == "medical"
#                     else "skincare_professional_guidance",

#             "assertiveness": "moderate"
#                     if cv_confident and context_type == "medical"
#                     else "low",

#             # Hard safety rules
#             "no_diagnosis": True,
#             "no_prescriptions": True,
#             "no_probability_claims": True,

#             # Forbidden phrases
#             "forbidden_phrases": [
#                 "high confidence",
#                 "likely condition",
#                 "this indicates",
#                 "definitely",
#             ],

#             # Response structure depends on case type
#             "response_structure":
#                 [
#                     "visual_findings",
#                     "image_limitations",
#                     "symptom_context",
#                     "general_skincare_guidance",
#                     "when_to_seek_help",
#                     "disclaimer",
#                 ]
#                 if context_type == "medical"
#                 else
#                 [
#                     "skin_type_assessment",
#                     "current_skin_status",
#                     "skincare_recommendations",
#                     "ingredient_guidance",
#                     "precautions",
#                     "disclaimer",
#                 ],
#         },
#     }

#     return context


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