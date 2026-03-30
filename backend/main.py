from database import log_session, get_bias_summary
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
        
        log_session(
            manager_name=request.manager_name,
            question=request.question,
            response=result["coaching_response"],
            bias_score=result["bias_score"],
            bias_flag=result["bias_flag"],
            employees=result["employees_referenced"]
        )
        
        return CoachResponse(
            answer=result["coaching_response"],
            bias_score=result["bias_score"],
            bias_flag=result["bias_flag"],
            employees_referenced=result["employees_referenced"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        from voice import transcribe_audio
        text = transcribe_audio(audio_bytes)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speak")
async def speak(request: CoachRequest):
    try:
        from voice import speak_response
        result = pipeline.invoke({
            "question": request.question,
            "manager_name": request.manager_name,
            "employee_context": "",
            "coaching_response": "",
            "bias_score": 0.0,
            "bias_flag": False,
            "employees_referenced": []
        })
        audio_bytes = speak_response(result["coaching_response"])
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/bias-summary")
def bias_summary():
    return get_bias_summary()