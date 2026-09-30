from google import genai

import os
API_KEY = os.environ.get("GEMINI_API_KEY") 


client = genai.Client(api_key=API_KEY)

MODELS = [
    "gemini-3.8-flash",  # High-efficiency workhorse model (Fresh queue context)
    "gemini-3.7-flash",  # Ultra-fast reasoning & coding engine
    "gemini-3.5-flash"   # GA standard stable production fallback model
]

def ask_gemini(prompt):
    last_error = None

    for model_name in MODELS:
        try:
            print(f"Attempting connection string: {model_name}")

            # Safe SDK extraction parameters using the Client utility instance
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            
            print(f"Success loading model: {model_name}")
            return response.text

        except Exception as e:
            print(f"Model interface {model_name} failed: {e}")
            last_error = e

    # Safe return indicator tracking loop if Google hits global rate-limiting caps
    return "AI endpoints are extremely busy right now. Please re-send your message in a few seconds!"