"""
Stock Trend Causality + AI Investment Advisor Launcher
This script sets up and runs the application with proper configuration.
"""
import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Ensure required directories exist
os.makedirs('backend/services', exist_ok=True)
os.makedirs('backend/utils', exist_ok=True)

# Create users.json file if it doesn't exist
if not os.path.exists('users.json'):
    with open('users.json', 'w') as f:
        json.dump({}, f)

# Set environment variables
if 'JWT_SECRET_KEY' not in os.environ:
    os.environ['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-production'

# Add backend to Python path
sys.path.append(os.path.abspath('backend'))

# Import and run the Flask app
from backend.app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Stock Advisor API on port {port}...")
    print(f"Access the API at http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)