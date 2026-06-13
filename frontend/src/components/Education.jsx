import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Award, GraduationCap } from 'lucide-react';
import './Education.css';

const Education = () => {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: '0px' }
    );

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    
    const rowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          } else {
            entry.target.classList.remove('animate');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px' }
    );

    const rows = document.querySelectorAll('.timeline-row');
    rows.forEach((row) => rowObserver.observe(row));

    return () => {
      if (sectionRef.current) {
        sectionObserver.unobserve(sectionRef.current);
      }
      rows.forEach((row) => rowObserver.unobserve(row));
    };
  }, []);

  const educationData = [
    {
      id: 1,
      startYear: "2025",
      endYear: "PRESENT",
      degree: "B.Tech in Computer Science Engineering (AIML)",
      institution: "Parul University",
      department: "Parul Institute of Engineering and Technology",
      status: "Pursuing (Currently in 3rd Year)",
      active: true
    },
    {
      id: 2,
      startYear: "2022",
      endYear: "2025",
      degree: "Diploma in Computer Engineering",
      institution: "Parul University",
      department: "Parul Institute of Engineering and Technology",
      status: "Completed",
      grade: "8.7 CGPA",
      active: false
    },
    {
      id: 3,
      startYear: "2022",
      endYear: "2022",
      degree: "Secondary School Education (SEE)",
      institution: "Shree Narendra Memorial Higher Secondary School",
      department: "Boriya, Saptari - Nepal",
      status: "Completed",
      grade: "GPA 3.32 / 4.00 (83%)",
      active: false
    }
  ];

  return (
    <section className={`education-section ${isInView ? 'in-view' : ''}`} id="education" ref={sectionRef}>
      <div className="education-cosmic">
        <div className="cosmic-spot education-spot-1"></div>
        <div className="cosmic-spot education-spot-2"></div>
      </div>

      <div className="education-container">
        <div className={`contact-header reveal-item ${isInView ? 'show' : ''}`}>
          <h1>EDUCATION</h1>
        </div>

        <div className={`timeline-split-wrapper ${isInView ? 'in-view' : ''}`}>
          <div className="timeline-center-line"></div>
          
          {educationData.map((item, index) => (
            <div 
              key={item.id} 
              className="timeline-row"
            >
              <div className="timeline-year-col">
                <div className="year-display">
                  <span className="year-start">{item.startYear}</span>
                  {item.startYear !== item.endYear && (
                    <>
                      <span className="year-separator">—</span>
                      <span className="year-end">{item.endYear}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="timeline-node-col">
                <div className={`node-dot ${item.active ? 'active-pulse' : ''}`}>
                  <div className="node-inner-dot"></div>
                </div>
              </div>

              <div className="timeline-content-col">
                <div className="content-inner">
                  <h2 className="degree-title">{item.degree}</h2>
                  
                  <div className="institution-info">
                    <span className="institution-name">{item.institution}</span>
                    <span className="institution-separator">•</span>
                    <span className="department-name">{item.department}</span>
                  </div>

                  <div className="badges-group">
                    {item.grade && (
                      <span className="badge-item grade">
                        <Award size={12} className="badge-icon" />
                        {item.grade}
                      </span>
                    )}
                    {item.status && (
                      <span className="badge-item status">
                        <GraduationCap size={12} className="badge-icon" />
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
