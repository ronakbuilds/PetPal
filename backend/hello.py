from google import genai

import os
API_KEY = os.environ.get("GEMINI_API_KEY") 

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Reply with exactly: Hello Ronak"
)

print(response.text)