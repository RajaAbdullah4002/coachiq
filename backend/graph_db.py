import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

def seed_team_graph():
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
        
        session.run("""
            CREATE (james:Employee {name: 'James Wilson', role: 'Software Engineer', score: 58})
            CREATE (sarah:Employee {name: 'Sarah Chen', role: 'Product Designer', score: 82})
            CREATE (tom:Employee {name: 'Tom Nguyen', role: 'Data Analyst', score: 71})
            CREATE (priya:Employee {name: 'Priya Sharma', role: 'Backend Engineer', score: 76})
            CREATE (marcus:Employee {name: 'Marcus Johnson', role: 'QA Engineer', score: 65})
            CREATE (manager:Manager {name: 'Manager'})
            
            CREATE (manager)-[:MANAGES]->(james)
            CREATE (manager)-[:MANAGES]->(sarah)
            CREATE (manager)-[:MANAGES]->(tom)
            CREATE (manager)-[:MANAGES]->(priya)
            CREATE (manager)-[:MANAGES]->(marcus)
            
            CREATE (sarah)-[:MENTORS]->(tom)
            CREATE (priya)-[:COLLABORATES_WITH]->(james)
            CREATE (james)-[:CONFLICT_WITH]->(priya)
            CREATE (marcus)-[:SENIOR_TO]->(james)
            CREATE (marcus)-[:SENIOR_TO]->(tom)
        """)

def get_employee_relationships(name: str) -> str:
    try:
        with driver.session() as session:
            result = session.run("""
                MATCH (e:Employee {name: $name})-[r]->(other)
                RETURN type(r) as relationship, other.name as person, other.role as role
            """, name=name)
            
            outgoing = [f"{r['relationship']} → {r['person']} ({r['role']})" for r in result]
            
            result2 = session.run("""
                MATCH (other)-[r]->(e:Employee {name: $name})
                RETURN type(r) as relationship, other.name as person, other.role as role
            """, name=name)
            
            incoming = [f"{r['person']} ({r['role']}) → {r['relationship']}" for r in result2]
            
            if not outgoing and not incoming:
                return f"No relationships found for {name}"
            
            context = f"Relationships for {name}:\n"
            if outgoing:
                context += "  " + "\n  ".join(outgoing) + "\n"
            if incoming:
                context += "  " + "\n  ".join(incoming)
            
            return context
    except Exception as e:
        return f"Graph database unavailable for {name}"
def close():
    driver.close()

try:
    seed_team_graph()
    print("Neo4j connected and seeded successfully")
except Exception as e:
    print(f"Neo4j unavailable: {e}. Graph features disabled.")