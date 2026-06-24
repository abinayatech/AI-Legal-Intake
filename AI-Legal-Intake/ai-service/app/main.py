from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import IntakeRequest, TriageResult
from app.classifier import classify_issue

app = FastAPI(title="Legal Triage AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI service is running"}

@app.post("/classify", response_model=TriageResult)
def classify(request: IntakeRequest):
    result = classify_issue(request.description)
    return result