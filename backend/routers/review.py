from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models.review import Review
from schemas.review import ReviewCreate, ReviewResponse
from utils.auth_utils import get_current_user


router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = UUID(current_user["id"])

    review = Review(
        user_id=user_id,
        rating=payload.rating,
        condition_identification=payload.condition_identification,
        products_recommended=payload.products_recommended,
        experience=payload.experience,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get("/me", response_model=list[ReviewResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = UUID(current_user["id"])

    reviews = (
        db.query(Review)
        .filter(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
def get_single_review(
    review_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = UUID(current_user["id"])

    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == user_id)
        .first()
    )

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return review


@router.delete("/{review_id}", status_code=status.HTTP_200_OK)
def delete_review(
    review_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = UUID(current_user["id"])

    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == user_id)
        .first()
    )

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully"}