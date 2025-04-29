from flask import Flask, request, jsonify
import PyPDF2
import io
import tempfile
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "methods": ["POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})


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
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    # For development
    app.run(debug=True, port=5000)

