import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Schedule = () => {
    return (
        <div>
            <Navbar />
            <div style={{ paddingTop: "70px" }}>
                <p className="page-title" style={{ textAlign: "center" }}>Clinician Schedule</p>
                <Outlet />
            </div>
        </div>
    );
};

export default Schedule;