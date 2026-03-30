import json
import os
import chromadb
from chromadb.utils import embedding_functions

EMPLOYEES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_employees.json")

client = chromadb.PersistentClient(path="./chroma_db")

embedding_fn = embedding_functions.DefaultEmbeddingFunction()

collection = client.get_or_create_collection(
    name="employees",
    embedding_function=embedding_fn
)

def load_employees():
    with open(EMPLOYEES_PATH, "r") as f:
        return json.load(f)

def embed_employees():
    employees = load_employees()
    
    existing = collection.get()
    if len(existing["ids"]) > 0:
        return
    
    documents = []
    ids = []
    metadatas = []
    
    for emp in employees:
        document = f"""
        Name: {emp['name']}
        Role: {emp['role']}
        Tenure: {emp['tenure_years']} years
        Survey Score: {emp['survey_score']}
        Performance: {emp['performance_rating']}
        Feedback: {emp['feedback']}
        Recent Notes: {emp['recent_notes']}
        """
        documents.append(document)
        ids.append(emp["id"])
        metadatas.append({"name": emp["name"], "role": emp["role"]})
    
    collection.add(documents=documents, ids=ids, metadatas=metadatas)

def search_employees(query: str, n_results: int = 3) -> str:
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    if not results["documents"][0]:
        return "No relevant employee data found."
    
    context = ""
    for i, doc in enumerate(results["documents"][0]):
        context += f"\n--- Employee {i+1} ---{doc}"
    
    return context

embed_employees()