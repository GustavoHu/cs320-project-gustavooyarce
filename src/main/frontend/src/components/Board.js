import React, { useState, useEffect } from "react";
import "./Board.css";

function Board() {
    const [goals, setGoals] = useState([]);
    const [tasksByGoal, setTasksByGoal] = useState({});
    const [collapsedGoals, setCollapsedGoals] = useState({});

    useEffect(() => {
        // 1) Cargar metas desde el backend
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

    // 2) Colapsar / expandir la vista de una meta
    const toggleCollapse = (goalId) => {
        setCollapsedGoals((prev) => ({
            ...prev,
            [goalId]: !prev[goalId],
        }));
    };

    // 3) Eliminar una meta
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
            // Remover la meta localmente
            setGoals((prev) => prev.filter((g) => g.id !== goalId));
            // Remover sus tareas del estado local
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
            <h1 className="board-title">All Goals Boards</h1>
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
                        style={{ borderColor: goal.color || "#ccc" }}
                    >
                        {/* Encabezado */}
                        <div
                            className="goal-board-header"
                            style={{ backgroundColor: goal.color || "#333" }}
                        >
                            <div
                                className="goal-board-title"
                                onClick={() => toggleCollapse(goal.id)}
                            >
                                <h2>
                                    {goal.title} (Goal #{goal.id})
                                </h2>
                            </div>
                            <button
                                className="delete-goal-btn"
                                onClick={(e) => {
                                    e.stopPropagation(); // Evita colapsar al hacer clic en el botón
                                    handleDeleteGoal(goal.id);
                                }}
                            >
                                Delete Goal
                            </button>
                        </div>

                        {/* Contenido si no está colapsado */}
                        {!isCollapsed && (
                            <div className="goal-board-content">
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

/** Maneja las 4 columnas (To Do, In Progress, Done, Delete) + crear/editar tareas */
function ColumnsContainer({ goal, tasks, setTasksByGoal }) {
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Estados para editar una tarea
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    // Iniciar la edición de una tarea
    const startEditingTask = (task) => {
        setEditingTask(task);
        setEditTitle(task.title);
    };

    // Actualizar una tarea (PUT) - solo se actualiza el título
    const handleUpdateTask = async () => {
        if (!editingTask) return;

        // Validar que el título no esté vacío
        if (!editTitle.trim()) {
            alert("Task title cannot be empty.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/tasks/${editingTask.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    status: editingTask.status,
                }),
            });
            if (!res.ok) {
                const msg = await res.text();
                alert(msg);
                return;
            }
            const updatedTask = await res.json();

            // Actualizar el estado local
            setTasksByGoal((prev) => {
                const goalTasks = prev[goal.id];
                if (!goalTasks) return prev;

                const columns = ["todo", "inProgress", "done"];
                const newState = { ...goalTasks };

                // Reemplazar la tarea actualizada en la columna correspondiente
                for (let col of columns) {
                    newState[col] = newState[col].map((t) =>
                        t.id === updatedTask.id ? updatedTask : t
                    );
                }

                return {
                    ...prev,
                    [goal.id]: newState,
                };
            });

            // Limpiar los estados de edición
            setEditingTask(null);
            setEditTitle("");

            alert("Task updated successfully.");
        } catch (error) {
            alert("Error updating task.");
        }
    };

    // Crear nueva tarea (POST)
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

            // Actualizar el estado local
            setTasksByGoal((prev) => {
                const goalTasks = prev[goal.id] || {
                    todo: [],
                    inProgress: [],
                    done: [],
                };
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

    // Drag & Drop para mover o eliminar tareas
    const handleDragStart = (event, sourceColumn, taskId) => {
        const data = { sourceColumn, taskId };
        event.dataTransfer.setData("application/json", JSON.stringify(data));
    };

    const handleDrop = (event, targetColumn) => {
        event.preventDefault();
        const droppedData = JSON.parse(event.dataTransfer.getData("application/json"));
        const { sourceColumn, taskId } = droppedData;

        if (sourceColumn === targetColumn && targetColumn !== "delete") return;

        if (targetColumn === "delete") {
            // Eliminar tarea del estado local
            setTasksByGoal((prev) => {
                const goalTasks = prev[goal.id];
                if (!goalTasks) return prev;

                const newTodo = goalTasks.todo.filter((t) => t.id !== taskId);
                const newInProgress = goalTasks.inProgress.filter((t) => t.id !== taskId);
                const newDone = goalTasks.done.filter((t) => t.id !== taskId);

                return {
                    ...prev,
                    [goal.id]: {
                        todo: newTodo,
                        inProgress: newInProgress,
                        done: newDone,
                    },
                };
            });

            // Eliminar en el backend
            fetch(`http://localhost:8080/tasks/${taskId}`, {
                method: "DELETE",
            }).catch((err) => console.error(err));
        } else {
            // Mover tarea a otra columna
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

            // Actualizar status en el backend
            fetch(`http://localhost:8080/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: targetColumn }),
            }).catch((err) => console.error(err));
        }
    };

    return (
        <div>
            {/* Form para agregar nueva tarea */}
            <form className="task-form" onSubmit={handleAddTask}>
                <input
                    className="task-input"
                    type="text"
                    placeholder="New Task Title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button className="btn-add-task" type="submit">
                    Add Task
                </button>
            </form>

            {/* Form de edición de tareas (solo si editingTask != null) */}
            {editingTask && (
                <div className="edit-task-form">
                    <h3>Edit Task</h3>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task Title"
                        className="edit-task-input"
                    />
                    <div className="edit-buttons">
                        <button onClick={handleUpdateTask}>Save</button>
                        <button
                            onClick={() => {
                                setEditingTask(null);
                                setEditTitle("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Contenedor de columnas */}
            <div className="columns-container">
                <Column
                    title="To Do"
                    columnKey="todo"
                    tasks={tasks.todo}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    onEditTask={startEditingTask}
                />
                <Column
                    title="In Progress"
                    columnKey="inProgress"
                    tasks={tasks.inProgress}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    onEditTask={startEditingTask}
                />
                <Column
                    title="Done"
                    columnKey="done"
                    tasks={tasks.done}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    onEditTask={startEditingTask}
                />
                <DeleteColumn onDragStart={handleDragStart} onDrop={handleDrop} />
            </div>
        </div>
    );
}

function Column({ title, columnKey, tasks, onDragStart, onDrop, onEditTask }) {
    const handleDragOver = (e) => e.preventDefault();

    const handleDropInThisColumn = (e) => {
        onDrop(e, columnKey);
    };

    return (
        <div
            className="column"
            onDragOver={handleDragOver}
            onDrop={handleDropInThisColumn}
        >
            <h3 className="column-title">{title}</h3>
            <div className="task-list">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        columnKey={columnKey}
                        onDragStart={onDragStart}
                        onEditTask={onEditTask}
                    />
                ))}
            </div>
        </div>
    );
}

function DeleteColumn({ onDragStart, onDrop }) {
    const handleDragOver = (e) => e.preventDefault();

    const handleDropInThisColumn = (e) => {
        onDrop(e, "delete");
    };

    return (
        <div
            className="delete-column"
            onDragOver={handleDragOver}
            onDrop={handleDropInThisColumn}
        >
            <h3 className="column-title">Delete</h3>
        </div>
    );
}

function TaskCard({ task, columnKey, onDragStart, onEditTask }) {
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
            <button onClick={() => onEditTask(task)}>Edit</button>
        </div>
    );
}

export default Board;
