import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./Navbar.css";
// Import Material UI components
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
// Import Lucide icons
import { Home, User, Briefcase, Code, Mail, Users } from "lucide-react";
// Add animation keyframes
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";

// Create enhanced animated components
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const slideIn = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const glow = keyframes`
  0% {
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 5px rgba(100, 149, 237, 0.9));
  }
  100% {
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
  }
`;

const AnimatedIcon = styled('span')`
  display: inline-flex;
  animation: ${pulse} 3s infinite ease-in-out;
  margin-right: 24px;
  transition: transform 0.3s ease;
  
  &:hover {
    animation: ${glow} 1.5s infinite ease-in-out;
    transform: scale(1.2);
  }
`;

const AnimatedText = styled('span')`
  display: inline-block;
  animation: ${fadeIn} 0.5s forwards;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 0;
    background: linear-gradient(90deg, transparent, #fff, transparent);
    transition: width 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
  }
`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeItem, setActiveItem] = useState("home");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isClickScrolling = useRef(false);
  const clickScrollTimeout = useRef(null);
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const updateIndicator = () => {
      if (!containerRef.current) return;
      const activeEl = containerRef.current.querySelector(".menu-item.active");
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    
    // Multiple timeouts to handle initial loading layout shifts
    const timer1 = setTimeout(updateIndicator, 100);
    const timer2 = setTimeout(updateIndicator, 500);
    const timer3 = setTimeout(updateIndicator, 1500);
    const timer4 = setTimeout(updateIndicator, 2500);

    window.addEventListener("resize", updateIndicator);
    return () => {
      window.removeEventListener("resize", updateIndicator);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [activeItem]);

  useEffect(() => {
    // Set active item based on current path
    const path = location.pathname.substring(1) || 'home';
    if (path === 'community' || menuItems.some(item => item.id === path)) {
      setActiveItem(path);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Scroll spy logic: observe sections to update active nav link on scroll
    const sectionPagePaths = ["/", "/home", "/about", "/skill", "/projects", "/contact"];
    if (!sectionPagePaths.includes(location.pathname)) {
      return;
    }

    const sectionsToObserve = ["home", "about", "skill", "projects", "contact"];
    
    const observerOptions = {
      root: null,
      // Focus on the top-to-middle portion of the viewport for active selection
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const observerCallback = (entries) => {
      if (isClickScrolling.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveItem(id);
          
          // Sync browser address bar with current active section without triggering react router reload
          const path = id === "home" ? "/" : `/${id}`;
          if (window.location.pathname !== path) {
            window.history.replaceState(null, "", path);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const timer = setTimeout(() => {
      sectionsToObserve.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickScrollTimeout.current) {
        clearTimeout(clickScrollTimeout.current);
      }
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleItemClick = (id) => {
    setActiveItem(id);
    closeMenu();
    
    // Check if this is the community item and user is not logged in
    if (id === "community" && !user) {
      // Navigate to login
      navigate("/login");
      return false;
    }

    // Set temporary ignore flag to avoid scroll spy updating active state during smooth scroll transition
    isClickScrolling.current = true;
    if (clickScrollTimeout.current) {
      clearTimeout(clickScrollTimeout.current);
    }
    clickScrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);

    return true;
  };

  // Updated menu items array with paths
  const menuItems = [
    { path: "/", label: "Home", icon: Home, id: "home" },
    { path: "/about", label: "About", icon: User, id: "about" },
    { path: "/skill", label: "Skills", icon: Code, id: "skill" },
    { path: "/projects", label: "Projects", icon: Briefcase, id: "projects" },
    { path: "/contact", label: "Contact", icon: Mail, id: "contact" },
    { path: "/community", label: "Community", icon: Users, id: "community" },
  ];

  const visibleMenuItems = menuItems.filter(item => item.id !== "community");

  // Enhanced drawer content with staggered animations
  const drawerContent = (
    <List sx={{ padding: "10px 0", paddingTop: "20px" }}>
      {visibleMenuItems.map((item, index) => {
        const IconComponent = item.icon;
        const isActive = activeItem === item.id;
        
        return (
          <ListItem 
            disablePadding 
            key={index}
            sx={{
              animation: `${slideIn} 0.4s forwards`,
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
            }}
          >
            <Link
              to={item.path}
              className={`menu-item ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                if (!handleItemClick(item.id)) {
                  e.preventDefault();
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 24px",
                width: "100%",
                color: isActive ? "#64f4ac" : "white",
                textDecoration: "none",
                transition: "all 0.3s ease",
                borderLeft: isActive ? "4px solid #64f4ac" : "4px solid transparent",
                background: isActive ? "rgba(100, 244, 172, 0.1)" : "transparent",
              }}
            >
              <AnimatedIcon 
                sx={{
                  color: isActive ? "#64f4ac" : "white",
                }}
              >
                <IconComponent 
                  size={24} 
                  style={{
                    animation: item.id === "community" ? `${glow} 2s infinite ease-in-out` : "none"
                  }}
                />
              </AnimatedIcon>
              <AnimatedText>
                {item.label}
              </AnimatedText>
            </Link>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <Link to="/" className="logo" onClick={() => handleItemClick('home')}>
          GAURI SHANKAR
        </Link>

        {isMobile && (
          <button className="menu-button" onClick={toggleMenu}>
            <div className={`hamburger-icon ${isMenuOpen ? "active" : ""}`}>
              <span className="line line-1"></span>
              <span className="line line-2"></span>
              <span className="line line-3"></span>
            </div>
          </button>
        )}

        {/* Desktop menu - now using Link components */}
        {!isMobile && (
          <div className="menu-items" ref={containerRef}>
            {/* Smooth sliding indicator bar */}
            <div 
              className="nav-indicator" 
              style={{
                position: "absolute",
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
                height: "3px",
                bottom: "0",
                transition: "left 0.35s cubic-bezier(0.25, 1, 0.5, 1), width 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease",
                pointerEvents: "none",
                zIndex: 1,
                display: "flex",
                justifyContent: "center"
              }}
            >
              <div 
                style={{
                  width: "60%",
                  height: "100%",
                  background: "linear-gradient(90deg, #3bf680, #00f3ff)",
                  boxShadow: "0 0 10px rgba(59, 246, 128, 0.8), 0 0 20px rgba(0, 243, 255, 0.4)",
                  borderRadius: "3px"
                }}
              />
            </div>
            {visibleMenuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  if (!handleItemClick(item.id)) {
                    e.preventDefault();
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Enhanced mobile drawer with animations */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={isMenuOpen}
            onClose={closeMenu}
            keepMounted
            variant="temporary"
            SlideProps={{
              appear: true,
              timeout: 400
            }}
            transitionDuration={{ enter: 400, exit: 300 }}
            sx={{
              "& .MuiPaper-root": {
                width: "280px",
                backgroundColor: "#0f0f0f",
                color: "white",
                backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), radial-gradient(circle at top right, rgba(100, 244, 172, 0.1), transparent 70%)",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
              },
              "& .MuiBackdrop-root": {
                backgroundColor: "rgba(0, 0, 0, 0.6)"
              }
            }}
          >
            {drawerContent}
          </Drawer>
        )}
      </nav>
    </div>
  );
};

export default Navbar;