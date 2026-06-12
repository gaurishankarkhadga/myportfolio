import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";
import myimage from './components/myimage.png';
import Home from "./components/Home";
import About from "./components/About";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import NetworkBackground from "./components/NetworkBackground";
import { ChevronUp, ChevronDown } from "lucide-react";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import Login from "./components/auth/Login";
import Community from "./components/Community";
import NotFound from "./components/NotFound";
import Register from "./components/auth/Register";
import SplashCursor from "./components/SplashCursor";

const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  
  return user ? element : <Navigate to="/login" />;
};

const sections = ["home", "about", "education", "skill", "projects", "contact"];

const MainContent = () => {
  const location = useLocation();

  useEffect(() => {

    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          entry.target.classList.toggle('in-viewport', entry.isIntersecting);
        });
      },
      {
        root: null,
        threshold: 0.15,
        rootMargin: '0px'
      }
    );

    
    const observeTimer = setTimeout(() => {
      document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
      });
    }, 1000);

    
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (location.pathname === '/' || sections.includes(location.pathname.substring(1))) {
      
      const path = location.pathname === '/' ? 'home' : location.pathname.substring(1);
      const element = document.getElementById(path);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }

    return () => {
      clearTimeout(observeTimer);
      observer.disconnect();
    };
  }, [sections, location]);

  const handleScrollButton = () => {
    
    const currentPosition = window.scrollY + 50; 
    
    
    for (let i = 0; i < sections.length; i++) {
      const element = document.getElementById(sections[i]);
      if (element && element.offsetTop > currentPosition) {
        
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    
    
    
    const homeSection = document.getElementById('home');
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="app-container loaded">
        <NetworkBackground />
        <div className="noise-overlay"></div>
        
        <main className="main-content" style={{backgroundColor:''}}>
          {[
            { id: "home", Component: Home },
            { id: "about", Component: About },
            { id: "education", Component: Education },
            { id: "skill", Component: Skills },
            { id: "projects", Component: Projects },
            { id: "contact", Component: Contact },
          ].map(({ id, Component }) => (
            <section key={id} id={id}>
              <Component />
            </section>
          ))}
        </main>
        
        <button 
          className="scroll-button" 
          onClick={handleScrollButton}
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </>
  );
};

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <SplashCursor />
        <Routes>
          <Route path="/" element={<Layout><MainContent /></Layout>} />
          <Route path="/home" element={<Layout><MainContent /></Layout>} />
          <Route path="/about" element={<Layout><MainContent /></Layout>} />
          <Route path="/education" element={<Layout><MainContent /></Layout>} />
          <Route path="/skill" element={<Layout><MainContent /></Layout>} />
          <Route path="/projects" element={<Layout><MainContent /></Layout>} />
          <Route path="/contact" element={<Layout><MainContent /></Layout>} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/community" 
            element={
              <Layout>
                <ProtectedRoute element={<Community />} />
              </Layout>
            } 
          />
          
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;