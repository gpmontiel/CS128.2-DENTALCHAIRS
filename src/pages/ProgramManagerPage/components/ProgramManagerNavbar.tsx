import * as React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-light.png";

import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Container,
    Avatar,
    Divider,
    Menu,
    MenuItem,
    IconButton
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import { supabase } from "../../../utils/supabase.ts";

const ResponsiveAppBar: React.FC = () => {
    const navigate = useNavigate();

    // DESKTOP MENU
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // USER STATE
    const [firstName, setFirstName] = React.useState<string>("User");
    const [lastName, setLastName] = React.useState<string>("User");
    const [userInitial, setUserInitial] = React.useState<string>("U");
    const [userRole, setUserRole] = React.useState<string>("");
    const [pfpUrl, setPfpUrl] = React.useState<string>("");

    React.useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("first_name, last_name, role_id, pfp")
                    .eq("profile_id", user.id)
                    .single();

                if (profile) {
                    const fn = profile.first_name || "User";
                    const ln = profile.last_name || "";

                    setFirstName(fn);
                    setLastName(ln);
                    setUserInitial(fn.charAt(0).toUpperCase());
                    setPfpUrl(profile.pfp || "");

                    if (profile.role_id) {
                        const { data: role } = await supabase
                            .from("roles")
                            .select("role")
                            .eq("role_id", profile.role_id)
                            .single();

                        setUserRole(role?.role || "");
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchUserProfile();
    }, []);

    // NAVIGATION
    const handleProfile = () => {
        navigate("/program-manager/profile");
        handleCloseMenu();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <AppBar position="static" elevation={0} sx={{ backgroundColor: "#493979", py: 1 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>

                    {/* LOGO */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer"
                        }}
                        onClick={() => navigate("/")}
                    >
                        <img src={logo} alt="Logo" style={{ height: 28 }} />
                        <Typography
                            sx={{ fontWeight: 700, color: "#E9B0F8", fontSize: 20 }}
                        >
                            DenTrack
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* AVATAR MENU */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                            <Avatar src={pfpUrl || undefined} sx={{ width: 40, height: 40 }}>
                                {!pfpUrl && userInitial}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleCloseMenu}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography fontWeight={600}>
                                    {lastName}, {firstName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {userRole}
                                </Typography>
                            </Box>

                            <Divider />

                            <MenuItem onClick={handleProfile}>
                                <PersonIcon fontSize="small" />
                                <Typography sx={{ ml: 1 }}>Profile</Typography>
                            </MenuItem>

                            <Divider />

                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon fontSize="small" />
                                <Typography sx={{ ml: 1 }}>Logout</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>

                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default ResponsiveAppBar;