import "./RequestForm.css"
import logo from "../../../assets/draft-logo.png";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";

const RequestForm = () => {
    const navigate = useNavigate();
    const [shift, setShift] = useState("");

    return (
        <div className="request-form-container">
            <nav className="request-form-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft />
                    </button>
                </div>

                <div className="nav-center">
                    <span className='logo-text'>DenTrack</span>
                </div>

                <div className="nav-right"></div>
            </nav>

            <div className="request-form-body">
                <div className="logo-form-img">
                    <img src={logo} alt="Dentrack Logo" className="logo-img" />
                </div>
                <p className="request-schedule-title">Request Schedule</p>
                <p className="request-schedule-desc">Fill in the details below to request your dental chair.</p>

                <div className="form-content">
                    <div className="date-shift">
                        <div className="date">
                            <p className="form-input-titles">DATE</p>
                            <input type="date" className="form-input" />
                        </div>

                        <div className="shift">
                            <p className="form-input-titles">SHIFT</p>
                            <div className="toggle-group">
                                <button 
                                    className={`toggle-btn-am ${shift === "AM" ? "active" : ""}`}
                                    onClick={() => setShift("AM")}
                                >
                                    AM
                                </button>

                                <button 
                                    className={`toggle-btn-pm ${shift === "PM" ? "active" : ""}`}
                                    onClick={() => setShift("PM")}
                                >
                                    PM
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="form-input-titles">ROOM AND SECTION</p>
                    <select className="form-input">
                        <option value="">Select Room</option>
                        <option value="Room 1">Room 1</option>
                        <option value="Room 2">Room 2</option>
                    </select>
                    <button className="confirm-btn">CONFIRM</button>
                </div>
            </div>
            
        </div>
    )
}

export default RequestForm;