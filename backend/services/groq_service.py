import os
import json
import httpx
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv(Path(__file__).parent.parent / ".env")



GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama3-8b-8192"


def build_prompt(question: str, ideal_answer: str, concepts: str, student_answer: str) -> str:
    return f"""Question: {question}
Ideal Answer: {ideal_answer}
Concepts to evaluate: {concepts}
Student Answer: {student_answer}

For each concept, determine:
- status: "correct" | "partial" | "incorrect" | "missing"
- misconception_type: "factual_error" | "partial_understanding" | "overgeneralization" | "conceptual_confusion" | "missing_concept" | null
- evidence: short quote from student answer, or null
- suggestion: specific remedial suggestion, or null

Respond ONLY with this JSON:
{{
  "concepts": [
    {{
      "concept_name": "...",
      "status": "...",
      "misconception_type": "...",
      "evidence": "...",
      "suggestion": "..."
    }}
  ],
  "summary": "one sentence summary of this student's understanding"
}}"""


async def analyze_answer(question: str, ideal_answer: str, concepts: str, student_answer: str) -> dict:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY tidak ditemukan di .env")

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a pedagogical analysis system that identifies student misconceptions "
                    "in programming essays. Your job is NOT to grade — only to diagnose conceptual "
                    "understanding. Always respond in valid JSON only. No text outside JSON."
                )
            },
            {
                "role": "user",
                "content": build_prompt(question, ideal_answer, concepts, student_answer)
            }
        ],
        "temperature": 0.2,  # rendah biar output konsisten, bukan kreatif
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload
        )
        response.raise_for_status()

    raw = response.json()["choices"][0]["message"]["content"].strip()

    # Strip markdown code block kalau LLM tetap wrap JSON dengan ```json
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)