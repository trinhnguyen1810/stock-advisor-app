"""
Database initialization script
Run this script to create the database tables
"""
from flask import Flask
from database import init_db, db
from models.models import User, SavedAnalysis

# Create a minimal Flask app for initialization
app = Flask(__name__)

# Initialize the database
init_db(app)

# Create tables
with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Tables created successfully!")
    
    # Check if we have a test user
    test_user = User.query.filter_by(email='test@example.com').first()
    
    # Create a test user if none exists
    if not test_user:
        from werkzeug.security import generate_password_hash
        
        print("Creating test user...")
        test_user = User(
            email='test@example.com',
            name='Test User',
            password=generate_password_hash('password123')
        )
        db.session.add(test_user)
        db.session.commit()
        print("Test user created successfully!")

print("Database initialization complete!")