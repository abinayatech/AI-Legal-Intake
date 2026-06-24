from pydantic import BaseModel
from typing import List

class IntakeRequest(BaseModel):
    description: str

class TriageResult(BaseModel):
    category: str
    urgency: str
    confidence: float
    suggested_documents: List[str]