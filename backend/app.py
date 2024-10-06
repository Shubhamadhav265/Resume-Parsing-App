from flask import Flask, request, json, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
import google.generativeai as genai
from PyPDF2 import PdfReader
from flask_bcrypt import Bcrypt
import os
import spacy
from dotenv import load_dotenv
from services.predef_skills import predefined_skills, standard_certifications
from services.model_fun import extract_skills, match_skills
import re

# Loading environment variables from .env file
load_dotenv()

# Loading a pre-trained NLP model
nlp = spacy.load("en_core_web_sm")

# # Configuring the Grmini-Pro API
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
CORS(app)  # Enabling CORS for all routes
bcrypt = Bcrypt(app)

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')  # Adding our MySQL username in the .env file
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')  # Adding our MySQL password in the .env file
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')  # Adding our database name in the .env file

mysql = MySQL(app)

# Directory to store uploaded resumes
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/')
def home():
    return "Welcome to the Resume Parsing App Backend!"

@app.route('/candidate-signup', methods=['POST'])
def candidate_signup():
    data = request.get_json()
    
    full_name = data.get('full_name')
    email = data.get('email')
    contact_number = data.get('contact_number')
    degree = data.get('degree')
    cgpa = data.get('cgpa')
    graduation_year = data.get('graduation_year')
    college_name = data.get('college_name')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    

    if not all([full_name, email, contact_number, degree, cgpa, graduation_year, college_name, password, confirm_password]):
        return jsonify({'error': 'All fields are required'}), 400
    
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not validate_contact_number(contact_number):
        return jsonify({'error': 'Invalid contact number format. Must be 10 digits.'}), 400

    if not validate_password(password):
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    cursor = mysql.connection.cursor()

    cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        return jsonify({'error': 'Email is already registered'}), 400

    try:
        cursor.execute('''INSERT INTO Users (email, password, role) VALUES (%s, %s, 'Candidate')''', 
                       (email, hashed_password))
        mysql.connection.commit()

        user_id = cursor.lastrowid

        cursor.execute('''INSERT INTO Student_Info (user_id, full_name, contact_number, college_name, degree, cgpa, graduation_year) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s)''', 
                       (user_id, full_name, contact_number, college_name, degree, cgpa, graduation_year))
        mysql.connection.commit()

        return jsonify({'message': 'Candidate signed up successfully'}), 201

    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()

def validate_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def validate_password(password):
    return len(password) >= 8

def validate_contact_number(contact_number):
    return re.match(r"^\d{10}$", contact_number)


@app.route('/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    user_id = request.form.get('user_id', 1)
    job_id = request.form.get('job_id', 1)  # Getting the job ID from the request
    if not user_id or not job_id:
        return jsonify({'error': 'User ID and Job ID are required'}), 400

    # Saving the uploaded file
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({'error': f"Failed to save the file: {e}"}), 500

    # Extracting text from the PDF file
    resume_text = extract_text_from_pdf(file_path)
    if not resume_text:
        return jsonify({'error': 'Failed to extract text from the PDF'}), 500

    skills_extraction = f""" From the following resume text, extract all skills mentioned under any 
                            section labeled 'Technical Skills,' 'Skills,' or similar. Return 
                            only the skills as a comma-separated list, with no additional information or 
                            formatting. Ensure the output is in a single line and consistent across 
                            multiple runs. **Resume**: {resume_text} """

    skills = get_gemini_response(skills_extraction)
    if skills is None:
        return jsonify({'error': 'Failed to extract skills'}), 500

    resume_skills = extract_skills(skills)
    # Converting list to String to consider it as an single value for the database storation
    skills_string = ', '.join(resume_skills)
    print(skills_string)

    # Inserting the resume submission into the Resumes DB table
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''INSERT INTO Resumes (user_id, file_path, status, skills) 
                          VALUES (%s, %s, 'Pending', %s)''', (user_id, file_path, skills_string))
        resume_id = cursor.lastrowid  # Get the ID of the inserted resume
        mysql.connection.commit()
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': f"Database error: {e}"}), 500
    finally:
        cursor.close()

    # Compulsorily should be in String Format
    Primary_Skills = "Java, Python, SQL, Git, Linux, AWS, Docker, Kubernetes, MySQL Workbench, OpenShift, CyberSecurity"
    Secondary_Skills = "Tkinter, Express.js, BootStrap, SMTP, Object-Oriented Programming (OOP), Data Structures and Algorithms, Cloudinary, JavaScript, Slack"
    Other_Skills = "React.js, Node.js, Azure, GitHub, JUnit, Selenium, MongoDB, PostgreSQL, TensorFlow"

    jd_Primary_Skills = extract_skills(Primary_Skills)
    jd_Secondary_Skills = extract_skills(Secondary_Skills)
    jd_Other_Skills = extract_skills(Other_Skills)

    # Match skills
    Pri_matching_skills, Pri_missing_skills = match_skills(resume_skills, jd_Primary_Skills)
    Sec_matching_skills, Sec_missing_skills = match_skills(resume_skills, jd_Secondary_Skills)
    Oth_matching_skills, Oth_missing_skills = match_skills(resume_skills, jd_Other_Skills)
    
    # Testing output (only)
    Pskills_string = ', '.join(Pri_matching_skills)

    # Percentage Primary, Secondary and Other Skill match
    per_primary_skill_match = round((len(Pri_matching_skills)/(len(Pri_matching_skills) + len(Pri_missing_skills)))*100, 2)
    per_secondary_skill_match = round((len(Sec_matching_skills)/(len(Sec_matching_skills) + len(Sec_missing_skills)))*100, 2)
    per_other_skill_match = round((len(Oth_matching_skills)/(len(Oth_matching_skills) + len(Oth_missing_skills)))*100, 2)

    input_prompt = f"""
        As an advanced Application Tracking System (ATS) with expertise in the tech field, analyze the following resume and provide a response in a single string with the following structure:

        {{
            "all_skills": [], 
            "work_skills": [], 
            "project_skills": [], 
            "total_publications": 0, 
            "copyrights": 0, 
            "patents": 0, 
            "certifications": [], 
            "hackathon_participation": 0
        }}

        1. **all_skills**: A list of all skills mentioned in the resume.
        2. **work_skills**: A list of skills specifically mentioned or inferred from the work experience section of the resume.
        3. **project_skills**: A list of skills used or learned from the project section of the resume.
        4. **total_publications**: The total count of publications mentioned in the resume.
        5. **copyrights**: The total count of copyrights mentioned in the resume.
        6. **patents**: The total count of patents mentioned in the resume.
        7. **certifications**: A list of certifications mentioned in the resume.
        8. **hackathon_participation**: A Flag value indicating if hackathon participation is mentioned (If yes, return 1, else return 0).

        **Resume**: {resume_text}
        """

    # Extracting the prompt Response and Multiple Resume Details
    gem_response = get_gemini_response(input_prompt)

    if gem_response:
                try:
                    # Try to parse the response as JSON
                    gem_response_data = json.loads(gem_response)

                    # Store the Workeperience, Project, Publications, Patent, Copyright, Certifications and Hackathons
                    # in the form of List's
                    work_skills = gem_response_data["work_skills"]
                    project_skills = gem_response_data["project_skills"]
                    total_publications = gem_response_data["total_publications"]
                    copyrights = gem_response_data["copyrights"]
                    patents = gem_response_data["patents"]
                    certifications = gem_response_data["certifications"]
                    hackathon_participation = gem_response_data["hackathon_participation"]


                    # Refining Skills once again with the predefined skills
                    ref_work_skills = extract_skills(' '.join(work_skills))  # Convert list to string
                    ref_project_skills = extract_skills(' '.join(project_skills))  # Convert list to string

                    # Work & Project skills present in the skill section of the resume
                    skillmatch_work_skills, skillmiss_work_skills = match_skills(ref_work_skills, resume_skills)
                    skillmatch_proj_skills, skillmiss_proj_skills = match_skills(ref_project_skills, resume_skills)
                                            
                    # Matching the work and project skills with primary and secondary skills
                    Pri_work_matching_skills, Pri_work_missing_skills = match_skills(skillmatch_work_skills, jd_Primary_Skills)
                    Sec_work_matching_skills, Sec_work_missing_skills = match_skills(skillmatch_work_skills, jd_Secondary_Skills)
                    
                    Pri_project_matching_skills, Pri_project_missing_skills = match_skills(skillmatch_proj_skills, jd_Primary_Skills)
                    Sec_project_matching_skills, Sec_project_missing_skills = match_skills(skillmatch_proj_skills, jd_Secondary_Skills)


                    # Percentage match of the primary and secondary skills of  work and project respectively.
                    per_pri_work_matching_skills = round(((len(Pri_work_matching_skills))/(len(jd_Primary_Skills))) * 100, 2)
                    per_sec_work_matching_skills = round(((len(Sec_work_matching_skills))/(len(jd_Secondary_Skills))) * 100, 2)

                    per_pri_project_matching_skills = round(((len(Pri_project_matching_skills))/(len(jd_Primary_Skills))) * 100, 2)
                    per_sec_project_matching_skills = round(((len(Sec_project_matching_skills))/(len(jd_Secondary_Skills))) * 100, 2)

                    # Sum of Publications, Copyrights and Patents and the final percentage score calculation
                    filing_total = total_publications + copyrights + patents
                    per_filing_score = 0
                    if filing_total >= 1:
                        per_filing_score = 5
                    else:
                        per_filing_score = 0

                    # Certifications Score Calculation
                    matching_certifications = set(certifications).intersection(standard_certifications)
                    count_matching_std_certifications = len(matching_certifications)
                    
                    per_certi_Score = 0
                    if count_matching_std_certifications >= 1:
                        per_certi_Score = 5
                    else:
                        per_certi_Score = 3

                    
                    # Hackathon Score Calculation
                    per_hackathon_score = 0
                    if hackathon_participation == 1:
                        per_hackathon_score = 4
                    else:
                        per_hackathon_score = 0

                    # Final Rubrick Formula
                    Final_score = (0.4 * per_primary_skill_match) + (0.2 * per_secondary_skill_match) + (0.1 * per_other_skill_match) + (0.056 * per_pri_work_matching_skills) + (0.024 * per_sec_work_matching_skills) + (0.056 * per_pri_project_matching_skills) + (0.024 * per_sec_project_matching_skills) + (per_filing_score) + (per_certi_Score) + (per_hackathon_score) 
                except Exception as e:
                    return jsonify({'error': f"Failed to parse JSON response: {e}"}), 500 


    else:
        return jsonify({'error': f"Gemini API call failed or returned an empty response: {e}"}), 400

    return jsonify({'message': 'Resume uploaded and processed successfully', 'skills': Final_score})


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

def extract_skills(resume_text):

    # Processing the resume text
    doc = nlp(resume_text)

    # Extracting skills
    extracted_skills = []
    
    # Checking for multi-word skills
    for skill in predefined_skills:
        # Using regex to match whole phrases in the resume text
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_text):
            extracted_skills.append(skill)

    # Removing duplicates
    return list(set(extracted_skills))

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
