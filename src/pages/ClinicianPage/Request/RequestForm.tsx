import "./RequestForm.css"
import logo from "../../../assets/logo-light.png";
import { supabase } from "../../../utils/supabase";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { Error } from "@mui/icons-material";

const RequestForm = () => {
    const navigate = useNavigate();
    const [shift, setShift] = useState("");
    const [submitModal, setSubmitModal] = useState(false);
    const [chosenSection, setChosenSection] = useState("");
    const [chosenDate, setChosenDate] = useState<string>("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [successOpen, setSuccessOpen] = useState(false);

    const toggleSubmitModal = () => {
        setSubmitModal(!submitModal);
    };

    const insertSched = async () => {
        if (!chosenDate || !shift || !chosenSection) {
            console.error("Form is incomplete");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const newSched = {
            student_id: userId,
            section_id: Number(chosenSection),
            date: chosenDate,
            shift: shift,
            status: "Pending"
        };

        const { data: insertData, error } = await supabase
            .from("dental_chairs_request_assignment")
            .insert([newSched])
            .single();

        if (error) {
            console.error("Insert error:", error);
            return;
        }

        console.log("Inserted successfully:", insertData);

        setSubmitModal(false);
        setSuccessOpen(true);
        setTimeout(() => {
            navigate(-1);
        }, 2000);
    };

    const getSection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChosenSection(e.target.value);
    }

    const getDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChosenDate(e.target.value); 
    };

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
                            <input type="date" className="form-input" onChange={getDate}/>
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
                    <select className="form-input" defaultValue="" onChange={getSection}>
                        <option value="" disabled hidden>
                            Select Room
                        </option>
                        <option value="1">OD - Oral Diagnosis/Triage</option>
                        <option value="2">OS - OS</option>
                        <option value="3">OM - Perio</option>
                        <option value="4">OM - Endo</option>
                        <option value="5">OP - FPD</option>
                        <option value="6">OP - Resto</option>
                        <option value="7">Prostho - RPD</option>
                        <option value="8">Prostho - Complete Denture</option>
                        <option value="9">Ortho - Ortho</option>
                    </select>
                    <button
                        className="confirm-btn"
                        onClick={() => {
                            if (!chosenDate || !shift || !chosenSection) {
                                setSnackbarMessage("Please complete all fields before continuing.");
                                setSnackbarOpen(true);
                                return;
                            }

                            toggleSubmitModal();
                        }}
                    >
                        CONFIRM
                    </button>
                </div>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                sx={{ mt: 2 }}
            >
                <Alert
                    icon={<Error />}
                    severity="error"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={successOpen}
                autoHideDuration={2000}
                onClose={() => setSuccessOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                sx={{ mt: 2 }}
            >
                <Alert severity="success">
                    Request submitted successfully!
                </Alert>
            </Snackbar>

            {submitModal && (
                <div className="submit-modal">
                    <div className="submit-modal-overlay" onClick={toggleSubmitModal}></div>
                    <div className="submit-modal-content">
                        <h2 style={{fontWeight: 650, fontSize: "23px", fontFamily: "Poppins, sans-serif"}}>Are you sure?</h2>
                        <p style={{fontSize: "17px"}}>This action cannot be undone. Please make sure your details are correct.</p>
                        <div className="submit-modal-btn">
                            <button className="go-back-btn" onClick={toggleSubmitModal}>Go Back</button>
                            <button className="submit-btn" onClick={insertSched}>SUBMIT</button>
                        </div>
                    </div>
                </div>
                )
            }
            
        </div>
    )
}

export default RequestForm;