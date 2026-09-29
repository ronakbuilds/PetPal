from google import genai

import os
API_KEY = os.environ.get("GEMINI_API_KEY") 


client = genai.Client(api_key=API_KEY)

MODELS = [
    "gemini-2.5-flash-8b",  # High-speed micro model (Best for bypassing traffic jams)
    "gemini-2.5-flash",     # Standard high-speed flash model
]


def ask_gemini(prompt):
    last_error = None

    for model_name in MODELS:
        try:
            print(f"Trying: {model_name}")

            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            
            print(f"Success: {model_name}")
            return response.text

        except Exception as e:
            print(f"{model_name} failed: {e}")
            last_error = e

    return f"AI is temporarily unavailable.\n\n{last_error}"