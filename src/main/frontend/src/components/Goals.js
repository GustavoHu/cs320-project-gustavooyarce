// Goals.js
import React, { useState } from "react";
import "./Goals.css";
import PhotoCarousel from "./PhotoCarousel";

function Goals() {
    const [goals, setGoals] = useState([
        { id: 1, title: "Finish React Course", description: "Complete the online course this month." },
        { id: 2, title: "Plan Summer Vacation", description: "Research and book flights." },
    ]);

    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    // Estado para imágenes inspiradoras
    const [images, setImages] = useState([]);

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const newGoal = {
            id: Date.now(),
            title: newTitle,
            description: newDescription,
        };

        setGoals((prevGoals) => [...prevGoals, newGoal]);
        setNewTitle("");
        setNewDescription("");
    };

    const handleDeleteGoal = (id) => {
        setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
    };

    // Manejo de la subida de imágenes
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Crear una URL temporal para mostrar la imagen
            const imageUrl = URL.createObjectURL(file);
            setImages((prevImages) => [...prevImages, imageUrl]);
        }
    };

    return (
        <div className="goals-container">
            <h1 className="goals-title">My Goals</h1>
            <p className="goals-subtitle">Keep track of your objectives and stay motivated!</p>

            {/* Formulario para agregar metas */}
            <form className="goals-form" onSubmit={handleAddGoal}>
                <div className="form-group">
                    <label htmlFor="goalTitle">Goal Title:</label>
                    <input
                        id="goalTitle"
                        type="text"
                        placeholder="Enter your goal..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="goalDescription">Description:</label>
                    <textarea
                        id="goalDescription"
                        placeholder="Describe your goal..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn-add-goal">Add Goal</button>
            </form>

            {/* Sección para subir imágenes */}
            <div className="upload-section">
                <h2>Upload Inspirational Photo</h2>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Carrusel de imágenes */}
            <PhotoCarousel images={images} />

            {/* Lista de metas */}
            <div className="goals-list">
                {goals.map((goal) => (
                    <div key={goal.id} className="goal-card">
                        <h3>{goal.title}</h3>
                        <p>{goal.description}</p>
                        <button className="btn-delete-goal" onClick={() => handleDeleteGoal(goal.id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Goals;
