import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import TableBooking, CafeTable, User
from app.schemas import TableBookingCreate, TableBookingOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.post("", response_model=TableBookingOut)
def create_table_booking(booking_in: TableBookingCreate, db: Session = Depends(get_db)):
    ref = f"MB-{random.randint(1000, 9999)}"
    
    # Check table availability if table specified
    table = None
    if booking_in.table_id:
        table = db.query(CafeTable).filter(CafeTable.id == booking_in.table_id).first()
    
    booking = TableBooking(
        booking_reference=ref,
        customer_name=booking_in.customer_name,
        customer_phone=booking_in.customer_phone,
        customer_email=booking_in.customer_email,
        booking_date=booking_in.booking_date,
        booking_time=booking_in.booking_time,
        guest_count=booking_in.guest_count,
        seating_preference=booking_in.seating_preference,
        table_id=table.id if table else None,
        special_notes=booking_in.special_notes,
        status="Confirmed"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@router.get("", response_model=List[TableBookingOut])
def get_all_bookings(status: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(TableBooking)
    if status:
        query = query.filter(TableBooking.status == status)
    return query.order_by(TableBooking.created_at.desc()).all()

@router.put("/{booking_id}/status")
def update_booking_status(booking_id: int, status_update: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(TableBooking).filter(TableBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    new_status = status_update.get("status")
    if new_status:
        booking.status = new_status
        db.commit()
    return {"message": "Booking status updated", "reference": booking.booking_reference, "status": booking.status}
