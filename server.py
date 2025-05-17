from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field # Import Field for default_factory
import json
import uuid
from typing import Optional # Make sure Optional is imported

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Task model
class Task(BaseModel):
    # For POST, id can be None. For PUT, it will be in the path.
    # We can also use default_factory if we want to ensure it's always a string,
    # but for POST it's better to explicitly set it.
    id: Optional[str] = None # ID is optional, will be generated on create
    title: str
    description: str = ""
    status: str

# Load initial tasks (consider loading into a list of Task objects for consistency)
try:
    with open("tasks.json", "r") as f:
        initial_task_data = json.load(f)
        # Ensure all loaded tasks have string IDs
        tasks_list = [Task(**{**task, "id": str(task.get("id", uuid.uuid4()))}) for task in initial_task_data]
        task_map = {task.id: task for task in tasks_list}
except FileNotFoundError:
    task_map = {} # Start with an empty map if file doesn't exist
except json.JSONDecodeError:
    task_map = {} # Start with an empty map if file is not valid JSON


@app.get("/api/tasks")
def get_tasks():
    # Return the .dict() representation of tasks
    return [task.dict() for task in task_map.values()]

@app.post("/api/tasks")
def create_task(task_payload: Task): # task_payload.id will be None from the request
    generated_id = str(uuid.uuid4())
    
    # Create a new Task instance with the generated ID and payload data
    new_task = Task(
        id=generated_id,
        title=task_payload.title,
        description=task_payload.description,
        status=task_payload.status
    )
    
    task_map[new_task.id] = new_task # Store the Pydantic model instance
    return new_task.dict() # Return the dictionary representation

@app.put("/api/tasks/{task_id}")
def update_task(task_id: str, updated_payload: Task):
    if task_id not in task_map:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get the existing task
    existing_task = task_map[task_id]
    
    # Update fields from the payload
    existing_task.title = updated_payload.title
    existing_task.description = updated_payload.description
    existing_task.status = updated_payload.status
    # The ID from the path (task_id) is authoritative, existing_task.id already matches.
    
    task_map[task_id] = existing_task # Re-assign (though modifying in place also works)
    return existing_task.dict()

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    if task_id not in task_map:
        raise HTTPException(status_code=404, detail="Task not found")
    deleted_task = task_map.pop(task_id)
    return deleted_task.dict() # Return the dict of the deleted task

def save_tasks_to_json():
    with open("tasks.json", "w") as f:
        json.dump([task.dict() for task in task_map.values()], f, indent=4)

@app.on_event("shutdown")
def shutdown_event():
    save_tasks_to_json()