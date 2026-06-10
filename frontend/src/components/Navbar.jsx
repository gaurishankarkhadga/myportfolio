import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    // Set active item based on current path
    const path = location.pathname.substring(1) || 'home';
    if (path === 'community' || menuItems.some(item => item.id === path)) {
      setActiveItem(path);
    }
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
          <div className="menu-items">
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