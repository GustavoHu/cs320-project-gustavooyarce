import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import TaskFlowInfo from "./TaskFlowInfo"; // Import new component

function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero">
                <h1>Welcome to <span className="highlight">TaskFlow</span></h1>
                <p>Stay organized, stay focused, achieve your goals.</p>
                <Link to="/Board" className="cta-button">Get Started</Link> {/* Change button to Link */}
            </section>

            {/* TaskFlow Info Section */}
            <TaskFlowInfo />
        </div>
    );
}

export default Home;
