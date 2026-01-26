from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from models import StoreType

# --- User Schemas ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class UserCreate(BaseModel):
    username: str
    password: str  # Added password

class UserOut(UserBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Store Schemas ---
class StoreBase(BaseModel):
    name: str
    store_type: StoreType

class StoreCreate(StoreBase):
    pass

class StoreOut(StoreBase):
    id: int
    model_config = {"from_attributes": True}

class StoreRankingOut(StoreOut):
    current_elo: float

# --- Item Schemas ---
class ItemOut(BaseModel):
    id: int
    user_id: int
    store_id: int
    image_path: str
    location_text: Optional[str]

    # NEW FIELDS
    latitude: Optional[float]
    longitude: Optional[float]

    materials_text: Optional[str]
    rating: int
    notes: Optional[str]
    created_at: datetime
    store: StoreOut

    class Config:
        orm_mode = True

# --- Action Schemas ---
class FollowRequest(BaseModel):
    follower_username: str
    target_username: str

class FollowRequestOut(BaseModel):
    id: int
    requester_username: str
    target_username: str
    status: str
    created_at: datetime

class CompareRequest(BaseModel):
    user_id: int
    winner_store_id: int
    loser_store_id: int
