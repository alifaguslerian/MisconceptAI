from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from database import get_db
from models import Session as SessionModel, StudentAnswer
from services.groq_service import analyze_answer

router = APIRouter(prefix="/sessions/{session_id}/analyze", tags=["analysis"])


@router.post("/")
async def analyze_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    answers = db.query(StudentAnswer).filter(StudentAnswer.session_id == session_id).all()
    if not answers:
        raise HTTPException(status_code=400, detail="Belum ada jawaban mahasiswa di session ini")

    results = []
    errors = []

    for answer in answers:
        try:
            result = await analyze_answer(
                question=session.question,
                ideal_answer=session.ideal_answer,
                concepts=session.concepts,
                student_answer=answer.answer_text
            )
            answer.analysis_result = json.dumps(result)
            answer.analyzed_at = datetime.now(timezone.utc)
            db.commit()

            results.append({
                "student_name": answer.student_name,
                "answer_id": answer.id,
                "analysis": result
            })

        except Exception as e:
            errors.append({
                "student_name": answer.student_name,
                "answer_id": answer.id,
                "error": str(e)
            })

    return {
        "session_id": session_id,
        "analyzed": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }


@router.get("/")
def get_analysis_results(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    answers = db.query(StudentAnswer).filter(
        StudentAnswer.session_id == session_id,
        StudentAnswer.analysis_result.isnot(None)
    ).all()

    return {
        "session_id": session_id,
        "session_name": session.name,
        "concepts": session.concepts.split(","),
        "results": [
            {
                "student_name": a.student_name,
                "answer_id": a.id,
                "analyzed_at": a.analyzed_at,
                "analysis": json.loads(a.analysis_result)
            }
            for a in answers
        ]
    }