import uuid
import json
import traceback
from datetime import datetime
from typing import List

from fastapi import Path, Depends, APIRouter, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from utils.auth_utils import get_current_user
from utils.storage_utils import upload_consultation_image, get_image_url

from models.consultation import Consultation

from ml_models.cv_inference import predict_disease
from ml_models.nlp_inference import extract_from_history
from ml_models.llm_response import generate_llm_response
from ml_models.dermasol_RAG.rag_pipeline import DermasolRAG
from decision_layer import decide_context

from schemas.consultation import ConsultationHistoryItem, ConsultationDetail
from utils.storage_utils import upload_consultation_image, get_image_url, delete_storage_object

router = APIRouter(prefix="/consultations", tags=["Consultations"])
rag_engine = DermasolRAG(llm_callable=generate_llm_response)


@router.post("/")
def create_consultation(
    symptoms: str = Form(...),
    age: int | None = Form(None),
    gender: str | None = Form(None),
    medical_history: str | None = Form(None),
    image: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        print(">>> STEP 1: endpoint entered")

        # -----------------------------------
        # STEP 2 — Read Image
        # -----------------------------------
        file_bytes = image.file.read()
        print(">>> STEP 2: image read, bytes =", len(file_bytes))

        # ✅ Upload to bucket (and validate jpg/png inside helper)
        bucket, path = upload_consultation_image(
            file_bytes=file_bytes,
            filename=image.filename,
            content_type=image.content_type
        )
        image_url = get_image_url(bucket, path, expires_in=3600)

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
        # STEP 5 — Decision Layer
        # -----------------------------------
        decision_context = decide_context(
            cv_result=cv_result,
            nlp_result=nlp_result,
            user_text=symptoms
        )

        print(">>> STEP 5: Decision Context")
        print(json.dumps(decision_context, indent=2))

        # -----------------------------------
        # Handle No Skin
        # -----------------------------------
        if decision_context.get("flags", {}).get("no_skin_detected"):
            # ✅ still store record so history has it
            user_uuid = uuid.UUID(current_user["id"])

            row = Consultation(
                user_id=user_uuid,
                age=age,
                gender=gender,
                symptoms=symptoms,
                medical_history=medical_history,
                image_bucket=bucket,
                image_path=path,
                context_type=None,
                final_condition=None,
                cv_label=cv_result.get("label"),
                disease_confidence=decision_context.get("disease_confidence"),
                skin_type=None,
                skin_type_confidence=None,
                cv_result=cv_result,
                nlp_result=nlp_result,
                decision_context=decision_context,
                rag_context_used=None,
                llm_output=None,
                final_response={
                    "case_type": None,
                    "analysis": "No skin detected in the image. Please upload a clearer image containing visible skin.",
                    "disclaimer": ""
                },
                recommended_products=[],
                status="COMPLETED",
            )
            db.add(row)
            db.commit()
            db.refresh(row)

            return {
                "id": str(row.id),
                "status": row.status,
                "created_at": row.created_at.isoformat(),
                "image_bucket": row.image_bucket,
                "image_path": row.image_path,
                "image_url": image_url,
                "response": row.final_response,
            }

        # -----------------------------------
        # STEP 6 — RAG + LLM
        # -----------------------------------
        print(">>> STEP 6: RAG start")
        rag_result = rag_engine.generate(decision_context)
        print(">>> STEP 6: RAG done")

        structured_llm_output = rag_result["structured_response"]
        if isinstance(structured_llm_output, str):
            structured_llm_output = json.loads(structured_llm_output)

        case_type = decision_context["context_type"]
        disease_confidence = decision_context.get("disease_confidence")

        # -----------------------------------
        # STEP 7 — Build Final Response
        # -----------------------------------
        if case_type == "skincare":
            guide = structured_llm_output.get("skin_care_guide", {})
            response_payload = {
                "case_type": "skincare",
                "analysis": structured_llm_output.get("analysis", ""),
                "skin_type": decision_context.get("skin_type"),
                "intent": guide.get("intent"),
                "routine": guide.get("routine"),
                "products": guide.get("ingredients"),
                "recommended_products": structured_llm_output.get("recommended_products", []),
                "disclaimer": structured_llm_output.get(
                    "disclaimer",
                    "This guidance is educational and not a medical diagnosis."
                ),
                "context_used": rag_result.get("context_used"),
                "disease_confidence": disease_confidence,
            }
        else:
            response_payload = {
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
                "context_used": rag_result.get("context_used"),
                "disease_confidence": disease_confidence,
            }

        # -----------------------------------
        # STEP 8 — Store in DB
        # -----------------------------------
        user_uuid = uuid.UUID(current_user["id"])

        row = Consultation(
            user_id=user_uuid,
            age=age,
            gender=gender,
            symptoms=symptoms,
            medical_history=medical_history,

            image_bucket=bucket,
            image_path=path,

            context_type=decision_context.get("context_type"),
            final_condition=decision_context.get("final_condition"),
            cv_label=cv_result.get("label"),
            disease_confidence=decision_context.get("disease_confidence"),
            skin_type=decision_context.get("skin_type"),
            skin_type_confidence=cv_result.get("skin_type_confidence"),

            cv_result=cv_result,
            nlp_result=nlp_result,
            decision_context=decision_context,
            rag_context_used=rag_result.get("context_used"),
            llm_output=structured_llm_output,
            final_response=response_payload,
            recommended_products=response_payload.get("recommended_products", []),
            status="COMPLETED",
        )

        db.add(row)
        db.commit()
        db.refresh(row)

        return {
            "id": str(row.id),
            "status": row.status,
            "created_at": row.created_at.isoformat(),
            "image_bucket": row.image_bucket,
            "image_path": row.image_path,
            "image_url": image_url,
            "response": row.final_response,
        }

    except Exception as e:
        print("❌ EXCEPTION CAUGHT")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[ConsultationHistoryItem])
def list_my_consultations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_uuid = uuid.UUID(current_user["id"])

    rows = (
        db.query(Consultation)
        .filter(Consultation.user_id == user_uuid)
        .order_by(Consultation.created_at.desc())
        .all()
    )

    # ✅ Add image_url per item
    out = []
    for r in rows:
        out.append({
            "id": r.id,
            "created_at": r.created_at,
            "context_type": r.context_type,
            "cv_label": r.cv_label,
            "disease_confidence": r.disease_confidence,
            "skin_type": r.skin_type,
            "image_url": get_image_url(r.image_bucket, r.image_path, expires_in=3600),
        })
    return out


@router.get("/{consultation_id}", response_model=ConsultationDetail)
def get_consultation_detail(
    consultation_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_uuid = uuid.UUID(current_user["id"])

    row = (
        db.query(Consultation)
        .filter(Consultation.id == uuid.UUID(consultation_id))
        .filter(Consultation.user_id == user_uuid)
        .first()
    )

    if not row:
        raise HTTPException(status_code=404, detail="Consultation not found")

    data = {
        "id": row.id,
        "user_id": row.user_id,
        "created_at": row.created_at,
        "age": row.age,
        "gender": row.gender,
        "symptoms": row.symptoms,
        "medical_history": row.medical_history,
        "image_bucket": row.image_bucket,
        "image_path": row.image_path,
        "image_url": get_image_url(row.image_bucket, row.image_path, expires_in=3600),
        "context_type": row.context_type,
        "final_condition": row.final_condition,
        "cv_result": row.cv_result,
        "nlp_result": row.nlp_result,
        "decision_context": row.decision_context,
        "rag_context_used": row.rag_context_used,
        "llm_output": row.llm_output,
        "final_response": row.final_response,
        "recommended_products": row.recommended_products,
        "status": row.status,
        "error": row.error,
    }
    return data

@router.delete("/{consultation_id}", status_code=204)
def delete_consultation(
    consultation_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_uuid = uuid.UUID(current_user["id"])

    row = (
        db.query(Consultation)
        .filter(Consultation.id == uuid.UUID(consultation_id))
        .filter(Consultation.user_id == user_uuid)
        .first()
    )

    if not row:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # delete image from storage (if exists)
    if row.image_bucket and row.image_path:
        delete_storage_object(row.image_bucket, row.image_path)

    db.delete(row)
    db.commit()
    return