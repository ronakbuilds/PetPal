from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection
import psycopg2.extras
from gemini import ask_gemini

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return {
        "status": "running",
        "project": "PetPal Backend"
    }


# ---------------- Register ---------------- #

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    fullname = data.get("fullname", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "user")

    if not fullname or not email or not password:
        return jsonify({"success": False, "message": "Missing required fields"})

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'fullname'
        """)
        has_fullname = cursor.fetchone()

        if has_fullname:
            cursor.execute("""
                INSERT INTO users (fullname, email, password, role)
                VALUES (%s, %s, %s, %s)
            """, (fullname, email, password, role))
        else:
            cursor.execute("""
                INSERT INTO users (name, email, password, role)
                VALUES (%s, %s, %s, %s)
            """, (fullname, email, password, role))

        conn.commit()
        return jsonify({"success": True, "message": "Registration Successful"})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"success": False, "message": f"Database Error: {str(e)}"})
    finally:
        cursor.close()
        conn.close()

# ---------------- Login ---------------- #

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "")

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cursor.execute("""
            SELECT id, fullname, email, role
            FROM users
            WHERE email=%s AND password=%s
        """, (email, password))

        user = cursor.fetchone()
        
        if user:
            return jsonify({
                "success": True,
                "message": "Login Successful",
                "user": {
                    "id": user["id"],
                    "fullname": user["fullname"],
                    "email": user["email"],
                    "role": user["role"]
                }
            })
        return jsonify({"success": False, "message": "Invalid Email or Password"})

    except Exception as e:
        return jsonify({"success": False, "message": f"Login Error: {str(e)}"})
    finally:
        # FIXED: Thread safeties evaluate fully BEFORE shutting connection down
        cursor.close()
        conn.close()


# ---------------- Add Pet ---------------- #

@app.route("/add_pet", methods=["POST"])
def add_pet():
    data = request.get_json()

    try:
        user_id = data.get("user_id")
        pet_name = data.get("pet_name", "").strip()
        pet_type = data.get("pet_type", "Dog").strip()
        breed = data.get("breed", "").strip()
        gender = data.get("gender", "Male").strip()
        medical_notes = data.get("medical_notes", "").strip()

        # SAFE CONVERSION: Converts decimal floats like 1.5 safely to rounded integer to stop database schema errors
        raw_age = data.get("age", 0)
        age = int(round(float(raw_age))) if raw_age else 0

        # SAFE CONVERSION: Parses weight float value safely
        raw_weight = data.get("weight", 0)
        weight = float(raw_weight) if raw_weight else 0.0

        # SAFE DATES HANDLER: Fallback to None if tracking dates arrive blank from frontend
        vaccination_date = data.get("vaccination_date")
        if not vaccination_date or vaccination_date.strip() == "":
            vaccination_date = None

        next_vaccination_date = data.get("next_vaccination_date")
        if not next_vaccination_date or next_vaccination_date.strip() == "":
            next_vaccination_date = None

        if not user_id or not pet_name:
            return jsonify({"success": False, "message": "User ID and Pet Name are required fields."})

    except Exception as parse_err:
        return jsonify({"success": False, "message": f"Data Parsing Error: {str(parse_err)}"})

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cursor.execute("""
        INSERT INTO pets(
            user_id, pet_name, pet_type, breed, gender, age, weight,
            vaccination_date, next_vaccination_date, medical_notes
        )
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, pet_name, pet_type, breed, gender, age, weight,
            vaccination_date, next_vaccination_date, medical_notes
        ))

        conn.commit()
        return jsonify({
            "success": True,
            "message": "Pet Registered Successfully"
        })
    except Exception as e:
        if conn:
            conn.rollback() # Aborts broken transaction state cleanly to prevent Render 500 loop locks
        return jsonify({
            "success": False,
            "message": f"Database Error: {str(e)}"
        })
    finally:
        cursor.close()
        conn.close()

# ---------------- My Pets ---------------- #

@app.route("/my_pets/<int:user_id>", methods=["GET"])
def my_pets(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cursor.execute("""
            SELECT id, pet_name, pet_type, breed, gender, age, weight, vaccination_date, next_vaccination_date, medical_notes
            FROM pets
            WHERE user_id=%s
        """, (user_id,))

        pets = cursor.fetchall()
        
        result = []
        for pet in pets:
            result.append({
                "id": pet["id"],
                "pet_name": pet["pet_name"],
                "pet_type": pet["pet_type"],
                "breed": pet["breed"],
                "gender": pet["gender"],
                "age": pet["age"],
                "weight": float(pet["weight"]) if pet["weight"] else 0,
                "vaccination_date": pet["vaccination_date"],
                "next_vaccination_date": pet["next_vaccination_date"],
                "medical_notes": pet["medical_notes"]
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
    finally:
        cursor.close()
        conn.close()


# ---------------- Contact Form ---------------- #

@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()

    name = data["name"]
    email = data["email"]
    subject = data["subject"]
    message = data["message"]

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cursor.execute("""
            INSERT INTO contacts(name,email,subject,message)
            VALUES(%s,%s,%s,%s)
        """, (name, email, subject, message))

        conn.commit()
        return jsonify({
            "success": True,
            "message": "Message Sent Successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        })
    finally:
        cursor.close()
        conn.close()


# ---------------- AI Chatbot ---------------- #

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data["message"]

    prompt = f"""
You are PetPal AI, the friendly AI assistant of the PetPal website.
Answer only questions related to pet care, animals, vaccinations, or the PetPal site.
Keep answers under 150 words.

User Question:
{question}
"""
    try:
        answer = ask_gemini(prompt)
        return jsonify({
            "success": True,
            "reply": answer
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "reply": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)
