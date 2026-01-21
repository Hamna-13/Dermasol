# import uuid
# from datetime import datetime
# from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException

# from utils.auth_utils import get_current_user

# from ml_models.predict import predict_disease
# from ml_models.nlp_inference import predict_from_history
# from ml_models.llm_response import generate_llm_response
# from decision_layer import decide_context


# router = APIRouter(prefix="/consultations", tags=["Consultations"])


# @router.post("/")
# def create_consultation(
#     age: int | None = Form(None),
#     gender: str | None = Form(None),
#     symptoms: str = Form(...),
#     medical_history: str | None = Form(None),
#     image: UploadFile = File(...),
#     # current_user=Depends(get_current_user),
# ):
#     # -------------------------------
#     # 1️⃣ Read image (IN-MEMORY ONLY)
#     # -------------------------------
#     file_bytes = image.file.read()
#     if not file_bytes:
#         raise HTTPException(status_code=400, detail="Empty image file")

#     # -------------------------------
#     # 2️⃣ CV inference
#     # -------------------------------
#     try:
#         _, pred_label, confidence = predict_disease(file_bytes)
#         cv_result = {
#             "label": pred_label,
#             "confidence": confidence
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"CV inference failed: {str(e)}")

#     # -------------------------------
#     # 3️⃣ NLP inference
#     # -------------------------------
#     try:
#         nlp_result = predict_from_history(symptoms)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"NLP inference failed: {str(e)}")

#     # -------------------------------
#     # 4️⃣ Decision layer (CV > NLP)
#     # -------------------------------
#     decision_context = decide_context(
#         cv_result=cv_result,
#         nlp_result=nlp_result,
#         user_text=symptoms
#     )

#     # -------------------------------
#     # 5️⃣ LLM response generation
#     # -------------------------------
#     try:
#         llm_response = generate_llm_response(decision_context)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")

#     # -------------------------------
#     # 6️⃣ Return PURE RESPONSE
#     # -------------------------------
#     return {
#     "id": str(uuid.uuid4()),
#     "status": "COMPLETED",
#     "created_at": datetime.utcnow().isoformat(),
#     "response": llm_response
# }


import uuid
import json
import traceback
from datetime import datetime
from fastapi import APIRouter, File, Form, UploadFile, HTTPException

from ml_models.predict import predict_disease
from ml_models.nlp_inference import predict_from_history
from ml_models.llm_response import generate_llm_response
from decision_layer import decide_context

router = APIRouter(prefix="/consultations", tags=["Consultations"])


@router.post("/")
def create_consultation(
    symptoms: str = Form(...),
    image: UploadFile = File(...),
):
    try:
        print(">>> STEP 1: endpoint entered")

        file_bytes = image.file.read()
        print(">>> STEP 2: image read, bytes =", len(file_bytes))

        print(">>> STEP 3: CV inference start")
        _, pred_label, confidence = predict_disease(file_bytes)
        print(">>> STEP 3: CV inference done")

        cv_result = {
            "label": pred_label,
            "confidence": confidence
        }

        print(">>> STEP 4: NLP inference start")
        nlp_result = predict_from_history(symptoms)
        print(">>> STEP 4: NLP inference done")

        print(">>> STEP 5: decision layer start")
        decision_context = decide_context(
            cv_result=cv_result,
            nlp_result=nlp_result,
            user_text=symptoms
        )
        print(">>> STEP 5: decision layer done")

        print(">>> STEP 6: LLM start")
        llm_response = generate_llm_response(decision_context)
        print(">>> STEP 6: LLM done")

        print(">>> STEP 7: LLM type =", type(llm_response))

        if isinstance(llm_response, str):
            print(">>> STEP 7b: parsing LLM JSON string")
            llm_response = json.loads(llm_response)

        print(">>> STEP 8: returning response")

        return {
            "id": str(uuid.uuid4()),
            "status": "COMPLETED",
            "created_at": datetime.utcnow().isoformat(),
            "response": llm_response
        }

    except Exception as e:
        print("❌ EXCEPTION CAUGHT")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



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
