import "./RequestForm.css"
import logo from "../../../assets/logo-light.png";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";

const RequestForm = () => {
    const navigate = useNavigate();
    const [shift, setShift] = useState("");
    const [submitModal, setSubmitModal] = useState(false);

    const toggleSubmitModal = () => {
        setSubmitModal(!submitModal);
    }

    return (
        <div className="request-form-container">
            <nav className="request-form-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft />
                    </button>
                </div>

                <div className="nav-center">
                    <span className='logo-text' style={{
                        color: "#E9B0F8",
                        fontFamily: "Poppins, sans-serif"}}
                        >DenTrack
                    </span>
                </div>

                <div className="nav-right"></div>
            </nav>

            <div className="request-form-body">
                <div className="logo-form-img">
                    <img src={logo} alt="Dentrack Logo" className="logo-img" />
                </div>
                <p className="request-schedule-title" style={{fontFamily: "Poppins, sans-serif"}}>Request Schedule</p>
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
                    <button className="confirm-btn" onClick={toggleSubmitModal}>CONFIRM</button>
                </div>
            </div>

            {submitModal && (
                <div className="submit-modal">
                    <div className="submit-modal-overlay" onClick={toggleSubmitModal}></div>
                    <div className="submit-modal-content">
                        <h2 style={{fontWeight: 650, fontSize: "23px", fontFamily: "Poppins, sans-serif"}}>Are you sure?</h2>
                        <p style={{fontSize: "17px"}}>This action cannot be undone. Please make sure your details are correct.</p>
                        <div className="submit-modal-btn">
                            <button className="go-back-btn" onClick={toggleSubmitModal}>Go Back</button>
                            <button className="submit-btn" onClick={toggleSubmitModal}>SUBMIT</button>
                        </div>
                    </div>
                </div>
                )
            }
            
        </div>
    )
}

export default RequestForm;