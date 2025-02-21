import React, { useState, useEffect } from "react";
import "./Board.css";

function Board() {
    const [goals, setGoals] = useState([]);
    const [tasksByGoal, setTasksByGoal] = useState({});
    const [collapsedGoals, setCollapsedGoals] = useState({});

    useEffect(() => {
        // Load goals from the backend
        fetch("http://localhost:8080/goals")
            .then((res) => res.json())
            .then((data) => {
                setGoals(data);
                // For each goal, load its tasks
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

    // Collapse/expand a Goal's view
    const toggleCollapse = (goalId) => {
        setCollapsedGoals((prev) => ({
            ...prev,
            [goalId]: !prev[goalId],
        }));
    };

    // Delete a Goal
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
            // Remove goal locally
            setGoals((prev) => prev.filter((g) => g.id !== goalId));
            // Also remove its tasks
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
                        {/* Header */}
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
                                    e.stopPropagation(); // Prevent collapse on click
                                    handleDeleteGoal(goal.id);
                                }}
                            >
                                Delete Goal
                            </button>
                        </div>

                        {/* Content if not collapsed */}
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

/** Handles the 4 columns (To Do, In Progress, Done, Delete) + add/edit tasks */
function ColumnsContainer({ goal, tasks, setTasksByGoal }) {
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Edit task states (only the title)
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    // Start editing a task
    const startEditingTask = (task) => {
        setEditingTask(task);
        setEditTitle(task.title);
    };

    // Update the task in the backend (PUT) - only updating title
    const handleUpdateTask = async () => {
        if (!editingTask) return;

        try {
            const res = await fetch(`http://localhost:8080/tasks/${editingTask.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle,
                    // keep the same status from editingTask
                    status: editingTask.status,
                }),
            });
            if (!res.ok) {
                const msg = await res.text();
                alert(msg);
                return;
            }
            const updatedTask = await res.json();

            // Update local state
            setTasksByGoal((prev) => {
                const goalTasks = prev[goal.id];
                if (!goalTasks) return prev;

                // We have three columns: todo, inProgress, done
                const columns = ["todo", "inProgress", "done"];
                const newState = { ...goalTasks };

                // Replace the updated task in whichever column it was
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

            // Clear editing states
            setEditingTask(null);
            setEditTitle("");
            alert("Task updated successfully.");
        } catch (error) {
            alert("Error updating task.");
        }
    };

    // Handle drag & drop to move or delete tasks
    const handleDrop = (event, targetColumn) => {
        event.preventDefault();
        const droppedData = JSON.parse(event.dataTransfer.getData("application/json"));
        const { sourceColumn, taskId } = droppedData;

        if (sourceColumn === targetColumn && targetColumn !== "delete") return;

        if (targetColumn === "delete") {
            // Remove from local state
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

            // Delete from backend
            fetch(`http://localhost:8080/tasks/${taskId}`, {
                method: "DELETE",
            }).catch((err) => console.error(err));
        } else {
            // Move task to another column
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

            // Update status in backend
            fetch(`http://localhost:8080/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: targetColumn }),
            }).catch((err) => console.error(err));
        }
    };

    const handleDragStart = (event, sourceColumn, taskId) => {
        const data = { sourceColumn, taskId };
        event.dataTransfer.setData("application/json", JSON.stringify(data));
    };

    // Create a new task (title only)
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

            // Update local state
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
            {/* Form to add a new task */}
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

            {/* Edit Task Form (only if editingTask != null) */}
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

            {/* Columns */}
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
        <div className="column" onDragOver={handleDragOver} onDrop={handleDropInThisColumn}>
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
        <div className="delete-column" onDragOver={handleDragOver} onDrop={handleDropInThisColumn}>
            <h3 className="column-title">Delete</h3>
        </div>
    );
}

function TaskCard({ task, columnKey, onDragStart, onEditTask }) {
    const handleDragStartCard = (e) => {
        onDragStart(e, columnKey, task.id);
    };

    return (
        <div className="task-card" draggable="true" onDragStart={handleDragStartCard}>
            <h4>{task.title}</h4>
            <button onClick={() => onEditTask(task)}>Edit</button>
        </div>
    );
}

export default Board;
