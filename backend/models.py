from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    question = Column(Text, nullable=False)
    ideal_answer = Column(Text, nullable=False)
    concepts = Column(Text, nullable=False)  # disimpan sebagai comma-separated string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    answers = relationship("StudentAnswer", back_populates="session", cascade="all, delete")


class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    student_name = Column(String(255), nullable=False)
    answer_text = Column(Text, nullable=False)
    analysis_result = Column(Text, nullable=True)  # JSON string, diisi setelah analisis
    analyzed_at = Column(DateTime(timezone=True), nullable=True)

    session = relationship("Session", back_populates="answers")