from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text, DateTime, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from db import Base

# Association table for followers (Many-to-Many self-referential)
follows = Table(
    'follows', Base.metadata,
    Column('follower_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('followed_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class StoreType(str, enum.Enum):
    department_store = "department_store"
    high_street_chain = "high_street_chain"
    boutique = "boutique"
    discount = "discount"
    luxury = "luxury"
    thrift = "thrift"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)  # NEW FIELD
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ... keep the rest of the relationships (items, scores, etc) ...
    items = relationship("Item", back_populates="owner")
    scores = relationship("UserStoreScore", back_populates="user")

    following = relationship(
        "User",
        secondary=follows,
        primaryjoin=id==follows.c.follower_id,
        secondaryjoin=id==follows.c.followed_id,
        backref="followers"
    )

    outgoing_requests = relationship(
        "FollowRequest",
        foreign_keys="FollowRequest.requester_id",
        back_populates="requester",
        cascade="all, delete-orphan"
    )
    incoming_requests = relationship(
        "FollowRequest",
        foreign_keys="FollowRequest.target_id",
        back_populates="target",
        cascade="all, delete-orphan"
    )

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    store_type = Column(Enum(StoreType))

    items = relationship("Item", back_populates="store")
    user_scores = relationship("UserStoreScore", back_populates="store")

class UserStoreScore(Base):
    """Per-user Elo rating for a specific store."""
    __tablename__ = "user_store_scores"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    store_id = Column(Integer, ForeignKey("stores.id"), primary_key=True)
    score = Column(Float, default=1200.0) # Standard starting Elo

    user = relationship("User", back_populates="scores")
    store = relationship("Store", back_populates="user_scores")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    store_id = Column(Integer, ForeignKey("stores.id"))

    image_path = Column(String)
    location_text = Column(String, nullable=True)

    # NEW COLUMNS
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    materials_text = Column(String, nullable=True)
    rating = Column(Integer)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="items")
    store = relationship("Store", back_populates="items")

class FollowRequest(Base):
    __tablename__ = "follow_requests"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"))
    target_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    requester = relationship("User", foreign_keys=[requester_id], back_populates="outgoing_requests")
    target = relationship("User", foreign_keys=[target_id], back_populates="incoming_requests")
