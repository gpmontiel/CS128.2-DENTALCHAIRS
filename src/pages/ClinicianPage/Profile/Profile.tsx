import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Profile = () => {
    return (
        <div>
            <Navbar />
            <div style={{ paddingTop: "70px" }}>
                <p className="page-title" style={{ textAlign: "center" }}>Clinician Profile</p>
                <Outlet />
            </div>
        </div>
    );
};

export default Profile;