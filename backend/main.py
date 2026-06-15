from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import sessions, answers, analysis

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MisconceptAI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(answers.router)
app.include_router(analysis.router)  # tambah ini


@app.get("/")
def root():
    return {"status": "ok", "message": "MisconceptAI API is running"}