import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import Board from './components/Board';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';
import Signin_up from "./components/Signin_up";


Amplify.configure(config);


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/Board" element={<Board />} />
                <Route path="/Signin_up" element={<Signin_up />} />
            </Routes>
        </BrowserRouter>

);
