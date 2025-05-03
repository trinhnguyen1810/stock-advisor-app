import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the directory of this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# SQLite database file path
DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'stock_advisor.db')}"

# Create database engine
engine = create_engine(DATABASE_URI, connect_args={"check_same_thread": False})

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()

# SQLAlchemy database instance
db = SQLAlchemy()

# Initialize database
def init_db(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    
    # Create all tables
    with app.app_context():
        db.create_all()
        
def get_db_session():
    """Get a database session"""
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()