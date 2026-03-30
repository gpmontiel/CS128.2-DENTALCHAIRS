import "./RequestSchedule.css"; 
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";

const RequestSchedule = () => {
    const navigate = useNavigate();
    const [schedFilter, setSchedFilter] = useState("Pending");
    
    return (
        <div> 
            <Navbar /> 
            <div className="request-body"> 
                <ul className="request-filter"> 
                    <li className={schedFilter === "Pending" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("Pending")}>Pending</li> 
                    <li className={schedFilter === "Rejected" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("Rejected")}>Rejected</li> 
                </ul> 
                <Outlet />
            </div> 

            <div>
                <button className="add-btn"  onClick={() => navigate("/requestForm")}>+</button>
            </div>
        </div> 
    );
};

export default RequestSchedule;