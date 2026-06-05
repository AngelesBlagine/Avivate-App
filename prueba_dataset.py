import pandas as pd

try:
    # 1. Intentar cargarlo de forma directa
    # Cambia 'dataset.csv' por el nombre real de tu archivo
    df = pd.read_csv('meajor_cleaned_preprocessed.csv') 
    print("¡Carga exitosa sin errores de codificación!")
    
    # 2. Ver las primeras filas para chequear la estructura
    print("\n--- Estructura de los Datos ---")
    print(df.head())
    
    # 3. Contar valores nulos (vacíos)
    print("\n--- Valores faltantes por columna ---")
    print(df.isnull().sum())
    
    # 4. Ver si las etiquetas están balanceadas
    # Cambia 'label' por el nombre de la columna de clasificación (ej: 'Class', 'Label', etc.)
    print("\n--- Distribución de Phishing (1) vs Legítimos (0) ---")
    print(df['label'].value_counts())

except Exception as e:
    print(f"❌ ERROR CRÍTICO CON ESTE DATASET: {e}")