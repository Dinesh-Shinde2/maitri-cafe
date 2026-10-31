import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import CelebrationBooking, User
from app.schemas import CelebrationBookingCreate, CelebrationBookingOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/celebrations", tags=["Celebrations"])

@router.post("", response_model=CelebrationBookingOut)
def create_celebration_booking(celeb_in: CelebrationBookingCreate, db: Session = Depends(get_db)):
    ref = f"CELEB-{random.randint(1000, 9999)}"
    
    celebration = CelebrationBooking(
        booking_reference=ref,
        event_type=celeb_in.event_type,
        customer_name=celeb_in.customer_name,
        customer_phone=celeb_in.customer_phone,
        customer_email=celeb_in.customer_email,
        event_date=celeb_in.event_date,
        event_time=celeb_in.event_time,
        guest_count=celeb_in.guest_count,
        decor_required=celeb_in.decor_required,
        cake_required=celeb_in.cake_required,
        food_package=celeb_in.food_package,
        special_requests=celeb_in.special_requests,
        status="Pending"
    )
    db.add(celebration)
    db.commit()
    db.refresh(celebration)
    return celebration

@router.get("", response_model=List[CelebrationBookingOut])
def get_all_celebration_bookings(status: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(CelebrationBooking)
    if status:
        query = query.filter(CelebrationBooking.status == status)
    return query.order_by(CelebrationBooking.created_at.desc()).all()

@router.put("/{celeb_id}/status")
def update_celebration_status(celeb_id: int, status_update: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    celeb = db.query(CelebrationBooking).filter(CelebrationBooking.id == celeb_id).first()
    if not celeb:
        raise HTTPException(status_code=404, detail="Celebration booking not found")
    
    new_status = status_update.get("status")
    if new_status:
        celeb.status = new_status
        db.commit()
    return {"message": "Celebration status updated", "reference": celeb.booking_reference, "status": celeb.status}
