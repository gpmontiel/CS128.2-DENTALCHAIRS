import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Notification = () => {
    return (
        <div>
            <Navbar />
            <div style={{ paddingTop: "70px" }}>
                <p className="page-title" style={{ textAlign: "center" }}>Clinician Notification</p>
                <Outlet />
            </div>
        </div>
    );
};

export default Notification;