import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-light.png";

interface Page {
    name: string;
    path: string;
}

interface Setting {
    name: string;
    path?: string;
}

const pages: Page[] = [
    { name: 'Schedule', path: '/clinician' },
    { name: 'Request', path: '/clinicianRequest' },
    { name: 'Notification', path: '/clinicianNotification' },
];

const settings: Setting[] = [
    { name: 'Switch Roles' },
    { name: 'Profile', path: '/clinicianProfile' },
    { name: 'Logout', path: '/login' },
];

const ResponsiveAppBar: React.FC = () => {
    const navigate = useNavigate();

    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [openDrawer, setOpenDrawer] = React.useState(false);
    const [roleOpen, setRoleOpen] = React.useState(false);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
        setRoleOpen(false);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#493979" }}>
        <Container maxWidth="xl">
            <Toolbar disableGutters>

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
                PaperProps={{
                    sx: {
                    backgroundColor: "#493979",
                    color: "white",
                    }
                }}
                >
                <Box sx={{ width: 250 }}>
                    <Typography sx={{ p: 2, fontWeight: 600 }}>
                    Menu
                    </Typography>

                    <List>
                    {pages.map((page) => (
                        <ListItem key={page.name} disablePadding>
                        <ListItemButton onClick={() => navigate(page.path)}>
                            <ListItemText primary={page.name} />
                        </ListItemButton>
                        </ListItem>
                    ))}
                    </List>
                </Box>
                </Drawer>
            </Box>

            {/* LOGO (CENTER MOBILE, LEFT DESKTOP) */}
            <Box
                sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
                justifyContent: { xs: 'center', md: 'flex-start' },
                }}
            >
                <img src={logo} alt="Logo" style={{ height: "28px" }} />
                <Typography
                sx={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    color: "#E9B0F8",
                }}
                >
                DenTrack
                </Typography>
            </Box>

            {/* DESKTOP NAV */}
            <Box sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexGrow: 1,
                    gap: 10,
                }}>
                {pages.map((page) => (
                <Button
                    key={page.name}
                    onClick={() => navigate(page.path)}
                    sx={{ color: 'white' }}
                >
                    {page.name}
                </Button>
                ))}
            </Box>

            {/* USER MENU */}
            <Box sx={{ flexGrow: 0, ml: 2 }}>
                <Tooltip title="User Menu">
                <IconButton onClick={handleOpenUserMenu}>
                    <Avatar />
                </IconButton>
                </Tooltip>

                <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                sx={{
                    mt: '15px',
                    '& .MuiPaper-root': {
                    backgroundColor: '#493979',
                    color: 'white',
                    },
                }}
                >
                {settings.map((setting) => (
                    <Box key={setting.name}>
                    {setting.name === 'Switch Roles' ? (
                        <>
                        <MenuItem onClick={() => setRoleOpen(!roleOpen)}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>Switch Roles</Typography>
                            <Typography sx={{ transform: roleOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                ▼
                            </Typography>
                            </Box>
                        </MenuItem>

                        {roleOpen && (
                            <Box sx={{ pl: 2 }}>
                            <MenuItem
                                onClick={() => {
                                navigate('/clinician');
                                handleCloseUserMenu();
                                }}
                            >
                                Clinician
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                navigate('/chair-manager');
                                handleCloseUserMenu();
                                }}
                            >
                                Chair Manager
                            </MenuItem>
                            </Box>
                        )}
                        </>
                    ) : (
                        <MenuItem
                        onClick={() => {
                            if (setting.path) navigate(setting.path);
                            handleCloseUserMenu();
                        }}
                        >
                        {setting.name}
                        </MenuItem>
                    )}
                    </Box>
                ))}
                </Menu>
            </Box>

            </Toolbar>
        </Container>
        </AppBar>
    );
};

export default ResponsiveAppBar;