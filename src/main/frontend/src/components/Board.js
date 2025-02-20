import React, { useState } from "react";
import "./Board.css";

function Board() {
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

    /**
     * Se dispara cuando inicias a arrastrar una tarjeta.
     * Guarda en dataTransfer la columna origen y el ID de la tarea.
     */
    const handleDragStart = (event, sourceColumn, taskId) => {
        const data = { sourceColumn, taskId };
        // Guardamos la info en el dataTransfer para recuperarla en onDrop
        event.dataTransfer.setData("application/json", JSON.stringify(data));
    };

    /**
     * Se dispara constantemente mientras pasas el mouse por encima de una columna.
     * Para permitir soltar, necesitamos llamar a event.preventDefault().
     */
    const handleDragOver = (event) => {
        event.preventDefault();
    };

    /**
     * Se dispara cuando sueltas la tarjeta en una columna destino.
     * Recuperamos la información del dataTransfer, removemos la tarea de la
     * columna origen y la insertamos en la columna destino.
     */
    const handleDrop = (event, targetColumn) => {
        event.preventDefault();
        const droppedData = JSON.parse(event.dataTransfer.getData("application/json"));
        const { sourceColumn, taskId } = droppedData;

        // Si se suelta en la misma columna, no hacemos nada
        if (sourceColumn === targetColumn) return;

        setTasks((prevTasks) => {
            // Copiamos las tareas de la columna origen
            const sourceTasks = [...prevTasks[sourceColumn]];
            // Encontramos el índice de la tarea
            const taskIndex = sourceTasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) return prevTasks; // No encontrado

            // Sacamos la tarea del array de origen
            const [movedTask] = sourceTasks.splice(taskIndex, 1);

            // Copiamos las tareas de la columna destino y añadimos la tarea
            const targetTasks = [...prevTasks[targetColumn], movedTask];

            // Retornamos el nuevo estado con las columnas actualizadas
            return {
                ...prevTasks,
                [sourceColumn]: sourceTasks,
                [targetColumn]: targetTasks,
            };
        });
    };

    return (
        <div className="board-container">
            <h1 className="board-title">Task Board</h1>
            <div className="columns-container">
                <Column
                    title="To Do"
                    columnKey="todo"
                    tasks={tasks.todo}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
                <Column
                    title="In Progress"
                    columnKey="inProgress"
                    tasks={tasks.inProgress}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
                <Column
                    title="Done"
                    columnKey="done"
                    tasks={tasks.done}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
            </div>
        </div>
    );
}

function Column({ title, columnKey, tasks, onDragStart, onDragOver, onDrop }) {
    // Al soltar en esta columna, llamamos a onDrop con la key de esta columna
    const handleDropInThisColumn = (event) => onDrop(event, columnKey);

    return (
        <div className="column" onDragOver={onDragOver} onDrop={handleDropInThisColumn}>
            <h2>{title}</h2>
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
    // Al iniciar a arrastrar, le decimos a Board qué tarea y qué columna es
    const handleDragStartCard = (event) => {
        onDragStart(event, columnKey, task.id);
    };

    return (
        <div
            className="task-card"
            draggable="true"
            onDragStart={handleDragStartCard}
        >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
        </div>
    );
}

export default Board;
