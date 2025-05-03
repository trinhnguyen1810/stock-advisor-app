import requests
import os
import json
from datetime import datetime, timedelta
import random

# News API key (optional)
# You can get a free API key from https://newsapi.org/
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '')

def get_stock_news(symbol, count=5):
    """
    Get news articles for a stock
    If NEWS_API_KEY is provided, uses NewsAPI
    Otherwise, falls back to mock data
    """
    if NEWS_API_KEY:
        try:
            # Calculate date for last 7 days
            to_date = datetime.now()
            from_date = to_date - timedelta(days=7)
            
            # Format dates for API
            from_str = from_date.strftime('%Y-%m-%d')
            to_str = to_date.strftime('%Y-%m-%d')
            
            # Make API request
            url = f"https://newsapi.org/v2/everything"
            params = {
                'q': f"{symbol} OR {get_company_name(symbol)}",
                'from': from_str,
                'to': to_str,
                'language': 'en',
                'sortBy': 'publishedAt',
                'apiKey': NEWS_API_KEY,
                'pageSize': count
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if data.get('status') == 'ok' and data.get('articles'):
                articles = data['articles']
                
                # Format articles
                formatted_articles = []
                for i, article in enumerate(articles):
                    formatted_articles.append({
                        'id': i,
                        'title': article.get('title', ''),
                        'source': article.get('source', {}).get('name', ''),
                        'url': article.get('url', ''),
                        'publishedAt': article.get('publishedAt', ''),
                        'summary': article.get('description', '')
                    })
                
                # Calculate simple sentiment (for demo purposes)
                sentiment = calculate_sentiment(formatted_articles)
                
                return {
                    'articles': formatted_articles,
                    'sentiment': sentiment
                }
        
        except Exception as e:
            print(f"Error fetching news: {str(e)}")
            # Fall back to mock data
    
    # Mock data if API call fails or no key provided
    return generate_mock_news(symbol)

def get_market_news(count=5):
    """Get general market news"""
    if NEWS_API_KEY:
        try:
            # Calculate date for last 3 days
            to_date = datetime.now()
            from_date = to_date - timedelta(days=3)
            
            # Format dates for API
            from_str = from_date.strftime('%Y-%m-%d')
            to_str = to_date.strftime('%Y-%m-%d')
            
            # Make API request
            url = f"https://newsapi.org/v2/everything"
            params = {
                'q': 'stock market OR investing OR "wall street" OR "financial markets"',
                'from': from_str,
                'to': to_str,
                'language': 'en',
                'sortBy': 'publishedAt',
                'apiKey': NEWS_API_KEY,
                'pageSize': count
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if data.get('status') == 'ok' and data.get('articles'):
                articles = data['articles']
                
                # Format articles
                formatted_articles = []
                for i, article in enumerate(articles):
                    formatted_articles.append({
                        'id': i,
                        'title': article.get('title', ''),
                        'source': article.get('source', {}).get('name', ''),
                        'url': article.get('url', ''),
                        'publishedAt': article.get('publishedAt', ''),
                        'summary': article.get('description', '')
                    })
                
                return formatted_articles
        
        except Exception as e:
            print(f"Error fetching market news: {str(e)}")
            # Fall back to mock data
    
    # Mock data if API call fails or no key provided
    return generate_mock_market_news(count)

def get_sector_news(sector, count=5):
    """Get news for a specific sector"""
    if NEWS_API_KEY:
        try:
            # Calculate date for last 5 days
            to_date = datetime.now()
            from_date = to_date - timedelta(days=5)
            
            # Format dates for API
            from_str = from_date.strftime('%Y-%m-%d')
            to_str = to_date.strftime('%Y-%m-%d')
            
            # Make API request
            url = f"https://newsapi.org/v2/everything"
            params = {
                'q': f"{sector} sector OR {sector} stocks OR {sector} industry",
                'from': from_str,
                'to': to_str,
                'language': 'en',
                'sortBy': 'publishedAt',
                'apiKey': NEWS_API_KEY,
                'pageSize': count
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if data.get('status') == 'ok' and data.get('articles'):
                articles = data['articles']
                
                # Format articles
                formatted_articles = []
                for i, article in enumerate(articles):
                    formatted_articles.append({
                        'id': i,
                        'title': article.get('title', ''),
                        'source': article.get('source', {}).get('name', ''),
                        'url': article.get('url', ''),
                        'publishedAt': article.get('publishedAt', ''),
                        'summary': article.get('description', '')
                    })
                
                return formatted_articles
        
        except Exception as e:
            print(f"Error fetching sector news: {str(e)}")
            # Fall back to mock data
    
    # Mock data if API call fails or no key provided
    return generate_mock_sector_news(sector, count)

def calculate_sentiment(articles):
    """
    Calculate a simple sentiment score from news articles
    This is a very simplified implementation for demo purposes
    In a real app, you would use NLP or a sentiment analysis API
    """
    # List of positive and negative words
    positive_words = [
        'up', 'rise', 'rising', 'gain', 'gains', 'positive', 'profit', 'profits',
        'growth', 'growing', 'increase', 'increasing', 'improved', 'strong', 'stronger',
        'success', 'successful', 'outperform', 'beat', 'exceeds', 'exceeded'
    ]
    
    negative_words = [
        'down', 'fall', 'falling', 'drop', 'drops', 'negative', 'loss', 'losses',
        'decline', 'declining', 'decrease', 'decreasing', 'weak', 'weaker',
        'fail', 'failed', 'miss', 'missed', 'underperform', 'below'
    ]
    
    # Count occurrences
    positive_count = 0
    negative_count = 0
    
    for article in articles:
        title = article.get('title', '').lower()
        summary = article.get('summary', '').lower()
        
        for word in positive_words:
            positive_count += title.count(word) + summary.count(word)
        
        for word in negative_words:
            negative_count += title.count(word) + summary.count(word)
    
    # Calculate sentiment (0 to 1)
    total = positive_count + negative_count
    if total == 0:
        return 0.5  # Neutral
    
    sentiment = positive_count / total
    
    # Normalize to avoid extremes
    sentiment = 0.3 + (sentiment * 0.4)
    
    return round(sentiment, 2)

def get_company_name(symbol):
    """Get company name from symbol"""
    # Map of common stock symbols to company names
    company_map = {
        'AAPL': 'Apple',
        'MSFT': 'Microsoft',
        'AMZN': 'Amazon',
        'GOOGL': 'Google',
        'META': 'Facebook',
        'TSLA': 'Tesla',
        'NVDA': 'NVIDIA',
        'JPM': 'JPMorgan',
        'V': 'Visa',
        'JNJ': 'Johnson'
    }
    
    return company_map.get(symbol, symbol)

def generate_mock_news(symbol):
    """Generate mock news for a symbol"""
    company_name = get_company_name(symbol)
    
    # Current date
    now = datetime.now()
    
    # Generate random news articles
    articles = []
    
    headlines = [
        f"{company_name} Reports Strong Quarterly Earnings",
        f"Analysts Upgrade {company_name} Stock to 'Buy'",
        f"{company_name} Announces New Product Launch",
        f"Investors Optimistic About {company_name}'s Growth Prospects",
        f"{company_name} Expands into New Markets",
        f"CEO of {company_name} Discusses Future Strategy",
        f"{company_name} Faces Competition in Core Business",
        f"Market Reaction to {company_name}'s Recent Announcements"
    ]
    
    sources = ["Bloomberg", "CNBC", "Reuters", "Financial Times", "Wall Street Journal", "MarketWatch", "Barron's", "Investor's Business Daily"]
    
    # Shuffle headlines for randomness
    random.shuffle(headlines)
    
    for i in range(min(5, len(headlines))):
        # Random date within last 7 days
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        
        article_date = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        articles.append({
            'id': i,
            'title': headlines[i],
            'source': random.choice(sources),
            'url': '#',
            'publishedAt': article_date.isoformat(),
            'summary': f"This is a mock summary about {company_name}. It provides information about recent developments and market reactions."
        })
    
    # Sort by date (newest first)
    articles.sort(key=lambda x: x['publishedAt'], reverse=True)
    
    # Calculate mock sentiment
    sentiment = random.uniform(0.4, 0.7)
    
    return {
        'articles': articles,
        'sentiment': round(sentiment, 2)
    }

def generate_mock_market_news(count=5):
    """Generate mock market news"""
    # Current date
    now = datetime.now()
    
    # Generate random news articles
    articles = []
    
    headlines = [
        "Markets Rally on Economic Data",
        "Fed Signals Interest Rate Decision",
        "Tech Stocks Lead Market Gains",
        "Investors Eye Upcoming Earnings Season",
        "Global Markets React to Economic Indicators",
        "Wall Street Awaits Key Economic Reports",
        "Market Volatility Increases on Uncertainty",
        "Sectors to Watch in Current Market Conditions"
    ]
    
    sources = ["Bloomberg", "CNBC", "Reuters", "Financial Times", "Wall Street Journal", "MarketWatch", "Barron's", "Investor's Business Daily"]
    
    # Shuffle headlines for randomness
    random.shuffle(headlines)
    
    for i in range(min(count, len(headlines))):
        # Random date within last 3 days
        days_ago = random.randint(0, 2)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        
        article_date = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        articles.append({
            'id': i,
            'title': headlines[i],
            'source': random.choice(sources),
            'url': '#',
            'publishedAt': article_date.isoformat(),
            'summary': "This is a mock summary about market conditions and trends. It discusses recent developments and potential impacts on investors."
        })
    
    # Sort by date (newest first)
    articles.sort(key=lambda x: x['publishedAt'], reverse=True)
    
    return articles

def generate_mock_sector_news(sector, count=5):
    """Generate mock news for a sector"""
    # Current date
    now = datetime.now()
    
    # Generate random news articles
    articles = []
    
    headlines = [
        f"{sector} Sector Shows Strong Performance",
        f"Analysts Optimistic About {sector} Stocks",
        f"Key Trends in {sector} Industry",
        f"Top {sector} Companies to Watch",
        f"{sector} Stocks React to Market Conditions",
        f"Investors Focus on {sector} Opportunities",
        f"Regulatory Changes Impact {sector} Sector",
        f"Future Outlook for {sector} Industry"
    ]
    
    sources = ["Bloomberg", "CNBC", "Reuters", "Financial Times", "Wall Street Journal", "MarketWatch", "Barron's", "Investor's Business Daily"]
    
    # Shuffle headlines for randomness
    random.shuffle(headlines)
    
    for i in range(min(count, len(headlines))):
        # Random date within last 5 days
        days_ago = random.randint(0, 4)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        
        article_date = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        articles.append({
            'id': i,
            'title': headlines[i],
            'source': random.choice(sources),
            'url': '#',
            'publishedAt': article_date.isoformat(),
            'summary': f"This is a mock summary about the {sector} sector. It discusses industry trends, key players, and market conditions."
        })
    
    # Sort by date (newest first)
    articles.sort(key=lambda x: x['publishedAt'], reverse=True)
    
    return articles