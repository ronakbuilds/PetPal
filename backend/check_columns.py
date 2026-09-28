import sqlite3

conn = sqlite3.connect("petpal.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(pets)")

for column in cursor.fetchall():
    print(column)

conn.close()