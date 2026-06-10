import React, { useEffect, useRef, useState } from 'react';
import './About.css';

// import profileImage from './mrx.jpg'; 
// import profileImage from './ann.png';


import profileImage from './rightview.jpg';

const About = () => {
  const containerRef = useRef(null);
  const parallaxElements = useRef([]);
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    bioSection: false,
    statsSection: false
  });

  const headerRef = useRef(null);
  const bioRef = useRef(null);
  const statsRef = useRef(null);
  
  useEffect(() => {
    // Handle parallax effect for decorative elements
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate how far the mouse is from the center in percentage
      const moveX = (clientX - centerX) / (rect.width / 2);
      const moveY = (clientY - centerY) / (rect.height / 2);
      
      // Apply parallax effect to elements
      parallaxElements.current.forEach((element, index) => {
        if (!element) return;
        
        // Different elements move at different speeds
        const factor = 15 + (index * 5);
        const x = moveX * factor;
        const y = moveY * factor;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    
    // Set initial position for elements
    const setupParallaxElements = () => {
      const elements = document.querySelectorAll('.parallax-element');
      parallaxElements.current = Array.from(elements);
    };
    
    setupParallaxElements();
    
    // Intersection Observer for visibility
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === headerRef.current) {
          setVisibleSections(prev => ({ ...prev, header: entry.isIntersecting }));
        } else if (entry.target === bioRef.current) {
          setVisibleSections(prev => ({ ...prev, bioSection: entry.isIntersecting }));
        } else if (entry.target === statsRef.current) {
          setVisibleSections(prev => ({ ...prev, statsSection: entry.isIntersecting }));
        }
      });
    }, observerOptions);

    if (headerRef.current) sectionObserver.observe(headerRef.current);
    if (bioRef.current) sectionObserver.observe(bioRef.current);
    if (statsRef.current) sectionObserver.observe(statsRef.current);
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      sectionObserver.disconnect();
    };
  }, []);
  
  return (
    <div className="about-container" ref={containerRef}>
      <div className="noise-overlay"></div>
      <div className="about-cosmic"></div>
      
      
      
      <div className="about-content">
        <div ref={headerRef} className={`about-header animated ${visibleSections.header ? 'show' : 'hide-up'}`}>
          <div className="contact-header">
            <h1>ABOUT ME</h1>
          </div>
          
        </div>
        
        <div className="about-grid">
          {/* Bio Section */}
          <div ref={bioRef} className={`bio-section animated ${visibleSections.bioSection ? 'show' : 'hide-up'}`}>
            <div className={`profile-image-container animated ${visibleSections.bioSection ? 'show' : 'hide-up'}`}>
              <img src={profileImage} alt="Gauri Shankar" className="profile-image" />
              {/* <div className="image-glow"></div> */}
            </div>
            
            <div className="bio-content">
              <p className={visibleSections.bioSection ? 'show' : 'hide-up'}>I'm <span className="highlight-text">GAURI SHANKAR KHADGA</span>, a passionate full-stack developer with expertise in both frontend and backend technologies. With a strong foundation in DevOps practices, I bridge the gap between development and operations to create seamless digital experiences.</p>
              <p className={visibleSections.bioSection ? 'show' : 'hide-up'}>My journey in tech began 6th  Month ago, and I've since collaborated with startups and established companies to build scalable applications that solve real-world problems. I believe in clean code, continuous learning, and pushing the boundaries of what's possible with modern web technologies.</p>
              
              <div ref={statsRef} className={`stats-container ${visibleSections.statsSection ? 'show' : 'hide-up'}`}>
                <div className="stat-item animated">
                  <span className="stat-number">2+</span>
                  <span className="stat-label">Years Experience</span>
                </div>
                
                <div className="stat-item animated">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Projects Completed</span>
                </div>
                <div className="stat-item animated">
                  <span className="stat-number">7+</span>
                  <span className="stat-label">Happy Clients</span>
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