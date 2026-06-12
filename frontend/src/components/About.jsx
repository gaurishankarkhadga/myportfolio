import React, { useEffect, useRef, useState } from 'react';
import './About.css';
import profileImage from './rightview.jpg';

const About = () => {
  const containerRef = useRef(null);
  const parallaxElements = useRef([]);
  const [isInView, setIsInView] = useState(false);

  const headerRef = useRef(null);
  
  useEffect(() => {
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      
      const moveX = (clientX - centerX) / (rect.width / 2);
      const moveY = (clientY - centerY) / (rect.height / 2);
      
      
      parallaxElements.current.forEach((element, index) => {
        if (!element) return;
        
        
        const factor = 15 + (index * 5);
        const x = moveX * factor;
        const y = moveY * factor;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    
    
    const setupParallaxElements = () => {
      const elements = document.querySelectorAll('.parallax-element');
      parallaxElements.current = Array.from(elements);
    };
    
    setupParallaxElements();
    
    
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, observerOptions);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);
  
  return (
    <div className="about-container" ref={containerRef}>
      
      <div className="about-content">
        <div ref={headerRef} className={`about-header ${isInView ? 'show' : ''}`}>
          <div className="contact-header">
            <h1>ABOUT ME</h1>
          </div>
        </div>
        
        <div className="about-grid">
          <div className={`bio-section ${isInView ? 'show' : ''}`}>
            <div className={`profile-image-container ${isInView ? 'show' : ''}`}>
              <img src={profileImage} alt="Gauri Shankar" className="profile-image" />
              <div className="image-glow"></div>
            </div>
            
            <div className="bio-content">
              <p className={isInView ? 'show' : ''}>
                I'm <span className="highlight-text">GAURI SHANKAR KHADGA</span>, a passionate full-stack developer with expertise in both frontend and backend technologies. With a strong foundation in DevOps practices, I bridge the gap between development and operations to create seamless digital experiences.
              </p>
              <p className={isInView ? 'show' : ''}>
                My journey in tech began 6 months ago, and I've since focused on building personal and academic projects, collaborating with student developers, and solving coding challenges to learn modern web development. I believe in clean code, continuous learning, and pushing the boundaries of what's possible.
              </p>
              
              <div className={`stats-container ${isInView ? 'show' : ''}`}>
                <div className={`stat-item ${isInView ? 'show' : ''}`}>
                  <span className="stat-number">150+</span>
                  <span className="stat-label">Coding Solved</span>
                </div>
                
                <div className={`stat-item ${isInView ? 'show' : ''}`}>
                  <span className="stat-number">12+</span>
                  <span className="stat-label">Projects Built</span>
                </div>
                <div className={`stat-item ${isInView ? 'show' : ''}`}>
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Technologies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
