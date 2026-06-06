from fastapi import FastAPI
from pydantic import BaseModel
import pickle

# Inicializamos la API
app = FastAPI(title="Backend de Estate Atenti")

# Cargamos el modelo y el vectorizador
with open('modelo_phishing.pkl', 'rb') as f:
    model = pickle.load(f)
with open('vectorizador.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

@app.get("/")
def home():
    return {"mensaje": "API del motor de IA de Estate Atenti en línea y operativa"}

# Estructura de los datos que recibiremos
class EmailInput(BaseModel):
    text: str

@app.post("/predict")
def predict_email(email: EmailInput):
    if not email.text.strip():
        return {"probabilidad": 0.0, "es_phishing": False}
        
    # Transformar texto a números
    text_tfidf = vectorizer.transform([email.text])
    
    # Predecir probabilidad
    probabilities = model.predict_proba(text_tfidf)[0]
    phishing_prob = probabilities[1]
    
    return {
        "probabilidad": round(float(phishing_prob), 4),
        "es_phishing": bool(phishing_prob > 0.5)
    }