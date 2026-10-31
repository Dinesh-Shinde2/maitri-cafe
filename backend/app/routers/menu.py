from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import MenuCategory, MenuItem, User
from app.schemas import MenuCategoryOut, MenuCategoryCreate, MenuItemOut, MenuItemCreate
from app.auth import get_current_user

router = APIRouter(prefix="/api/menu", tags=["Menu"])

@router.get("", response_model=List[MenuCategoryOut])
def get_full_menu(db: Session = Depends(get_db)):
    categories = db.query(MenuCategory).filter(MenuCategory.is_active == True).order_by(MenuCategory.display_order).all()
    return categories

@router.post("/categories", response_model=MenuCategoryOut)
def create_category(cat_in: MenuCategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = MenuCategory(name=cat_in.name, display_order=cat_in.display_order)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.post("/items", response_model=MenuItemOut)
def create_menu_item(item_in: MenuItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = db.query(MenuCategory).filter(MenuCategory.id == item_in.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    item = MenuItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/items/{item_id}", response_model=MenuItemOut)
def update_menu_item(item_id: int, item_in: MenuItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    for key, value in item_in.model_dump().items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.patch("/items/{item_id}/toggle-availability")
def toggle_item_availability(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    item.is_available = not item.is_available
    db.commit()
    return {"id": item.id, "name": item.name, "is_available": item.is_available}

@router.delete("/items/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted successfully"}
