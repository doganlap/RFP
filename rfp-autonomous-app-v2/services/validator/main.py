import os
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Validator Service")

class EvaluationCriterion(BaseModel):
    criterion: str
    weight: float

class ParsedRFP(BaseModel):
    sections: dict
    evaluationCriteria: list[EvaluationCriterion]
    metadata: dict

class ValidationResult(BaseModel):
    layers: dict
    issues: list[str]

@app.post("/validate", response_model=ValidationResult)
def validate(parsed: ParsedRFP):
    issues = []
    layers = {
        "format_ok": True,
        "schema_ok": True,
        "business_rules_ok": True,
        "cross_ref_ok": None,
        "ai_review_ok": None
    }

    # Layer 1 - format
    if not isinstance(parsed.sections, dict):
        layers["format_ok"] = False
        issues.append("Sections must be a dictionary.")

    # Layer 2 - schema
    crit_ok = all(0 <= c.weight <= 1 for c in parsed.evaluationCriteria)
    if not crit_ok:
        layers["schema_ok"] = False
        issues.append("Weights must be between 0 and 1.")

    # Layer 3 - business rules (example)
    if sum(c.weight for c in parsed.evaluationCriteria) != 1.0:
        layers["business_rules_ok"] = False
        issues.append("Weights must sum to 1.0")

    # Layers 4 & 5 stubs
    # layers["cross_ref_ok"] = True/False after cross-check with requirements vs sections
    # layers["ai_review_ok"] = True/False after AI-assisted checks

    return {"layers": layers, "issues": issues}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
