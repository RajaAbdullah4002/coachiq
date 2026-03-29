from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import CoachRequest, CoachResponse
from pipeline import pipeline

app = FastAPI(title="CoachIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "CoachIQ is running"}

@app.post("/coach", response_model=CoachResponse)
def coach(request: CoachRequest):
    try:
        result = pipeline.invoke({
            "question": request.question,
            "manager_name": request.manager_name,
            "employee_context": "",
            "coaching_response": "",
            "bias_score": 0.0,
            "bias_flag": False,
            "employees_referenced": []
        })
        
        return CoachResponse(
            answer=result["coaching_response"],
            bias_score=result["bias_score"],
            bias_flag=result["bias_flag"],
            employees_referenced=result["employees_referenced"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))