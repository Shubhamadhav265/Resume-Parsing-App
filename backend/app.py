from flask import Flask, request, json, jsonify,session
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
from flask_jwt_extended import create_access_token
from flask_jwt_extended import JWTManager
from datetime import timedelta
import logging
# import genai

# Loading environment variables from .env file
load_dotenv()

# Loading a pre-trained NLP model
nlp = spacy.load("en_core_web_sm")

# # Configuring the Grmini-Pro API
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:4000"}}, supports_credentials=True)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

  # Enabling CORS for all routes
bcrypt = Bcrypt(app)
# session(app)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,   # Prevent JavaScript from accessing session cookie
    SESSION_COOKIE_SECURE=False,    # Set to True in production with HTTPS
    SESSION_COOKIE_SAMESITE=None,   # Allow cross-origin requests (since you're on different ports)
    SESSION_COOKIE_DOMAIN=None,     # Use default domain settings (make sure not set incorrectly)
)

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')  # Adding our MySQL username in the .env file
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')  # Adding our MySQL password in the .env file
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')  # Adding our database name in the .env file
app.config['SESSION_TYPE'] = 'filesystem' 
mysql = MySQL(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)
app.secret_key = os.getenv('SECRET_KEY')

app.permanent_session_lifetime = timedelta(hours=5)

# Directory to store uploaded resumes
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure logging to capture error messages and info for debugging
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def home():
    return "Welcome to the Resume Parsing App Backend!"

@app.route('/hr-signup', methods=['POST'])
def HR_signup():
    data = request.get_json()

    full_name = data.get('full_name')
    email = data.get('email')
    contact_number = data.get('contact_number')
    company_name = data.get('company_name')
    position = data.get('position')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not all([full_name, email, contact_number, company_name, position, password, confirm_password]):
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
        return jsonify({'error': 'Your Email is already registered'}), 400

    try:
        cursor.execute('''INSERT INTO Users (email, password, role) VALUES (%s, %s, 'HR')''', 
                       (email, hashed_password))
        mysql.connection.commit()

        user_id = cursor.lastrowid

        cursor.execute('''INSERT INTO HR_Info (user_id, full_name, contact_number, company_name, position) 
                          VALUES (%s, %s, %s, %s, %s)''', 
                       (user_id, full_name, contact_number, company_name, position))
        mysql.connection.commit()

        return jsonify({'message': 'HR signed up successfully'}), 201

    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()


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
        return jsonify({'error': 'Your Email is already registered'}), 400

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


@app.route('/candidate-signin', methods=['POST'])
def candidate_signin():
    try:
        # Log the request data
        print("Received sign-in request")

        data = request.get_json()
        if not data:
            print("No JSON data found in the request")
            return jsonify({'error': 'Invalid request, no data found'}), 400

        print(f"Request data: {data}")

        email = data.get('email')
        password = data.get('password')

        # Log extracted data
        print(f"Extracted email: {email}, password: {password}")

        # Check for missing fields
        if not all([email, password]):
            print("Missing email or password")
            return jsonify({'error': 'All fields are required'}), 400

        cursor = mysql.connection.cursor()

        try:
            # Log the database query
            print(f"Querying user with email: {email}")
            cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
            user = cursor.fetchone()

            # Check if user exists
            if not user:
                print(f"User with email {email} does not exist")
                return jsonify({'error': 'User does not exist'}), 404

            print(f"User found: {user}")

            # Check if the user is a Candidate
            if user[3] != 'Candidate':  # Assuming user[3] is the role column
                print(f"User with email {email} is not a Candidate")
                return jsonify({'error': 'User is not authorized as Candidate'}), 403

            # Check password
            if not bcrypt.check_password_hash(user[2], password):  # Assuming user[2] is the hashed password
                print("Incorrect password for user")
                return jsonify({'error': 'Incorrect password'}), 400

            # Save user_id in session
            session['user_id'] = user[0]  # Assuming user[0] is user_id
            session.permanent = True  # Session will follow lifetime defined above
            print(f"User ID stored in session: {session.get('user_id')}")
            print(f"Session after login: {session}")


            # Successful sign-in
            print(f"Candidate with email {email} signed in successfully")
            # Assuming you've stored the user_id in the session after a successful login
            user_id = session.get('user_id')

            if user_id:
                print(f"User ID: {user_id}")
            else:
                print("User ID not found in session")

            return jsonify({'message': 'Candidate signed in successfully', 'user_id': user[0]}), 200

        except Exception as db_error:
            # Log the database error
            print(f"Database error: {db_error}")
            mysql.connection.rollback()
            return jsonify({'error': 'Database error occurred, please try again later'}), 500

        finally:
            cursor.close()
            print("Database cursor closed")

    except Exception as e:
        # Log any other errors
        print(f"Error occurred: {e}")
        return jsonify({'error': 'An unexpected error occurred, please try again later'}), 500

@app.route('/hr-signin', methods=['POST'])
def hr_signin():
    try:
        print("Received HR sign-in request")
        data = request.get_json()
        print(f"Request data: {data}")

        email = data.get('email')
        password = data.get('password')
        print(f"Extracted email: {email}, password: [HIDDEN]")

        if not all([email, password]):
            print("Missing fields in the request")
            return jsonify({'error': 'All fields are required'}), 400

        cursor = mysql.connection.cursor()

        try:
            print(f"Querying user with email: {email}")
            cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                print("User does not exist")
                return jsonify({'error': 'User does not exist'}), 404

            print(f"User found: {user}")

            if user[3] != 'HR':  # Assuming user[3] is the role
                print("User is not an HR")
                return jsonify({'error': 'User is not authorized as HR'}), 403

            hashed_password = user[2]  # Assuming user[2] is the hashed password
            print(f"Hashed password from DB: {hashed_password}")

            if not bcrypt.check_password_hash(hashed_password, password):
                print("Incorrect password")
                return jsonify({'error': 'Incorrect password'}), 400

            # Store user_id and role in session
            session['user_id_hr'] = user[0]  # Assuming user[0] is user_id
            session['role'] = user[3]     # Assuming user[3] is the role (HR in this case)
            session.permanent = True      # Session will follow lifetime defined above
            session.modified = True

            # Print session data to check if it's stored correctly
            print(f"Session after login of hr: {session}")
            print(f"User ID: {session.get('user_id_hr')}, Role: {session.get('role')}")

            # Successful sign-in
            print("HR signed in successfully")
            return jsonify({'message': 'HR signed in successfully', 'user_id_hr': user[0], 'role': user[3]}), 200

        except Exception as db_error:
            print(f"Database error: {db_error}")
            mysql.connection.rollback()
            return jsonify({'error': 'Database error occurred, please try again later'}), 500

        finally:
            cursor.close()
            print("Cursor closed")

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'An unexpected error occurred, please try again later'}), 500



@app.route('/upload', methods=['POST'])
def upload_resume():
    logging.debug(f"Session at resume upload: {session}")
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    user_id = session.get('user_id')
    logging.debug(f"User ID from session: {user_id}")
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 400

    job_id = request.form.get('job_id')
    logging.debug(f"Job ID from session: {job_id}")
    if not job_id:
        return jsonify({'error': 'Job ID is required'}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    try:
        file.save(file_path)
    except Exception as e:
        logging.error(f"Failed to save the file: {e}")
        return jsonify({'error': f"Failed to save the file: {e}"}), 500

    try:
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT primary_skills, secondary_skills, other_skills FROM Job_Postings WHERE job_id = %s', (job_id,))
        skills = cursor.fetchone()

        if skills:
        # Unpacking the results into variables and converting to string
            primary_skills, secondary_skills, other_skills = map(str, skills)
            
            # Optionally, you can format them as a single string if needed
            Primary_Skills = f"{primary_skills}"
            Secondary_Skills = f"{secondary_skills}"
            Other_Skills = f"{other_skills}"

    except Exception as e:
        logging.error(f"Database error: {e}")
        return jsonify({'error': f"Database error: {e}"}), 500
    finally:
        cursor.close()

    resume_text = extract_text_from_pdf(file_path)
    if not resume_text:
        return jsonify({'error': 'Failed to extract text from the PDF'}), 500

    skills_extraction = f"""From the following resume text, extract all skills mentioned under any 
                            section labeled 'Technical Skills,' 'Skills,' or similar. Return 
                            only the skills as a comma-separated list, with no additional information or 
                            formatting. Ensure the output is in a single line and consistent across 
                            multiple runs. **Resume**: {resume_text}"""

    skills = get_gemini_response(skills_extraction)

    if skills is None:
        return jsonify({'error': 'Failed to extract skills'}), 500

    resume_skills = extract_skills(skills)
    skills_string = ', '.join(resume_skills)
    logging.debug(f"Extracted Skills: {skills_string}")


    feedback_prompt = f"""
    You are reviewing a candidate's resume: {resume_text}. The job role requires:
    - Primary Skills: {Primary_Skills}
    - Secondary Skills: {Secondary_Skills}
    - Other Skills: {Other_Skills}

    Provide a very-very short analysis highlighting (only in 4 lines in total): 
    1. Missing or underrepresented skills (focus on Primary, then Secondary, then Other). 
    2. Actionable recommendations, including relevant courses or certifications for improvement.
    """

    feedback = get_gemini_response(feedback_prompt)

    if feedback is None:
        return jsonify({'error': 'Failed to extract skills'}), 500

    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''INSERT INTO Resumes (user_id, file_path, status, skills, feedback) 
                          VALUES (%s, %s, 'Pending', %s, %s)''', (user_id, file_path, skills_string, feedback))
        resume_id = cursor.lastrowid
        mysql.connection.commit()
    except Exception as e:
        mysql.connection.rollback()
        logging.error(f"Database error: {e}")
        return jsonify({'error': f"Database error: {e}"}), 500
    finally:
        cursor.close()


    jd_Primary_Skills = extract_skills(Primary_Skills)
    jd_Secondary_Skills = extract_skills(Secondary_Skills)
    jd_Other_Skills = extract_skills(Other_Skills)

    Pri_matching_skills, Pri_missing_skills = match_skills(resume_skills, jd_Primary_Skills)
    Sec_matching_skills, Sec_missing_skills = match_skills(resume_skills, jd_Secondary_Skills)
    Oth_matching_skills, Oth_missing_skills = match_skills(resume_skills, jd_Other_Skills)

    per_primary_skill_match = round((len(Pri_matching_skills) / (len(Pri_matching_skills) + len(Pri_missing_skills))) * 100, 2)
    per_secondary_skill_match = round((len(Sec_matching_skills) / (len(Sec_matching_skills) + len(Sec_missing_skills))) * 100, 2)
    per_other_skill_match = round((len(Oth_matching_skills) / (len(Oth_matching_skills) + len(Oth_missing_skills))) * 100, 2)

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

        **Resume**: {resume_text}
    """

    gem_response = get_gemini_response(input_prompt)

    if gem_response:
        try:
            gem_response_data = json.loads(gem_response)

            work_skills = gem_response_data["work_skills"]
            project_skills = gem_response_data["project_skills"]
            total_publications = gem_response_data["total_publications"]
            copyrights = gem_response_data["copyrights"]
            patents = gem_response_data["patents"]
            certifications = gem_response_data["certifications"]
            hackathon_participation = gem_response_data["hackathon_participation"]

            ref_work_skills = extract_skills(' '.join(work_skills))
            ref_project_skills = extract_skills(' '.join(project_skills))

            skillmatch_work_skills, skillmiss_work_skills = match_skills(ref_work_skills, resume_skills)
            skillmatch_proj_skills, skillmiss_proj_skills = match_skills(ref_project_skills, resume_skills)

            Pri_work_matching_skills, Pri_work_missing_skills = match_skills(skillmatch_work_skills, jd_Primary_Skills)
            Sec_work_matching_skills, Sec_work_missing_skills = match_skills(skillmatch_work_skills, jd_Secondary_Skills)

            Pri_project_matching_skills, Pri_project_missing_skills = match_skills(skillmatch_proj_skills, jd_Primary_Skills)
            Sec_project_matching_skills, Sec_project_missing_skills = match_skills(skillmatch_proj_skills, jd_Secondary_Skills)

            per_pri_work_matching_skills = round(((len(Pri_work_matching_skills))/(len(jd_Primary_Skills))) * 100, 2)
            per_sec_work_matching_skills = round(((len(Sec_work_matching_skills))/(len(jd_Secondary_Skills))) * 100, 2)

            per_pri_project_matching_skills = round(((len(Pri_project_matching_skills))/(len(jd_Primary_Skills))) * 100, 2)
            per_sec_project_matching_skills = round(((len(Sec_project_matching_skills))/(len(jd_Secondary_Skills))) * 100, 2)

            filing_total = total_publications + copyrights + patents
            per_filing_score = 5 if filing_total >= 1 else 0

            matching_certifications = set(certifications).intersection(standard_certifications)
            count_matching_std_certifications = len(matching_certifications)
            per_certi_Score = 5 if count_matching_std_certifications >= 1 else 3

            per_hackathon_score = 4 if hackathon_participation == 1 else 0

            # Final Rubrick Formula
            Final_score = (0.4 * per_primary_skill_match) + (0.2 * per_secondary_skill_match) + (0.1 * per_other_skill_match) + (0.056 * per_pri_work_matching_skills) + (0.024 * per_sec_work_matching_skills) + (0.056 * per_pri_project_matching_skills) + (0.024 * per_sec_project_matching_skills) + (per_filing_score) + (per_certi_Score) + (per_hackathon_score) 
            # logging.debug(f"Final Score of the Candidate: {Final_score}")

            logging.info(f"Final Score Calculated: {Final_score}")

            try:
                cursor = mysql.connection.cursor()
                cursor.execute('''INSERT INTO Applications (job_id, user_id, status, resume_id) 
                                VALUES (%s, %s, 'Pending', %s)''', (job_id, user_id, resume_id))
                application_id = cursor.lastrowid
                mysql.connection.commit()
            except Exception as e:
                mysql.connection.rollback()
                logging.error(f"Database error: {e}")
                return jsonify({'error': f"Database error: {e}"}), 500
            finally:
                cursor.close()

            try:
                cursor = mysql.connection.cursor()
                cursor.execute('''INSERT INTO Evaluation_Results (application_id, score) 
                                VALUES (%s, %s)''', (application_id, Final_score))
                result_id = cursor.lastrowid
                mysql.connection.commit()
            except Exception as e:
                mysql.connection.rollback()
                logging.error(f"Database error: {e}")
                return jsonify({'error': f"Database error: {e}"}), 500
            finally:
                cursor.close()
            
        except Exception as e:
            logging.error(f"Error processing Gemini response: {e}")
            return jsonify({'error': 'Error processing response'}), 500
        finally:
            cursor.close()
    else:
        logging.error("Failed to get response from Gemini.")
        return jsonify({'error': 'Failed to get response from Gemini'}), 500

    return jsonify({'message': 'Resume uploaded successfully', 'score': Final_score}), 200

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        return text.strip()
    except Exception as e:
        logging.error(f"Error extracting text from PDF: {e}")
        return None


def get_gemini_response(prompt):
    try:
        # Use the correct method here according to the documentation
        model = genai.GenerativeModel('gemini-pro')  # Ensure this matches your library's structure
        response = model.generate_content(prompt)  # This is an example; check actual method
        return response.text  # Adjust according to the actual response structure
    except Exception as e:
        logging.error(f"Gemini API error: {e}")
        return None


def extract_skills(skill_string):
    skills = [skill.strip() for skill in skill_string.split(',')]
    return skills

def match_skills(resume_skills, job_skills):
    matching_skills = [skill for skill in resume_skills if skill in job_skills]
    missing_skills = [skill for skill in job_skills if skill not in resume_skills]
    return matching_skills, missing_skills


@app.route('/job-posting', methods=['POST'])
def create_job_posting():
    try:
        # Step 1: Retrieve data from the request
        data = request.get_json()
        if not data:
            logging.error("No JSON data received.")
            return jsonify({'error': 'No data provided'}), 400
        
        logging.info("Received data: %s", data)

        # Step 2: Validate required fields in the request body
        company_name = data.get('company_name')
        job_description = data.get('job_description')
        role = data.get('role')
        primary_skills = data.get('primary_skills')
        secondary_skills = data.get('secondary_skills')
        other_skills = data.get('other_skills')
        package = data.get('package')
        stipend_amount = data.get('stipend_amount')

        # Check for missing required fields and log them
        required_fields = ['company_name', 'job_description', 'role', 'primary_skills']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            logging.error("Missing required fields: %s", missing_fields)
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        # Step 3: Validate numeric fields (package and stipend_amount) are of correct type
        try:
            # Ensure that package and stipend_amount are either None or valid floats
            package = float(package) if package else None
            stipend_amount = float(stipend_amount) if stipend_amount else None
        except ValueError as e:
            logging.error(f"Invalid data type for numeric fields: package - {package}, stipend_amount - {stipend_amount}")
            return jsonify({'error': 'Package and stipend_amount must be valid numbers'}), 400

        # Step 4: Get the HR's user_id from the session
        user_id = session.get('user_id_hr')
        if not user_id:
            logging.error("User not logged in. HR user ID is missing.")
            return jsonify({'error': 'HR user must be logged in to create a job posting'}), 401
        
        logging.info(f"Using HR user ID: {user_id} from session.")

        # Step 5: Connect to the database
        cursor = mysql.connection.cursor()
        logging.info("Database connection established successfully.")

        # Step 6: Execute the database insert query
        try:
            query = '''INSERT INTO Job_Postings (user_id, title, description, primary_skills, secondary_skills, other_skills, company_name, package, stipend_amount) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'''
            cursor.execute(query, (user_id, role, job_description, primary_skills, secondary_skills, other_skills, company_name, package, stipend_amount))
            mysql.connection.commit()
            logging.info("Job posting created successfully in the database.")
            return jsonify({'message': 'Job posting created successfully'}), 201
        
        except Exception as e:
            # Step 7: Handle any database-related errors
            mysql.connection.rollback()
            logging.error(f"Database insertion error: {str(e)}")
            return jsonify({'error': f"Database error: {str(e)}"}), 500
        
        finally:
            # Step 8: Ensure cursor is closed
            cursor.close()
            logging.info("Database cursor closed.")

    except Exception as e:
        # Step 9: Catch any unexpected errors
        logging.error(f"An unexpected error occurred: {str(e)}")
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500


@app.route('/available-jobs', methods=['GET'])
def fetch_available_jobs():
    try:
        logging.info("Received GET request for available jobs.")
        # Step 1: Connect to the database
        cursor = mysql.connection.cursor()
        logging.info("Database connection established successfully.")

        # Step 2: Get the user_id from the session
        user_id = session.get('user_id')  # Assuming user_id is stored in the session
        if not user_id:
            return jsonify({'error': 'User not authenticated'}), 401

        # Step 3: Execute the database select query
        try:
            query = '''SELECT jp.job_id, jp.user_id, jp.company_name, jp.title, jp.description,
                              jp.primary_skills, jp.secondary_skills, jp.other_skills,
                              jp.package, jp.stipend_amount
                       FROM Job_Postings jp
                       LEFT JOIN Applications a ON jp.job_id = a.job_id AND a.user_id = %s
                       WHERE a.job_id IS NULL'''  # Only fetch jobs not applied for

            cursor.execute(query, (user_id,))
            job_postings = cursor.fetchall()
            logging.info("Available job postings fetched from the database: %s", job_postings)

            # Step 4: Return the job postings
            if job_postings:
                return jsonify([job_posting_to_dict(job_posting) for job_posting in job_postings])
            else:
                return jsonify({'message': 'No job postings found'}), 404

        except Exception as e:
            # Step 5: Handle any database-related errors
            mysql.connection.rollback()
            logging.error("Database query error: %s", e)
            return jsonify({'error': f"Database error: {str(e)}"}), 500

        finally:
            # Step 6: Ensure cursor is closed
            cursor.close()
            logging.info("Database cursor closed.")

    except Exception as e:
        # Step 7: Catch any unexpected errors
        logging.error("An unexpected error occurred: %s", e)
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500


def job_posting_to_dict(job_posting):
    job_dict = {
        'job_id': job_posting[0],
        'user_id': job_posting[1],
        'company_name': job_posting[2],
        'title': job_posting[3],
        'description': job_posting[4],
        'primary_skills': job_posting[5],
        'secondary_skills': job_posting[6],
        'other_skills': job_posting[7],
        'package': float(job_posting[8]),  # Ensure package is converted to float
        'stipend_amount': float(job_posting[9])  # Ensure stipend_amount is converted to float
    }
    return job_dict



@app.route('/applied-jobs', methods=['GET'])
def get_applied_jobs():
    """
    Endpoint to get all applied jobs for a user
    """
    try:
        # Step 1: Get the user_id from the session
        user_id = session.get('user_id')  # Assuming user_id is stored in the session
        logging.info("User ID", {user_id})
        if not user_id:
            return jsonify({'error': 'User not authenticated'}), 401

        # Step 2: Connect to the database
        cursor = mysql.connection.cursor()
        logging.info("Database connection established successfully.")
        
        # Step 3: Execute the database query
        query = """
            SELECT jp.job_id, jp.user_id, jp.company_name, jp.title, jp.description, 
                   jp.primary_skills, jp.secondary_skills, jp.other_skills, 
                   jp.package, jp.stipend_amount, a.applied_at, a.status
            FROM Job_Postings jp
            INNER JOIN Applications a ON jp.job_id = a.job_id
            WHERE a.user_id = %s
            ORDER BY a.applied_at DESC
        """
        try:
            cursor.execute(query, (user_id,))
            applied_jobs = cursor.fetchall()
            logging.info("Applied jobs fetched from the database.")

            # Step 4: Return the applied jobs
            if applied_jobs:
                return jsonify([applied_job_to_dict(applied_job) for applied_job in applied_jobs]), 200
            else:
                return jsonify({'message': 'No applied jobs found'}), 404
        except Exception as e:
            # Step 5: Handle any database-related errors
            mysql.connection.rollback()
            logging.error("Database query error: %s", e)
            return jsonify({'error': f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()  # Ensure cursor is closed after the operation
    except Exception as e:
        # Step 6: Catch any unexpected errors
        logging.error("An unexpected error occurred: %s", e)
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500

def applied_job_to_dict(applied_job):
    logging.info("Converting applied job to dict: %s", applied_job)
    return {
        'job_id': applied_job[0],
        'user_id': applied_job[1],
        'company_name': applied_job[2],
        'title': applied_job[3],
        'description': applied_job[4],
        'primary_skills': applied_job[5],
        'secondary_skills': applied_job[6],
        'other_skills': applied_job[7],
        'package': float(applied_job[8]),  # Convert Decimal to float if needed
        'stipend_amount': float(applied_job[9]),  # Convert Decimal to float if needed
        'applied_at': applied_job[10].isoformat(),
        'status': applied_job[11]
    }


@app.route('/posted-jobs', methods=['GET'])
def get_posted_jobs():
    """
    Endpoint to get all jobs posted by the logged-in HR user.
    """
    try:
        # Step 1: Get the user ID from the session
        user_id_hr = session.get('user_id_hr')
        if not user_id_hr:
            logging.warning("No user ID found in session. User not logged in.")
            return jsonify({'error': 'Please sign in as an HR user'}), 401
        
        logging.info(f"User ID: {user_id_hr} fetched from session.")

        # Step 2: Connect to the database
        cursor = mysql.connection.cursor()
        logging.info("Database connection established successfully.")

        # Step 3: Execute the database query
        query = """SELECT job_id, user_id, company_name, title, description, 
                          primary_skills, secondary_skills, other_skills, package, stipend_amount
                   FROM Job_Postings
                   WHERE user_id = %s"""
        try:
            cursor.execute(query, (user_id_hr,))
            posted_jobs = cursor.fetchall()
            logging.info(f"Fetched {len(posted_jobs)} job postings from the database.")

            # Step 4: Return the posted jobs
            if posted_jobs:
                logging.info(f"Jobs found: {posted_jobs}")
                # Convert each row to dictionary format using the helper function
                return jsonify([job_posting_to_dict(posted_job) for posted_job in posted_jobs]), 200
            else:
                logging.info("No job postings found for the user.")
                return jsonify({'message': 'No posted jobs found'}), 404

        except Exception as e:
            # Step 5: Handle database query errors
            logging.error(f"Database query error: {str(e)}")
            return jsonify({'error': f"Database query error: {str(e)}"}), 500

    except Exception as e:
        # Step 6: Catch any unexpected errors
        logging.error(f"Unexpected error occurred: {str(e)}")
        return jsonify({'error': f"Unexpected error: {str(e)}"}), 500

    finally:
        # Ensure cursor is closed
        try:
            cursor.close()
            logging.info("Database cursor closed.")
        except Exception as e:
            logging.error(f"Error closing cursor: {str(e)}")


@app.route('/student-rankings/<int:job_id>', methods=['GET'])
def get_student_rankings(job_id):
    try:
        cur = mysql.connection.cursor()

        # Corrected SQL query to fetch student ranking data
        query = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY er.score DESC) AS sr_no,
                si.full_name,
                si.college_name,
                u.email AS email_id,
                er.score,
                a.status
            FROM 
                Applications a
            JOIN 
                Evaluation_Results er ON a.application_id = er.application_id
            JOIN 
                Student_Info si ON a.user_id = si.user_id
            JOIN 
                Users u ON si.user_id = u.user_id
            WHERE 
                a.job_id = %s
            ORDER BY 
                er.score DESC;
        """

        # Execute the query
        cur.execute(query, (job_id,))
        results = cur.fetchall()

        logging.info(results)

        # Return results as JSON response
        return jsonify(results)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Error fetching student rankings'}), 500
    

@app.route('/shortlist-students/<int:job_id>', methods=['POST'])
def shortlist_students(job_id):
    data = request.json
    num_candidates = data.get('numCandidates', 0)  # Default to 0 as integer

    # Convert num_candidates to an integer
    try:
        num_candidates = int(num_candidates)  # Convert to int
    except ValueError:
        return jsonify({"error": "Invalid number of candidates"}), 400

    if num_candidates <= 0:
        return jsonify({"error": "Invalid number of candidates"}), 400

    cursor = mysql.connection.cursor()  # Ensure this is set up properly
    try:
        #fetch the job's shortlist status
        cursor.execute("SELECT shortlist_status FROM Job_Postings WHERE job_id = %s", (job_id,))
        job = cursor.fetchone()

        if not job:
            return jsonify({"message": "Job not found"}), 404
        
        shortlist_status = job[0]  # Extract shortlist_status

        # Fetch students based on their scores, ordered by score
        cursor.execute("""
            SELECT 
                ROW_NUMBER() OVER (ORDER BY er.score DESC) AS sr_no,
                si.full_name,
                si.college_name,
                u.user_id,  # Use user_id to update the Applications table
                u.email AS email_id,
                er.score,
                a.status
            FROM 
                Applications a
            JOIN 
                Evaluation_Results er ON a.application_id = er.application_id
            JOIN 
                Student_Info si ON a.user_id = si.user_id
            JOIN 
                Users u ON si.user_id = u.user_id
            WHERE 
                a.job_id = %s
            ORDER BY 
                er.score DESC
            LIMIT %s
        """, (job_id, num_candidates))

        shortlisted_students = cursor.fetchall()
        
        if not shortlisted_students:
            return jsonify({"message": "No candidates found to shortlist."}), 404

        # Update the status of shortlisted candidates
        for student in shortlisted_students:
            cursor.execute("""
                UPDATE Applications 
                SET status = 'Shortlisted' 
                WHERE user_id = %s AND job_id = %s
            """, (student[3], job_id))  # Ensure correct index for user_id

        # Update the status of remaining candidates to 'Rejected'
        cursor.execute("""
            UPDATE Applications 
            SET status = 'Rejected' 
            WHERE job_id = %s AND user_id NOT IN %s
        """, (job_id, tuple(student[3] for student in shortlisted_students)))

        mysql.connection.commit()  # Commit the changes

        return jsonify({"message": "Students shortlisted successfully."}), 200

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log the error
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()  # Ensure the cursor is closed
   

@app.route('/feedback/<int:job_id>', methods=['GET'])
def get_feedback(job_id):
    try:
        cursor = mysql.connection.cursor()  # Ensure this is set up properly
        # SQL query to fetch feedback from resumes table based on job_id
        query = """
            SELECT r.feedback 
            FROM Resumes r
            JOIN Applications a ON r.resume_id = a.resume_id
            WHERE a.job_id = %s
        """
        cursor.execute(query, (job_id,))
        result = cursor.fetchone()

        if result:
            return jsonify({"feedback": result[0]}), 200
        else:
            return jsonify({"feedback": "No feedback available for this job."}), 404
    except Exception as e:
        print(f"Error fetching feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/logout', methods=['POST'])
def logout():
    try:
        # Clear the session to log the user out
        session.clear()

        # Optionally, send a success message as a response
        return jsonify({'message': 'User logged out successfully'}), 200
    except Exception as e:
        # Handle any errors that occur during logout
        return jsonify({'error': f"Logout failed: {str(e)}"}), 500



if __name__ == '__main__':
    app.run(debug=True)