from google import genai

import os
API_KEY = os.environ.get("GEMINI_API_KEY") 
    
for model in client.models.list():
    print(model.name)