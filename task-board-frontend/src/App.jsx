import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const COLUMN_ORDER = ["To Do", "In Progress", "Done"];

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("To Do");

    const API_URL = "http://localhost:8000/api/tasks";

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => setTasks(data));
    }, []);

    const groupedTasks = COLUMN_ORDER.reduce((acc, col) => {
        acc[col] = tasks.filter((task) => task.status === col);
        return acc;
    }, {});

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.droppableId === source.droppableId)
            return;

        const updatedTasks = tasks.map((task) =>
            task.id === draggableId
                ? { ...task, status: destination.droppableId }
                : task
        );
        setTasks(updatedTasks);

        const movedTask = updatedTasks.find((task) => task.id === draggableId);
        await fetch(`${API_URL}/${movedTask.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movedTask),
        });
    };

    const createTask = async () => {
        const newTask = { id: "", title, description, status };
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        });
        const data = await res.json();
        setTasks((prev) => [...prev, data]);
        setTitle("");
        setDescription("");
        setStatus("To Do");
    };

    const deleteTask = async (id) => {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const updateTask = async (id, title, description) => {
        const updated = tasks.map((t) =>
            t.id === id ? { ...t, title, description } : t
        );
        setTasks(updated);
        const task = updated.find((t) => t.id === id);
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
                Task Management Board
            </h1>

            {/* Task Creator */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-12 max-w-5xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                    Create New Task
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <select
                        className="p-3 border border-gray-300 rounded-lg w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {COLUMN_ORDER.map((col) => (
                            <option key={col} value={col}>
                                {col}
                            </option>
                        ))}
                    </select>
                    <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                        onClick={createTask}
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Task Columns */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLUMN_ORDER.map((column) => (
                        <Droppable droppableId={column} key={column}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-white rounded-xl shadow-md p-5 min-h-[400px] flex flex-col"
                                >
                                    <h2 className="text-xl font-bold text-gray-700 mb-4 text-center border-b pb-2">
                                        {column}
                                    </h2>
                                    <div className="space-y-4">
                                        {groupedTasks[column]?.map(
                                            (task, index) => (
                                                <Draggable
                                                    key={task.id}
                                                    draggableId={task.id}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition relative"
                                                        >
                                                            <input
                                                                className="font-semibold text-gray-800 text-lg bg-transparent w-full mb-1 focus:outline-none"
                                                                value={
                                                                    task.title
                                                                }
                                                                onChange={(e) =>
                                                                    updateTask(
                                                                        task.id,
                                                                        e.target
                                                                            .value,
                                                                        task.description
                                                                    )
                                                                }
                                                            />
                                                            <textarea
                                                                className="text-sm text-gray-600 bg-transparent w-full resize-none focus:outline-none"
                                                                value={
                                                                    task.description
                                                                }
                                                                onChange={(e) =>
                                                                    updateTask(
                                                                        task.id,
                                                                        task.title,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    deleteTask(
                                                                        task.id
                                                                    )
                                                                }
                                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        )}
                                    </div>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

export default App;
