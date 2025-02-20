import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./components/Home";
import Board from "./components/Board";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Amplify } from "aws-amplify";
import config from "./amplifyconfiguration.json";
import Signin_up from "./components/Signin_up";
import Goals from "./components/Goals";
import ErrorHandlingPage from "./components/ErrorHandlingPage";

Amplify.configure(config);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <BrowserRouter>
        <Navbar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Board" element={<Board />} />
            <Route path="/Signin_up" element={<Signin_up />} />
            <Route path="/Goals" element={<Goals />} />
            <Route path="/ErrorHandling" element={<ErrorHandlingPage />} />

        </Routes>
    </BrowserRouter>
);
