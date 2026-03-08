from pydantic import BaseModel
from typing import Optional

class Patient(BaseModel):

    age: Optional[int] = None
    gender: Optional[str] = None

    main_symptom: Optional[str] = None
    severity: Optional[int] = None
    duration_days: Optional[int] = None

    nausea: Optional[bool] = False
    photophobia: Optional[bool] = False
    neck_stiffness: Optional[bool] = False
    sudden_onset: Optional[bool] = False

    triage_level: Optional[str] = "UNKNOWN"
