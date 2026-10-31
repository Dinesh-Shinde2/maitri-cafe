from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import CustomerLoyalty, LoyaltyReward, LoyaltyTransaction, Order, User
from app.auth import get_current_user

router = APIRouter(prefix="/api/loyalty", tags=["Loyalty & Rewards"])

class AdjustPointsRequest(BaseModel):
    phone: str
    name: Optional[str] = "Valued Diner"
    points_change: int
    description: str

class RewardCreateRequest(BaseModel):
    reward_name: str
    points_required: int
    discount_amount: float

class RedeemRequest(BaseModel):
    phone: str
    reward_id: int

def calculate_tier(total_spent: float) -> str:
    if total_spent >= 5000:
        return "Platinum"
    elif total_spent >= 2500:
        return "Gold"
    elif total_spent >= 1000:
        return "Silver"
    return "Bronze"

@router.get("/customer/{phone}")
def get_customer_loyalty(phone: str, db: Session = Depends(get_db)):
    loyalty = db.query(CustomerLoyalty).filter(CustomerLoyalty.phone == phone).first()
    if not loyalty:
        # Auto-create loyalty profile for new customer with 20 Welcome Points!
        loyalty = CustomerLoyalty(
            phone=phone,
            name="Valued Guest",
            total_spent=0.0,
            points_balance=20, # Welcome bonus!
            tier="Bronze"
        )
        db.add(loyalty)
        db.commit()
        db.refresh(loyalty)

        # Log Welcome Bonus Transaction
        tx = LoyaltyTransaction(
            phone=phone,
            points_change=20,
            description="Welcome Bonus for Joining Maitri Rewards!"
        )
        db.add(tx)
        db.commit()

    txs = db.query(LoyaltyTransaction).filter(LoyaltyTransaction.phone == phone).order_by(LoyaltyTransaction.created_at.desc()).limit(10).all()
    
    return {
        "phone": loyalty.phone,
        "name": loyalty.name,
        "total_spent": loyalty.total_spent,
        "points_balance": loyalty.points_balance,
        "tier": loyalty.tier,
        "recent_transactions": [
            {
                "id": t.id,
                "points_change": t.points_change,
                "description": t.description,
                "created_at": t.created_at
            }
            for t in txs
        ]
    }

@router.get("/rewards")
def get_active_rewards(db: Session = Depends(get_db)):
    rewards = db.query(LoyaltyReward).filter(LoyaltyReward.is_active == True).order_by(LoyaltyReward.points_required).all()
    if not rewards:
        # Seed default rewards catalog if empty
        default_rewards = [
            {"reward_name": "Free Peri Peri Fries", "points_required": 50, "discount_amount": 169.0},
            {"reward_name": "Free Signature Cold Coffee", "points_required": 100, "discount_amount": 149.0},
            {"reward_name": "Free Warm Sizzling Brownie", "points_required": 150, "discount_amount": 219.0},
            {"reward_name": "Free Maitri Special Pizza", "points_required": 250, "discount_amount": 349.0},
        ]
        for r in default_rewards:
            reward_obj = LoyaltyReward(**r)
            db.add(reward_obj)
        db.commit()
        rewards = db.query(LoyaltyReward).filter(LoyaltyReward.is_active == True).order_by(LoyaltyReward.points_required).all()

    return rewards

@router.post("/redeem")
def redeem_points(request: RedeemRequest, db: Session = Depends(get_db)):
    loyalty = db.query(CustomerLoyalty).filter(CustomerLoyalty.phone == request.phone).first()
    if not loyalty:
        raise HTTPException(status_code=404, detail="Loyalty account not found for this phone number")
    
    reward = db.query(LoyaltyReward).filter(LoyaltyReward.id == request.reward_id).first()
    if not reward or not reward.is_active:
        raise HTTPException(status_code=404, detail="Reward option not available")
    
    if loyalty.points_balance < reward.points_required:
        raise HTTPException(status_code=400, detail=f"Insufficient points balance ({loyalty.points_balance} / {reward.points_required} Pts)")
    
    # Deduct points
    loyalty.points_balance -= reward.points_required
    
    tx = LoyaltyTransaction(
        phone=request.phone,
        points_change=-reward.points_required,
        description=f"Redeemed reward: {reward.reward_name}"
    )
    db.add(tx)
    db.commit()
    db.refresh(loyalty)

    return {
        "success": True,
        "reward_name": reward.reward_name,
        "discount_amount": reward.discount_amount,
        "remaining_points": loyalty.points_balance
    }

# --- ADMIN LOYALTY MANAGEMENT ENDPOINTS ---
@router.get("/admin/customers")
def get_all_loyalty_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customers = db.query(CustomerLoyalty).order_by(CustomerLoyalty.points_balance.desc()).all()
    return customers

@router.post("/admin/adjust-points")
def admin_adjust_points(req: AdjustPointsRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loyalty = db.query(CustomerLoyalty).filter(CustomerLoyalty.phone == req.phone).first()
    if not loyalty:
        loyalty = CustomerLoyalty(
            phone=req.phone,
            name=req.name or "Valued Guest",
            total_spent=0.0,
            points_balance=0,
            tier="Bronze"
        )
        db.add(loyalty)
        db.commit()
        db.refresh(loyalty)

    loyalty.points_balance += req.points_change
    if loyalty.points_balance < 0:
        loyalty.points_balance = 0

    tx = LoyaltyTransaction(
        phone=req.phone,
        points_change=req.points_change,
        description=f"Admin Adjustment: {req.description}"
    )
    db.add(tx)
    db.commit()
    db.refresh(loyalty)

    return {
        "message": "Points balance updated successfully",
        "phone": loyalty.phone,
        "new_balance": loyalty.points_balance
    }

@router.post("/admin/rewards")
def admin_create_reward(req: RewardCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reward = LoyaltyReward(
        reward_name=req.reward_name,
        points_required=req.points_required,
        discount_amount=req.discount_amount,
        is_active=True
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward
