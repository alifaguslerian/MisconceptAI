from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Session as SessionModel, StudentAnswer
from backend.schemas import StudentAnswerCreate, StudentAnswerResponse

router = APIRouter(prefix="/sessions/{session_id}/answers", tags=["answers"])


@router.post("/", response_model=StudentAnswerResponse)
def add_answer(session_id: int, data: StudentAnswerCreate, db: Session = Depends(get_db)):
    # Pastikan session-nya ada
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    answer = StudentAnswer(
        session_id=session_id,
        student_name=data.student_name,
        answer_text=data.answer_text,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


@router.get("/", response_model=List[StudentAnswerResponse])
def get_answers(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    return db.query(StudentAnswer).filter(StudentAnswer.session_id == session_id).all()


@router.delete("/{answer_id}")
def delete_answer(session_id: int, answer_id: int, db: Session = Depends(get_db)):
    answer = db.query(StudentAnswer).filter(
        StudentAnswer.id == answer_id,
        StudentAnswer.session_id == session_id
    ).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Jawaban tidak ditemukan")

    db.delete(answer)
    db.commit()
    return {"message": "Jawaban berhasil dihapus"}