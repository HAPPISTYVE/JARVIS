def update_patient(patient, text):

    text = text.lower()

    if "mal à la tête" in text:
        patient.main_symptom = "headache"

    if "nausée" in text:
        patient.nausea = True

    if "lumière" in text:
        patient.photophobia = True

    if "cou raide" in text:
        patient.neck_stiffness = True

    if "brutal" in text:
        patient.sudden_onset = True

    for word in text.split():
        if word.isdigit():
            value = int(word)
            if 1 <= value <= 10:
                patient.severity = value

    return patient

