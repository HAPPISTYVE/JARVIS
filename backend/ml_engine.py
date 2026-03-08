import joblib, os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from dataset_manager import load_dataset

MODEL_PATH = "model/medical_model.pkl"

def train_model():

    dataset = load_dataset()
    if len(dataset) < 5:
        return False

    X = [item["features"] for item in dataset]
    y = [item["label"] for item in dataset]

    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)

    os.makedirs("model", exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    return True

def predict(features):

    if not os.path.exists(MODEL_PATH):
        return None

    model = joblib.load(MODEL_PATH)
    probabilities = model.predict_proba([features])
    classes = model.classes_

    results = []

    for i in range(len(classes)):
        results.append({
            "condition": classes[i],
            "probability": round(probabilities[0][i]*100, 2)
        })

    results.sort(key=lambda x: x["probability"], reverse=True)

    return results


