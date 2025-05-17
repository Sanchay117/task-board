import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // UPDATED IMPORT

const COLUMN_ORDER = ["To Do", "In Progress", "Done"];
const API_URL = "https://tasks-board.onrender.com/api/tasks";

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("To Do");

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) =>
                setTasks(data.map((task) => ({ ...task, id: String(task.id) })))
            )
            .catch((error) => console.error("Error fetching tasks:", error));
    }, []);

    const groupedTasks = COLUMN_ORDER.reduce((acc, col) => {
        acc[col] = tasks.filter((task) => task.status === col);
        return acc;
    }, {});

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (
            !destination ||
            (destination.droppableId === source.droppableId &&
                destination.index === source.index)
        ) {
            return;
        }

        const taskToMove = tasks.find((task) => task.id === draggableId);
        if (!taskToMove) return;

        // Optimistic UI update: change status
        const newTasksState = tasks.map((task) =>
            task.id === draggableId
                ? { ...task, status: destination.droppableId }
                : task
        );
        setTasks(newTasksState);

        // Update backend
        try {
            const movedTaskPayload = {
                ...taskToMove, // Send the original task data
                status: destination.droppableId, // with the new status
            };
            await fetch(`${API_URL}/${draggableId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movedTaskPayload),
            });
        } catch (error) {
            console.error("Error updating task status:", error);
            // Revert UI change if backend update fails
            setTasks(
                tasks.map((task) =>
                    task.id === draggableId ? taskToMove : task
                )
            ); // Revert to original task state before drag for the specific task
        }
    };

    const createTask = async () => {
        if (!title.trim()) {
            alert("Title cannot be empty.");
            return;
        }
        const newTaskPayload = { title, description, status };
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTaskPayload),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setTasks((prev) => [...prev, { ...data, id: String(data.id) }]);
            setTitle("");
            setDescription("");
            setStatus("To Do");
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const deleteTask = async (id) => {
        const taskIdStr = String(id);
        // Optimistic UI update
        const originalTasks = [...tasks];
        setTasks((prev) => prev.filter((task) => task.id !== taskIdStr));
        try {
            const res = await fetch(`${API_URL}/${taskIdStr}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        } catch (error) {
            console.error("Error deleting task:", error);
            setTasks(originalTasks); // Revert on error
        }
    };

    const updateTask = async (id, newTitle, newDescription) => {
        const taskIdStr = String(id);
        const taskToUpdate = tasks.find((t) => t.id === taskIdStr);
        if (!taskToUpdate) return;

        const updatedTaskData = {
            ...taskToUpdate,
            title: newTitle,
            description: newDescription,
        };

        // Optimistic UI update
        const originalTasks = [...tasks];
        setTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === taskIdStr ? updatedTaskData : t))
        );

        try {
            const res = await fetch(`${API_URL}/${taskIdStr}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTaskData),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        } catch (error) {
            console.error("Error updating task:", error);
            setTasks(originalTasks); // Revert on error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
                Task Management Board
            </h1>

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

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLUMN_ORDER.map((column) => (
                        <Droppable droppableId={column} key={column}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`bg-white rounded-xl shadow-md p-5 min-h-[400px] flex flex-col ${
                                        snapshot.isDraggingOver
                                            ? "bg-blue-50"
                                            : ""
                                    }`}
                                >
                                    <h2 className="text-xl font-bold text-gray-700 mb-4 text-center border-b pb-2">
                                        {column}
                                    </h2>
                                    <div className="space-y-4 flex-grow overflow-y-auto">
                                        {groupedTasks[column]?.map(
                                            (task, index) => (
                                                <Draggable
                                                    key={task.id}
                                                    draggableId={task.id}
                                                    index={index}
                                                >
                                                    {(
                                                        providedDraggable, // Renamed to avoid conflict with outer provided
                                                        snapshotDraggable // Renamed
                                                    ) => (
                                                        <div
                                                            ref={
                                                                providedDraggable.innerRef
                                                            }
                                                            {...providedDraggable.draggableProps}
                                                            {...providedDraggable.dragHandleProps}
                                                            className={`bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition relative ${
                                                                snapshotDraggable.isDragging
                                                                    ? "opacity-80 shadow-xl"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <input
                                                                className="font-semibold text-gray-800 text-lg bg-transparent w-full mb-1 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1"
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
                                                                className="text-sm text-gray-600 bg-transparent w-full resize-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1"
                                                                value={
                                                                    task.description
                                                                }
                                                                rows={Math.max(
                                                                    1,
                                                                    task.description.split(
                                                                        "\n"
                                                                    ).length
                                                                )}
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
                                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl p-1 leading-none"
                                                                aria-label="Delete task"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        )}
                                        {provided.placeholder}
                                    </div>
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
