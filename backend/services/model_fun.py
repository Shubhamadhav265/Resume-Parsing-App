from services.predef_skills import predefined_skills, standard_certifications
import google.generativeai as genai
import os
import PyPDF2 as pdf
from dotenv import load_dotenv
import json
import re
import spacy

# Load a pre-trained NLP model
nlp = spacy.load("en_core_web_sm")

def extract_skills(resume_text):

    # Process the resume text
    doc = nlp(resume_text)

    # Extract skills
    extracted_skills = []
    
    # Check for multi-word skills
    for skill in predefined_skills:
        # Use regex to match whole phrases in the resume text
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_text):
            extracted_skills.append(skill)

    # Remove duplicates
    return list(set(extracted_skills))


def match_skills(resume_skills, job_description_skills):
    resume_skill_set = set(resume_skills)
    job_skill_set = set(job_description_skills)

    matching_skills = [skill for skill in job_skill_set if skill in resume_skill_set]
    missing_skills = [skill for skill in job_skill_set if skill not in matching_skills]

    # Putting non-matching skills into missing_skills list
    for job_skill in job_description_skills:
        if not any(resume_skill.lower() in job_skill.lower() for resume_skill in resume_skills):
            missing_skills.append(job_skill)

    # Remove duplicates
    missing_skills = list(set(missing_skills))

    return matching_skills, missing_skills
