import React, { useState, useEffect } from 'react';
import './HomePage.css';

function HomePage() {
  const images = [
    "/slideshow/1.jpeg",
    "/slideshow/2.jpeg",
    "/slideshow/3.jpeg",
    "/slideshow/4.jpeg",
    "/slideshow/5.jpeg",
    "/slideshow/6.jpeg",
    "/slideshow/7.jpeg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="hero-section">
      <img src={images[currentSlide]} alt="Slideshow" className="hero-image" />
      <div className="hero-overlay">
        <h1>Empowering the Future of Energy</h1>
        <p>Sustainable solutions for the next generation.</p>
      </div>
    </div>
  );
}

export default HomePage;
