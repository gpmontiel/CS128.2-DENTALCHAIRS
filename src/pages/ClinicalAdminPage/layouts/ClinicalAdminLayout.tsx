import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";

const ClinicalAdminLayout = () => {
    return (
        <Box>
            <Navbar />
            {/* Page content changes here */}
            <Outlet />
        </Box>
    );
};

export default ClinicalAdminLayout;