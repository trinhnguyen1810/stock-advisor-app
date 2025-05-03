"""
Configuration settings for the application
"""
import os
from datetime import timedelta

# Flask settings
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
PORT = int(os.environ.get('PORT', 5001))
HOST = os.environ.get('HOST', '0.0.0.0')

# JWT settings
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

# File paths
USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'users.json')

# API keys
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '')

# Stock API settings
DEFAULT_TIMEFRAME = '1mo'
POPULAR_STOCKS = [
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corporation"},
    {"symbol": "AMZN", "name": "Amazon.com, Inc."},
    {"symbol": "GOOGL", "name": "Alphabet Inc."},
    {"symbol": "META", "name": "Meta Platforms, Inc."},
    {"symbol": "TSLA", "name": "Tesla, Inc."},
    {"symbol": "NVDA", "name": "NVIDIA Corporation"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
    {"symbol": "V", "name": "Visa Inc."},
    {"symbol": "JNJ", "name": "Johnson & Johnson"}
]