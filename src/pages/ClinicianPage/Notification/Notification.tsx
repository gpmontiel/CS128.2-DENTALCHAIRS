import "./Notification.css"; 
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";

const RequestSchedule = () => {
    const navigate = useNavigate();
    const [notifFilter, setNotifFilter] = useState("Unread");
    
    return (
        <div className="notif-container"> 
            <Navbar /> 
            <div className="notif-body"> 
                <ul className="notif-filter"> 
                    <li className={notifFilter === "Unread" ? "filter-item active" : "filter-item"} onClick={() => setNotifFilter("Unread")}>Unread</li> 
                    <li className={notifFilter === "All" ? "filter-item active" : "filter-item"} onClick={() => setNotifFilter("All")}>All</li> 
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