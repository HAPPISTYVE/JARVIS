def evaluate_redflags(patient):

    if patient.sudden_onset:
        return "EMERGENCY"

    if patient.neck_stiffness and patient.severity and patient.severity >= 8:
        return "EMERGENCY"

    if patient.severity and patient.severity >= 9:
        return "URGENT"

    return "NON_URGENT"

