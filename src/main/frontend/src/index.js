import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Board from './Board';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./Navbar";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/Board" element={<Board />} />
                {/* You can add more pages by adding more Route elements here! */}
            </Routes>
        </BrowserRouter>

);
