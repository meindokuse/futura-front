import React, { useState, useEffect } from 'react';
import './Login.css'

const placeholderImages = [
  'login/foto1.JPG',
   'login/foto2.jpg',
   'login/foto3.jpg',
   'login/foto4.jpg',
];

const BackgroundCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Предзагрузка изображений
  useEffect(() => {
    placeholderImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Логика смены изображений
  useEffect(() => {
    const slideDuration = 7000; // Время показа одного изображения
    const transitionDuration = 2000; // Длительность перехода

    const interval = setInterval(() => {
      setIsTransitioning(true);

      // После завершения анимации меняем изображение
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % placeholderImages.length);
        setIsTransitioning(false);
      }, transitionDuration);
    }, slideDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background-carousel">
      <div
        className={`carousel-image ${isTransitioning ? 'fade-out' : 'fade-in'}`}
        style={{
          backgroundImage: `url(${placeholderImages[currentImageIndex]})`,
          transition: 'opacity 2s ease-in-out',
        }}
      />
      <div className="image-overlay" />
    </div>
  );
};

export default BackgroundCarousel;