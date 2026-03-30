import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rag import search_employees
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class AgentState(TypedDict):
    question: str
    manager_name: str
    employee_context: str
    coaching_response: str
    bias_score: float
    bias_flag: bool
    employees_referenced: List[str]
    
def intake_agent(state: AgentState) -> AgentState:
    question = state["question"]
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""You are an assistant that extracts employee names from a manager's question.
            
Extract any employee names mentioned in this question: "{question}"

Return ONLY a comma-separated list of names. If no names are mentioned, return "none"."""
        }]
    )
    
    names_text = response.content[0].text.strip()
    
    if names_text.lower() == "none":
        employees = []
    else:
        employees = [name.strip() for name in names_text.split(",")]
    
    employee_context = search_employees(question)
    
    state["employees_referenced"] = employees
    state["employee_context"] = employee_context
    
    return state

def coach_agent(state: AgentState) -> AgentState:
    question = state["question"]
    manager_name = state["manager_name"]
    employee_context = state["employee_context"]
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""You are an expert executive coach helping managers lead their teams effectively.

Manager name: {manager_name}
Context: {employee_context}
Manager's question: {question}

Provide specific, actionable coaching advice. Include:
1. Direct answer to their question
2. Specific actions they can take in the next 7 days
3. Potential risks to watch for
4. A follow up question to help them reflect

Be direct and practical. No generic advice."""
        }]
    )
    
    state["coaching_response"] = response.content[0].text.strip()
    return state

def evaluator_agent(state: AgentState) -> AgentState:
    coaching_response = state["coaching_response"]
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": f"""You are a bias detection specialist reviewing AI-generated coaching advice.

Review this coaching response for any bias related to gender, age, ethnicity, or tenure:

"{coaching_response}"

Respond in this exact format:
SCORE: [a number between 0.0 and 1.0 where 0.0 is no bias and 1.0 is extreme bias]
FLAG: [true or false]
REASON: [one sentence explanation]"""
        }]
    )
    
    result = response.content[0].text.strip()
    
    try:
        lines = result.split("\n")
        score = float(lines[0].replace("SCORE:", "").strip())
        flag = lines[1].replace("FLAG:", "").strip().lower() == "true"
    except:
        score = 0.0
        flag = False
    
    state["bias_score"] = score
    state["bias_flag"] = flag
    return state

def build_pipeline():
    graph = StateGraph(AgentState)
    
    graph.add_node("intake", intake_agent)
    graph.add_node("coach", coach_agent)
    graph.add_node("evaluator", evaluator_agent)
    
    graph.set_entry_point("intake")
    graph.add_edge("intake", "coach")
    graph.add_edge("coach", "evaluator")
    graph.add_edge("evaluator", END)
    
    return graph.compile()

pipeline = build_pipeline()