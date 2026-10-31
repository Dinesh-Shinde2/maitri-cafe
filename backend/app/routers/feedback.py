from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Feedback, Order
from app.schemas import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackOut)
def submit_feedback(fb_in: FeedbackCreate, db: Session = Depends(get_db)):
    avg_rating = round(
        (fb_in.food_rating + fb_in.service_rating + fb_in.ambience_rating + fb_in.cleanliness_rating) / 4.0, 1
    )
    
    feedback = Feedback(
        order_id=fb_in.order_id,
        table_number=fb_in.table_number,
        customer_name=fb_in.customer_name or "Anonymous Diner",
        food_rating=fb_in.food_rating,
        service_rating=fb_in.service_rating,
        ambience_rating=fb_in.ambience_rating,
        cleanliness_rating=fb_in.cleanliness_rating,
        overall_rating=avg_rating,
        comments=fb_in.comments,
        is_public=fb_in.is_public
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

@router.get("", response_model=List[FeedbackOut])
def get_feedback(public_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Feedback)
    if public_only:
        query = query.filter(Feedback.is_public == True)
    return query.order_by(Feedback.created_at.desc()).all()

@router.get("/summary")
def get_feedback_summary(db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).all()
    if not feedbacks:
        return {
            "total_reviews": 0,
            "overall_avg": 5.0,
            "food_avg": 5.0,
            "service_avg": 5.0,
            "ambience_avg": 5.0,
            "cleanliness_avg": 5.0
        }
    
    count = len(feedbacks)
    return {
        "total_reviews": count,
        "overall_avg": round(sum(f.overall_rating for f in feedbacks) / count, 1),
        "food_avg": round(sum(f.food_rating for f in feedbacks) / count, 1),
        "service_avg": round(sum(f.service_rating for f in feedbacks) / count, 1),
        "ambience_avg": round(sum(f.ambience_rating for f in feedbacks) / count, 1),
        "cleanliness_avg": round(sum(f.cleanliness_rating for f in feedbacks) / count, 1),
    }
