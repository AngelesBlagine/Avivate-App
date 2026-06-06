import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report
import pickle

print("⏳ Cargando y limpiando el dataset...")
df = pd.read_csv('ai_engine/meajor_cleaned_preprocessed.csv')

# Eliminamos las filas donde 'body' o 'label' estén vacías (solo había 1 de cada una)
df = df.dropna(subset=['body', 'label'])

X = df['body']
y = df['label']

print("⏳ Dividiendo datos en Entrenamiento (80%) y Pruebas (20%)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("⏳ Convirtiendo texto a números (TF-IDF)...")
# Usamos stop_words='english' porque tu dataset está en inglés
vectorizer = TfidfVectorizer(max_features=10000, stop_words='english')
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print("⏳ Entrenando el motor de IA (Naive Bayes)...")
model = MultinomialNB()
model.fit(X_train_tfidf, y_train)

print("⏳ Evaluando la precisión del modelo...")
preds = model.predict(X_test_tfidf)
print(f"\n✅ ¡ENTRENAMIENTO COMPLETO!")
print(f"🎯 Precisión General (Accuracy): {accuracy_score(y_test, preds):.4f}")
print("\n--- Reporte de Clasificación para el Word ---")
print(classification_report(y_test, preds))

print("💾 Guardando el cerebro de la IA en el disco...")
with open('modelo_phishing.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('vectorizador.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)

print("👍 Archivos 'modelo_phishing.pkl' y 'vectorizador.pkl' creados con éxito.")