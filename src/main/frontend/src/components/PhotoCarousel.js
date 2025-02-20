// PhotoCarousel.js
import React, { useState } from "react";
import "./PhotoCarousel.css";

function PhotoCarousel({ images }) {
    const [current, setCurrent] = useState(0);
    const total = images.length;

    const nextImage = () => {
        setCurrent((prev) => (prev + 1) % total);
    };

    const prevImage = () => {
        setCurrent((prev) => (prev - 1 + total) % total);
    };

    if (total === 0) {
        return <p>No inspirational photos added yet.</p>;
    }

    return (
        <div className="carousel-container">
            <button className="carousel-btn" onClick={prevImage}>
                &#60;
            </button>
            <div className="carousel-image-container">
                <img src={images[current]} alt={`Inspirational ${current + 1}`} />
            </div>
            <button className="carousel-btn" onClick={nextImage}>
                &#62;
            </button>
        </div>
    );
}

export default PhotoCarousel;
