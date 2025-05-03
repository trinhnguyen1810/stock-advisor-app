from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

# Import routes
from routes.auth_routes import auth_bp
from routes.stock_routes import stock_bp
from routes.analysis_routes import analysis_bp

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configure app
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(stock_bp, url_prefix='/api/stocks')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

# Root route
@app.route('/')
def index():
    return jsonify({
        'message': 'Stock Trend Causality + AI Investment Advisor API',
        'status': 'running'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'message': 'Resource not found',
        'error': str(error)
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'message': 'Internal server error',
        'error': str(error)
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)