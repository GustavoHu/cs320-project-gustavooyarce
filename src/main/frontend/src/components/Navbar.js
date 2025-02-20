// Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">TaskFlow</div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/Board">Board</Link>
                <Link to="/Goals">Goals</Link>
                <Link to="/Signin_up">Sign In/ Sign Up</Link>
            </div>
        </nav>
    );
}

export default Navbar;
