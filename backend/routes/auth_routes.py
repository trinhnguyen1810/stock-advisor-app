import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required
)
from werkzeug.security import generate_password_hash, check_password_hash
import json

# For simplicity, we'll use a JSON file to store users
# In a production app, you'd use a database
# Use absolute path to ensure it works in any environment
USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'users.json')

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# Helper functions
def get_users():
    """Load users from JSON file"""
    # Create the file with an empty object if it doesn't exist
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)
    
    with open(USERS_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            # If the file is empty or malformed, return an empty dict
            return {}

def save_users(users):
    """Save users to JSON file"""
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving users: {str(e)}")
        return False

# Routes
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'message': 'Missing required fields'}), 400
        
        users = get_users()
        
        # Check if user already exists
        if data['email'] in users:
            return jsonify({'message': 'User already exists'}), 409
        
        # Create new user
        users[data['email']] = {
            'id': str(len(users) + 1),
            'name': data['name'],
            'email': data['email'],
            'password': generate_password_hash(data['password']),
            'saved_analyses': []
        }
        
        # Save users to file
        if not save_users(users):
            return jsonify({'message': 'Error saving user data'}), 500
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing email or password'}), 400
        
        users = get_users()
        
        # Check if user exists
        if data['email'] not in users:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        user = users[data['email']]
        
        # Check password
        if not check_password_hash(user['password'], data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Create tokens
        access_token = create_access_token(identity=data['email'])
        refresh_token = create_refresh_token(identity=data['email'])
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            }
        }), 200
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user():
    try:
        current_user = get_jwt_identity()
        users = get_users()
        
        if current_user not in users:
            return jsonify({'message': 'User not found'}), 404
        
        user = users[current_user]
        
        return jsonify({
            'id': user['id'],
            'name': user['name'],
            'email': user['email']
        }), 200
    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)
        
        return jsonify({
            'access_token': access_token
        }), 200
    except Exception as e:
        print(f"Token refresh error: {str(e)}")
        return jsonify({'message': f'Server error: {str(e)}'}), 500