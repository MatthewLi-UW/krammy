from flask import Flask, request, jsonify
import PyPDF2
import io
import tempfile
import os
import requests
from flask_cors import CORS
from flask_apscheduler import APScheduler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

if os.environ.get('RENDER'):
    # Production settings
    app.config.update(
        DEBUG=False,
        TESTING=False,
        PROPAGATE_EXCEPTIONS=True,
        # Recommended security headers
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
    )

CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "https://*.krammy.app"],
    "methods": ["POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

# Initialize scheduler
scheduler = APScheduler()
scheduler.init_app(app)

# Keep-alive ping configuration
RENDER_EXTERNAL_URL = os.environ.get('RENDER_EXTERNAL_URL')

def keep_alive_ping():
    """Send a request to the application to prevent Render from spinning it down."""
    if RENDER_EXTERNAL_URL:
        url = f"{RENDER_EXTERNAL_URL}/api/health"
        try:
            response = requests.get(url, timeout=10)
            logger.info(f"Keep-alive ping sent. Status: {response.status_code}")
        except Exception as e:
            logger.error(f"Keep-alive ping failed: {str(e)}")
    else:
        logger.info("Keep-alive ping skipped (not running on Render)")

# Add the scheduler job only in production
if os.environ.get('RENDER'):
    # Schedule the keep-alive ping every 14 minutes
    app.config['SCHEDULER_API_ENABLED'] = True
    scheduler.add_job(id='keep_alive_job', func=keep_alive_ping, 
                      trigger='interval', minutes=14)
    scheduler.start()


@app.route('/api/parse-pdf', methods=['POST'])
def parse_pdf():
    """
    API endpoint to extract text from a PDF file.
    
    Expects a POST request with a PDF file in the 'pdf' field.
    Returns JSON with the extracted text.
    """
    # file size check (limit to 10MB)
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 10MB in bytes
    
    if request.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

    if 'pdf' not in request.files:
        return jsonify({"error": "No PDF file provided"}), 400
    
    pdf_file = request.files['pdf']
    
    if pdf_file.filename == '':
        return jsonify({"error": "No PDF file selected"}), 400
    
    try:
        # Read PDF directly from memory
        pdf_stream = io.BytesIO(pdf_file.read())
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        
        # Extract text from all pages
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        if not text.strip():
            text = "No text extracted"

        return jsonify({"text": text})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def extract_text_from_pdf_bytes(pdf_bytes):
    """
    Utility function to extract text from PDF bytes.
    
    Args:
        pdf_bytes: PDF file as bytes
    
    Returns:
        Extracted text as a string
    """
    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        return text
    except Exception as e:
        raise Exception(f"Error extracting text: {str(e)}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint used for monitoring and keep-alive pings."""
    return jsonify({"status": "ok", "message": "PDF parsing service is running"})

if __name__ == "__main__":
    # Check if running in production
    if os.environ.get('RENDER'):
        # For production - don't run the app directly,
        # gunicorn will be invoked through Procfile
        print("Running in production - use 'gunicorn parse-pdf:app' instead of app.run()")
    else:
        # For development only
        print("Running in development mode")
        app.run(debug=True, port=5000)

