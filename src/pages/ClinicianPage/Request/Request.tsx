import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Request = () => {
    return (
        <div>
            <Navbar />
            <div style={{ paddingTop: "70px" }}>
                <p className="page-title" style={{ textAlign: "center" }}>Clinician Request</p>
                <Outlet />
            </div>
        </div>
    );
};

export default Request;