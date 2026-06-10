import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";
import myimage from './components/myimage.png';
import Home from "./components/Home";
import About from "./components/About";
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









// Protected route component that checks authentication
const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  
  return user ? element : <Navigate to="/login" />;
};

const sections = ["home", "about", "skill", "projects", "contact"];

// The main content component that handles scrolling and animations
const MainContent = () => {
  const location = useLocation();

  useEffect(() => {

    // Intersection Observer for section visibility
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

    // Observe sections after DOM load
    const observeTimer = setTimeout(() => {
      document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
      });
    }, 1000);

    // Scroll to appropriate section when route changes
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (location.pathname === '/' || sections.includes(location.pathname.substring(1))) {
      // If we have a route like /about, scroll to that section
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
    // Get current scroll position
    const currentPosition = window.scrollY + 50; // Add small offset
    
    // Find the next section
    for (let i = 0; i < sections.length; i++) {
      const element = document.getElementById(sections[i]);
      if (element && element.offsetTop > currentPosition) {
        // Found next section, scroll to it
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    // If we get here, we didn't find a next section,
    // which means we're at or near the bottom,
    // so scroll to home section
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
            { id: "skill", Component: Skills },
            { id: "projects", Component: Projects },
            { id: "contact", Component: Contact },
          ].map(({ id, Component }) => (
            <section key={id} id={id}>
              <Component />
            </section>
          ))}
        </main>
        
        {/* Single scroll button */}
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

// Layout component that includes Navbar for all pages
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// Routes configuration for the app
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main content routes with Layout */}
          <Route path="/" element={<Layout><MainContent /></Layout>} />
          <Route path="/home" element={<Layout><MainContent /></Layout>} />
          <Route path="/about" element={<Layout><MainContent /></Layout>} />
          <Route path="/skill" element={<Layout><MainContent /></Layout>} />
          <Route path="/projects" element={<Layout><MainContent /></Layout>} />
          <Route path="/contact" element={<Layout><MainContent /></Layout>} />
          
          {/* Auth routes without the full Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Community route with Layout */}
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