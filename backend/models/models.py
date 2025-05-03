from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base, db

class User(db.Model):
    """User model for authentication and profile"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with SavedAnalysis
    saved_analyses = relationship("SavedAnalysis", back_populates="user", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class SavedAnalysis(db.Model):
    """Model for saved stock analyses"""
    __tablename__ = "saved_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    name = Column(String(255))
    recommendation = Column(String(50))
    notes = Column(Text)
    factors = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with User
    user = relationship("User", back_populates="saved_analyses")
    
    def to_dict(self):
        """Convert saved analysis object to dictionary"""
        return {
            "id": str(self.id),
            "symbol": self.symbol,
            "name": self.name,
            "recommendation": self.recommendation,
            "notes": self.notes,
            "factors": self.factors,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }