def headache_protocol(patient):

    scores = {
        "Migraine": 0,
        "Céphalée de tension": 0,
        "Méningite": 0
    }

    if patient.severity and patient.severity >= 7:
        scores["Migraine"] += 20

    if patient.nausea:
        scores["Migraine"] += 25

    if patient.photophobia:
        scores["Migraine"] += 25

    if patient.neck_stiffness:
        scores["Méningite"] += 40

    total = sum(scores.values())
    if total == 0:
        return []

    results = []

    for condition, score in scores.items():
        probability = round((score / total) * 100, 2)
        results.append({
            "condition": condition,
            "probability": probability
        })

    results.sort(key=lambda x: x["probability"], reverse=True)
    return results

