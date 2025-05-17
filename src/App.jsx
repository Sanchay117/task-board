import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./App.css";

const COLUMN_ORDER = ["To Do", "In Progress", "Done"];

function App() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/tasks")
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
        await fetch(`http://localhost:8000/api/tasks/${movedTask.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movedTask),
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Task Board</h1>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {COLUMN_ORDER.map((column) => (
                        <Droppable droppableId={column} key={column}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-gray-100 p-4 rounded-xl shadow-md min-h-[300px]"
                                >
                                    <h2 className="text-xl font-semibold mb-3">
                                        {column}
                                    </h2>
                                    {groupedTasks[column]?.map(
                                        (task, index) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-4 mb-3 rounded-lg shadow border"
                                                    >
                                                        <h3 className="font-bold">
                                                            {task.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {task.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )
                                    )}
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
