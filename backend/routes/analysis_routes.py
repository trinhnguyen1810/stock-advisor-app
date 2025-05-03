from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from database import db
from models.models import User, SavedAnalysis
from services.news_service import get_stock_news

# Create blueprint
analysis_bp = Blueprint('analysis', __name__)

def get_causal_factors(symbol):
    """
    Analyze causal factors affecting a stock
    This is a simplified implementation for demo purposes
    In a real application, you would use more sophisticated analysis
    """
    try:
        # Get stock data
        stock = yf.Ticker(symbol)
        hist = stock.history(period='6mo')
        
        # Calculate simple metrics
        returns = hist['Close'].pct_change().dropna()
        volatility = returns.std() * np.sqrt(252)  # Annualized volatility
        
        # Get market data (S&P 500)
        market = yf.Ticker('^GSPC')
        market_hist = market.history(period='6mo')
        market_returns = market_hist['Close'].pct_change().dropna()
        
        # Calculate correlation with market
        correlation = returns.corr(market_returns)
        
        # Get news sentiment (from our service)
        news = get_stock_news(symbol)
        news_sentiment = 0.5  # Neutral by default
        
        # Determine if there were any recent earnings
        had_recent_earnings = False
        try:
            earnings = stock.earnings_dates
            if not earnings.empty:
                latest_earnings = earnings.index[0]
                days_since_earnings = (datetime.now() - latest_earnings).days
                had_recent_earnings = days_since_earnings < 30
        except:
            pass
        
        # Create factors
        factors = [
            {
                "name": "Market Trend",
                "impact": round(correlation * 0.8, 2),
                "description": f"Stock has a {abs(correlation):.2f} correlation with the overall market"
            },
            {
                "name": "Volatility",
                "impact": round(min(volatility * 2, 1.0) * (0.5 if volatility > 0.2 else 0.8), 2),
                "description": f"Stock has {volatility:.2f} annualized volatility"
            }
        ]
        
        # Add earnings factor if recent
        if had_recent_earnings:
            last_price = hist['Close'].iloc[-1]
            pre_earnings_price = hist['Close'].iloc[-min(days_since_earnings + 5, len(hist) - 1)]
            earnings_impact = (last_price - pre_earnings_price) / pre_earnings_price
            
            factors.append({
                "name": "Earnings Report",
                "impact": round(min(abs(earnings_impact) * 2, 1.0) * (0.9 if earnings_impact > 0 else -0.9), 2),
                "description": f"Recent earnings report {'exceeded' if earnings_impact > 0 else 'missed'} expectations"
            })
        
        # Add sector performance factor
        try:
            sector = stock.info.get('sector')
            if sector:
                # This is simplified - in a real app, you'd compare with sector ETFs
                sector_impact = np.random.uniform(0.3, 0.7) * (1 if np.random.random() > 0.5 else -1)
                
                factors.append({
                    "name": "Sector Performance",
                    "impact": round(sector_impact, 2),
                    "description": f"{sector} sector is showing {'strong' if sector_impact > 0 else 'weak'} performance"
                })
        except:
            pass
        
        # Add news sentiment factor
        factors.append({
            "name": "News Sentiment",
            "impact": round((news_sentiment - 0.5) * 1.6, 2),
            "description": f"Recent news sentiment is {'positive' if news_sentiment > 0.5 else 'negative' if news_sentiment < 0.5 else 'neutral'}"
        })
        
        # Add analyst ratings factor (simplified)
        analyst_impact = np.random.uniform(0.4, 0.8) * (1 if np.random.random() > 0.4 else -1)
        factors.append({
            "name": "Analyst Ratings",
            "impact": round(analyst_impact, 2),
            "description": f"Recent analyst ratings are {'generally positive' if analyst_impact > 0 else 'generally negative'}"
        })
        
        return {
            "symbol": symbol,
            "name": stock.info.get('shortName', symbol),
            "factors": factors,
            "sentiment": {
                "news": round(news_sentiment, 2),
                "social": round(0.4 + np.random.random() * 0.3, 2),  # Random for demo
                "overall": round((news_sentiment * 0.6) + (0.4 + np.random.random() * 0.3) * 0.4, 2)
            }
        }
    
    except Exception as e:
        # Fallback to mock data
        return {
            "symbol": symbol,
            "name": f"{symbol} Inc.",
            "factors": [
                {
                    "name": "Market Trend",
                    "impact": 0.6,
                    "description": "Stock has a 0.75 correlation with the overall market"
                },
                {
                    "name": "Earnings Report",
                    "impact": 0.8,
                    "description": "Recent earnings report exceeded expectations"
                },
                {
                    "name": "Sector Performance",
                    "impact": 0.4,
                    "description": "Technology sector is showing strong performance"
                },
                {
                    "name": "News Sentiment",
                    "impact": 0.3,
                    "description": "Recent news sentiment is positive"
                },
                {
                    "name": "Analyst Ratings",
                    "impact": 0.7,
                    "description": "Recent analyst ratings are generally positive"
                }
            ],
            "sentiment": {
                "news": 0.7,
                "social": 0.6,
                "overall": 0.65
            }
        }

def get_investment_recommendation(symbol, causal_analysis=None):
    """
    Generate investment recommendation based on causal analysis
    This is a simplified implementation for demo purposes
    """
    if not causal_analysis:
        causal_analysis = get_causal_factors(symbol)
    
    # Calculate overall score from factors
    factor_scores = [factor["impact"] for factor in causal_analysis["factors"]]
    overall_score = sum(factor_scores) / len(factor_scores)
    
    # Determine recommendation
    if overall_score > 0.3:
        recommendation = "BUY"
        confidence = min(0.5 + overall_score, 0.95)
        reasoning = "Based on positive market conditions, favorable news sentiment, and strong analyst ratings."
    elif overall_score < -0.3:
        recommendation = "SELL"
        confidence = min(0.5 + abs(overall_score), 0.95)
        reasoning = "Based on negative market conditions, unfavorable news sentiment, and weak analyst ratings."
    else:
        recommendation = "HOLD"
        confidence = 0.5 + (0.5 - abs(overall_score))
        reasoning = "Based on mixed signals and moderate market conditions."
    
    # Add specific reasoning from factors
    positive_factors = [f["name"] for f in causal_analysis["factors"] if f["impact"] > 0.4]
    negative_factors = [f["name"] for f in causal_analysis["factors"] if f["impact"] < -0.4]
    
    if positive_factors:
        reasoning += f" Positive factors include {', '.join(positive_factors)}."
    
    if negative_factors:
        reasoning += f" Negative factors include {', '.join(negative_factors)}."
    
    # Get stock data for price targets
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period='1mo')
        current_price = hist['Close'].iloc[-1]
        
        # Simple price targets based on volatility
        volatility = hist['Close'].pct_change().std() * np.sqrt(252)
        
        price_target = {
            "low": round(current_price * (1 - volatility * 1.5), 2),
            "median": round(current_price * (1 + overall_score * 0.2), 2),
            "high": round(current_price * (1 + volatility * 1.5), 2)
        }
    except:
        # Fallback
        price_target = {
            "low": 100,
            "median": 120,
            "high": 140
        }
    
    return {
        "symbol": symbol,
        "name": causal_analysis["name"],
        "recommendation": recommendation,
        "confidence": round(confidence, 2),
        "reasoning": reasoning,
        "priceTarget": price_target,
        "timeHorizon": "Medium-term (3-6 months)"
    }

# Routes
@analysis_bp.route('/causal/<symbol>', methods=['GET'])
def causal_analysis(symbol):
    """Get causal analysis for a stock"""
    try:
        analysis = get_causal_factors(symbol)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({
            'message': f'Error generating causal analysis: {str(e)}'
        }), 500

@analysis_bp.route('/recommendation/<symbol>', methods=['GET'])
def recommendation(symbol):
    """Get investment recommendation for a stock"""
    try:
        # Get causal analysis first
        causal = get_causal_factors(symbol)
        
        # Generate recommendation
        rec = get_investment_recommendation(symbol, causal)
        
        return jsonify(rec), 200
    except Exception as e:
        return jsonify({
            'message': f'Error generating recommendation: {str(e)}'
        }), 500

@analysis_bp.route('/sector/<sector>', methods=['GET'])
def sector_analysis(sector):
    """Get analysis for a sector"""
    # This is a simplified implementation
    # In a real app, you'd analyze sector ETFs and component stocks
    
    # Map of sample sectors to ETFs
    sector_etfs = {
        'technology': 'XLK',
        'healthcare': 'XLV',
        'financials': 'XLF',
        'energy': 'XLE',
        'consumer': 'XLY',
        'utilities': 'XLU',
        'materials': 'XLB',
        'industrials': 'XLI',
        'real-estate': 'XLRE',
        'communication': 'XLC'
    }
    
    etf = sector_etfs.get(sector.lower(), 'SPY')
    
    try:
        # Get ETF data
        ticker = yf.Ticker(etf)
        hist = ticker.history(period='6mo')
        
        # Calculate performance
        start_price = hist['Close'].iloc[0]
        end_price = hist['Close'].iloc[-1]
        performance = ((end_price - start_price) / start_price) * 100
        
        # Calculate volatility
        returns = hist['Close'].pct_change().dropna()
        volatility = returns.std() * np.sqrt(252)
        
        # Get market comparison
        market = yf.Ticker('^GSPC')
        market_hist = market.history(period='6mo')
        market_start = market_hist['Close'].iloc[0]
        market_end = market_hist['Close'].iloc[-1]
        market_performance = ((market_end - market_start) / market_start) * 100
        
        # Generate outlook
        relative_performance = performance - market_performance
        
        if relative_performance > 5:
            outlook = "Strong outperformance compared to the overall market"
        elif relative_performance > 0:
            outlook = "Slight outperformance compared to the overall market"
        elif relative_performance > -5:
            outlook = "Comparable performance to the overall market"
        else:
            outlook = "Underperformance compared to the overall market"
        
        # Mock stocks in sector
        stocks = [
            {"symbol": "AAPL", "name": "Apple Inc.", "performance": 12.5, "recommendation": "BUY"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "performance": 15.2, "recommendation": "BUY"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "performance": 8.7, "recommendation": "HOLD"},
            {"symbol": "AMZN", "name": "Amazon.com, Inc.", "performance": 10.1, "recommendation": "BUY"},
            {"symbol": "META", "name": "Meta Platforms, Inc.", "performance": 6.3, "recommendation": "HOLD"}
        ]
        
        return jsonify({
            "sector": sector.capitalize(),
            "etf": etf,
            "performance": round(performance, 2),
            "volatility": round(volatility, 2),
            "marketPerformance": round(market_performance, 2),
            "relativePerformance": round(relative_performance, 2),
            "outlook": outlook,
            "topStocks": stocks
        }), 200
    except Exception as e:
        # Fallback to mock data
        return jsonify({
            "sector": sector.capitalize(),
            "etf": etf,
            "performance": 8.5,
            "volatility": 0.22,
            "marketPerformance": 5.2,
            "relativePerformance": 3.3,
            "outlook": "Slight outperformance compared to the overall market",
            "topStocks": [
                {"symbol": "AAPL", "name": "Apple Inc.", "performance": 12.5, "recommendation": "BUY"},
                {"symbol": "MSFT", "name": "Microsoft Corporation", "performance": 15.2, "recommendation": "BUY"},
                {"symbol": "GOOGL", "name": "Alphabet Inc.", "performance": 8.7, "recommendation": "HOLD"},
                {"symbol": "AMZN", "name": "Amazon.com, Inc.", "performance": 10.1, "recommendation": "BUY"},
                {"symbol": "META", "name": "Meta Platforms, Inc.", "performance": 6.3, "recommendation": "HOLD"}
            ]
        }), 200

@analysis_bp.route('/save', methods=['POST'])
@jwt_required()
def save_analysis():
    """Save an analysis for a user"""
    try:
        current_user_email = get_jwt_identity()
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('symbol'):
            return jsonify({
                'message': 'Missing required fields'
            }), 400
        
        # Get user
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({
                'message': 'User not found'
            }), 404
        
        # Check if analysis already exists for this user and stock
        existing_analysis = SavedAnalysis.query.filter_by(
            user_id=user.id,
            symbol=data.get('symbol')
        ).first()
        
        if existing_analysis:
            # Update existing analysis
            existing_analysis.name = data.get('name', existing_analysis.name)
            existing_analysis.recommendation = data.get('recommendation', existing_analysis.recommendation)
            existing_analysis.notes = data.get('notes', existing_analysis.notes)
            
            if data.get('factors'):
                existing_analysis.factors = data.get('factors')
                
            # The timestamp will update automatically due to the onupdate parameter
            
            db.session.commit()
            
            return jsonify({
                'message': 'Analysis updated successfully',
                'analysis': existing_analysis.to_dict()
            }), 200
        else:
            # Create new analysis
            new_analysis = SavedAnalysis(
                user_id=user.id,
                symbol=data.get('symbol'),
                name=data.get('name', data.get('symbol')),
                recommendation=data.get('recommendation', 'HOLD'),
                notes=data.get('notes', ''),
                factors=data.get('factors', [])
            )
            
            db.session.add(new_analysis)
            db.session.commit()
            
            return jsonify({
                'message': 'Analysis saved successfully',
                'analysis': new_analysis.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        print(f"Save analysis error: {str(e)}")
        return jsonify({
            'message': f'Error saving analysis: {str(e)}'
        }), 500

@analysis_bp.route('/saved', methods=['GET'])
@jwt_required()
def get_saved_analyses():
    """Get all saved analyses for a user"""
    try:
        current_user_email = get_jwt_identity()
        
        # Get user
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({
                'message': 'User not found'
            }), 404
        
        # Get saved analyses
        analyses = SavedAnalysis.query.filter_by(user_id=user.id).order_by(SavedAnalysis.timestamp.desc()).all()
        
        # Convert to dict
        analyses_dict = [analysis.to_dict() for analysis in analyses]
        
        return jsonify(analyses_dict), 200
    
    except Exception as e:
        print(f"Get saved analyses error: {str(e)}")
        return jsonify({
            'message': f'Error fetching saved analyses: {str(e)}'
        }), 500

@analysis_bp.route('/saved/<analysis_id>', methods=['DELETE'])
@jwt_required()
def delete_saved_analysis(analysis_id):
    """Delete a saved analysis"""
    try:
        current_user_email = get_jwt_identity()
        
        # Get user
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({
                'message': 'User not found'
            }), 404
        
        # Find analysis
        analysis = SavedAnalysis.query.filter_by(id=analysis_id, user_id=user.id).first()
        if not analysis:
            return jsonify({
                'message': 'Analysis not found'
            }), 404
        
        # Delete analysis
        db.session.delete(analysis)
        db.session.commit()
        
        return jsonify({
            'message': 'Analysis deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Delete analysis error: {str(e)}")
        return jsonify({
            'message': f'Error deleting analysis: {str(e)}'
        }), 500