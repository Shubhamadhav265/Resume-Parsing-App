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
session(app)
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
# def candidate_signin():
#     try:
#         # Log the request data
#         print("Received sign-in request")

#         data = request.get_json()
#         print(f"Request data: {data}")

#         email = data.get('email')
#         password = data.get('password')

#         # Log extracted data
#         print(f"Extracted email: {email}, password: {password}")

#         # Check for missing fields
#         if not all([email, password]):
#             print("Missing fields in the request")
#             return jsonify({'error': 'All fields are required'}), 400

#         cursor = mysql.connection.cursor()

#         try:
#             # Log the database query
#             print(f"Querying user with email: {email}")
#             cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
#             user = cursor.fetchone()

#             # Check if user exists
#             if not user:
#                 print("User does not exist")
#                 return jsonify({'error': 'User does not exist'}), 404

#             print(f"User found: {user}")
            
#             # Check if the user is an Candidate
#             if user[3] != 'Candidate':  # Assuming user[3] is the role
#                 print("User is not an Candidate")
#                 return jsonify({'error': 'User is not authorized as Candidate'}), 403

#             # Check password
#             if not bcrypt.check_password_hash(user[2], password):  # Assuming user[1] is the hashed password
#                 print("Incorrect password")
#                 return jsonify({'error': 'Incorrect password'}), 400

#             # Here we'r generating access_token for the signedin user_id
#             print(create_access_token(identity=user[0]))

#             # Successful sign-in
#             print("Candidate signed in successfully")
#             return jsonify({'message': 'Candidate signed in successfully'}), 200

#         except Exception as db_error:
#             # Log the database error
#             print(f"Database error: {db_error}")
#             mysql.connection.rollback()
#             return jsonify({'error': str(db_error)}), 500

#         finally:
#             cursor.close()
#             print("Cursor closed")

#     except Exception as e:
#         # Log any other errors
#         print(f"Error occurred: {e}")
#         return jsonify({'error': str(e)}), 500
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
        # Log the request data
        print("Received HR sign-in request")

        data = request.get_json()
        print(f"Request data: {data}")

        email = data.get('email')
        password = data.get('password')

        # Log extracted data
        print(f"Extracted email: {email}, password: [HIDDEN]")

        # Check for missing fields
        if not all([email, password]):
            print("Missing fields in the request")
            return jsonify({'error': 'All fields are required'}), 400

        cursor = mysql.connection.cursor()

        try:
            # Log the database query
            print(f"Querying user with email: {email}")
            cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
            user = cursor.fetchone()

            # Check if user exists
            if not user:
                print("User does not exist")
                return jsonify({'error': 'User does not exist'}), 404

            print(f"User found: {user}")

            # Check if the user is an HR
            if user[3] != 'HR':  # Assuming user[3] is the role
                print("User is not an HR")
                return jsonify({'error': 'User is not authorized as HR'}), 403

            # Log the hashed password
            hashed_password = user[2]  # Assuming user[2] is the hashed password
            print(f"Hashed password from DB: {hashed_password}")

            # Check password
            if not bcrypt.check_password_hash(hashed_password, password):
                print("Incorrect password")
                return jsonify({'error': 'Incorrect password'}), 400

            # Here we'r generating access_token for the signedin user_id
            print(create_access_token(identity=user[0]))

            # Successful sign-in
            print("HR signed in successfully")
            return jsonify({'message': 'HR signed in successfully'}), 200

        except Exception as db_error:
            # Log the database error
            print(f"Database error: {db_error}")
            mysql.connection.rollback()
            return jsonify({'error': str(db_error)}), 500

        finally:
            cursor.close()
            print("Cursor closed")  

    except Exception as e:
        # Log any other errors
        print(f"Error occurred: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/upload', methods=['POST'])
def upload_resume():
    print(f"Session at resume upload: {session}")
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    # session['user_id2'] =2

    # Get user_id from session instead of request.form
    
    user_id = session.get('user_id')
    print(f"User ID from session: {user_id}")
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 400  # Handle if user is not logged in

    job_id = request.form.get('job_id')  # Get the job ID from the request
    if not job_id:
        return jsonify({'error': 'Job ID is required'}), 400

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
    # Converting list to String to consider it as a single value for database storage
    skills_string = ', '.join(resume_skills)
    print(skills_string)

    # Inserting the resume submission into the Resumes DB table
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''INSERT INTO Resumes (user_id, job_id, file_path, status, skills) 
                          VALUES (%s, %s, %s, 'Pending', %s)''', (user_id, job_id, file_path, skills_string))
        resume_id = cursor.lastrowid  # Get the ID of the inserted resume
        mysql.connection.commit()
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': f"Database error: {e}"}), 500
    finally:
        cursor.close()

    # Process to match skills
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

    # Calculate skill match percentage
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


import logging
# Configure logging to capture error messages and info for debugging
logging.basicConfig(level=logging.DEBUG)

@app.route('/job-posting', methods=['POST'])
def create_job_posting():
    try:
        # Step 1: Retrieve data from the request
        data = request.get_json()
        if not data:
            logging.error("No JSON data received.")
            return jsonify({'error': 'No data provided'}), 400
        
        logging.info("Received data: %s", data)

        # Step 2: Validate required fields
        company_name = data.get('company_name')
        job_description = data.get('job_description')
        role = data.get('role')
        primary_skills = data.get('primary_skills')
        secondary_skills = data.get('secondary_skills')
        other_skills = data.get('other_skills')
        package = data.get('package')
        stipend_amount = data.get('stipend_amount')
        user_id = data.get('user_id', 1)  # default to 1 if not provided

        if not all([company_name, job_description, role, primary_skills, user_id]):
            missing_fields = [field for field in ['company_name', 'job_description', 'role', 'primary_skills', 'user_id'] if not data.get(field)]
            logging.error("Missing required fields: %s", missing_fields)
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        # Step 3: Connect to the database
        cursor = mysql.connection.cursor()
        logging.info("Database connection established successfully.")
        
        # Step 4: Execute the database insert query
        try:
            query = '''INSERT INTO Job_Postings (user_id, title, description, primary_skills, secondary_skills, other_skills, company_name, package, stipend_amount) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'''
            cursor.execute(query, (user_id, role, job_description, primary_skills, secondary_skills, other_skills, company_name, package, stipend_amount))
            mysql.connection.commit()
            logging.info("Job posting created successfully in the database.")
            return jsonify({'message': 'Job posting created successfully'}), 201
        
        except Exception as e:
            # Step 5: Handle any database-related errors
            mysql.connection.rollback()
            logging.error("Database insertion error: %s", e)
            return jsonify({'error': f"Database error: {str(e)}"}), 500
        
        finally:
            # Step 6: Ensure cursor is closed
            cursor.close()
            logging.info("Database cursor closed.")

    except Exception as e:
        # Step 7: Catch any unexpected errors
        logging.error("An unexpected error occurred: %s", e)
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/available-jobs', methods=['GET'])
def fetch_available_jobs():
    try:
        logging.info("Received GET request for available jobs.")
        # Step 1: Connect to the database
        cursor = mysql.connection.cursor()
        logging.info("Database connection established successfully.")
        
        # Step 2: Execute the database select query
        try:
            query = '''SELECT job_id, user_id, company_name, title, description,package, stipend_amount
                       FROM Job_Postings'''
            cursor.execute(query)
            job_postings = cursor.fetchall()
            logging.info("Available job postings fetched from the database: %s", job_postings)
            
            # Step 3: Return the job postings
            if job_postings:
                return jsonify([job_posting_to_dict(job_posting) for job_posting in job_postings])
            else:
                return jsonify({'message': 'No job postings found'}), 404
        
        except Exception as e:
            # Step 4: Handle any database-related errors
            mysql.connection.rollback()
            logging.error("Database query error: %s", e)
            return jsonify({'error': f"Database error: {str(e)}"}), 500
        
        finally:
            # Step 5: Ensure cursor is closed
            cursor.close()
            logging.info("Database cursor closed.")
    
    except Exception as e:
        # Step 6: Catch any unexpected errors
        logging.error("An unexpected error occurred: %s", e)
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500


def job_posting_to_dict(job_posting):
    logging.info("Converting job posting to dict: %s", job_posting)
    return {
        'job_id': job_posting[0],
        'user_id': job_posting[1],
        'company_name': job_posting[2],
        'title': job_posting[3],
        'description': job_posting[4],
        'package': float(job_posting[5]),  # Convert Decimal to float if needed
        'stipend_amount': float(job_posting[6])  # Convert Decimal to float if needed
    }


@app.route('/applied-jobs', methods=['GET'])
def get_applied_jobs():
    """
    Endpoint to get all applied jobs for a user
    """
    try:
        # Step 1: Get the user ID from the request
        user_id = request.args.get('user_id')
        logging(f"User ID: {user_id}")
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Step 2: Connect to the database
        cursor = mysql.connection.cursor()
        logging.info("Database connection established successfully.")
        
        # Step 3: Execute the database query
        query = """SELECT jp.job_id, jp.user_id, jp.company_name, jp.title, jp.description, jp.primary_skills, jp.secondary_skills, jp.other_skills, jp.package, jp.stipend_amount, a.applied_at, a.status
                    FROM Job_Postings jp
                    INNER JOIN Applications a ON jp.job_id = a.job_id
                    WHERE a.user_id = %s
                    ORDER BY a.applied_at DESC"""
        try:
            cursor.execute(query, (user_id,))
            applied_jobs = cursor.fetchall()
            logging.info("Applied jobs fetched from the database: %s", applied_jobs)
            
            # Step 4: Return the applied jobs
            if applied_jobs:
                return jsonify([applied_job_to_dict(applied_job) for applied_job in applied_jobs])
            else:
                return jsonify({'message': 'No applied jobs found'}), 404
        except Exception as e:
            # Step 5: Handle any database-related errors
            mysql.connection.rollback()
            logging.error("Database query error: %s", e)
            return jsonify({'error': f"Database error: {str(e)}"}), 500
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


if __name__ == '__main__':
    app.run(debug=True)