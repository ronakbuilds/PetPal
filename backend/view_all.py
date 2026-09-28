import sqlite3

conn = sqlite3.connect("petpal.db")
cursor = conn.cursor()

print("===== USERS =====")
cursor.execute("SELECT * FROM users")
for row in cursor.fetchall():
    print(row)

print("\n===== PETS =====")
cursor.execute("SELECT * FROM pets")
for row in cursor.fetchall():
    print(row)

conn.close()