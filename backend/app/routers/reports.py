from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models import Order, OrderItem, TableBooking, CelebrationBooking, CafeTable, MenuItem, User
from app.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/analytics")
def get_analytics_report(
    period: str = Query("Today", description="Today, Yesterday, This Week, This Month, All"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    
    if period == "Today":
        start_date = datetime(now.year, now.month, now.day, 0, 0, 0)
    elif period == "Yesterday":
        yesterday = now - timedelta(days=1)
        start_date = datetime(yesterday.year, yesterday.month, yesterday.day, 0, 0, 0)
    elif period == "This Week":
        start_date = now - timedelta(days=7)
    elif period == "This Month":
        start_date = datetime(now.year, now.month, 1, 0, 0, 0)
    else:
        start_date = datetime(2020, 1, 1)

    # 1. Sales & Orders Overview
    orders_query = db.query(Order).filter(Order.created_at >= start_date)
    all_orders = orders_query.all()
    
    completed_orders = [o for o in all_orders if o.order_status in ["Delivered", "Ready", "Preparing", "Confirmed", "Received"]]
    cancelled_orders = [o for o in all_orders if o.order_status == "Cancelled"]
    
    total_sales = sum(o.total_amount for o in completed_orders)
    total_orders_count = len(completed_orders)
    avg_order_value = round(total_sales / total_orders_count, 2) if total_orders_count > 0 else 0.0

    # 2. Food Item Performance (Top Ordered Dishes)
    item_stats = (
        db.query(
            OrderItem.item_name,
            func.sum(OrderItem.quantity).label("total_qty"),
            func.sum(OrderItem.subtotal).label("total_revenue")
        )
        .join(Order)
        .filter(Order.created_at >= start_date, Order.order_status != "Cancelled")
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(10)
        .all()
    )

    top_food_items = [
        {"item_name": item[0], "orders_count": int(item[1]), "revenue": float(item[2])}
        for item in item_stats
    ]

    # 3. Booking Metrics
    bookings = db.query(TableBooking).filter(TableBooking.created_at >= start_date).all()
    total_bookings = len(bookings)
    confirmed_bookings = len([b for b in bookings if b.status == "Confirmed"])
    completed_bookings = len([b for b in bookings if b.status == "Completed"])
    cancelled_bookings = len([b for b in bookings if b.status == "Cancelled"])

    # 4. Celebration Breakdown
    celebs = db.query(CelebrationBooking).filter(CelebrationBooking.created_at >= start_date).all()
    celeb_counts = {}
    for c in celebs:
        celeb_counts[c.event_type] = celeb_counts.get(c.event_type, 0) + 1

    # 5. Table Performance
    tables = db.query(CafeTable).all()
    table_reports = []
    for t in tables:
        t_orders = [o for o in all_orders if o.table_id == t.id and o.order_status != "Cancelled"]
        t_revenue = sum(o.total_amount for o in t_orders)
        table_reports.append({
            "table_number": t.table_number,
            "location": t.location,
            "capacity": t.capacity,
            "orders_count": len(t_orders),
            "revenue": t_revenue,
            "current_status": t.status
        })

    return {
        "period": period,
        "overview": {
            "total_sales": total_sales,
            "total_orders": total_orders_count,
            "avg_order_value": avg_order_value,
            "cancelled_orders": len(cancelled_orders)
        },
        "top_food_items": top_food_items,
        "bookings_summary": {
            "total_bookings": total_bookings,
            "confirmed": confirmed_bookings,
            "completed": completed_bookings,
            "cancelled": cancelled_bookings
        },
        "celebration_summary": {
            "total_requests": len(celebs),
            "by_event_type": celeb_counts
        },
        "table_reports": table_reports
    }
