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
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-light.png";
import EditIcon from '@mui/icons-material/Edit';
import { Badge, Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { supabase } from "../../../utils/supabase.ts";
import { useEffect, useState } from "react";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Page {
    name: string;
    path: string;
    icon: React.ReactNode;
}

interface AppNotification {
    id: string | number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const pages: Page[] = [
    { name: 'Attendance', path: '/clinicalAdminAttendance', icon: <CalendarMonthIcon fontSize="small" /> },
    { name: 'Requests', path: '/clinicalAdminRequests', icon: <AssignmentTurnedInIcon fontSize="small" /> },
    { name: 'Reports', path: '/clinicalAdminReports', icon: <AssessmentIcon fontSize="small" /> },
    { name: 'Management', path: '/clinicalAdminStudents', icon: <PeopleIcon fontSize="small" /> },
];

const ResponsiveAppBar: React.FC = () => {
    const navigate = useNavigate();

    const [openDrawer, setOpenDrawer] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [profile, setProfile] = useState<any>(() => {
        const cached = localStorage.getItem('userProfile');
        return cached ? JSON.parse(cached) : null;
    });
    const [pfpUrl, setPfpUrl] = useState<string>(() => {
        return localStorage.getItem('userPfp') || '';
    });

    const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(null);
    const openNotif = Boolean(notifAnchor);
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // --- PROFILE FETCH SYNC EFFECT ---
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            const { data, error } = await supabase
                .from("profiles")
                .select(`first_name, last_name, pfp`)
                .eq("profile_id", userId)
                .single();

            if (error) {
                console.error(error);
            } else if (data) {
                setProfile(data);
                const newPfpUrl = data?.pfp || "";
                setPfpUrl(newPfpUrl);

                localStorage.setItem('userProfile', JSON.stringify(data));
                localStorage.setItem('userPfp', newPfpUrl);
            }
        };

        fetchProfile();

        const handleProfileUpdate = (event: CustomEvent) => {
            const { profile: updatedProfile, pfpUrl: updatedPfp } = event.detail;
            if (updatedProfile) setProfile(updatedProfile);
            if (updatedPfp) setPfpUrl(updatedPfp);
        };

        window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
        };
    }, []);

    // --- REALTIME NOTIFICATIONS SUBSCRIPTION EFFECT ---
    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Latest 5 Notifications
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) console.error("Error fetching notifications:", error);
            else if (data) setNotifications(data);

            // 2. Stream Live Incoming Modifications
            const channel = supabase
                .channel(`admin-notifs-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setNotifications((prev) => [payload.new as AppNotification, ...prev]);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        fetchNotifications();
    }, []);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error.message);
            return;
        }
        navigate("/");
    };

    const handleMobileNavigate = (path: string) => {
        navigate(path);
        setOpenDrawer(false);
    };

    const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
        setNotifAnchor(event.currentTarget);
    };

    const handleNotifClose = () => {
        setNotifAnchor(null);
    };

    const handleMarkAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const formatNotificationTime = (date: string) => {
        const now = dayjs();
        const created = dayjs(date);
        const diffInHours = now.diff(created, "hour");

        if (diffInHours < 24) {
            return created.fromNow();
        }
        return created.format("MMM D, YYYY h:mm A");
    };

    const handleNotificationClick = async (notif: AppNotification) => {
        navigate("/admin-notifications");
        handleNotifClose();

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notif.id);

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
            );
        }
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#493979", py: 1 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ position: "relative" }}>

                    {/* MOBILE HAMBURGER MENU DRAWER */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton size="large" onClick={() => setOpenDrawer(true)} color="inherit">
                            <MenuIcon />
                        </IconButton>

                        <Drawer
                            anchor="left" open={openDrawer} onClose={() => setOpenDrawer(false)}
                            slotProps={{ paper: { sx: { backgroundColor: "#493979", color: "white" } } }}
                        >
                            <Box sx={{ width: 260, display: "flex", flexDirection: "column", height: "100%" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 3, pb: 2 }}>
                                    <Avatar
                                        sx={{ width: 80, height: 80, mb: 2, backgroundColor: "#6b4e9e", fontSize: "2rem" }}
                                        src={pfpUrl || undefined}
                                    >
                                        {!pfpUrl && profile?.first_name?.charAt(0)}
                                        {!pfpUrl && !profile && "U"}
                                    </Avatar>

                                    <Typography sx={{ fontWeight: 600, mb: 2, textAlign: "center" }}>
                                        Hello, {profile?.first_name || 'Admin'}!
                                    </Typography>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%", px: 3 }}>
                                        <Button
                                            variant="outlined" size="small" fullWidth disableElevation
                                            onClick={() => navigate("/admin-profile")}
                                            sx={{ color: "white", borderColor: "rgba(255, 255, 255, 0.8)", borderRadius: 5, textTransform: "none", py: 1 }}
                                            startIcon={<PersonIcon fontSize="small" />}
                                        >
                                            Profile
                                        </Button>
                                    </Box>
                                </Box>

                                <List sx={{ flexGrow: 1, pl: 1.5 }}>
                                    {pages.map((page) => (
                                        <ListItem key={page.name} disablePadding>
                                            <ListItemButton onClick={() => handleMobileNavigate(page.path)}>
                                                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>{page.icon}</ListItemIcon>
                                                <ListItemText primary={page.name} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>

                                <Box sx={{ p: 2, pb: 3 }}>
                                    <Button
                                        variant="contained" fullWidth onClick={() => handleLogout()}
                                        sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 4, color: "white", py: 1.5 }}
                                        startIcon={<LogoutIcon fontSize="small" />}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            </Box>
                        </Drawer>
                    </Box>

                    {/* APP LOGO ANCHOR BRANDING */}
                    <Box onClick={() => navigate("/clinicalAdminAttendance")} sx={{ display: 'flex', alignItems: 'center', gap: 1, position: { xs: "absolute", md: "relative" }, left: { xs: "50%", md: "auto" }, transform: { xs: "translateX(-50%)", md: "none" }, zIndex: 1 }}>
                        <img src={logo} alt="Logo" style={{ height: "28px" }} />
                        <Typography sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#E9B0F8", fontSize: 21 }}>
                            DenTrack
                        </Typography>
                    </Box>

                    {/* DESKTOP ROUTING LINKS TAB BLOCK */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 10, justifyContent: 'center', position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                        {pages.map((page) => (
                            <Button key={page.name} onClick={() => navigate(page.path)} sx={{ color: 'white', textTransform: "none" }} startIcon={page.icon}>
                                {page.name}
                            </Button>
                        ))}
                    </Box>

                    {/* DESKTOP RIGHT UTILITIES PANEL SECTION */}
                    <Box sx={{ ml: "auto", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 3 }}>

                        {/* NOTIFICATIONS CONTROL ICON TRIGGER */}
                        <IconButton onClick={handleNotifClick} size="small" sx={{ p: 0.5 }}>
                            <Badge
                                badgeContent={unreadCount} color="info" overlap="circular"
                                sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 18, minWidth: 18, fontWeight: 600 } }}
                            >
                                <NotificationsIcon sx={{ fontSize: { xs: 26, sm: 30, md: 32 }, color: "white" }} />
                            </Badge>
                        </IconButton>

                        {/* LIVE NOTIFICATIONS DROPDOWN MENU ARCHITECTURE */}
                        <Menu
                            anchorEl={notifAnchor} open={openNotif} onClose={handleNotifClose}
                            slotProps={{
                                paper: {
                                    sx: {
                                        width: 320, borderRadius: 3, mt: 1.5,
                                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15), 0px 2px 8px rgba(0, 0, 0, 0.05)',
                                        overflow: 'visible',
                                        '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                                    }
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#493979', fontSize: 21 }}>
                                    Notifications
                                </Typography>
                                {notifications.some(n => !n.is_read) && (
                                    <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#493979' }}>
                                        Mark all as read
                                    </Button>
                                )}
                            </Box>

                            <Divider />

                            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <MenuItem
                                            key={notif.id} onClick={() => handleNotificationClick(notif)}
                                            sx={{ py: 1.5, px: 2.5, display: "flex", flexDirection: "column", alignItems: "flex-start", whiteSpace: 'normal', borderBottom: '1px solid #f0f0f0', backgroundColor: notif.is_read ? "transparent" : "rgba(73, 57, 121, 0.04)" }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: notif.is_read ? 500 : 700, flexGrow: 1 }}>
                                                    {notif.title}
                                                </Typography>
                                                {!notif.is_read && <Box sx={{ width: 8, height: 8, bgcolor: '#493979', borderRadius: '50%', ml: 1 }} />}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                                                Tap to view full details.
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                                                {formatNotificationTime(notif.created_at)}
                                            </Typography>
                                        </MenuItem>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                        No new notifications
                                    </Typography>
                                )}
                            </Box>

                            <Button
                                fullWidth onClick={() => { handleNotifClose(); navigate("/admin-notifications"); }}
                                sx={{ py: 1.5, textTransform: 'none', color: '#493979', fontWeight: 600, fontSize: '0.875rem' }}
                            >
                                View all notifications
                            </Button>
                        </Menu>

                        {/* USER PROFILE AVATAR MENU TRIGGER */}
                        <IconButton size="small" onClick={handleAvatarClick} sx={{ p: 0, display: { xs: 'none', md: 'inline-flex' } }}>
                            <Avatar sx={{ width: 32, height: 32 }} src={pfpUrl || undefined}>
                                {!pfpUrl && (profile?.first_name?.charAt(0) || "A")}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl} open={open} onClose={handleClose} onClick={handleClose}
                            slotProps={{
                                paper: {
                                    elevation: 0,
                                    sx: {
                                        width: 240, borderRadius: 2, overflow: 'visible', filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))', mt: 1.5, bgcolor: 'background.paper',
                                        '& .MuiMenuItem-root': { px: 2, py: 1.2, transition: 'all 0.2s ease', '&:hover': { bgcolor: 'action.hover', transform: 'translateX(2px)' } },
                                        '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1.5 },
                                        '& .MuiListItemIcon-root': { minWidth: 36, color: 'text.secondary' },
                                        '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 }
                                    }
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {profile ? `${profile.last_name}, ${profile.first_name}` : 'Clinical Admin'}
                                </Typography>
                                <Typography variant="caption" color="#493979" sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                                    Clinical Administrator
                                </Typography>
                            </Box>

                            <Divider />

                            <MenuItem onClick={() => navigate("/admin-profile")}>
                                <ListItemIcon>
                                    <EditIcon fontSize="small" sx={{ color: '#4c438e' }} />
                                </ListItemIcon>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Edit Profile
                                </Typography>
                            </MenuItem>

                            <Divider sx={{ my: 0.5 }} />

                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
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