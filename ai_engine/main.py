import os
import pickle
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client # <-- 1. NUEVO IMPORT

# Inicializamos la API
app = FastAPI(title="Backend de AvivateApp")

# Configuración de CORS para permitir conexiones desde la interfaz web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde cualquier origen en desarrollo
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP (POST, GET, etc.)
    allow_headers=["*"],
)

# --- 2. CONFIGURACIÓN DE SUPABASE ---
# ATENCIÓN: Reemplaza estos valores con los de tu panel de Supabase (Project Settings -> API)
SUPABASE_URL = "https://yzadlngdxrpfeiuzmsvw.supabase.co"
SUPABASE_KEY = "sb_publishable_VL-nHKYUz_iBTgF8E0FoSQ_wYqO8rmj"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# ------------------------------------

# Cargamos el modelo y el vectorizador
with open('modelo_phishing.pkl', 'rb') as f:
    model = pickle.load(f)
with open('vectorizador.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

@app.get("/")
def home():
    return {"mensaje": "API del motor de IA de AvivateApp en línea y operativa. No te olvides de agregar /docs en la URL para ver la documentación interactiva."}

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
    
    # Guardamos los resultados finales para retornarlos
    prob_redondeada = round(float(phishing_prob), 4)
    es_phish = bool(phishing_prob > 0.5)

    # --- 3. LÓGICA PARA GUARDAR EN LA BASE DE DATOS ---
    # Convertimos los datos al formato que espera nuestra tabla
    score_porcentaje = int(prob_redondeada * 100)
    risk_level = "danger" if score_porcentaje >= 70 else ("doubt" if score_porcentaje >= 30 else "safe")
    
    # Cortamos el texto para no guardar un correo gigante entero (solo los primeros 50 caracteres)
    snippet_text = email.text.strip()
    snippet = snippet_text[:50] + "..." if len(snippet_text) > 50 else snippet_text

    # Lo envolvemos en un try/except. Si Supabase falla o no hay internet, 
    # la app no se rompe y le devuelve el resultado al usuario igual.
    try:
        supabase.table("logs_analisis").insert({
            "score": score_porcentaje,
            "level": risk_level,
            "snippet": snippet
        }).execute()
        print("✅ Análisis guardado exitosamente en Supabase")
    except Exception as e:
        print(f"❌ Error al guardar en Supabase: {e}")
    # --------------------------------------------------

    # Retornamos exactamente lo que React espera recibir
    return {
        "probabilidad": prob_redondeada,
        "es_phishing": es_phish
    }