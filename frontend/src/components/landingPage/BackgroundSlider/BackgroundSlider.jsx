import { useState, useEffect } from "react";
import "./BackgroundSlider.css";

import bg1 from "../../../assets/backgrounds/landingbg1.png";
import bg2 from "../../../assets/backgrounds/landingbg2.png";
import bg3 from "../../../assets/backgrounds/landingbg3.png";

const images = [bg1, bg2, bg3];

function BackgroundSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slider" aria-hidden="true">
      {images.map((img, i) => (
        <div
          key={i}
          className={`bg-slider__slide ${i === current ? "bg-slider__slide--active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      {/* Dark gradient overlay — keeps text readable */}
      <div className="bg-slider__overlay" />
    </div>
  );
}

export default BackgroundSlider;
