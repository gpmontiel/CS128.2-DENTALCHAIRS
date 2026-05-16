import * as React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-light.png";

import {AppBar, Box, Toolbar, Typography, Container, Avatar, Divider, Menu, MenuItem, IconButton} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import { supabase } from "../../../utils/supabase";
import "../css/Navbar.css";

const ResponsiveAppBar: React.FC = () => {
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const [firstName, setFirstName] = React.useState("User");
    const [lastName, setLastName] = React.useState("User");
    const [userInitial, setUserInitial] = React.useState("U");
    const [userRole, setUserRole] = React.useState("");
    const [pfpUrl, setPfpUrl] = React.useState("");

    React.useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("first_name, last_name, role_id, pfp")
                .eq("profile_id", user.id)
                .single();

            if (profile) {
                setFirstName(profile.first_name || "User");
                setLastName(profile.last_name || "");
                setUserInitial(profile.first_name?.charAt(0).toUpperCase() || "U");
                setPfpUrl(profile.pfp || "");

                if (profile.role_id) {
                    const { data: role } = await supabase
                        .from("roles")
                        .select("role")
                        .eq("role_id", profile.role_id)
                        .single();

                    setUserRole(role?.role || "Program Manager");
                }
            }
        };

        fetchUserProfile();
    }, []);

    const handleProfile = () => {
        handleCloseMenu();
        navigate("/program-manager/profile");
    };

    const handleLogout = async () => {
        handleCloseMenu();
        await supabase.auth.signOut();
        navigate("/", { replace: true });
    };

    return (
        <AppBar position="static" className="navbar-appbar">
            <Container maxWidth={false} className="navbar-container">
                <Toolbar disableGutters className="navbar-toolbar">

                    {/* LOGO ONLY CLICKABLE */}
                    <Box
                        className="navbar-logo"
                        onClick={() => navigate("/manager")}
                        sx={{ cursor: "pointer" }}
                    >
                        <img src={logo} className="navbar-logo-img" />
                        <Typography className="navbar-title">
                            DenTrack
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* AVATAR */}
                    <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                        <Avatar src={pfpUrl || undefined}>
                            {!pfpUrl && userInitial}
                        </Avatar>
                    </IconButton>

                    {/* MENU */}
                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleCloseMenu}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        slotProps={{
                            paper: {
                                className: "navbar-menu-paper"
                            }
                        }}
                    >
                        {/* USER INFO */}
                        <Box className="navbar-userbox">
                            <Typography fontWeight={600}>
                                {lastName}, {firstName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {userRole}
                            </Typography>
                        </Box>

                        <Divider />

                        {/* PROFILE */}
                        <MenuItem onClick={handleProfile}>
                            <PersonIcon fontSize="small" />
                            <Typography sx={{ ml: 1 }}>Profile</Typography>
                        </MenuItem>

                        <Divider />

                        {/* LOGOUT */}
                        <MenuItem onClick={handleLogout} className="logout-item">
                            <LogoutIcon fontSize="small" />
                            <Typography sx={{ ml: 1 }}>Logout</Typography>
                        </MenuItem>

                    </Menu>

                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default ResponsiveAppBar;