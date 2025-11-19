import os
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl
import uvicorn

app = FastAPI(title="Parser Service")

class ParseIn(BaseModel):
    rfpId: int
    name: str
    documentUrl: HttpUrl | None = None

class ParsedRFP(BaseModel):
    sections: dict
    evaluationCriteria: list
    metadata: dict

@app.post("/parse", response_model=ParsedRFP)
def parse_rfp(body: ParseIn):
    # Stubbed extraction. Replace with real PDF/DOCX parsing.
    sections = {
        "Introduction": f"Auto-parsed intro for {body.name}",
        "Scope": "Delivery of GRC platform components",
        "Requirements": "Security, Performance, Localization (AR/EN), Support SLAs"
    }
    evaluation = [
        {"criterion": "Fit", "weight": 0.4},
        {"criterion": "Complexity", "weight": 0.3},
        {"criterion": "Competitive", "weight": 0.3},
    ]
    meta = {
        "rfpId": body.rfpId,
        "source": body.documentUrl,
        "extractedBy": "parser_stub",
    }
    return {"sections": sections, "evaluationCriteria": evaluation, "metadata": meta}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
