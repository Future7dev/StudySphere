import os
import json
import redis
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_engine import build_workflow

project_root = Path(__file__).resolve().parent

# In-memory warm storage
workflow = None

# Initialize Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

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
    previous_score: str | None = None
    knowledge_level: str | None = None
    goal: str | None = None

@app.get("/health")
def health_check():
    try:
        redis_ping = redis_client.ping()
    except Exception:
        redis_ping = False
        
    return {
        "status": "ok",
        "service": "LearnXYZ FastAPI Persistent Model Engine",
        "model_loaded": workflow is not None,
        "redis_connected": redis_ping,
    }

@app.post("/generate")
def generate_roadmap_and_quiz(req: GenerateRequest):
    global workflow

    if not req.topic or not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic must not be empty.")

    clean_topic = req.topic.strip()
    score_suffix = f":{req.previous_score}" if req.previous_score else ""
    kl_suffix = f":{req.knowledge_level}" if req.knowledge_level else ""
    goal_suffix = f":{req.goal}" if req.goal else ""
    cache_key = f"learnxyz:roadmap:{clean_topic.lower()}{score_suffix}{kl_suffix}{goal_suffix}"

    # Redis cache check
    try:
        cached_result = redis_client.get(cache_key)
        if cached_result:
            print(f"[CACHE] Returning '{clean_topic}' instantly from Redis cache!")
            return json.loads(cached_result)
    except Exception as e:
        print(f"[WARNING] Redis cache get error: {e}")

    if workflow is None:
        workflow = build_workflow()

    try:
        print(f"[MODEL] Running warm LangGraph model for new topic: '{clean_topic}'...")
        final_state = workflow.invoke({
            "topic": clean_topic,
            "previous_score": req.previous_score,
            "knowledge_level": req.knowledge_level,
            "goal": req.goal
        })

        roadmap = final_state.get("roadmap")
        quiz = final_state.get("quiz")
        flashcards = final_state.get("flashcards")

        if not roadmap:
            raise HTTPException(
                status_code=500, detail="Model pipeline returned empty roadmap."
            )

        result = {
            "success": True,
            "roadmap": roadmap,
            "quiz": quiz,
            "flashcards": flashcards,
        }

        # Cache in Redis
        try:
            redis_client.setex(cache_key, 86400, json.dumps(result))
            print(f"[DONE] Finished generating '{clean_topic}'! Stored in Redis.")
        except Exception as e:
            print(f"[WARNING] Redis cache set error: {e}")
            
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
