import React, { useState, useEffect, useRef } from 'react';
import './Skills.css';

// Import your SVG icons
import cicd from './svgicons/ci-cd-svgrepo-com.svg';
import css3 from './svgicons/css-3-svgrepo-com.svg';
import docker from './svgicons/docker-svgrepo-com.svg';
import git from './svgicons/git-svgrepo-com.svg';
import html5 from './svgicons/html-5-svgrepo-com.svg';
import java from './svgicons/java-svgrepo-com.svg';
import linux from './svgicons/linux-svgrepo-com.svg';
import mongodb from './svgicons/mongodb-svgrepo-com.svg';
import mysql from './svgicons/mysql-logo-svgrepo-com.svg';
import nextjs from './svgicons/nextjs-icon-svgrepo-com.svg';
import nodejs from './svgicons/node-js-svgrepo-com.svg';
import php from './svgicons/php-svgrepo-com.svg';
import python from './svgicons/python-svgrepo-com.svg';
import react from './svgicons/react-svgrepo-com.svg';
import aws from './svgicons/aws-svgrepo-com.svg';
import javascript from './svgicons/javascript-svgrepo-com.svg';

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('frontend');
  const [isInView, setIsInView] = useState(false);
  const skillCardsRef = useRef([]);
  const containerRef = useRef(null);

  // Map skill names to their corresponding icons
  const skillIconMap = {
    'React': react,
    'JavaScript': javascript,
    'HTML': html5,
    'CSS': css3,
    'Next.js': nextjs,
    'PHP': php,
    'Node.js': nodejs,
    'JAVA': java,
    'Python': python,
    'MongoDB': mongodb,
    'SQL': mysql,
    'Docker': docker,
    'CI/CD': cicd,
    'AWS': aws,
    'Git': git,
    'Linux': linux
  };

  const skillsData = {
    frontend: [
      { name: 'React', level: 90, description: 'Building complex UI components & state management' },
      { name: 'JavaScript', level: 85, description: 'Modern ES6+, async/await, functional programming' },
      { name: 'HTML', level: 95, description: 'Semantic markup' },
      { name: 'CSS', level: 90, description: 'Flexbox/Grid, animations' },
      { name: 'Next.js', level: 85, description: 'Server-side rendering, API routes, static generation' },
      { name: 'PHP', level: 70, description: 'Legacy support and CMS development' },
    ],
    backend: [
      { name: 'Node.js', level: 85, description: 'RESTful APIs, middleware, authentication' },
      { name: 'JAVA', level: 85, description: 'Enterprise applications, microservices' },
      { name: 'Python', level: 75, description: 'Data processing, automation, scripting' },
      { name: 'MongoDB', level: 80, description: 'Schema design, aggregation framework' },
      { name: 'SQL', level: 75, description: 'Complex queries, database optimization' }
    ],
    devops: [
      { name: 'Docker', level: 80, description: 'Containerization, multi-container applications' },
      { name: 'CI/CD', level: 75, description: 'Automated testing, deployment pipelines' },
      { name: 'AWS', level: 70, description: 'S3, EC2, Lambda, CloudFront, Route53' },
      { name: 'Git', level: 90, description: 'Advanced branching strategies, workflow automation' },
      { name: 'Linux', level: 85, description: 'Server configuration, shell scripting' }
    ]
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
      observer.observe(skillsSection);
    }

    return () => {
      if (skillsSection) {
        observer.unobserve(skillsSection);
      }
    };
  }, []);

  useEffect(() => {
    // Set up the observer for the cards container
    const observeCards = () => {
      if (!containerRef.current) return;
      
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Trigger animation for all cards when container is visible
            const cards = containerRef.current.querySelectorAll('.skill-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-in');
              }, index * 120); // Staggered delay
            });
          } else {
            // Reset animations when container is out of view
            const cards = containerRef.current.querySelectorAll('.skill-card');
            cards.forEach(card => {
              card.classList.remove('animate-in');
            });
          }
        });
      }, options);
      
      observer.observe(containerRef.current);
      
      return observer;
    };
    
    const observer = observeCards();
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // Reset animations when changing categories
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.skill-card');
      cards.forEach(card => {
        card.classList.remove('animate-in');
      });
      
      // Add a small delay before triggering new category animations
      setTimeout(() => {
        const newCards = containerRef.current.querySelectorAll('.skill-card');
        newCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('animate-in');
          }, index * 120);
        });
      }, 50);
    }
  };

  return (
    <section className={`skills-section ${isInView ? 'in-view' : ''}`}>
      <div className="skills-container">
         <div className="contact-header">
            <h1>MY SKILLS</h1>
          </div>

        <div className={`skills-tabs ${isInView ? 'tabs-animate' : ''}`}>
          {Object.keys(skillsData).map((category) => (
            <button
              key={category}
              className={`tab-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="skills-cards-container" ref={containerRef}>
          {skillsData[activeCategory].map((skill, index) => (
            <div 
              key={`${activeCategory}-${index}`} 
              className="skill-card"
              ref={el => skillCardsRef.current[index] = el}
              style={{"--delay": `${index * 0.12}s`, "--skill-level": `${skill.level}%`}}
            >
              <div className="skill-card-header">
                <div className="skill-card-title-group">
                  <img 
                    src={skillIconMap[skill.name]} 
                    alt={`${skill.name} icon`} 
                    className="skill-icon"
                  />
                  <span className="skill-name">{skill.name}</span>
                </div>
                <span className="skill-percentage">{skill.level}%</span>
              </div>
              
              <div className="skill-level-container">
                <div 
                  className="skill-level" 
                  style={{"--width": `${skill.level}%`}}
                ></div>
              </div>
              
              <div className="skill-description">
                <p>{skill.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;