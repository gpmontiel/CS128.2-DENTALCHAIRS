import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-light.png";
import EditIcon from '@mui/icons-material/Edit';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import {Badge, Divider, ListItemIcon, Menu, MenuItem} from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';
import ThreePIcon from '@mui/icons-material/ThreeP';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface Page {
    name: string;
    path: string;
    icon: React.ReactNode;
}

const pages: Page[] = [
    { name: 'Schedule', path: '/clinician', icon: <ScheduleIcon fontSize="small" /> },
    { name: 'Request Dental Chair', path: '/clinicianRequest', icon: <ThreePIcon fontSize="small" /> },
];

const ResponsiveAppBar: React.FC = () => {
    const navigate = useNavigate();

    const [openDrawer, setOpenDrawer] = React.useState(false);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#493979", py: 1 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ position: "relative" }}>
                    {/* MOBILE HAMBURGER */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            onClick={() => setOpenDrawer(true)}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>

                        <Drawer
                            anchor="left"
                            open={openDrawer}
                            onClose={() => setOpenDrawer(false)}
                            slotProps={{
                                paper: {
                                    sx: {
                                        backgroundColor: "#493979",
                                        color: "white",
                                    },
                                },
                            }}
                        >
                            <Box sx={{ width: 260, display: "flex", flexDirection: "column", height: "100%" }}>
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pt: 3,
                                    pb: 2,
                                }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mb: 2,
                                            backgroundColor: "#6b4e9e",
                                            fontSize: "2rem"
                                        }}
                                    >
                                        U
                                    </Avatar>

                                    <Typography sx={{ fontWeight: 600, mb: 2, textAlign: "center" }}>
                                        Hello, User!
                                    </Typography>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, justifyItems: "center" }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disableElevation
                                            onClick={() => {/* handle edit profile */}}
                                            sx={{
                                                color: "white",
                                                borderColor: "rgba(255, 255, 255, 0.8)",
                                                borderRadius: 5,
                                                textTransform: "none",
                                                py: 1
                                            }}
                                            startIcon={<EditIcon fontSize="small" />}
                                        >
                                            Edit Profile
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            disableElevation
                                            onClick={() => {/* handle switch to chair manager */}}
                                            sx={{
                                                color: "white",
                                                backgroundColor: "#4c438e",
                                                borderRadius: 5,
                                                textTransform: "none",
                                                px: 2,
                                                py: 1.5,
                                            }}
                                            startIcon={<SwitchAccountIcon fontSize="small" />}
                                        >
                                            Switch to Chair Manager
                                        </Button>
                                    </Box>
                                </Box>

                                <List sx={{ flexGrow: 1, pl: 1.5 }}>
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => navigate("/schedule")}>
                                            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                                                <ScheduleIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Schedule" />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => navigate("/request")}>
                                            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                                                <ThreePIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Request" />
                                        </ListItemButton>
                                    </ListItem>
                                </List>

                                <Box sx={{ p: 2, pb: 3 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => {/* handle logout */}}
                                        sx={{
                                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                                            borderRadius: 4,
                                            color: "white",
                                            py: 1.5
                                        }}
                                        startIcon={<LogoutIcon fontSize="small" />}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            </Box>
                        </Drawer>
                    </Box>

                    {/* LOGO - CENTERED ON MOBILE, LEFT ON DESKTOP */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            position: { xs: "absolute", md: "relative" },
                            left: { xs: "50%", md: "auto" },
                            transform: { xs: "translateX(-50%)", md: "none" },
                            zIndex: 1,
                        }}
                    >
                        <img src={logo} alt="Logo" style={{ height: "28px" }} />
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 700,
                                color: "#E9B0F8",
                                fontSize: 21,
                            }}
                        >
                            DenTrack
                        </Typography>
                    </Box>

                    {/* DESKTOP NAV - CENTERED */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        gap: 10,
                        justifyContent: 'center',
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                    }}>
                        {pages.map((page) => (
                            <Button
                                key={page.name}
                                onClick={() => navigate(page.path)}
                                sx={{ color: 'white', textTransform: "none" }}
                                startIcon={page.icon}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>

                    {/* DESKTOP RIGHT PART */}
                    <Box sx={{
                        ml: "auto",
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 3
                    }}>
                        <IconButton size="small" sx={{ p: 0.5 }}>
                            <Badge
                                badgeContent={2}
                                color="info"
                                overlap="circular"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: '0.7rem',
                                        height: 18,
                                        minWidth: 18,
                                        fontWeight: 600,
                                    }
                                }}
                            >
                                <NotificationsIcon sx={{ fontSize: 32, color: "white" }} />
                            </Badge>
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={handleAvatarClick}
                            sx={{ p: 0, display: { xs: 'none', md: 'inline-flex' } }}
                        >
                            <Avatar sx={{ width: 32, height: 32 }}>
                                K
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                            slotProps={{
                                paper: {
                                    elevation: 0,
                                    sx: {
                                        width: 240,
                                        borderRadius: 2,
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))',
                                        mt: 1.5,
                                        bgcolor: 'background.paper',
                                        '& .MuiMenuItem-root': {
                                            px: 2,
                                            py: 1.2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                                transform: 'translateX(2px)',
                                            }
                                        },
                                        '& .MuiAvatar-root': {
                                            width: 32,
                                            height: 32,
                                            ml: -0.5,
                                            mr: 1.5,
                                        },
                                        '& .MuiListItemIcon-root': {
                                            minWidth: 36,
                                            color: 'text.secondary',
                                        },
                                        '&::before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {/* User info header */}
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    KANG SEULGI
                                </Typography>
                                <Typography variant="caption" color="#493979" sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                                    Clinician
                                </Typography>
                            </Box>

                            <Divider />

                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <SwitchAccountIcon fontSize="small" sx={{ color: '#4c438e' }} />
                                </ListItemIcon>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Switch to Chair Manager
                                </Typography>
                            </MenuItem>

                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <EditIcon fontSize="small" sx={{ color: '#4c438e' }} />
                                </ListItemIcon>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Edit Profile
                                </Typography>
                            </MenuItem>

                            <Divider sx={{ my: 0.5 }} />

                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" sx={{ color: 'error.main'}} />
                                </ListItemIcon>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                                    Logout
                                </Typography>
                            </MenuItem>

                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default ResponsiveAppBar;