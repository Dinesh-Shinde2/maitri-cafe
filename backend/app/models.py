from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="admin")  # admin, staff
    created_at = Column(DateTime, default=datetime.utcnow)

class CafeTable(Base):
    __tablename__ = "cafe_tables"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(String, unique=True, index=True, nullable=False) # e.g. T01, T02
    capacity = Column(Integer, nullable=False, default=4)
    location = Column(String, default="Indoor") # Indoor, Rooftop, Garden, Window
    status = Column(String, default="Available") # Available, Occupied, Reserved, Maintenance
    qr_token = Column(String, unique=True, nullable=False) # Security token for QR validation
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="table")
    bookings = relationship("TableBooking", back_populates="table")

class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    items = relationship("MenuItem", back_populates="category")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("menu_categories.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    prep_time_mins = Column(Integer, default=15)

    category = relationship("MenuCategory", back_populates="items")
    order_items = relationship("OrderItem", back_populates="menu_item")

class TableBooking(Base):
    __tablename__ = "table_bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String, unique=True, index=True, nullable=False) # e.g. MB-8291
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_email = Column(String, nullable=True)
    booking_date = Column(String, nullable=False) # YYYY-MM-DD
    booking_time = Column(String, nullable=False) # e.g. 19:00
    guest_count = Column(Integer, nullable=False)
    seating_preference = Column(String, default="Indoor")
    table_id = Column(Integer, ForeignKey("cafe_tables.id"), nullable=True)
    special_notes = Column(Text, nullable=True)
    status = Column(String, default="Confirmed") # Pending, Confirmed, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    table = relationship("CafeTable", back_populates="bookings")

class CelebrationBooking(Base):
    __tablename__ = "celebration_bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String, unique=True, index=True, nullable=False) # e.g. CELEB-4912
    event_type = Column(String, nullable=False) # Birthday, Anniversary, Couple Date, Friends Party, Family Gathering, Custom
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_email = Column(String, nullable=True)
    event_date = Column(String, nullable=False)
    event_time = Column(String, nullable=False)
    guest_count = Column(Integer, nullable=False)
    decor_required = Column(Boolean, default=False)
    cake_required = Column(Boolean, default=False)
    food_package = Column(String, nullable=True) # Silver, Gold, Platinum, Custom
    special_requests = Column(Text, nullable=True)
    status = Column(String, default="Pending") # Pending, Accepted, Contacted, Rejected, Completed
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False) # e.g. #1045
    table_id = Column(Integer, ForeignKey("cafe_tables.id"), nullable=False)
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    order_status = Column(String, default="Received") # Received, Confirmed, Preparing, Ready, Delivered, Cancelled
    payment_status = Column(String, default="Pending") # Pending, Paid
    payment_method = Column(String, default="Pay at Counter") # Pay at Counter, UPI, Cash
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    table = relationship("CafeTable", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    item_name = Column(String, nullable=False)
    price_per_unit = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False)
    notes = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    table_number = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    food_rating = Column(Integer, default=5)
    service_rating = Column(Integer, default=5)
    ambience_rating = Column(Integer, default=5)
    cleanliness_rating = Column(Integer, default=5)
    overall_rating = Column(Float, default=5.0)
    comments = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="feedback")

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(String, nullable=False)
    request_type = Column(String, nullable=False) # Water, Waiter, Bill
    status = Column(String, default="Pending") # Pending, Attended
    created_at = Column(DateTime, default=datetime.utcnow)

class CustomerLoyalty(Base):
    __tablename__ = "customer_loyalty"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, default="Valued Diner")
    total_spent = Column(Float, default=0.0)
    points_balance = Column(Integer, default=0)
    tier = Column(String, default="Bronze") # Bronze, Silver, Gold, Platinum
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LoyaltyReward(Base):
    __tablename__ = "loyalty_rewards"

    id = Column(Integer, primary_key=True, index=True)
    reward_name = Column(String, nullable=False) # e.g. Free Cold Coffee
    points_required = Column(Integer, nullable=False, default=100)
    discount_amount = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, nullable=False, index=True)
    order_id = Column(Integer, nullable=True)
    points_change = Column(Integer, nullable=False) # positive for earned, negative for redeemed
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
