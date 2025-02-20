// TaskFlowInfo.js
import React from "react";
import "./Home.css"; // Keep using the same stylesheet
import productivityImg from "../assets/productivity.png"; // Ensure the path is correct
import keyFeaturesImg from "../assets/key-features.png"; // Ensure this image is saved in the correct folder

function TaskFlowInfo() {
    return (
        <div>
            {/* Section: What is TaskFlow? */}
            <section className="taskflow-info">
                <div className="info-container">
                    <div className="info-image">
                        <img src={productivityImg} alt="Productivity Illustration" />
                    </div>
                    <div className="info-content">
                        <h2>Streamline Your Workflow with <span className="highlight">TaskFlow</span></h2>
                        <p>A simple yet powerful tool designed to help you stay focused, track your tasks, and achieve your goals effortlessly.</p>
                        <ul className="benefits-list">
                            <li>✅ Organize tasks efficiently</li>
                            <li>✅ Set and track your progress</li>
                            <li>✅ Stay on top of deadlines</li>
                            <li>✅ Boost productivity with a structured workflow</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section: Key Features */}
            <section className="key-features">
                <div className="features-image">
                    <img src={keyFeaturesImg} alt="Productivity Dashboard" />
                </div>
                <div className="features-content">
                    <h2>Powerful Features to Keep You on Track</h2>
                    <p>TaskFlow provides a comprehensive toolkit to help you manage your productivity like never before.</p>
                    <ul className="benefits-list">
                        <li>✅ Smart Task Management</li>
                        <li>✅ Goal Tracking and Progress Monitoring</li>
                        <li>✅ Automated Reminders and Notifications</li>
                        <li>✅ Collaborative Workspaces</li>
                        <li>✅ Insightful Analytics for Better Productivity</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}

export default TaskFlowInfo;
