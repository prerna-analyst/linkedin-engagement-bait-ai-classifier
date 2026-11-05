"""
PriceTrack - Backend Entry Point (Flask + SQLAlchemy + APScheduler)
Full-Stack E-Commerce Price Comparison & Tracking Platform
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'platform': 'PriceTrack Core API',
            'version': '1.0.0',
            'db_driver': 'MySQL / PyMySQL'
        }), 200

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
