import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'pricetrack-super-secret-jwt-key-2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'pricetrack-jwt-token-signing-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # MySQL Database URI fallback
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'rootpassword')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', 'pricetrack_db')
    
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_timeout': 20,
        'pool_pre_ping': True
    }
    
    # SMTP Email configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.mailtrap.io')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'alerts@pricetrack.com')
    
    # Price Tracking Engine
    PRICE_TRACKING_INTERVAL_MINUTES = int(os.getenv('TRACKING_INTERVAL_MINUTES', '15'))
