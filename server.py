from fastapi import FastAPI, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from pydantic import BaseModel # type: ignore
import json
import uuid

app = FastAPI()

# Allow frontend dev environment to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Task model
class Task(BaseModel):
    id: str
    title: str
    description: str = ""
    status: str

# Load initial tasks
with open("tasks.json", "r") as f:
    tasks = json.load(f)

# Convert to dict for faster access by id
task_map = {task["id"]: task for task in tasks}

@app.get("/api/tasks")
def get_tasks():
    return list(task_map.values())

@app.post("/api/tasks")
def create_task(task: Task):
    task.id = str(uuid.uuid4())
    task_map[task.id] = task.dict()
    return task_map[task.id]

@app.put("/api/tasks/{task_id}")
def update_task(task_id: str, updated: Task):
    if task_id not in task_map:
        raise HTTPException(status_code=404, detail="Task not found")
    updated.id = task_id  # enforce same ID
    task_map[task_id] = updated.dict()
    return task_map[task_id]

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    if task_id not in task_map:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_map.pop(task_id)
