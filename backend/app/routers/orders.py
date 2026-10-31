import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Order, OrderItem, CafeTable, MenuItem, ServiceRequest, User
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate, ServiceRequestCreate, ServiceRequestOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# --- Table Service Requests (Water / Waiter / Bill) ---
# NOTE: Static routes MUST be declared before dynamic path parameter routes (/{order_id}) in FastAPI
@router.post("/service-request", response_model=ServiceRequestOut)
def create_service_request(req_in: ServiceRequestCreate, db: Session = Depends(get_db)):
    req = ServiceRequest(
        table_number=req_in.table_number,
        request_type=req_in.request_type,
        status="Pending"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/service-requests", response_model=List[ServiceRequestOut])
def get_service_requests(db: Session = Depends(get_db)):
    return db.query(ServiceRequest).filter(ServiceRequest.status == "Pending").order_by(ServiceRequest.created_at.desc()).all()

@router.put("/service-requests/{req_id}/attend")
def attend_service_request(req_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found")
    req.status = "Attended"
    db.commit()
    return {"message": "Service request attended"}

# --- Order Placement & Queue ---
@router.post("", response_model=OrderOut)
def place_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    # 1. Validate Table and QR Token
    table = db.query(CafeTable).filter(CafeTable.table_number == order_in.table_number).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    if table.qr_token != order_in.qr_token:
        raise HTTPException(status_code=403, detail="Invalid QR Code session for this table")
    
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one menu item")
    
    # Generate Order Number e.g. #1045
    order_num = f"#{random.randint(1000, 9999)}"
    
    total_amount = 0.0
    order_items_to_create = []

    for item_data in order_in.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_data.menu_item_id).first()
        if not menu_item or not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"Item ID {item_data.menu_item_id} is unavailable")
        
        subtotal = menu_item.price * item_data.quantity
        total_amount += subtotal
        
        order_items_to_create.append({
            "menu_item_id": menu_item.id,
            "item_name": menu_item.name,
            "price_per_unit": menu_item.price,
            "quantity": item_data.quantity,
            "subtotal": subtotal,
            "notes": item_data.notes
        })

    new_order = Order(
        order_number=order_num,
        table_id=table.id,
        customer_name=order_in.customer_name or f"Guest @ {table.table_number}",
        customer_phone=order_in.customer_phone,
        total_amount=total_amount,
        order_status="Received", # Order Received -> Customer waiting for Admin confirmation
        payment_status="Pending",
        payment_method="Pay at Counter",
        notes=order_in.notes
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Attach order items
    for item_dict in order_items_to_create:
        item_obj = OrderItem(order_id=new_order.id, **item_dict)
        db.add(item_obj)

    # Update Table status to Occupied
    table.status = "Occupied"
    db.commit()
    db.refresh(new_order)

    # Convert output with table_number
    output = OrderOut.model_validate(new_order)
    output.table_number = table.table_number
    return output

@router.get("", response_model=List[OrderOut])
def get_all_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Order)
    if status and status != "All":
        query = query.filter(Order.order_status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    results = []
    for o in orders:
        out = OrderOut.model_validate(o)
        if o.table:
            out.table_number = o.table.table_number
        results.append(out)
    return results

@router.get("/{order_id}", response_model=OrderOut)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    out = OrderOut.model_validate(order)
    if order.table:
        out.table_number = order.table.table_number
    return out

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, update: OrderStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import CustomerLoyalty, LoyaltyTransaction
    from app.routers.loyalty import calculate_tier

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["Received", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"]
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid order status")
    
    old_status = order.order_status
    order.order_status = update.status
    if update.status == "Delivered":
        order.payment_status = "Paid"

        # Credit Loyalty Points if customer phone exists
        if old_status != "Delivered" and order.customer_phone:
            earned_points = int((order.total_amount // 100) * 10)
            if earned_points > 0:
                loyalty = db.query(CustomerLoyalty).filter(CustomerLoyalty.phone == order.customer_phone).first()
                if not loyalty:
                    loyalty = CustomerLoyalty(
                        phone=order.customer_phone,
                        name=order.customer_name or "Valued Diner",
                        total_spent=0.0,
                        points_balance=0,
                        tier="Bronze"
                    )
                    db.add(loyalty)
                    db.commit()
                    db.refresh(loyalty)

                loyalty.points_balance += earned_points
                loyalty.total_spent += order.total_amount
                loyalty.tier = calculate_tier(loyalty.total_spent)

                tx = LoyaltyTransaction(
                    phone=order.customer_phone,
                    order_id=order.id,
                    points_change=earned_points,
                    description=f"Earned {earned_points} Pts for Order {order.order_number}"
                )
                db.add(tx)

    elif update.status == "Cancelled":
        if order.table:
            order.table.status = "Available"

    db.commit()
    db.refresh(order)
    
    out = OrderOut.model_validate(order)
    if order.table:
        out.table_number = order.table.table_number
    return out
