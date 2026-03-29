from pydantic import BaseModel
from typing import Optional

class CoachRequest(BaseModel):
    question: str
    manager_name: Optional[str] = "Manager"

class CoachResponse(BaseModel):
    answer: str
    bias_score: float
    bias_flag: bool
    employees_referenced: list[str]