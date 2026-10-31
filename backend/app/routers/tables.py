from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CafeTable, User
from app.schemas import CafeTableOut, CafeTableCreate
from app.auth import get_current_user
from app.qr_generator import generate_table_qr_token, generate_qr_code_base64

router = APIRouter(prefix="/api/tables", tags=["Tables"])

@router.get("", response_model=List[CafeTableOut])
def get_all_tables(db: Session = Depends(get_db)):
    return db.query(CafeTable).order_by(CafeTable.table_number).all()

@router.get("/{table_number}/validate")
def validate_table_qr(table_number: str, token: str, db: Session = Depends(get_db)):
    table = db.query(CafeTable).filter(CafeTable.table_number == table_number).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    if table.qr_token != token:
        raise HTTPException(status_code=403, detail="Invalid or expired QR code session for this table")
    return {
        "valid": True,
        "table_id": table.id,
        "table_number": table.table_number,
        "capacity": table.capacity,
        "location": table.location,
        "status": table.status
    }

@router.get("/{table_number}/qr-code")
def get_table_qr_code(table_number: str, origin_url: str = "http://localhost:5173", db: Session = Depends(get_db)):
    table = db.query(CafeTable).filter(CafeTable.table_number == table_number).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    order_url = f"{origin_url}/order/{table.table_number}?token={table.qr_token}"
    qr_image = generate_qr_code_base64(order_url)
    return {
        "table_number": table.table_number,
        "location": table.location,
        "capacity": table.capacity,
        "qr_token": table.qr_token,
        "order_url": order_url,
        "qr_image_base64": qr_image
    }

@router.post("", response_model=CafeTableOut)
def create_table(table_in: CafeTableCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(CafeTable).filter(CafeTable.table_number == table_in.table_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table number already exists")
    
    token = f"TOKEN_{table_in.table_number}_{generate_table_qr_token()}"
    new_table = CafeTable(
        table_number=table_in.table_number,
        capacity=table_in.capacity,
        location=table_in.location,
        status=table_in.status,
        qr_token=token
    )
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    return new_table

@router.put("/{table_id}/status")
def update_table_status(table_id: int, status_update: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    table = db.query(CafeTable).filter(CafeTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    new_status = status_update.get("status")
    if new_status:
        table.status = new_status
        db.commit()
    return {"message": "Table status updated", "table_number": table.table_number, "status": table.status}
