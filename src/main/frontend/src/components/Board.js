import React, { useState } from "react";
import "./Board.css"; // Import styles

function Board() {
    // Sample tasks (static for now)
    const [tasks, setTasks] = useState({
        todo: [
            { id: 1, title: "Set up meeting", description: "Plan for project discussion" },
            { id: 2, title: "Write report", description: "Summary for client" },
        ],
        inProgress: [
            { id: 3, title: "Develop Home Page", description: "Frontend UI" },
        ],
        done: [
            { id: 4, title: "Research AI tools", description: "Find best integrations" },
        ],
    });

    return (
        <div className="board-container">
            <h1 className="board-title">Task Board</h1>
            <div className="columns-container">
                <Column title="To Do" tasks={tasks.todo} />
                <Column title="In Progress" tasks={tasks.inProgress} />
                <Column title="Done" tasks={tasks.done} />
            </div>
        </div>
    );
}

// Column Component
function Column({ title, tasks }) {
    return (
        <div className="column">
            <h2>{title}</h2>
            <div className="task-list">
                {tasks.map(task => (
                    <TaskCard key={task.id} title={task.title} description={task.description} />
                ))}
            </div>
        </div>
    );
}

// Task Card Component
function TaskCard({ title, description }) {
    return (
        <div className="task-card">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default Board;
