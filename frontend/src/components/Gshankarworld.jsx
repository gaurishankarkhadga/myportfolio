import React from "react";
import "./Gshankarworld.css";

export const Gshankarworld = ({ onReturn }) => {
  return (
    <div className="gshankar-world">
      <div className="digital-grid"></div>
      
      {/* Floating elements for visual effect */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i}
          className="floating-element"
          style={{
            '--delay': `${Math.random() * 5}s`,
            '--size': `${20 + Math.random() * 50}px`,
            '--x': `${Math.random() * 100}vw`,
            '--y': `${Math.random() * 100}vh`,
            '--rotation': `${Math.random() * 360}deg`,
            '--duration': `${5 + Math.random() * 10}s`,
            '--hue': `${Math.random() * 360}`
          }}
        />
      ))}
      
      {/* Main content */}
      <div className="gshankar-content">
        <h1 className="gshankar-title">GAURISHANKAR WORLD</h1>
      
        <button className="return-button" onClick={onReturn}>
          Return to Reality
        </button>
      </div>
    </div>
  );
};

export default Gshankarworld;