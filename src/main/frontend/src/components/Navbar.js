// Navbar.js
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <Link to="/">Home</Link>
            <span> | </span>
            <Link to="/Board">Board</Link>
            <span> | </span>
            <Link to="/Signin_up">Sign In / Sign Up</Link>
        </nav>
    );
}

export default Navbar;
