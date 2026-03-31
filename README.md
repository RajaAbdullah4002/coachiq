# CoachIQ — AI Workplace Coaching System

> An intelligent coaching assistant for managers, powered by a multi-agent LangGraph pipeline, semantic search, knowledge graphs, and voice I/O. Deployed on Microsoft Azure.

**Live Demo:** [coachiq-frontend.azurewebsites.net](https://coachiq-frontend.azurewebsites.net)  
**Backend API:** [coachiq-backend.azurewebsites.net/docs](https://coachiq-backend.azurewebsites.net/docs)

---

## What It Does

CoachIQ helps managers make better decisions about their teams. A manager types or speaks a question — "Who on my team is at risk of leaving?" or "How do I handle James who keeps missing deadlines?" — and CoachIQ:

1. Searches employee data semantically to find relevant context
2. Understands team relationships, reporting lines, and peer dynamics
3. Generates specific, actionable coaching advice using Claude AI
4. Evaluates the response for demographic bias before returning it
5. Logs every interaction to a SQLite audit trail for compliance

---

## Architecture
```
React Frontend (Azure App Service)
        ↓ HTTP
FastAPI Backend (Azure App Service)
        ↓
LangGraph Pipeline
   ├── Intake Agent     → Extracts employee names + queries ChromaDB + Neo4j
   ├── Coach Agent      → Calls Claude API, generates coaching response
   └── Evaluator Agent  → Scores response for bias, flags if needed
        ↓
ChromaDB (Vector Search) + Neo4j (Knowledge Graph) + SQLite (Audit Log)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| AI Pipeline | LangGraph, Anthropic Claude API |
| Vector Search | ChromaDB |
| Knowledge Graph | Neo4j |
| Voice Input | OpenAI Whisper (STT) |
| Voice Output | ElevenLabs (TTS) |
| Session Storage | SQLite |
| Containerisation | Docker, Docker Compose |
| Cloud | Microsoft Azure (App Service, Container Registry) |
| CI/CD | GitHub Actions |

---

## Key Features

**Multi-Agent Pipeline**  
Three specialised LangGraph agents run in sequence. Each has a single responsibility — parsing, coaching, evaluating. Adding new agents doesn't break existing ones.

**Semantic Employee Search (RAG)**  
Employee data is embedded into ChromaDB. Queries like "who is struggling with feedback?" return the most relevant employees semantically, not just keyword matches.

**Knowledge Graph (Neo4j)**  
Team relationships — mentorship, conflict, seniority, collaboration — are stored as graph edges. The Coach Agent knows that James has a conflict with Priya and that Marcus is senior to him.

**Bias Evaluation Layer**  
Every coaching response is reviewed by the Evaluator Agent for demographic bias. A score between 0.0 and 1.0 is returned alongside every response and logged for audit.

**Voice Interface**  
Managers can speak their question (Whisper STT converts speech to text) and receive spoken coaching responses (ElevenLabs TTS).

**Production CI/CD**  
Every push to `main` triggers GitHub Actions to build Docker images, push to Azure Container Registry, and deploy to Azure App Service automatically.

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker Desktop
- Neo4j Desktop

### With Docker Compose
```bash
git clone https://github.com/RajaAbdullah4002/coachiq
cd coachiq
cp .env.example .env  # Add your API keys
docker-compose up --build
```

Frontend: http://localhost  
Backend API docs: http://localhost:8000/docs

### Without Docker
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Environment Variables
```
ANTHROPIC_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/coach` | Submit a coaching question |
| POST | `/transcribe` | Convert audio to text (Whisper) |
| POST | `/speak` | Generate spoken coaching response |
| GET | `/bias-summary` | Audit report — average bias scores |

---

## Project Structure
```
coachiq/
├── backend/
│   ├── main.py          # FastAPI app + endpoints
│   ├── pipeline.py      # LangGraph agents
│   ├── rag.py           # ChromaDB vector search
│   ├── graph_db.py      # Neo4j knowledge graph
│   ├── database.py      # SQLite audit logging
│   ├── voice.py         # Whisper STT + ElevenLabs TTS
│   └── models.py        # Pydantic schemas
├── frontend/
│   └── src/App.jsx      # React UI
├── data/
│   └── synthetic_employees.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── .github/workflows/ci.yml
```

---

## Built By

Raja Abdullah — Melbourne, VIC, Australia  
[LinkedIn](https://www.linkedin.com/in/mabdullah010) | [GitHub](https://github.com/RajaAbdullah4002)