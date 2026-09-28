\# 🐾 PetPal — AI-Powered Pet Care \& Animal Welfare Platform



PetPal is an AI-powered web application designed to make pet care and animal welfare management easier and more accessible.



The platform allows users to manage their pets, track vaccination information, explore pet adoption and lost \& found services, access pet-care information, and interact with an AI assistant powered by Google Gemini.



\---



\## 📌 Project Overview



PetPal combines a simple and responsive web interface with a Python Flask backend and Google Gemini AI.



The main objective of PetPal is to provide a centralized platform where users can:



\- 🐶 Register and manage pets

\- 💉 Track vaccination information

\- 🏠 Explore pet adoption

\- 🔎 Find or report lost pets

\- 📚 Access pet-care information

\- 🤖 Ask questions to an AI pet-care assistant

\- 📞 Contact PetPal support

\- 🌐 Interact with the AI assistant in multiple languages



\---



\## ✨ Features



\### 🐾 Pet Management



Users can register their pets and maintain important pet-related information.



\### 💉 Vaccination Tracking



PetPal provides functionality for managing vaccination information and helping users keep track of important vaccination details.



\### 🏠 Pet Adoption



The platform provides an adoption section where users can explore pets available for adoption.



\### 🔎 Lost \& Found



Users can use the Lost \& Found section to help report or find missing pets.



\### 📚 Pet Care Guide



Users can access general information related to:



\- Dog care

\- Cat care

\- Feeding

\- Vaccination

\- Animal welfare

\- General pet health and safety



\### 🤖 AI Pet Assistant



PetPal includes an AI chatbot powered by Google's Gemini API.



Users can ask questions such as:



> "What vaccines does my puppy need?"



> "How should I take care of a newborn kitten?"



> "How do I register my pet?"



The question is sent from the frontend to the Flask backend, which sends an appropriate prompt to Gemini. Gemini generates the response and the backend sends it back to the frontend.



\### 🌐 Multilingual AI



The AI assistant can respond in the same language used by the user, including languages such as:



\- English

\- Hindi

\- Marathi



\---



\# 🏗️ System Architecture



```text

&#x20;                   ┌──────────────────────┐

&#x20;                   │      PetPal UI      │

&#x20;                   │   HTML + CSS + JS    │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                              │ HTTP Request

&#x20;                              ▼

&#x20;                   ┌──────────────────────┐

&#x20;                   │     Flask Backend    │

&#x20;                   │      Python API      │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                ┌─────────────┴─────────────┐

&#x20;                │                           │

&#x20;                ▼                           ▼

&#x20;       ┌─────────────────┐        ┌──────────────────┐

&#x20;       │    Database     │        │   Gemini AI API  │

&#x20;       │ Pet/User Data   │        │ Google Gemini    │

&#x20;       └─────────────────┘        └──────────────────┘

