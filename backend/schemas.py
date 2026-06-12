from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SessionCreate(BaseModel):
    name: str
    question: str
    ideal_answer: str
    concepts: str  # comma-separated, e.g. "recursion, base case, stack overflow"


class SessionResponse(BaseModel):
    id: int
    name: str
    question: str
    ideal_answer: str
    concepts: str
    created_at: datetime

    class Config:
        from_attributes = True
        
class StudentAnswerCreate(BaseModel):
    student_name: str
    answer_text: str


class StudentAnswerResponse(BaseModel):
    id: int
    session_id: int
    student_name: str
    answer_text: str
    analysis_result: Optional[str]  # None kalau belum dianalisis
    analyzed_at: Optional[datetime]

    class Config:
        from_attributes = True