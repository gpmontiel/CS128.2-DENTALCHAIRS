import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import ChairManagerNavbar from "../components/ChairManagerNavbar";

const ChairManagerLayout = () => {
    return (
        <Box>
            <ChairManagerNavbar />
            {/* Page content changes here */}
            <Outlet />
        </Box>
    );
};

export default ChairManagerLayout;