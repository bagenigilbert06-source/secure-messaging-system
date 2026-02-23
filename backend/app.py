import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# Create Flask app
app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return {'status': 'healthy'}, 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return {'error': 'Endpoint not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=5000)
