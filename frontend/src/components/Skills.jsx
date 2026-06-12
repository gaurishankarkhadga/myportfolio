import React, { useState, useEffect, useRef } from 'react';
import './Skills.css';

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

  
  const skillIconMap = {
    'React': react,
    'JavaScript': javascript,
    'HTML': html5,
    'CSS': css3,
    'PHP': php,
    'Node.js': nodejs,
    'JAVA': java,
    'Python': python,
    'MongoDB': mongodb,
    'SQL': mysql,
    'CI/CD': cicd,
    'AWS': aws,
    'Git': git,
    'Linux': linux
  };

  const skillsData = {
    frontend: [
      { name: 'React', level: 70, description: 'Building complex UI components & state management' },
      { name: 'JavaScript', level: 80, description: 'Modern ES6+, async/await, functional programming' },
      { name: 'HTML', level: 95, description: 'Semantic markup' },
      { name: 'CSS', level: 90, description: 'Flexbox/Grid, animations' },
      { name: 'PHP', level: 50, description: 'Legacy support and CMS development' },
    ],
    backend: [

      { name: 'Node.js', level: 70, description: 'RESTful APIs, middleware, authentication' },
      { name: 'JAVA', level: 60, description: 'Enterprise applications, microservices' },
      { name: 'Python', level: 50, description: 'Data processing, automation, scripting' },
      { name: 'MongoDB', level: 60, description: 'Schema design, aggregation framework' },
      { name: 'SQL', level: 75, description: 'Complex queries, database optimization' }
    ],
    devops: [
      { name: 'CI/CD', level: 75, description: 'Automated testing, deployment pipelines' },
      { name: 'AWS', level: 10, description: 'EC2, S3' },
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
            
            const cards = containerRef.current.querySelectorAll('.skill-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-in');
              }, index * 120); 
            });
          } else {
            
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
    
    
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.skill-card');
      cards.forEach(card => {
        card.classList.remove('animate-in');
      });
      
      
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