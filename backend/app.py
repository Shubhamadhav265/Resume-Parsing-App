from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
import google.generativeai as genai
from PyPDF2 import PdfReader
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')  # Add your MySQL username in the .env file
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')  # Add your MySQL password in the .env file
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')  # Add your database name in the .env file

mysql = MySQL(app)

# Directory to store uploaded resumes
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    user_id = request.form.get('user_id', 1)
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
        

    # Save the uploaded file
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({'error': f"Failed to save the file: {e}"}), 500

    # Extract text from the PDF file
    resume_text = extract_text_from_pdf(file_path)
    if not resume_text:
        return jsonify({'error': 'Failed to extract text from the PDF'}), 500

    # Use Gemini to extract skills
    prompt = f"""From the following resume text, extract all skills mentioned under any 
                                section labeled 'Technical Skills,' 'Skills,' 'Soft Skills' or similar. Return 
                                only the skills as a comma-separated list, with no additional information or 
                                formatting. Ensure the output is in a single line and consistent across 
                                multiple runs. **Resume**:\n{resume_text}"""
    
    skills = get_gemini_response(prompt)
    if skills is None:
        return jsonify({'error': 'Failed to extract skills'}), 500

    # Insert the resume into the Resumes table
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''INSERT INTO Resumes (user_id, file_path, status, feedback) 
                          VALUES (%s, %s, 'Pending', %s)''', (user_id, file_path, skills))
        mysql.connection.commit()
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': f"Database error: {e}"}), 500
    finally:
        cursor.close()

    return jsonify({'message': 'Resume uploaded and processed successfully', 'skills': skills})

def extract_text_from_pdf(file_path):
    try:
        pdf_reader = PdfReader(file_path)
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



@app.route('/job-posting', methods=['POST'])
def create_job_posting():
    data = request.get_json()
    
    # Validate required fields
    company_name = data.get('company_name')
    job_description = data.get('job_description')
    role = data.get('role')
    primary_skills = data.get('primary_skills')
    secondary_skills = data.get('secondary_skills')
    other_skills = data.get('other_skills')
    package = data.get('package')
    stipend_amount = data.get('stipend_amount')
    user_id = data.get('user_id', 1)  # Add user_id to associate with the posting

    if not all([company_name, job_description, role, primary_skills, user_id]):
        return jsonify({'error': 'Missing required fields'}), 400

    cursor = mysql.connection.cursor()

    try:
        cursor.execute('''INSERT INTO Job_Postings (user_id, title, description, primary_skills, secondary_skills, other_skills, company_name, package, stipend_amount) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                       (user_id, role, job_description, primary_skills, secondary_skills, other_skills, company_name, package, stipend_amount))
        mysql.connection.commit()
        return jsonify({'message': 'Job posting created successfully'}), 201
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)
