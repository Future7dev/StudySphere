import sys
import os
import json
from pathlib import Path
from dotenv import load_dotenv
import nbformat
import concurrent.futures
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
project_root = Path(__file__).resolve().parent
load_dotenv(project_root / ".env")
load_dotenv(project_root / "Backend" / ".env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and pre-warm model on startup
    init_workflow_from_notebook()
    yield


app = FastAPI(
    title="LearnXYZ Persistent Roadmap & Quiz Engine",
    version="2.0.0",
    description="Always-running LangGraph model pipeline powered by test.ipynb",
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


# In-memory warm storage
workflow = None
FAST_CACHE = {}


def init_workflow_from_notebook():
    global workflow
    nb_path = project_root / "test.ipynb"
    if not nb_path.exists():
        raise FileNotFoundError(f"Notebook not found at {nb_path}")

    print("[INFO] Pre-loading models, prompts, and pipeline from test.ipynb into memory...")
    with open(nb_path, "r", encoding="utf-8") as f:
        nb = nbformat.read(f, as_version=4)

    code_env = {}
    for i in range(10):
        cell = nb.cells[i]
        if cell.cell_type == "code":
            cell_code = cell.source
            # Avoid the test invoke line during cell execution
            if "Who is the president of India" in cell_code:
                cell_code = cell_code.split("model.invoke")[0]
            exec(cell_code, code_env)

    StateGraph = code_env["StateGraph"]
    SubjectState = code_env["SubjectState"]
    START = code_env["START"]
    END = code_env["END"]

    search_yt = code_env["search_best_youtube_video"]
    search_art = code_env["search_articles"]

    # Optimized parallel YouTube search node to eliminate sequential network latency
    def fast_youtube_node(state):
        roadmap = state["roadmap"]
        topics = []
        for sub in roadmap.get("subtopics", []):
            for t in sub.get("topics", []):
                topics.append(t)

        def fetch_yt(t):
            try:
                q = f"{t.get('name', '')} tutorial"
                t["Links"] = search_yt(q)
            except Exception:
                t["Links"] = "focus on articles"

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            list(executor.map(fetch_yt, topics))

        return {"roadmap": roadmap}

    # Optimized parallel Tavily search node
    def fast_article_node(state):
        roadmap = state["roadmap"]
        pairs = []
        for sub in roadmap.get("subtopics", []):
            for t in sub.get("topics", []):
                pairs.append((t, sub.get("subtopic_name", "")))

        def fetch_art(pair):
            t, sub_name = pair
            try:
                q = f"{t.get('name', '')} {sub_name}".strip()
                t["articles"] = search_art(q, max_results=2)
            except Exception:
                t["articles"] = []

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            list(executor.map(fetch_art, pairs))

        return {"roadmap": roadmap}

    graph = StateGraph(SubjectState)
    graph.add_node("roadmap", code_env["roadmapnode"])
    graph.add_node("youtube", fast_youtube_node)
    graph.add_node("article", fast_article_node)
    graph.add_node("quiz", code_env["quiznode"])

    # NOTE: savejson is intentionally omitted - responses are NOT saved in module.json!
    graph.add_edge(START, "roadmap")
    graph.add_edge("roadmap", "youtube")
    graph.add_edge("youtube", "article")
    graph.add_edge("article", "quiz")
    graph.add_edge("quiz", END)

    workflow = graph.compile()
    print("[OK] Model and LangGraph workflow are compiled and running hot in FastAPI memory!")


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

    # 1. Instant memory cache check (0ms response if already requested in this session)
    if cache_key in FAST_CACHE:
        print(f"[CACHE] Returning '{clean_topic}' instantly from FastAPI in-memory cache!")
        return FAST_CACHE[cache_key]

    if workflow is None:
        init_workflow_from_notebook()

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
