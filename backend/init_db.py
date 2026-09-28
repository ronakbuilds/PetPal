import sqlite3

conn = sqlite3.connect("petpal.db")
cursor = conn.cursor()

# Users
cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS pets(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    pet_name TEXT NOT NULL,
    pet_type TEXT NOT NULL,
    breed TEXT,
    gender TEXT,
    age REAL,
    weight REAL,
    vaccination_date TEXT,
    next_vaccination_date TEXT,
    medical_notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

# Contact Messages
cursor.execute("""
CREATE TABLE IF NOT EXISTS contacts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT
)
""")

conn.commit()
conn.close()

print("Database Created Successfully!")