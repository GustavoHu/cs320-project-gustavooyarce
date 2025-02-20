import React, { useState, useEffect } from "react";
import "./Board.css";

function Board() {
    const [goals, setGoals] = useState([]);
    const [tasksByGoal, setTasksByGoal] = useState({});
    const [collapsedGoals, setCollapsedGoals] = useState({}); // para colapsar/expandir

    useEffect(() => {
        // Cargar metas
        fetch("http://localhost:8080/goals")
            .then((res) => res.json())
            .then((data) => {
                setGoals(data);
                // Para cada meta, cargar sus tareas
                data.forEach((goal) => {
                    fetch(`http://localhost:8080/tasks?goalId=${goal.id}`)
                        .then((res) => res.json())
                        .then((tasks) => {
                            const todo = tasks.filter((t) => t.status === "todo");
                            const inProgress = tasks.filter((t) => t.status === "inProgress");
                            const done = tasks.filter((t) => t.status === "done");
                            setTasksByGoal((prev) => ({
                                ...prev,
                                [goal.id]: { todo, inProgress, done },
                            }));
                        })
                        .catch((err) => console.error(err));
                });
            })
            .catch((err) => console.error(err));
    }, []);

    // Colapsar/expandir
    const toggleCollapse = (goalId) => {
        setCollapsedGoals((prev) => ({
            ...prev,
            [goalId]: !prev[goalId],
        }));
    };

    // Eliminar meta
    const handleDeleteGoal = async (goalId) => {
        try {
            const res = await fetch(`http://localhost:8080/goals/${goalId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const msg = await res.text();
                alert(msg);
                return;
            }
            // Si se eliminó en backend, lo removemos de la lista local
            setGoals((prev) => prev.filter((g) => g.id !== goalId));
            // También podemos quitar sus tareas de tasksByGoal
            setTasksByGoal((prev) => {
                const copy = { ...prev };
                delete copy[goalId];
                return copy;
            });
        } catch (error) {
            alert("Error deleting goal.");
        }
    };

    return (
        <div className="board-page-container">
            <h1>All Goals Boards</h1>
            {goals.map((goal) => {
                const goalTasks = tasksByGoal[goal.id] || {
                    todo: [],
                    inProgress: [],
                    done: [],
                };
                const isCollapsed = collapsedGoals[goal.id] || false;

                return (
                    <div
                        key={goal.id}
                        className="goal-board"
                        style={{
                            border: `2px solid ${goal.color || "#ccc"}`,
                            marginBottom: "20px",
                            borderRadius: "8px",
                            backgroundColor: "#1a1a1a",
                        }}
                    >
                        {/* Encabezado con el título de la meta */}
                        <div
                            className="goal-board-header"
                            style={{
                                backgroundColor: goal.color || "#333",
                                padding: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                        >
                            <div onClick={() => toggleCollapse(goal.id)}>
                                <h2 style={{ color: "#fff" }}>
                                    {goal.title} (Goal #{goal.id})
                                </h2>
                            </div>

                            {/* Botón para eliminar la meta */}
                            <button
                                style={{ marginLeft: "auto" }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Evita colapsar al hacer clic
                                    handleDeleteGoal(goal.id);
                                }}
                            >
                                Delete Goal
                            </button>
                        </div>

                        {/* Si NO está colapsado, mostramos el tablero */}
                        {!isCollapsed && (
                            <div className="goal-board-content" style={{ padding: "10px" }}>
                                <ColumnsContainer
                                    goal={goal}
                                    tasks={goalTasks}
                                    setTasksByGoal={setTasksByGoal}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** Este componente maneja las 3 columnas (To Do, In Progress, Done) y un formulario para crear nuevas tareas */
function ColumnsContainer({ goal, tasks, setTasksByGoal }) {
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const handleDrop = (event, targetColumn) => {
        event.preventDefault();
        const droppedData = JSON.parse(event.dataTransfer.getData("application/json"));
        const { sourceColumn, taskId } = droppedData;

        if (sourceColumn === targetColumn) return;

        // 1) Actualiza local
        setTasksByGoal((prev) => {
            const goalTasks = prev[goal.id];
            if (!goalTasks) return prev;

            const sourceTasks = [...goalTasks[sourceColumn]];
            const idx = sourceTasks.findIndex((t) => t.id === taskId);
            if (idx === -1) return prev;

            const [moved] = sourceTasks.splice(idx, 1);
            moved.status = targetColumn;

            const targetTasks = [...goalTasks[targetColumn], moved];

            return {
                ...prev,
                [goal.id]: {
                    ...goalTasks,
                    [sourceColumn]: sourceTasks,
                    [targetColumn]: targetTasks,
                },
            };
        });

        // 2) Actualiza en backend
        fetch(`http://localhost:8080/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: targetColumn }),
        }).catch((err) => console.error(err));
    };

    const handleDragStart = (event, sourceColumn, taskId) => {
        const data = { sourceColumn, taskId };
        event.dataTransfer.setData("application/json", JSON.stringify(data));
    };

    // Form para crear nueva tarea
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) {
            alert("Please enter a task title.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTaskTitle,
                    status: "todo",
                    goal: { id: goal.id },
                }),
            });
            if (!res.ok) {
                const msg = await res.text();
                alert(msg);
                return;
            }
            const createdTask = await res.json();

            // Actualizamos local
            setTasksByGoal((prev) => {
                const goalTasks = prev[goal.id] || { todo: [], inProgress: [], done: [] };
                return {
                    ...prev,
                    [goal.id]: {
                        ...goalTasks,
                        todo: [...goalTasks.todo, createdTask],
                    },
                };
            });

            setNewTaskTitle("");
        } catch (err) {
            alert("Error creating task.");
        }
    };

    return (
        <div>
            <form onSubmit={handleAddTask} style={{ marginBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="New Task Title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button type="submit">Add Task</button>
            </form>

            <div className="columns-container">
                <Column
                    title="To Do"
                    columnKey="todo"
                    tasks={tasks.todo}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                />
                <Column
                    title="In Progress"
                    columnKey="inProgress"
                    tasks={tasks.inProgress}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                />
                <Column
                    title="Done"
                    columnKey="done"
                    tasks={tasks.done}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                />
            </div>
        </div>
    );
}

function Column({ title, columnKey, tasks, onDragStart, onDrop }) {
    const handleDragOver = (e) => e.preventDefault();
    const handleDropInThisColumn = (e) => onDrop(e, columnKey);

    return (
        <div className="column" onDragOver={handleDragOver} onDrop={handleDropInThisColumn}>
            <h3>{title}</h3>
            <div className="task-list">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        columnKey={columnKey}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    );
}

function TaskCard({ task, columnKey, onDragStart }) {
    const handleDragStartCard = (e) => {
        onDragStart(e, columnKey, task.id);
    };

    return (
        <div
            className="task-card"
            draggable="true"
            onDragStart={handleDragStartCard}
        >
            <h4>{task.title}</h4>
            <p>{task.description}</p>
        </div>
    );
}

export default Board;
