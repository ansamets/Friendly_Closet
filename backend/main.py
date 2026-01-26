from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.exc import IntegrityError
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from datetime import datetime
from passlib.context import CryptContext
from pydantic import BaseModel
from db import engine, Base, get_db
import models
import schemas
import elo
from PIL import Image, ImageOps
from geopy.geocoders import Nominatim

# Initialize Geocoder
geolocator = Nominatim(user_agent="wardrobe_app_v1")

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wardrobe API")
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Setup CORS for localhost frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
class UserCreate(BaseModel):
    username: str
    password: str

# --- AUTH ---
@app.post("/auth", response_model=schemas.UserOut)
def login_or_create(user_data: UserCreate, db: Session = Depends(get_db)):
    # Try to find user
    print(f"DEBUG: Password received is: '{user_data.password}'")
    user = db.query(models.User).filter(models.User.username == user_data.username).first()

    if not user:
        # CREATE NEW USER
        hashed_password = pwd_context.hash(user_data.password)
        user = models.User(username=user_data.username, password_hash=hashed_password)
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Username already taken")
    else:
        # VERIFY PASSWORD
        if not pwd_context.verify(user_data.password, user.password_hash):
             raise HTTPException(status_code=400, detail="Incorrect password")

    return user

# --- SOCIAL ---
@app.post("/follow")
def follow_user(req: schemas.FollowRequest, db: Session = Depends(get_db)):
    follower = db.query(models.User).filter(models.User.username == req.follower_username).first()
    target = db.query(models.User).filter(models.User.username == req.target_username).first()

    if not follower or not target:
        raise HTTPException(status_code=404, detail="User not found")

    if follower.id == target.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    if target in follower.following:
        return {"message": f"Already following {target.username}"}

    existing = (
        db.query(models.FollowRequest)
        .filter(
            models.FollowRequest.requester_id == follower.id,
            models.FollowRequest.target_id == target.id,
            models.FollowRequest.status == "pending",
        )
        .first()
    )
    if existing:
        return {"message": "Follow request already sent"}

    request = models.FollowRequest(requester_id=follower.id, target_id=target.id, status="pending")
    db.add(request)
    db.commit()
    return {"message": f"Follow request sent to {target.username}"}

@app.post("/unfollow")
def unfollow_user(req: schemas.FollowRequest, db: Session = Depends(get_db)):
    follower = db.query(models.User).filter(models.User.username == req.follower_username).first()
    target = db.query(models.User).filter(models.User.username == req.target_username).first()

    if not follower or not target:
        raise HTTPException(status_code=404, detail="User not found")

    if target not in follower.following:
        return {"message": f"Not following {target.username}"}

    follower.following.remove(target)
    db.commit()
    return {"message": f"Unfollowed {target.username}"}

@app.get("/follow_requests", response_model=List[schemas.FollowRequestOut])
def get_follow_requests(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    requests = (
        db.query(models.FollowRequest)
        .filter(
            models.FollowRequest.target_id == user.id,
            models.FollowRequest.status == "pending",
        )
        .order_by(models.FollowRequest.created_at.desc())
        .all()
    )

    return [
        schemas.FollowRequestOut(
            id=r.id,
            requester_username=r.requester.username,
            target_username=r.target.username,
            status=r.status,
            created_at=r.created_at,
        )
        for r in requests
    ]

@app.get("/follow_requests/sent", response_model=List[schemas.FollowRequestOut])
def get_sent_follow_requests(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    requests = (
        db.query(models.FollowRequest)
        .filter(
            models.FollowRequest.requester_id == user.id,
            models.FollowRequest.status == "pending",
        )
        .order_by(models.FollowRequest.created_at.desc())
        .all()
    )

    return [
        schemas.FollowRequestOut(
            id=r.id,
            requester_username=r.requester.username,
            target_username=r.target.username,
            status=r.status,
            created_at=r.created_at,
        )
        for r in requests
    ]

@app.post("/follow_requests/{request_id}/accept")
def accept_follow_request(request_id: int, username: str, db: Session = Depends(get_db)):
    req = db.query(models.FollowRequest).filter(models.FollowRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.target.username != username:
        raise HTTPException(status_code=403, detail="Not allowed")

    if req.status != "pending":
        return {"message": "Request already handled"}

    req.requester.following.append(req.target)
    req.status = "accepted"
    db.commit()
    return {"message": "Follow request accepted"}

@app.post("/follow_requests/{request_id}/reject")
def reject_follow_request(request_id: int, username: str, db: Session = Depends(get_db)):
    req = db.query(models.FollowRequest).filter(models.FollowRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.target.username != username:
        raise HTTPException(status_code=403, detail="Not allowed")

    if req.status != "pending":
        return {"message": "Request already handled"}

    req.status = "rejected"
    db.commit()
    return {"message": "Follow request rejected"}

@app.post("/follow_requests/{request_id}/cancel")
def cancel_follow_request(request_id: int, username: str, db: Session = Depends(get_db)):
    req = db.query(models.FollowRequest).filter(models.FollowRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.requester.username != username:
        raise HTTPException(status_code=403, detail="Not allowed")

    if req.status != "pending":
        return {"message": "Request already handled"}

    req.status = "cancelled"
    db.commit()
    return {"message": "Follow request cancelled"}

@app.get("/users/{username}/following", response_model=List[schemas.UserOut])
def get_following(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user: raise HTTPException(404, "User not found")
    return user.following

@app.get("/users/{username}/followers", response_model=List[schemas.UserOut])
def get_followers(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user: raise HTTPException(404, "User not found")
    return user.followers

# --- STORES ---
@app.post("/stores", response_model=schemas.StoreOut)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    db_store = models.Store(**store.model_dump())
    try:
        db.add(db_store)
        db.commit()
        db.refresh(db_store)
    except Exception:
        db.rollback()
        # In a real app, handle duplicates gracefully
        raise HTTPException(400, "Store likely exists")
    return db_store

@app.get("/stores", response_model=List[schemas.StoreOut])
def get_stores(db: Session = Depends(get_db)):
    return db.query(models.Store).all()

# --- ITEMS (With File Upload) ---
# In backend/main.py

# 1. Make sure you have these imports at the top
from fastapi import Form, File, UploadFile
from typing import Optional
@app.post("/items", response_model=schemas.ItemOut)
def create_item(
    user_id: int = Form(...),
    store_name: str = Form(...),
    store_type: str = Form(...),
    location_text: Optional[str] = Form(None),
    # NEW: Accept coordinates directly from form
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    materials_text: Optional[str] = Form(None),
    rating: int = Form(...),
    notes: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Handle Store
    clean_name = store_name.strip()
    existing_store = db.query(models.Store).filter(models.Store.name == clean_name).first()

    if existing_store:
        store_id = existing_store.id
    else:
        new_store = models.Store(name=clean_name, store_type=store_type)
        db.add(new_store)
        db.commit()
        db.refresh(new_store)
        store_id = new_store.id

    # 2. Handle Image
    img = Image.open(image.file)
    img = ImageOps.exif_transpose(img)
    img.thumbnail((800, 800))

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    os.makedirs("uploads", exist_ok=True)
    base = os.path.splitext(os.path.basename(image.filename))[0]
    safe = "".join(c for c in base if c.isalnum() or c in ("-", "_"))[:40]
    filename = f"{safe}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}.jpg"
    file_location = os.path.join("uploads", filename)
    img.save(file_location, "JPEG", quality=80)

    # 3. COORDINATE LOGIC (Updated)
    final_lat = latitude
    final_lon = longitude

    # Fallback: If frontend didn't send coords but sent text, try server-side geocoding
    # Fallback: If frontend didn't send coords but sent text, try server-side geocoding
    # if (final_lat is None or final_lon is None) and location_text:
    #     try:
    #         query = f"{clean_name} {location_text}"
    #         loc = geolocator.geocode(query)

    #         if loc is not None:
    #             final_lat = loc.latitude
    #             final_lon = loc.longitude

    #     except Exception as e:
    #         print("Server-side geocoding failed:", e)


    # 4. Save Item
    new_item = models.Item(
        user_id=user_id,
        store_id=store_id,
        image_path=file_location,
        location_text=location_text,
        latitude=final_lat,  # Use the decided lat
        longitude=final_lon, # Use the decided lon
        materials_text=materials_text,
        rating=rating,
        notes=notes
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/items", response_model=List[schemas.ItemOut])
def get_feed(db: Session = Depends(get_db)):
    return db.query(models.Item).order_by(models.Item.created_at.desc()).all()

@app.get("/items/friends", response_model=List[schemas.ItemOut])
def get_friends_feed(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    friend_ids = [u.id for u in user.following]
    if not friend_ids:
        return []

    return (
        db.query(models.Item)
        .filter(models.Item.user_id.in_(friend_ids))
        .order_by(models.Item.created_at.desc())
        .all()
    )

# --- ELO RANKING SYSTEM ---
def get_user_store_score(db: Session, user_id: int, store_id: int) -> models.UserStoreScore:
    """Helper: fetch existing score row or create default (1200)"""
    score_entry = db.query(models.UserStoreScore).filter_by(user_id=user_id, store_id=store_id).first()
    if not score_entry:
        score_entry = models.UserStoreScore(user_id=user_id, store_id=store_id, score=1200.0)
        db.add(score_entry)
        db.commit() # Commit so it has an ID/Persists for the calc
        db.refresh(score_entry)
    return score_entry

@app.post("/compare_store")
def compare_stores(req: schemas.CompareRequest, db: Session = Depends(get_db)):
    # 1. Get current scores (or init defaults)
    winner_entry = get_user_store_score(db, req.user_id, req.winner_store_id)
    loser_entry = get_user_store_score(db, req.user_id, req.loser_store_id)

    # 2. Calculate new Elo
    new_win_score, new_lose_score = elo.calculate_elo(winner_entry.score, loser_entry.score)

    # 3. Update DB
    winner_entry.score = new_win_score
    loser_entry.score = new_lose_score
    db.commit()

    return {
        "winner_new_score": new_win_score,
        "loser_new_score": new_lose_score
    }

@app.get("/store_rankings", response_model=List[schemas.StoreRankingOut])
def get_user_rankings(user_id: int, db: Session = Depends(get_db)):
    """
    Returns stores sorted by the specific user's Elo score.
    If the user hasn't ranked a store, it won't appear here (or we could join and show 1200).
    Here we show only ranked stores for clarity.
    """
    results = (
        db.query(models.Store, models.UserStoreScore.score)
        .join(models.UserStoreScore, models.Store.id == models.UserStoreScore.store_id)
        .filter(models.UserStoreScore.user_id == user_id)
        .order_by(models.UserStoreScore.score.desc())
        .all()
    )

    # Format for response
    output = []
    for store, score in results:
        output.append(schemas.StoreRankingOut(
            id=store.id,
            name=store.name,
            store_type=store.store_type,
            current_elo=float(score),
        ))
    return output
