// ErrorHandlingPage.js
import React, { useState } from "react";

// Si tuvieras un archivo config.js con tu API_URL, lo importas aquí:
// import { API_URL } from "../config";
const API_URL = "http://localhost:8080"; // Ajusta a tu endpoint real de Quarkus

function ErrorHandlingPage() {
    // 1) Campo numérico
    const [number, setNumber] = useState("");
    const [submittedNumber, setSubmittedNumber] = useState("");

    // 2) Campo nombre (validación en backend)
    const [name, setName] = useState("");
    const [serverMessage, setServerMessage] = useState("");

    // --- (A) Validación en frontend: asegurar que el número sea par
    const handleSubmitNumber = () => {
        // Con type="number", el usuario no puede meter letras, pero podría meter decimales o impares.
        if (Number(number) % 2 !== 0) {
            alert("Please enter an even number.");
        } else {
            setSubmittedNumber(number);
        }
    };

    // --- (B) Validación en backend: mandar un POST y procesar la respuesta
    const handleSubmitName = async () => {
        try {
            const response = await fetch(`${API_URL}/submit-name`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const text = await response.text();

            if (response.status === 400) {
                // Error del lado del backend
                alert(text); // Mensaje de error amigable que vino del servidor
            } else {
                // Éxito
                setServerMessage(text);
            }
        } catch (error) {
            // Error de red o de conexión
            alert("An error occurred while contacting the server.");
        }
    };

    return (
        <div style={{ margin: "20px" }}>
            <h1>Error Handling Page</h1>

            {/* ---------- 1) Validación con atributo HTML y en frontend ---------- */}
            <section style={{ marginBottom: "30px" }}>
                <h2>1. Enter an even number</h2>
                <p>(Letters won’t be accepted because of type="number".)</p>
                <input
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter a number"
                />
                <button onClick={handleSubmitNumber}>Submit Number</button>
                {submittedNumber && (
                    <p style={{ color: "green" }}>
                        You submitted an even number: {submittedNumber}
                    </p>
                )}
            </section>

            {/* ---------- 2) Validación en el backend ---------- */}
            <section>
                <h2>2. Enter your first name</h2>
                <p>No spaces allowed, cannot be empty (validated by the server).</p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                />
                <button onClick={handleSubmitName}>Submit Name</button>
                {serverMessage && (
                    <p style={{ color: "green" }}>
                        {serverMessage}
                    </p>
                )}
            </section>
        </div>
    );
}

export default ErrorHandlingPage;
