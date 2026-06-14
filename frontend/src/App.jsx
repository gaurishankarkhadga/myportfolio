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
import { ArrowUp, ArrowDown } from "lucide-react";
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

  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        // If user scrolls past the top of the contact section (minus a offset margin)
        const isAtContact = window.scrollY >= contactSection.offsetTop - 200;
        setIsAtBottom(isAtContact);
      } else {
        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;
        setIsAtBottom(isBottom);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const smoothScrollTo = (targetElement, duration = 1200) => {
    // Temporarily disable CSS smooth scroll to prevent buffering/conflicts with JS loop
    document.documentElement.style.scrollBehavior = 'auto';

    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        // Restore CSS smooth scroll once finished
        document.documentElement.style.scrollBehavior = 'smooth';
      }
    };

    requestAnimationFrame(animation);
  };

  const handleScrollButton = () => {
    if (isAtBottom) {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        smoothScrollTo(homeSection, 1500);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const currentPosition = window.scrollY + 50; 
    for (let i = 0; i < sections.length; i++) {
      const element = document.getElementById(sections[i]);
      if (element && element.offsetTop > currentPosition) {
        smoothScrollTo(element, 1200);
        return;
      }
    }

    const homeSection = document.getElementById('home');
    if (homeSection) {
      smoothScrollTo(homeSection, 1500);
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
          {isAtBottom ? <ArrowUp size={24} /> : <ArrowDown size={24} />}
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