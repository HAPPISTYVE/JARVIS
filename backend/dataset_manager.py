import json, os

DATA_PATH = "data/training_data.json"

def load_dataset():
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def save_dataset(data):
    os.makedirs("data", exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=4)

def add_case(features, label):
    data = load_dataset()
    data.append({"features": features, "label": label})
    save_dataset(data)

