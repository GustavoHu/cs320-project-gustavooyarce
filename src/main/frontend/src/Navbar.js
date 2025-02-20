// Navbar.js
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <Link to="/">Home</Link>
            <span> | </span>
            <Link to="/Board">Board</Link>
        </nav>
    );
}

export default Navbar;
