predefined_skills = [
    # Programming Languages
    "Python", "Java", "JavaScript", "C++", "CPP", "C", "C#", "Ruby", "Go", "Swift", "Kotlin", "PHP", "TypeScript", "R", 
    "Shell Scripting", "Scala", "Perl", "Rust", "Dart", "Elixir", "Haskell", "Lua", "Objective-C", "MATLAB", 
    "VHDL", "Verilog", "Solidity",   
    # Web Development Frameworks and Tools
    "HTML", "CSS", "Tailwind", "Bootstrap", "SASS", "LESS", "React", "Angular", "Vue.js", "Node.js", "Express.js",
    "Django", "Flask", "ASP.NET", "Ruby on Rails", "Next.js", "Gatsby", "Nuxt.js", "jQuery", "Svelte", "WebAssembly",
    # Mobile Development Frameworks
    "Flutter", "React Native", "SwiftUI", "Xamarin", "Ionic", "Cordova", "Kotlin Multiplatform", "NativeScript",
    # Cloud Platforms and Services
    "AWS", "Azure", "Google Cloud", "Google Cloud Platform (GCP)", "IBM Cloud", "Oracle Cloud", "Heroku", "DigitalOcean", 
    "CloudFormation", "Lambda", "API Gateway", "EC2", "S3", "Route 53", "Azure DevOps", "GCP BigQuery", "Kubernetes", "VPC",
    " Load Balancing", "Virtualization", "Infrastructure as Code"
    # DevOps & CI/CD Tools
    "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "Chef", "Puppet", "Vagrant", "CircleCI", "TravisCI",
    "GitLab CI", "Bitbucket Pipelines", "SonarQube", "Artifactory", "Nagios", "Prometheus", "Grafana", "ELK Stack (Elasticsearch, Logstash, Kibana)", 
    "New Relic", "Splunk", "PagerDuty", "Istio", "OpenShift", "ArgoCD", "Nomad","CI/CD pipelines", "CloudWatch"
    # Version Control & Collaboration Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "Perforce", "Subversion (SVN)", "Mercurial",
    # Databases
    "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle", "SQL Server", "MariaDB", "Cassandra", "Redis", "DynamoDB",
    "CouchDB", "Memcached", "Firestore", "Couchbase", "Neo4j", "Elasticsearch", "ClickHouse", "InfluxDB", "TimescaleDB", 
    "CockroachDB", "HBase", "Hive", "PrestoDB", "BackUp", "Recovery","SQL", "Cloud storag"
    # Machine Learning & Data Science Libraries/Tools
    "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "OpenCV", "XGBoost", 
    "LightGBM", "CatBoost", "NLTK", "SpaCy", "Hugging Face Transformers", "SciPy", "Statsmodels", "Dask", "PySpark", 
    "Airflow", "Hadoop", "Kafka", "MLflow", "Kubeflow", "Tidyverse", "Jupyter Notebooks", 
    # Natural Language Processing (NLP) and AI Tools
    "Speech Recognition", "TextBlob", "BERT", "GPT", "Transformer Networks", "Word2Vec", "FastText", "GloVe", 
    "OpenAI API", "DeepSpeech", "CoreNLP", "AllenNLP", "Fairseq", "Dialogflow", "Rasa",
    # Software Testing & QA
    "Selenium", "JUnit", "pytest", "TestNG", "Cucumber", "Mocha", "Chai", "Jest", "Postman", "SoapUI", "LoadRunner", 
    "JMeter", "Appium", "Robot Framework", "Cypress", "Protractor", "SpecFlow", "QTest", "TestComplete", "Zephyr",
    # System Administration & Infrastructure
    "Linux", "Bash", "PowerShell", "Windows Server", "Unix", "VMware", "Hyper-V", "OpenStack", "Zabbix", "Nagios", 
    "pfSense", "HAProxy", "Nginx", "Apache HTTP Server", "Tomcat", "IIS", "FreeBSD", "OpenBSD", "AWS Lambda", 
    # Networking & Security
    "TCP/IP", "DNS", "DHCP", "HTTP", "HTTPS", "Load Balancing", "VPN", "SSH", "SSL/TLS", "Firewalls", "Routing Protocols", 
    "OSI Model", "Wireshark", "Nmap", "Snort", "Penetration Testing", "OWASP", "Burp Suite", "Metasploit", 
    "Kali Linux", "Suricata", "SOC", "SIEM", "IDS/IPS", "Endpoint Security", "Zero Trust", "OAuth", "SAML", "IAM", "PKI", 
    "SSL Certificates", "WAF", "Cloud Security", "Encryption", "AES", "RSA", "Two-Factor Authentication", 
    # Big Data & Data Engineering Tools
    "Hadoop", "Spark", "Flink", "Kafka", "Storm", "Hive", "Pig", "Presto", "Airflow", "NiFi", "HDFS", "Cloudera", 
    "Databricks", "EMR", "MapReduce", "Delta Lake", "Snowflake", "Redshift", "BigQuery", "Azure Data Lake",
    # Business Intelligence & Data Visualization Tools
    "Tableau", "Power BI", "Looker", "Qlik", "Google Data Studio", "D3.js", "Plotly", "ggplot2", "Metabase", "Grafana",
    # Software Design & Architecture
    "Microservices", "RESTful API", "GraphQL", "gRPC", "Service-Oriented Architecture (SOA)", "Event-Driven Architecture",
    "CQRS", "Domain-Driven Design (DDD)", "Test-Driven Development (TDD)", "Behavior-Driven Development (BDD)",
    "Clean Architecture", "Serverless Architecture", "Event Sourcing", "Pub/Sub Architecture", 
    # Miscellaneous Tools & Technologies
    "VS Code", "IntelliJ IDEA", "Eclipse", "PyCharm", "Xcode", "NetBeans", "Android Studio", "Atom", "Sublime Text",
    "Maven", "Gradle", "npm", "Yarn", "Webpack", "Parcel", "Babel", "ESLint", "Prettier", "SonarLint", "Figma", 
    "Adobe XD", "Sketch", "InVision", "Zeplin", "Lucidchart", "Microsoft Visio", "PlantUML", "Draw.io", 
    # Soft Skills
    "Collaboration", "Communication", "Teamwork", "Problem Solving", "Time Management", "Leadership", 
    "Creativity", "Critical Thinking", "Adaptability", "Emotional Intelligence", "Public Speaking", "Negotiation",
    "Conflict Resolution", "Empathy", "Decision Making", "Strategic Thinking", "Interpersonal Skills", 
    "Organizational Skills", "Customer Service", "Networking", "Communication skills", "Problem-solving"
    # Emerging Technologies
    "Blockchain", "NFTs", "Smart Contracts", "IoT", "AR/VR", "Metaverse", "Quantum Computing", "5G", "Edge Computing", 
    "3D Printing", "Wearable Technology", "Autonomous Systems", "Robotic Process Automation (RPA)", "Biotechnology", 
    "Synthetic Biology", "Nanotechnology", "Cognitive Computing", "Augmented Reality", "Virtual Reality", "Agile methodologies"
    # Additional Skills
    "SQL", "Git", "Linux", "AWS", "Docker", "Kubernetes", "MySQL Workbench", "OpenShift", "CyberSecurity", 
    "Tkinter", "SMTP", "Object-Oriented Programming (OOP)", "Data Structures and Algorithms", "Cloudinary", 
    "Slack", "React.js", "Azure", "GitHub", "Selenium", "TensorFlow", "Operating Systems","Documentation", "Troubleshooting", 
    "Project management", "Adaptability"
]

# Pre-Defining the standard Certification Courses
standard_certifications = [
    "AWS Certified Solutions Architect – Associate",
    "Certified Kubernetes Administrator (CKA)",
    "Google Professional Cloud Architect",
    "Microsoft Certified: Azure Solutions Architect Expert",
    "Certified Information Systems Security Professional (CISSP)",
    "AWS Certified Developer – Associate",
    "Certified Ethical Hacker (CEH)",
    "Cisco Certified Network Associate (CCNA)",
    "CompTIA Security+",
    "Microsoft Certified: Azure Fundamentals",
    "Google Professional Data Engineer",
    "AWS Certified Cloud Practitioner",
    "Certified ScrumMaster (CSM)",
    "AWS Certified DevOps Engineer – Professional",
    "Microsoft Certified: Azure DevOps Engineer Expert",
    "CompTIA Network+",
    "Certified Information Security Manager (CISM)",
    "Cisco Certified Network Professional (CCNP)",
    "Google Associate Cloud Engineer",
    "PMP: Project Management Professional",
    "Certified Software Development Professional (CSDP)",
    "Microsoft Certified: Azure Administrator Associate",
    "Oracle Certified Java Programmer",
    "VMware Certified Professional (VCP)",
    "AWS Certified Security – Specialty",
    "Certified Cloud Security Professional (CCSP)",
    "Microsoft Certified: Power Platform Fundamentals",
    "Red Hat Certified Engineer (RHCE)",
    "TOGAF 9 Certification",
    "AWS Certified Big Data – Specialty",
    "ITIL 4 Foundation Certification",
    "Microsoft Certified: Power BI Data Analyst Associate",
    "Certified Information Systems Auditor (CISA)",
    "Google Professional Cloud Developer",
    "Salesforce Certified Platform Developer I",
    "Certified in Risk and Information Systems Control (CRISC)",
    "Microsoft Certified: Dynamics 365 Fundamentals",
    "Adobe Certified Expert (ACE)",
    "Cloudera Certified Data Analyst",
    "Certified Data Privacy Solutions Engineer (CDPSE)",
    "HashiCorp Certified: Terraform Associate",
    "Certified Agile Leadership (CAL)",
    "Google Professional Machine Learning Engineer",
    "AWS Certified Machine Learning – Specialty",
    "Scrum.org Professional Scrum Master (PSM I)",
    "Microsoft Certified: Security, Compliance, and Identity Fundamentals",
    "Cisco Certified DevNet Professional",
    "Oracle Database SQL Certified Associate",
    "Certified Blockchain Developer",
    "Certified JavaScript Developer (CIW)"
]
