from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# --- Table Schemas ---
class CafeTableBase(BaseModel):
    table_number: str
    capacity: int
    location: str = "Indoor"
    status: str = "Available"

class CafeTableCreate(CafeTableBase):
    pass

class CafeTableOut(CafeTableBase):
    id: int
    qr_token: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Menu Schemas ---
class MenuCategoryBase(BaseModel):
    name: str
    display_order: int = 0
    is_active: bool = True

class MenuCategoryCreate(MenuCategoryBase):
    pass

class MenuItemBase(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_veg: bool = True
    is_available: bool = True
    prep_time_mins: int = 15

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemOut(MenuItemBase):
    id: int

    class Config:
        from_attributes = True

class MenuCategoryOut(MenuCategoryBase):
    id: int
    items: List[MenuItemOut] = []

    class Config:
        from_attributes = True

# --- Table Booking Schemas ---
class TableBookingCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    booking_date: str
    booking_time: str
    guest_count: int
    seating_preference: str = "Indoor"
    table_id: Optional[int] = None
    special_notes: Optional[str] = None

class TableBookingOut(TableBookingCreate):
    id: int
    booking_reference: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Celebration Schemas ---
class CelebrationBookingCreate(BaseModel):
    event_type: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    event_date: str
    event_time: str
    guest_count: int
    decor_required: bool = False
    cake_required: bool = False
    food_package: Optional[str] = "Standard"
    special_requests: Optional[str] = None

class CelebrationBookingOut(CelebrationBookingCreate):
    id: int
    booking_reference: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    table_number: str
    qr_token: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemCreate]

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    item_name: str
    price_per_unit: float
    quantity: int
    subtotal: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    order_number: str
    table_id: int
    table_number: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    total_amount: float
    order_status: str
    payment_status: str
    payment_method: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    order_id: Optional[int] = None
    table_number: Optional[str] = None
    customer_name: Optional[str] = None
    food_rating: int = 5
    service_rating: int = 5
    ambience_rating: int = 5
    cleanliness_rating: int = 5
    comments: Optional[str] = None
    is_public: bool = True

class FeedbackOut(FeedbackCreate):
    id: int
    overall_rating: float
    created_at: datetime

    class Config:
        from_attributes = True

# --- Service Request Schemas ---
class ServiceRequestCreate(BaseModel):
    table_number: str
    request_type: str # Water, Waiter, Bill

class ServiceRequestOut(ServiceRequestCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
