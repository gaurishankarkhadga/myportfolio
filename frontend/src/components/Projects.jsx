import React, { useState, useEffect, useRef } from 'react';
import { Github, ExternalLink, Star, ChevronDown } from 'lucide-react';
import './Projects.css';

import myfirst from './myfirst.png';
import youtube from './youtube.png';
import gshankarai from './chatai.png';
import business from './business.png';
import ecommerce from './ecommerce.png';
import adBlocker from './addblocker.png';
import mstar from './mstar.png';  
import quickx from './quickx.png';  
import gsharpi from './gsharpi.png';  

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  const cardRefs = useRef({});

  
  const projects = [
    {
      id: 1,
      title: "MrChat AI",
      description: "An AI-powered chat application with natural language processing capabilities.",
      category: "ai",
      featured: true,
      technologies: ["React", "OpenAI API", "Node.js", "Express", "MongoDB"],
      image: gshankarai,
      liveLink: "https://mrchatai.netlify.app",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 2,
      title: "Gaurishankar's First Site",
      description: "Personal portfolio website showcasing projects and skills.",
      category: "web",
      featured: false,
      technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
      image: myfirst,
      liveLink: "https://gshankarfirstsite.netlify.app",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 3,
      title: "My Business",
      description: "Business management platform with inventory tracking and reporting features.",
      category: "web",
      featured: true,
      technologies: ["React", "Node.js", "MongoDB", "Express", "Chart.js"],
      image: business,
      liveLink: "https://mr-gaurishankar-khadga.github.io/mybusiness",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 4,
      title: "Wenli.in",
      description: "E-commerce platform with product management and payment processing.",
      category: "web",
      featured: false,
      technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe API"],
      image: ecommerce,
      liveLink: "https://wenli.in",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 5,
      title: "YouTube Looks Like",
      description: "YouTube clone with video uploading, viewing, and commenting functionality.",
      category: "web",
      featured: false,
      technologies: ["React", "Firebase", "Redux", "Material UI"],
      image: youtube,
      liveLink: "https://youtubelookslike.netlify.app",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 6,
      title: "Ad Blocker Chrome Extension",
      description: "Chrome extension that blocks advertisements on websites.",
      category: "tools",
      featured: false,
      technologies: ["JavaScript", "Chrome API", "CSS"],
      image: adBlocker,
      liveLink: "#",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 7,
      title: "mstar - NPM Package",
      description: "Utility library for JavaScript projects with helpful functions and tools.",
      category: "package",
      featured: false,
      technologies: ["JavaScript", "Node.js", "NPM"],
      image: mstar,
      liveLink: "https://www.npmjs.com/package/mstar",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 8,
      title: "gsharpi - NPM Package",
      description: "Framework for building CLI applications with Node.js.",
      category: "package",
      featured: false,
      technologies: ["JavaScript", "Node.js", "NPM", "CLI"],
      image: gsharpi,
      liveLink: "https://www.npmjs.com/package/gsharpi",
      codeLink: "https://github.com/settings/profile"
    },
    {
      id: 9,
      title: "quickx - NPM Package",
      description: "Fast, lightweight utility library for common operations in JavaScript.",
      category: "package",
      featured: false,
      technologies: ["JavaScript", "Node.js", "NPM"],
      image: quickx,
      liveLink: "https://www.npmjs.com/package/quickx",
      codeLink: "https://github.com/settings/profile"
    }
  ];

  const categories = [
    { name: "All Projects", value: "all" },
    { name: "Web Applications", value: "web" },
    { name: "AI Projects", value: "ai" },
    { name: "Tools", value: "tools" },
    { name: "NPM Packages", value: "package" }
  ];

  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current.classList.add('section-visible');
          sectionRef.current.classList.remove('section-hidden');
          setIsInView(true);
        } else {
          sectionRef.current.classList.add('section-hidden');
          sectionRef.current.classList.remove('section-visible');
          setIsInView(false);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        } else {
          entry.target.classList.remove('in-viewport');
        }
      });
    }, observerOptions);

    
    Object.values(cardRefs.current).forEach(ref => {
      if (ref) {
        cardObserver.observe(ref);
      }
    });

    return () => {
      
      Object.values(cardRefs.current).forEach(ref => {
        if (ref) {
          cardObserver.unobserve(ref);
        }
      });
    };
  }, [filteredProjects, visibleCount]);

  
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(item => item.category === activeFilter));
    }
    setVisibleCount(6);
  }, [activeFilter]);

  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.project-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 3);
  };

  return (
    <section className="projects-section" id="projects" ref={sectionRef}>
      <div className="projects-container">
        <div className={`projects-header ${isInView ? 'header-visible' : ''}`}>
           <div className="contact-header">
              <h1>MY PROJECTS</h1>
            </div>
          <p className="projects-subheading">
            Explore my portfolio of innovative solutions across different technologies
          </p>
        </div>

        <div className={`all-projects ${isInView ? 'content-visible' : ''}`}>
          <div className="filter-container">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`filter-btn ${activeFilter === category.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(category.value)}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="projects-grid">
            {filteredProjects.slice(0, visibleCount).map((project) => (
              <div 
                className="project-card"
                key={project.id}
                ref={el => cardRefs.current[project.id] = el}
              >
                <div className="project-img-container">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="project-img"
                  />
                  <div className="img-overlay">
                    <div className="overlay-content">
                      <div className="overlay-links">
                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={20} />
                        </a>
                        <a href={project.codeLink} target="_blank" rel="noopener noreferrer">
                          <Github size={20} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech-stack">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="tech-more">+{project.technologies.length - 3}</span>
                    )}
                  </div>
                  <div className="project-links">
                    <a 
                      href={project.codeLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="project-link"
                    >
                      <Github size={14} /> Code
                    </a>
                    <a 
                      href={project.liveLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="project-link"
                    >
                      <ExternalLink size={14} /> Demo
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProjects.length > visibleCount && (
            <div className="load-more-container">
              <button 
                className="load-more-btn" 
                onClick={handleLoadMore}
              >
                Load More Projects <ChevronDown size={16} className="ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;