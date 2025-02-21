import React, { useState, useEffect } from "react";
import "./Goals.css";
import PhotoCarousel from "./PhotoCarousel";

function Goals() {
    const [goals, setGoals] = useState([]);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newColor, setNewColor] = useState("#FFD700");

    const [editingGoal, setEditingGoal] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editColor, setEditColor] = useState("#FFD700");

    const [images, setImages] = useState([]);

    // 1) Cargar metas al montar el componente
    useEffect(() => {
        fetch("http://localhost:8080/goals")
            .then((res) => res.json())
            .then((data) => {
                setGoals(data);
            })
            .catch((err) => console.error("Error fetching goals:", err));
    }, []);

    // 2) Crear nueva meta (POST) con validaciones locales
    const handleAddGoal = async (e) => {
        e.preventDefault();

        // --- Validaciones en el Frontend ---
        const trimmedTitle = newTitle.trim();
        const trimmedDescription = newDescription.trim();

        // Título no vacío
        if (!trimmedTitle) {
            alert("Please enter a goal title.");
            return;
        }
        // Mínimo 3 caracteres
        if (trimmedTitle.length < 3) {
            alert("Title must be at least 3 characters.");
            return;
        }
        // Máximo 150 caracteres
        if (trimmedTitle.length > 150) {
            alert("Title cannot exceed 150 characters.");
            return;
        }
        // Descripción máximo 150 caracteres
        if (trimmedDescription.length > 150) {
            alert("Description cannot exceed 150 characters.");
            return;
        }

        // --- Llamada al servidor ---
        try {
            const response = await fetch("http://localhost:8080/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription,
                    color: newColor,
                }),
            });

            // Si el servidor envía un error, lo leemos y mostramos
            if (!response.ok) {
                const errorText = await response.text();
                alert(errorText);
                return;
            }

            // Si todo va bien, parseamos la respuesta y actualizamos estado
            const createdGoal = await response.json();
            alert("Goal created successfully: " + createdGoal.title);

            // Agregamos la meta creada al estado local
            setGoals((prev) => [...prev, createdGoal]);

            // Reseteamos los campos del formulario
            setNewTitle("");
            setNewDescription("");
            setNewColor("#FFD700");
        } catch (err) {
            alert("Error contacting server.");
        }
    };

    // 3) Borrar meta (DELETE)
    const handleDeleteGoal = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/goals/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const msg = await response.text();
                alert(msg);
                return;
            }
            setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
            alert("Goal deleted successfully.");
        } catch (err) {
            alert("Error deleting goal.");
        }
    };

    // Iniciar edición de meta
    const startEditingGoal = (goal) => {
        setEditingGoal(goal);
        setEditTitle(goal.title);
        setEditDescription(goal.description || "");
        setEditColor(goal.color || "#FFD700");
    };

    // 4) Actualizar meta (PUT) con validaciones similares
    const handleUpdateGoal = async () => {
        if (!editingGoal) return;

        const trimmedTitle = editTitle.trim();
        const trimmedDescription = editDescription.trim();

        // Validaciones locales
        if (!trimmedTitle) {
            alert("Please enter a goal title.");
            return;
        }
        if (trimmedTitle.length < 3) {
            alert("Title must be at least 3 characters.");
            return;
        }
        if (trimmedTitle.length > 150) {
            alert("Title cannot exceed 150 characters.");
            return;
        }
        if (trimmedDescription.length > 150) {
            alert("Description cannot exceed 150 characters.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/goals/${editingGoal.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: editTitle,
                        description: editDescription,
                        color: editColor,
                    }),
                }
            );

            if (!response.ok) {
                const msg = await response.text();
                alert(msg);
                return;
            }

            const updatedGoal = await response.json();

            setGoals((prevGoals) =>
                prevGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
            );

            setEditingGoal(null);
            setEditTitle("");
            setEditDescription("");
            setEditColor("#FFD700");
            alert("Goal updated successfully.");
        } catch (err) {
            alert("Error updating goal.");
        }
    };

    // 5) Subir imágenes inspiracionales (solo local)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImages((prevImages) => [...prevImages, imageUrl]);
        }
    };

    return (
        <div className="goals-container">
            <h1 className="goals-title">My Goals</h1>
            <p className="goals-subtitle">
                Keep track of your objectives and stay motivated!
            </p>

            {/* Formulario para agregar una nueva meta */}
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

                <div className="form-group">
                    <label htmlFor="goalColor">Color:</label>
                    <input
                        id="goalColor"
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn-add-goal">
                    Add Goal
                </button>
            </form>

            {/* Sección para subir fotos inspiracionales */}
            <div className="upload-section">
                <h2>Upload Inspirational Photo</h2>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Photo carousel */}
            <PhotoCarousel images={images} />

            {/* Formulario de edición (solo visible cuando editingGoal no es null) */}
            {editingGoal && (
                <div className="edit-goal-form">
                    <h2>Edit Goal</h2>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Edit Title"
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Edit Description"
                    />
                    <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                    />
                    <button onClick={handleUpdateGoal}>Save Changes</button>
                    <button onClick={() => setEditingGoal(null)}>Cancel</button>
                </div>
            )}

            {/* Lista de metas existentes */}
            <div className="goals-list">
                {goals.map((goal) => (
                    <div
                        key={goal.id}
                        className="goal-card"
                        style={{ borderLeft: `8px solid ${goal.color || "#333"}` }}
                    >
                        <h3>{goal.title}</h3>
                        <p>{goal.description}</p>
                        <button
                            className="btn-delete-goal"
                            onClick={() => handleDeleteGoal(goal.id)}
                        >
                            Delete
                        </button>
                        <button onClick={() => startEditingGoal(goal)}>Edit</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Goals;
