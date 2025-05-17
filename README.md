# Task Management Board

A full-stack Kanban-style task management application with a FastAPI backend and a React frontend. Users can create, view, update, delete, and drag-and-drop tasks between different status columns.

## Features

-   **Create Tasks:** Add new tasks with a title, description, and initial status.
-   **View Tasks:** Display tasks in columns representing their status ("To Do", "In Progress", "Done").
-   **Update Tasks:**
    -   Inline editing of task titles and descriptions.
    -   Change task status by dragging and dropping tasks between columns.
-   **Delete Tasks:** Remove tasks from the board.
-   **Persistent Storage:** Task data is saved in a `tasks.json` file on the backend.
-   **Responsive Design:** Basic responsiveness for different screen sizes.

## Tech Stack

**Backend (Root Directory):**

-   **FastAPI:** Modern, fast (high-performance) web framework for building APIs with Python.
-   **Pydantic:** Data validation and settings management using Python type annotations.
-   **Uvicorn:** ASGI server for running FastAPI applications.
-   **Python 3.x**

**Frontend (`task-board-frontend/` Directory):**

-   **React:** JavaScript library for building user interfaces.
-   **@hello-pangea/dnd:** A maintained fork of `react-beautiful-dnd` for accessible drag and drop functionality.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **Vite:** Next-generation frontend tooling for fast development and optimized builds.
-   **JavaScript (ES6+)**
-   **Node.js & npm**

## Project Structure

.</br>
├── task-board-frontend/ # React Frontend Application</br>
│ ├── public/</br>
│ ├── src/</br>
│ │ ├── App.jsx # Main application component</br>
│ │ ├── main.jsx # React entry point</br>
│ │ └── index.css # Global styles (Tailwind imports)</br>
│ ├── index.html</br>
│ ├── package.json</br>
│ └── vite.config.js</br>
│</br>
├── main.py # FastAPI backend application</br>
├── tasks.json # Data store for tasks</br>
├── requirements.txt # Python backend dependencies</br>
└── README.md # This file</br>

## Prerequisites

-   **Python:** Version 3.7+
-   **Pip:** Python package installer
-   **Node.js:** Version 16.x or higher
-   **npm:** Node package manager

## Setup and Running

You need to run the backend and frontend servers separately.

### 1. Backend Setup (FastAPI)

Navigate to the **root directory** of the project.

1.  **Create and activate a virtual environment (recommended):**

    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

2.  **Install Python dependencies:**
    Make sure you have a `requirements.txt` file in the root directory with at least:

    ```
    fastapi
    uvicorn[standard]
    ```

    Then run:

    ```bash
    pip install -r requirements.txt
    ```

3.  **Prepare `tasks.json`:**
    If `tasks.json` doesn't exist in the root directory, create an empty one or one with an initial empty array:

    ```json
    []
    ```

    The backend will load from this file and create it if it's missing and handled by an improved `try-except` block (as in the previous backend example).

4.  **Run the FastAPI server:**
    ```bash
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
    ```
    The backend API will be accessible at `http://127.0.0.1:8000`.

### 2. Frontend Setup (React)

Navigate to the `task-board-frontend/` directory.

1.  **Install Node.js dependencies:**

    ```bash
    cd task-board-frontend
    npm install
    # or
    # yarn install
    ```

2.  **Run the React development server:**

    ```bash
    npm run dev
    # or
    # yarn dev
    ```

    The frontend application will typically be accessible at `http://localhost:5173` (Vite's default) or another port shown in your terminal.

3.  **API Configuration:**
    The frontend `App.jsx` currently has the API URL hardcoded:
    `const API_URL = "http://127.0.0.1:8000/api/tasks";`
    Ensure this matches where your backend is running. For production, you would typically use environment variables.

## API Endpoints (Backend)

Base URL: `http://127.0.0.1:8000`

-   **`GET /api/tasks`**

    -   Description: Retrieves all tasks.
    -   Response: `200 OK` with a list of task objects.

-   **`POST /api/tasks`**

    -   Description: Creates a new task.
    -   Request Body (JSON):
        ```json
        {
            "title": "string",
            "description": "string",
            "status": "string" // e.g., "To Do"
        }
        ```
    -   Response: `200 OK` with the created task object (including its new server-generated `id`).

-   **`PUT /api/tasks/{task_id}`**

    -   Description: Updates an existing task (title, description, or status).
    -   Path Parameter: `task_id` (string) - The ID of the task to update.
    -   Request Body (JSON):
        ```json
        {
            "title": "string",
            "description": "string",
            "status": "string"
        }
        ```
    -   Response: `200 OK` with the updated task object. `404 Not Found` if task doesn't exist.

-   **`DELETE /api/tasks/{task_id}`**
    -   Description: Deletes a task.
    -   Path Parameter: `task_id` (string) - The ID of the task to delete.
    -   Response: `200 OK` with the deleted task object. `404 Not Found` if task doesn't exist.

## Future Enhancements

-   User authentication and authorization.
-   Replace `tasks.json` with a proper database (e.g., PostgreSQL, MongoDB with an ORM/ODM).
-   Real-time updates using WebSockets.
-   More detailed task fields (due dates, priorities, assignees).
-   Search and filtering functionality.
-   Unit and integration tests.
-   Deployment scripts/CI-CD pipeline.

## Deployment

Backend : [here](https://tasks-board.onrender.com/)</br>
Frontend : [here](https://task-board-weld.vercel.app/)

## Additional Notes

This project was made mostly with the help of LLM's as I have only basic knowledge of react and no knowledge whatsoever of Vite and Tailwind. The coding and debugging was done in under an hour. Deployment however took a bit longer as the inital sites I chose were very problematic (Heroku and pythonanywhere).

Chat Link : [here](https://chatgpt.com/share/682876f7-7b0c-8002-8cd5-3e1279c2c17d)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
