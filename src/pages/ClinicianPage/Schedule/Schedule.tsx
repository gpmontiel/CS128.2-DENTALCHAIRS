import "./Schedule.css"; 
import { Outlet } from "react-router-dom"; 
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar"; 

const Schedule = () => { 
    const navigate = useNavigate();
    const [schedFilter, setSchedFilter] = useState("Current");
    
    return (
        <div> 
            <Navbar /> 
            <div className="schedule-body"> 
                <ul className="schedule-filter"> 
                    <li className={schedFilter === "Current" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("Current")}>Current</li> 
                    <li className={schedFilter === "Upcoming" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("Upcoming")}>Upcoming</li> 
                    <li className={schedFilter === "History" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("History")}>History</li> 
                </ul> 
                <Outlet />
            </div> 

            <div>
                <button className="add-btn"  onClick={() => navigate("/requestForm")}>+</button>
            </div>
        </div> 
    );
}; 

export default Schedule;