import React, { useState, useEffect } from "react";
import "./Goals.css";
import PhotoCarousel from "./PhotoCarousel";

function Goals() {
    // State to store goals fetched from the backend
    const [goals, setGoals] = useState([]);

    // States for creating a new goal
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newColor, setNewColor] = useState("#FFD700");

    // States for editing an existing goal
    const [editingGoal, setEditingGoal] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editColor, setEditColor] = useState("#FFD700");

    // State for uploading inspirational images
    const [images, setImages] = useState([]);

    // 1) Fetch all goals from the backend on component mount
    useEffect(() => {
        fetch("http://localhost:8080/goals")
            .then((res) => res.json())
            .then((data) => {
                setGoals(data);
            })
            .catch((err) => console.error("Error fetching goals:", err));
    }, []);

    // 2) Handle creating a new goal (POST)
    const handleAddGoal = async (e) => {
        e.preventDefault();

        // Basic frontend validations
        if (!newTitle.trim()) {
            alert("Please enter a goal title.");
            return;
        }
        if (newTitle.length < 3) {
            alert("Title must be at least 3 characters.");
            return;
        }
        if (newTitle.length > 150) {
            alert("Title cannot exceed 150 characters.");
            return;
        }
        if (newDescription.length > 150) {
            alert("Description cannot exceed 150 characters.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription,
                    color: newColor
                })
            });

            const createdGoal = await response.json();

            if (!response.ok) {
                // If the server responded with an error
                alert(createdGoal);
            } else {
                alert("Goal created successfully: " + createdGoal.title);
                // Add the newly created goal to local state
                setGoals((prev) => [...prev, createdGoal]);
                // Clear input fields
                setNewTitle("");
                setNewDescription("");
                setNewColor("#FFD700");
            }
        } catch (err) {
            alert("Error contacting server.");
        }
    };

    // 3) Handle deleting a goal (DELETE)
    const handleDeleteGoal = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/goals/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const msg = await response.text();
                alert(msg);
                return;
            }

            // Remove the goal from local state
            setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
            alert("Goal deleted successfully.");
        } catch (err) {
            alert("Error deleting goal.");
        }
    };

    // 4) Start editing a goal: fill edit states
    const startEditingGoal = (goal) => {
        setEditingGoal(goal);
        setEditTitle(goal.title);
        setEditDescription(goal.description || "");
        setEditColor(goal.color || "#FFD700");
    };

    // 5) Handle updating a goal (PUT)
    const handleUpdateGoal = async () => {
        if (!editingGoal) return;

        try {
            const response = await fetch(
                `http://localhost:8080/goals/${editingGoal.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: editTitle,
                        description: editDescription,
                        color: editColor
                    })
                }
            );

            if (!response.ok) {
                const msg = await response.text();
                alert(msg);
                return;
            }

            const updatedGoal = await response.json();

            // Update the local goals list
            setGoals((prevGoals) =>
                prevGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
            );

            // Clear editing states
            setEditingGoal(null);
            setEditTitle("");
            setEditDescription("");
            setEditColor("#FFD700");

            alert("Goal updated successfully.");
        } catch (err) {
            alert("Error updating goal.");
        }
    };

    // 6) Handle image upload (local feature)
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
            <p className="goals-subtitle">Keep track of your objectives and stay motivated!</p>

            {/* Form to add a new goal */}
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

                <button type="submit" className="btn-add-goal">Add Goal</button>
            </form>

            {/* Section to upload inspirational photos */}
            <div className="upload-section">
                <h2>Upload Inspirational Photo</h2>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Photo carousel */}
            <PhotoCarousel images={images} />

            {/* Edit Goal Form (only visible when editingGoal is not null) */}
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

            {/* List of existing goals */}
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
                        <button onClick={() => startEditingGoal(goal)}>
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Goals;
