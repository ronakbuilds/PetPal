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
        try:
            # 1. Try inserting with 'fullname' column name
            cursor.execute("""
            INSERT INTO users (fullname, email, password, role)
            VALUES (%s, %s, %s, %s)
            """, (fullname, email, password, role))
            conn.commit()
        except Exception as db_err:
            # 2. If it fails, rollback and try inserting with 'name' column name instead
            conn.rollback()
            cursor.execute("""
            INSERT INTO users (name, email, password, role)
            VALUES (%s, %s, %s, %s)
            """, (fullname, email, password, role))
            conn.commit()

        return jsonify({
            "success": True,
            "message": "Registration Successful"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Database Error: {str(e)}"
        })
    finally:
        # FIXED: Added critical connection shutdown to prevent socket blocking crashes
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

    user_id = data["user_id"]
    pet_name = data["pet_name"]
    pet_type = data["pet_type"]
    breed = data["breed"]
    gender = data["gender"]
    age = data["age"]
    weight = data["weight"]
    vaccination_date = data["vaccination_date"]
    next_vaccination_date = data["next_vaccination_date"]
    medical_notes = data["medical_notes"]

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cursor.execute("""
        INSERT INTO pets(
            user_id, pet_name, pet_type, breed, gender, age, weight,
            vaccination_date, next_vaccination_date, medical_notes
        )
        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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
        return jsonify({
            "success": False,
            "message": str(e)
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
