import sys
import os
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, CafeTable, MenuCategory, MenuItem, TableBooking, CelebrationBooking, Order, OrderItem, Feedback
from app.auth import get_password_hash
from app.qr_generator import generate_table_qr_token

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Admin from env (prod) — fallback only for local demo
    admin_username = os.getenv("ADMIN_USERNAME", "admin").strip() or "admin"
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@maitricafe.com").strip() or "admin@maitricafe.com"
    admin_full_name = os.getenv("ADMIN_FULL_NAME", "Maitri Manager").strip() or "Maitri Manager"

    admin = db.query(User).filter(User.username == admin_username).first()
    if not admin:
        admin = User(
            username=admin_username,
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            full_name=admin_full_name,
            role="admin",
        )
        db.add(admin)
    elif os.getenv("ADMIN_PASSWORD"):
        # When ADMIN_PASSWORD is set on Render, always sync hash (rotate prod password)
        admin.hashed_password = get_password_hash(admin_password)
        admin.email = admin_email
        admin.full_name = admin_full_name
        admin.role = "admin"


    # Seed Cafe Tables (T01 - T08)
    tables_data = [
        {"table_number": "T01", "capacity": 2, "location": "Indoor Window"},
        {"table_number": "T02", "capacity": 4, "location": "Indoor Center"},
        {"table_number": "T03", "capacity": 6, "location": "Indoor Large"},
        {"table_number": "T04", "capacity": 4, "location": "Indoor Cozy"},
        {"table_number": "T05", "capacity": 2, "location": "Garden View"},
        {"table_number": "T06", "capacity": 4, "location": "Garden Patio"},
        {"table_number": "T07", "capacity": 8, "location": "Rooftop Party Section"},
        {"table_number": "T08", "capacity": 4, "location": "Rooftop Couple View"},
    ]

    for t in tables_data:
        existing = db.query(CafeTable).filter(CafeTable.table_number == t["table_number"]).first()
        if not existing:
            token = f"TOKEN_{t['table_number']}_{generate_table_qr_token()}"
            table = CafeTable(
                table_number=t["table_number"],
                capacity=t["capacity"],
                location=t["location"],
                status="Available",
                qr_token=token
            )
            db.add(table)

    # Seed Menu Categories & Items
    categories_menu = [
        {
            "name": "Starters & Snacks",
            "items": [
                {"name": "Crispy Peri Peri Fries", "description": "Golden skin-on fries tossed in spicy African peri peri seasoning", "price": 169, "is_veg": True, "prep_time_mins": 10, "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80"},
                {"name": "Paneer Tikka Bites", "description": "Soft cottage cheese cubes marinated in tandoori spices and charred to perfection", "price": 249, "is_veg": True, "prep_time_mins": 15, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80"},
                {"name": "Garlic Butter Cheese Toast", "description": "Artisanal bread loaded with garlic butter and melted mozzarella", "price": 189, "is_veg": True, "prep_time_mins": 10, "image_url": "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bff?w=500&q=80"},
                {"name": "Crispy Veg Spring Rolls", "description": "Golden fried rolls stuffed with shredded veggies & sweet chili sauce", "price": 199, "is_veg": True, "prep_time_mins": 12, "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80"}
            ]
        },
        {
            "name": "Artisanal Pizzas",
            "items": [
                {"name": "Maitri Special Veggie Pizza", "description": "Hand-tossed crust topped with bell peppers, olives, corn, jalapeños & double cheese", "price": 349, "is_veg": True, "prep_time_mins": 20, "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80"},
                {"name": "Classic Margherita", "description": "San Marzano style tomato sauce, fresh mozzarella, and fresh basil leaves", "price": 299, "is_veg": True, "prep_time_mins": 18, "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80"},
                {"name": "Spicy Paneer Makhani Pizza", "description": "Fusion pizza topped with rich makhani sauce, spiced paneer & coriander", "price": 379, "is_veg": True, "prep_time_mins": 20, "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80"}
            ]
        },
        {
            "name": "Burgers & Sandwiches",
            "items": [
                {"name": "Ultimate Veggie Crunch Burger", "description": "Crispy herb potato patty, cheddar cheese slice, caramelized onion & secret sauce", "price": 199, "is_veg": True, "prep_time_mins": 15, "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80"},
                {"name": "Grilled Bombay Masala Toastie", "description": "Triple-decker grilled sandwich filled with spiced potato, veggies, mint chutney & cheese", "price": 179, "is_veg": True, "prep_time_mins": 12, "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80"}
            ]
        },
        {
            "name": "Pastas & Main Course",
            "items": [
                {"name": "Creamy Alfredo Penne", "description": "Penne pasta tossed in garlic parmesan white sauce with exotic mushrooms & veggies", "price": 289, "is_veg": True, "prep_time_mins": 18, "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281273?w=500&q=80"},
                {"name": "Spicy Arrabbiata Pasta", "description": "Penne pasta in fiery red tomato basil sauce topped with black olives & parmesan", "price": 269, "is_veg": True, "prep_time_mins": 16, "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80"}
            ]
        },
        {
            "name": "Beverages & Cold Coffees",
            "items": [
                {"name": "Signature Cold Coffee w/ Ice Cream", "description": "Rich espresso blended with milk, dark cocoa, topped with vanilla scoop", "price": 149, "is_veg": True, "prep_time_mins": 8, "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80"},
                {"name": "Fresh Mint Mojito", "description": "Chilled sparkling soda muddled with fresh mint, lime juice & cane sugar", "price": 129, "is_veg": True, "prep_time_mins": 5, "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80"},
                {"name": "Belgian Chocolate Shake", "description": "Thick milk shake loaded with rich Belgian cocoa fudge & chocolate curls", "price": 179, "is_veg": True, "prep_time_mins": 8, "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80"}
            ]
        },
        {
            "name": "Desserts & Cakes",
            "items": [
                {"name": "Warm Sizzling Brownie w/ Vanilla", "description": "Fudgy dark chocolate brownie served on a hot skillet with vanilla ice cream", "price": 219, "is_veg": True, "prep_time_mins": 10, "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80"},
                {"name": "New York Baked Cheesecake", "description": "Classic creamy cheesecake slice served with blueberry compote", "price": 249, "is_veg": True, "prep_time_mins": 5, "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80"}
            ]
        }
    ]

    order_idx = 1
    for cat_data in categories_menu:
        cat = db.query(MenuCategory).filter(MenuCategory.name == cat_data["name"]).first()
        if not cat:
            cat = MenuCategory(name=cat_data["name"], display_order=order_idx)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            order_idx += 1

        for item_data in cat_data["items"]:
            existing_item = db.query(MenuItem).filter(MenuItem.name == item_data["name"]).first()
            if not existing_item:
                item = MenuItem(
                    category_id=cat.id,
                    name=item_data["name"],
                    description=item_data["description"],
                    price=item_data["price"],
                    is_veg=item_data["is_veg"],
                    prep_time_mins=item_data["prep_time_mins"],
                    image_url=item_data["image_url"],
                    is_available=True
                )
                db.add(item)

    db.commit()
    db.close()
    print("Database seeded successfully with initial tables, admin user, and menu items!")

if __name__ == "__main__":
    seed_db()
