import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_engine import build_workflow

project_root = Path(__file__).resolve().parent

# In-memory warm storage
workflow = None
FAST_CACHE = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and pre-warm model on startup
    global workflow
    print("[INFO] Pre-loading models, prompts, and pipeline into memory...")
    workflow = build_workflow()
    print("[OK] Model and LangGraph workflow are compiled and running hot in FastAPI memory!")
    yield

app = FastAPI(
    title="LearnXYZ Persistent Roadmap & Quiz Engine",
    version="2.0.0",
    description="Always-running LangGraph model pipeline",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    topic: str

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "LearnXYZ FastAPI Persistent Model Engine",
        "model_loaded": workflow is not None,
        "cached_topics_count": len(FAST_CACHE),
    }

@app.post("/generate")
def generate_roadmap_and_quiz(req: GenerateRequest):
    global workflow, FAST_CACHE

    if not req.topic or not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic must not be empty.")

    clean_topic = req.topic.strip()
    cache_key = clean_topic.lower()

    # Instant memory cache check (0ms response if already requested in this session)
    if cache_key in FAST_CACHE:
        print(f"[CACHE] Returning '{clean_topic}' instantly from FastAPI in-memory cache!")
        return FAST_CACHE[cache_key]

    if workflow is None:
        workflow = build_workflow()

    try:
        print(f"[MODEL] Running warm LangGraph model for new topic: '{clean_topic}'...")
        final_state = workflow.invoke({"topic": clean_topic})

        roadmap = final_state.get("roadmap")
        quiz = final_state.get("quiz")

        if not roadmap:
            raise HTTPException(
                status_code=500, detail="Model pipeline returned empty roadmap."
            )

        result = {
            "success": True,
            "roadmap": roadmap,
            "quiz": quiz,
        }

        # Cache in memory
        FAST_CACHE[cache_key] = result
        print(f"[DONE] Finished generating '{clean_topic}'! Stored in warm memory.")
        return result

    except Exception as e:
        print(f"[ERROR] Generation error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Model execution error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("FASTAPI_PORT", 8000))
    print(f"Starting persistent FastAPI model server on http://127.0.0.1:{port}...")
    uvicorn.run("fastapi_app:app", host="127.0.0.1", port=port, reload=False)
