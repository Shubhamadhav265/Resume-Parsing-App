from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
import google.generativeai as genai
from PyPDF2 import PdfReader
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Extract text from the PDF file
    resume_text = extract_text_from_pdf(file)
    if not resume_text:
        return jsonify({'error': 'Failed to extract text from the PDF'}), 500

    prompt = f"""From the following resume text, extract all skills mentioned under any 
                                section labeled 'Technical Skills,' 'Skills,' 'Soft Skills' or similar. Return 
                                only the skills as a comma-separated list, with no additional information or 
                                formatting. Ensure the output is in a single line and consistent across 
                                multiple runs. **Resume**:\n{resume_text}"""
    
    skills = get_gemini_response(prompt)

    if skills is None:
        return jsonify({'error': 'Failed to extract skills'}), 500

    return jsonify({'skills': skills})

def extract_text_from_pdf(file):
    try:
        pdf_reader = PdfReader(file)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text() or ''
        return text
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return None

def get_gemini_response(prompt):
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error with API call: {e}")
        return None

if __name__ == '__main__':
    app.run(debug=True)
