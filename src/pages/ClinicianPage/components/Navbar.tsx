import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Offcanvas } from "bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Navbar.css';
import logo from "../../../assets/draft-logo.png";
import profileIcon from "../../../assets/profile-icon-blank.png"


const Navbar = () => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [roleOpen, setRoleOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavClick = (path: string) => {
        const offcanvasElement = document.getElementById('sidebarDrawer');
        const bsOffcanvas = Offcanvas.getInstance(offcanvasElement);
        
        if (bsOffcanvas) {
            bsOffcanvas.hide();
        }

        navigate(path);
    };

    return (
        <nav className="navbar custom-navbar fixed-top">
            <div className="container-fluid">
                {/* Show hamburger only on mobile */}
                {isMobile && (
                    <button 
                        className="navbar-toggler navbar-dark" 
                        type="button" 
                        data-bs-toggle="offcanvas" 
                        data-bs-target="#sidebarDrawer" 
                        aria-controls="sidebarDrawer"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                )}

                <a className="navbar-brand" href="#">
                    <img src={logo} alt="Dentrack Logo" className="logo-img" />
                    <span className='logo-text'>DenTrack</span>
                </a>

                {/* Desktop navigation links - shown only on desktop */}
                {!isMobile && (
                    <div className="desktop-nav">
                        <Link to="/clinician" className="nav-link text-white mx-2">SCHEDULE</Link>
                        <Link to="/clinicianRequest" className="nav-link text-white mx-2">REQUEST</Link>
                        <Link to="/clinicianNotification" className="nav-link text-white mx-2">NOTIFICATION</Link>
                    </div>
                )}

                {/* Profile button - always visible */}
                <div className="profile">
                    <button 
                        className="profile-btn"
                        onClick={() => setProfileOpen(!profileOpen)}
                    >
                        <img src={profileIcon} alt="Profile Icon" className="profile-img" />
                    </button>
                    {profileOpen && (
                        <div className="dropdown-menu show position-absolute end-0 mt-2">
            
                        {/* SWITCH ROLES */}
                        <div>
                            <button 
                                className={`switch-role-btn ${roleOpen ? "active" : ""}`}
                                onClick={() => setRoleOpen(!roleOpen)}
                            >
                                Switch Roles
                                <span className={`arrow ${roleOpen ? "open" : ""}`}>
                                    ▼
                                </span>
                            </button>

                            {roleOpen && (
                                <div className="role-dropdown">
                                    <button className="role-item">Clinician</button>

                                    <button 
                                        className="role-item"
                                        onClick={() => navigate("/chair-manager")}
                                    >
                                        Chair Manager
                                    </button>
                                </div>
                            )}
                        </div>

                            <button className="view-profile-btn" onClick={() => {
                                navigate("/clinicianProfile");
                                setProfileOpen(false);
                            }}>Profile
                            </button>

                            <button className="logout-btn" onClick={() => navigate("/login")}>Logout</button>
                        </div>
                    )}
                </div>

                {/*Sidebar - only used on mobile */}
                <div 
                    className="offcanvas offcanvas-start text-bg-dark" 
                    tabIndex="-1" 
                    id="sidebarDrawer" 
                    aria-labelledby="sidebarLabel"
                >
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="sidebarLabel">Menu</h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            data-bs-dismiss="offcanvas" 
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="offcanvas-body">
                        <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                            <button onClick={() => handleNavClick("/clinician")} className="nav-link">
                                Schedule
                            </button>

                            <button onClick={() => handleNavClick("/clinicianRequest")} className="nav-link">
                                Requests
                            </button>

                            <button onClick={() => handleNavClick("/clinicianNotification")} className="nav-link">
                                Notifications
                            </button>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;