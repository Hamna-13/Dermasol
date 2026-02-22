# import uuid
# from datetime import datetime
# from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException

# from utils.auth_utils import get_current_user
# from schemas.consultation import ConsultationOut

# router = APIRouter(prefix="/consultations", tags=["Consultations"])


# @router.post("/", response_model=ConsultationOut)
# def create_consultation(
#     age: int | None = Form(None),
#     gender: str | None = Form(None),
#     symptoms: str = Form(...),
#     medical_history: str | None = Form(None),
#     image: UploadFile = File(...),
#     current_user=Depends(get_current_user),
# ):
#     # 🔹 Read image into memory
#     file_bytes = image.file.read()
#     if not file_bytes:
#         raise HTTPException(status_code=400, detail="Empty image file")

#     # 🔹 Run ML inference
#     try:
#         from ml_models.predict import predict_disease

#         _, pred_label, confidence = predict_disease(file_bytes)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

#     # 🔹 Return response only (NO persistence)
#     return {
#         "id": str(uuid.uuid4()),          # ephemeral ID
#         "user_id": current_user["id"],
#         "age": age,
#         "gender": gender,
#         "symptoms": symptoms,
#         "medical_history": medical_history,
#         "image_bucket": None,
#         "image_path": None,
#         "image_url": None,
#         "diagnosis": pred_label,
#         "confidence": confidence,
#         "status": "COMPLETED",
#         "created_at": datetime.utcnow(),
#     }


# NEW NLP INTEGRATION CODE

# import uuid
# import json
# import traceback
# from datetime import datetime
# from fastapi import APIRouter, File, Form, UploadFile, HTTPException

# from ml_models.cv_inference import predict_disease
# from ml_models.nlp_inference import extract_from_history
# from ml_models.llm_response import generate_llm_response
# from ml_models.dermasol_RAG.rag_pipeline import DermasolRAG

# router = APIRouter(prefix="/consultations", tags=["Consultations"])

# # Initialize RAG once
# rag_engine = DermasolRAG(llm_callable=generate_llm_response)


# @router.post("/")
# def create_consultation(
#     symptoms: str = Form(...),
#     image: UploadFile = File(...),
# ):
#     try:
#         print(">>> STEP 1: endpoint entered")

#         # -----------------------------------
#         # STEP 2 — Read Image
#         # -----------------------------------
#         file_bytes = image.file.read()
#         print(">>> STEP 2: image read, bytes =", len(file_bytes))

#         # -----------------------------------
#         # STEP 3 — CV Inference
#         # -----------------------------------
#         print(">>> STEP 3: CV inference start")
#         cv_result = predict_disease(file_bytes)
#         print(">>> STEP 3: CV inference done")
#         print(">>> CV RESULT:", cv_result)

#         # -----------------------------------
#         # STEP 4 — NLP Extraction (goal + intent)
#         # -----------------------------------
#         print(">>> STEP 4: NLP extraction start")
#         nlp_result = extract_from_history(symptoms)
#         print(">>> STEP 4: NLP extraction done")
#         print(">>> NLP RESULT:", nlp_result)

#         # -----------------------------------
#         # Handle no skin detected
#         # -----------------------------------
#         if cv_result.get("no_skin_detected"):
#             return {
#                 "id": str(uuid.uuid4()),
#                 "status": "COMPLETED",
#                 "created_at": datetime.utcnow().isoformat(),
#                 "response": {
#                     "summary": "No skin detected in the image. Please upload a clearer image containing visible skin.",
#                     "analysis": "",
#                     "skincare_guidance": "",
#                     "precautions": "",
#                     "disclaimer": ""
#                 },
#             }

#         # -----------------------------------
#         # STEP 5 — Prepare Structured Data for RAG
#         # -----------------------------------
#         structured_data = {
#             "goal": nlp_result.get("goal"),
#             "intent": nlp_result.get("intent"),
#             "disease": cv_result.get("label", "normal"),
#             "skin_type": cv_result.get("skin_type", ""),
#             "symptoms": nlp_result.get("symptoms", []),
#             "allergies": nlp_result.get("allergies", []),
#             "severity": nlp_result.get("severity"),
#             "user_text": symptoms  # VERY IMPORTANT for semantic retrieval
#         }

#         print(">>> Structured Data for RAG:")
#         print(json.dumps(structured_data, indent=2))

#         # -----------------------------------
#         # STEP 6 — RAG + LLM
#         # -----------------------------------
#         print(">>> STEP 6: RAG start")

#         rag_result = rag_engine.generate(structured_data)

#         print(">>> STEP 6: RAG done")
#         print(">>> Context Used:", rag_result["context_used"])

#         structured_llm_output = rag_result["structured_response"]

#         if isinstance(structured_llm_output, str):
#             structured_llm_output = json.loads(structured_llm_output)

#         # -----------------------------------
#         # STEP 7 — Build Final Response
#         # -----------------------------------
#         print(">>> STEP 7: building final response")

#         case_type = structured_llm_output.get("case_type")

#         # ==============================
#         # SKINCARE CASE RESPONSE
#         # ==============================
#         if case_type == "skincare":

#             guide = structured_llm_output.get("skin_care_guide", {})

#             final_response = {
#                 "id": str(uuid.uuid4()),
#                 "status": "COMPLETED",
#                 "created_at": datetime.utcnow().isoformat(),
#                 "response": {
#                     "case_type": "skincare",

#                     "analysis": structured_llm_output.get("analysis", ""),

#                     "skin_type": structured_llm_output.get("skin_type"),

#                     "intent": guide.get("intent"),

#                     "routine": guide.get("routine"),

#                     "products": guide.get("ingredients"),

#                     # Heading only for now (as requested)
#                     "recommended_products": structured_llm_output.get(
#                         "recommended_products",
#                         []
#                     ),

#                     "disclaimer": structured_llm_output.get(
#                         "disclaimer",
#                         "This guidance is educational and not a medical diagnosis."
#                     ),

#                     "context_used": rag_result["context_used"],
#                     "skin_type_confidence": cv_result.get("skin_type_confidence"),
#                 }
#             }

#         # ==============================
#         # MEDICAL CASE RESPONSE
#         # ==============================
#         else:

#             final_response = {
#                 "id": str(uuid.uuid4()),
#                 "status": "COMPLETED",
#                 "created_at": datetime.utcnow().isoformat(),
#                 "response": {
#                     "case_type": "medical",

#                     "analysis": structured_llm_output.get("analysis", ""),

#                     "skin_type": structured_llm_output.get("skin_type"),

#                     "symptoms": structured_llm_output.get("symptoms"),

#                     "causes": structured_llm_output.get("causes"),

#                     "treatment": structured_llm_output.get("treatment"),

#                     "precautions": structured_llm_output.get("precautions"),

#                     "when_to_see_doctor": structured_llm_output.get("when_to_see_doctor"),

#                     "disclaimer": structured_llm_output.get(
#                         "disclaimer",
#                         "This information is educational and not a confirmed medical diagnosis."
#                     ),

#                     "context_used": rag_result["context_used"],
#                     "skin_type_confidence": cv_result.get("skin_type_confidence"),
#                 }
#             }

#         print(">>> FINAL RESPONSE:")
#         print(json.dumps(final_response, indent=2))

#         return final_response

#     except Exception as e:
#         print("❌ EXCEPTION CAUGHT")
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))


import uuid
import json
import traceback
from datetime import datetime
from fastapi import APIRouter, File, Form, UploadFile, HTTPException

from ml_models.cv_inference import predict_disease
from ml_models.nlp_inference import extract_from_history
from ml_models.llm_response import generate_llm_response
from ml_models.dermasol_RAG.rag_pipeline import DermasolRAG
from decision_layer import decide_context

router = APIRouter(prefix="/consultations", tags=["Consultations"])

# Initialize RAG once
rag_engine = DermasolRAG(llm_callable=generate_llm_response)


@router.post("/")
def create_consultation(
    symptoms: str = Form(...),
    image: UploadFile = File(...),
):
    try:
        print(">>> STEP 1: endpoint entered")

        # -----------------------------------
        # STEP 2 — Read Image
        # -----------------------------------
        file_bytes = image.file.read()
        print(">>> STEP 2: image read, bytes =", len(file_bytes))

        # -----------------------------------
        # STEP 3 — CV Inference
        # -----------------------------------
        print(">>> STEP 3: CV inference start")
        cv_result = predict_disease(file_bytes)
        print(">>> STEP 3: CV inference done")
        print(">>> CV RESULT:", cv_result)

        # -----------------------------------
        # STEP 4 — NLP Extraction
        # -----------------------------------
        print(">>> STEP 4: NLP extraction start")
        nlp_result = extract_from_history(symptoms)
        print(">>> STEP 4: NLP extraction done")
        print(">>> NLP RESULT:", nlp_result)

        # -----------------------------------
        # STEP 5 — Decision Layer (STRICT CV AUTHORITY)
        # -----------------------------------
        decision_context = decide_context(
            cv_result=cv_result,
            nlp_result=nlp_result,
            user_text=symptoms
        )

        print(">>> STEP 5: Decision Context")
        print(json.dumps(decision_context, indent=2))

        # -----------------------------------
        # Handle No Skin Detected
        # -----------------------------------
        if decision_context.get("flags", {}).get("no_skin_detected"):
            return {
                "id": str(uuid.uuid4()),
                "status": "COMPLETED",
                "created_at": datetime.utcnow().isoformat(),
                "response": {
                    "case_type": None,
                    "analysis": "No skin detected in the image. Please upload a clearer image containing visible skin.",
                    "disclaimer": ""
                },
            }

        # -----------------------------------
        # STEP 6 — RAG + LLM
        # -----------------------------------
        print(">>> STEP 6: RAG start")

        rag_result = rag_engine.generate(decision_context)

        print(">>> STEP 6: RAG done")
        print(">>> Context Used:", rag_result["context_used"])

        structured_llm_output = rag_result["structured_response"]

        if isinstance(structured_llm_output, str):
            structured_llm_output = json.loads(structured_llm_output)

        case_type = decision_context["context_type"]

        # -----------------------------------
        # STEP 7 — Build Final Response
        # -----------------------------------
        print(">>> STEP 7: building final response")

        disease_confidence = decision_context.get("disease_confidence")

        # ==============================
        # SKINCARE RESPONSE
        # ==============================
        if case_type == "skincare":

            guide = structured_llm_output.get("skin_care_guide", {})

            final_response = {
                "id": str(uuid.uuid4()),
                "status": "COMPLETED",
                "created_at": datetime.utcnow().isoformat(),
                "response": {
                    "case_type": "skincare",

                    "analysis": structured_llm_output.get("analysis", ""),

                    "skin_type": decision_context.get("skin_type"),

                    "intent": guide.get("intent"),

                    "routine": guide.get("routine"),

                    "products": guide.get("ingredients"),

                    "recommended_products": structured_llm_output.get(
                        "recommended_products", []
                    ),

                    "disclaimer": structured_llm_output.get(
                        "disclaimer",
                        "This guidance is educational and not a medical diagnosis."
                    ),

                    "context_used": rag_result["context_used"],

                    # Only disease model confidence (even if normal)
                    "disease_confidence": disease_confidence,
                }
            }

        # ==============================
        # MEDICAL RESPONSE
        # ==============================
        else:

            final_response = {
                "id": str(uuid.uuid4()),
                "status": "COMPLETED",
                "created_at": datetime.utcnow().isoformat(),
                "response": {
                    "case_type": "medical",

                    "analysis": structured_llm_output.get("analysis", ""),

                    "skin_type": decision_context.get("skin_type"),

                    "symptoms": structured_llm_output.get("symptoms"),

                    "causes": structured_llm_output.get("causes"),

                    "treatment": structured_llm_output.get("treatment"),

                    "precautions": structured_llm_output.get("precautions"),

                    "when_to_see_doctor": structured_llm_output.get("when_to_see_doctor"),

                    "disclaimer": structured_llm_output.get(
                        "disclaimer",
                        "This information is educational and not a confirmed medical diagnosis."
                    ),

                    "context_used": rag_result["context_used"],

                    # Only disease model confidence
                    "disease_confidence": disease_confidence,
                }
            }

        print(">>> FINAL RESPONSE:")
        print(json.dumps(final_response, indent=2))

        return final_response

    except Exception as e:
        print("❌ EXCEPTION CAUGHT")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))