from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import yfinance as yf
import pandas as pd
import json
from datetime import datetime, timedelta

# Create blueprint
stock_bp = Blueprint('stocks', __name__)

# Popular stocks
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

# Routes
@stock_bp.route('/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """Get stock data for a specific symbol"""
    timeframe = request.args.get('timeframe', 'max')  # Default to max
    
    # Map timeframe to period
    periods = {
        '1d': '1d',
        '5d': '5d',
        '1mo': '1mo',
        '3mo': '3mo',
        '6mo': '6mo',
        '1y': '1y',
        '2y': '2y',
        '5y': '5y',
        'max': 'max'
    }
    
    period = periods.get(timeframe, '1mo')
    
    try:
        # Get stock data
        stock = yf.Ticker(symbol)
        hist = stock.history(period=period)
        
        # Format data
        data = []
        for date, row in hist.iterrows():
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'volume': int(row['Volume'])
            })
        
        # Get company info
        try:
            info = stock.info
            company_name = info.get('shortName', symbol)
            sector = info.get('sector', '')
            industry = info.get('industry', '')
        except:
            company_name = symbol
            sector = ''
            industry = ''
        
        return jsonify({
            'symbol': symbol,
            'name': company_name,
            'sector': sector,
            'industry': industry,
            'prices': data
        }), 200
    
    except Exception as e:
        return jsonify({
            'message': f'Error fetching stock data: {str(e)}'
        }), 500

@stock_bp.route('/search', methods=['GET'])
def search_stocks():
    """Search for stocks by keyword"""
    query = request.args.get('q', '')
    
    if not query or len(query) < 2:
        return jsonify([]), 200
    
    try:
        # This is a simplified implementation
        # In a real app, you'd use a more sophisticated search
        tickers = yf.Tickers(' '.join([query, f"{query}.*"]))
        results = []
        
        for ticker in tickers.tickers:
            try:
                info = ticker.info
                if 'symbol' in info and 'shortName' in info:
                    results.append({
                        'symbol': info['symbol'],
                        'name': info['shortName']
                    })
                    # Limit to 10 results
                    if len(results) >= 10:
                        break
            except:
                pass
        
        return jsonify(results), 200
    
    except Exception as e:
        # Fallback to mock data for demo purposes
        mock_results = [
            {"symbol": f"{query.upper()}", "name": f"Sample Company for {query}"},
            {"symbol": f"{query.upper()}A", "name": f"Another Sample for {query}"}
        ]
        return jsonify(mock_results), 200

@stock_bp.route('/popular', methods=['GET'])
def get_popular_stocks():
    """Get a list of popular stocks"""
    return jsonify(POPULAR_STOCKS), 200

@stock_bp.route('/details/<symbol>', methods=['GET'])
def get_stock_details(symbol):
    """Get detailed information about a stock"""
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
        # Format data
        details = {
            'symbol': symbol,
            'name': info.get('shortName', symbol),
            'logo': info.get('logo_url', ''),
            'sector': info.get('sector', ''),
            'industry': info.get('industry', ''),
            'description': info.get('longBusinessSummary', ''),
            'website': info.get('website', ''),
            'market_cap': info.get('marketCap', 0),
            'pe_ratio': info.get('trailingPE', 0),
            'dividend_yield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
            'fifty_two_week_high': info.get('fiftyTwoWeekHigh', 0),
            'fifty_two_week_low': info.get('fiftyTwoWeekLow', 0),
            'average_volume': info.get('averageVolume', 0),
            'beta': info.get('beta', 0)
        }
        
        return jsonify(details), 200
    
    except Exception as e:
        # Fallback to mock data for demo purposes
        mock_details = {
            'symbol': symbol,
            'name': f"{symbol} Inc.",
            'logo': '',
            'sector': 'Technology',
            'industry': 'Software',
            'description': f"This is a sample description for {symbol}.",
            'website': f"https://www.{symbol.lower()}.com",
            'market_cap': 1000000000,
            'pe_ratio': 20.5,
            'dividend_yield': 1.5,
            'fifty_two_week_high': 150.0,
            'fifty_two_week_low': 100.0,
            'average_volume': 5000000,
            'beta': 1.2
        }
        
        return jsonify(mock_details), 200