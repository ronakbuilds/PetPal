from google import genai

client = genai.Client(api_key="YAQ.Ab8RN6LbLj--sNWXk7vUWmg0pxWpOoQX-OSxCLBVknMxNKFcuA")

for model in client.models.list():
    print(model.name)