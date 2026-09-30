import os
import psycopg2
import psycopg2.extras

def get_db_connection():
    # 1. Safely extract your secure hidden string straight from the Render panel
    db_url = os.environ.get('DATABASE_URL')
    
    if not db_url:
        raise ValueError("Missing DATABASE_URL environment variable inside Render panel!")
        
    # 2. Fix the legacy Heroku/Render standard prefix variant if it exists
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    # 3. FIXED: Feed the entire unbroken string directly into psycopg2 safely!
    conn = psycopg2.connect(db_url)
    return conn
