import { Link, router, usePage } from '@inertiajs/react';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Chip,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    ArrowLeftRight, CalendarCheck, Contact, ClipboardClock, LayoutDashboard, Users, ScrollText, ClipboardCheck,
    CalendarDays, SquareChartGantt, User
} from "lucide-react";
import type { ReactNode } from 'react';
import React, { useState } from 'react';

interface RootLayoutProps {
    children: ReactNode;
}

interface AppNotification {
    id: string | number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    time_ago?: string;
}

export function RootLayout({children}: RootLayoutProps) {
    const page = usePage();
    const user = (page.props as any).auth?.user;

    const isChairManagerView = page.url.includes('/chair-manager');
    const isAdmin = user?.role_id === 1;
    const isManager = user?.role_id === 2;

    let navItems = [];

    if (isAdmin) {
        navItems = [
            {label: 'Attendance', path: '/admin/home', icon: <CalendarDays />},
            {label: 'Requests', path: '/admin/manage-requests', icon: <ClipboardCheck />},
            {label: 'Reports', path: '/admin/manage-reports', icon: <ScrollText />},
            {label: 'Management', path: '/admin/management', icon: <Users />},
        ];
    } else if (isManager) {
        navItems = [
            {label: 'Reports', path: '/manager/home', icon: <SquareChartGantt />},
        ];
    } else if (isChairManagerView) {
        navItems = [
            {label: 'Dashboard', path: '/chair-manager/home', icon: <LayoutDashboard/>},
            {label: 'History', path: '/chair-manager/history', icon: <ClipboardClock />},
        ];
    } else {
        navItems = [
            {label: 'Schedule', path: '/clinician/home', icon: <CalendarCheck />},
            {label: 'Request Tracker', path: '/clinician/request-tracker', icon: <Contact/>},
        ];
    }

    const showSwitchButton = !isAdmin && !isManager;
    const switchText = isChairManagerView ? 'Switch to Clinician' : 'Switch to Chair Manager';
    const switchRoute = isChairManagerView ? '/clinician/home' : '/chair-manager/home';

    // --- UI STATE ---
    const [openDrawer, setOpenDrawer] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
    const openNotif = Boolean(notifAnchor);

    // --- REAL NOTIFICATIONS FROM INERTIA PROPS ---
    const notifications: AppNotification[] = (page.props as any).auth?.notifications || [];
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // --- HANDLERS ---
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => setNotifAnchor(event.currentTarget);
    const handleNotifClose = () => setNotifAnchor(null);

    const handleLogout = () => {
        handleClose();
        router.post('/logout');
    };

    // Mark all as read via backend route
    const handleMarkAllRead = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
        });
    };

    // --- UTILS ---
    function stringToColor(string: string) {
        let hash = 0;
        let i;

        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }

        return color;
    }

    function stringAvatar(name: string) {
        if (!name) {
            return {children: 'U'};
        }

        const split = name.split(' ');
        const initials = split.length > 1
            ? `${split[0][0]}${split[1][0]}`
            : `${name.charAt(0)}`;

        return {
            sx: {bgcolor: stringToColor(name)},
            children: initials.toUpperCase(),
        };
    }

    const getRoleLabel = () => {
        if (user?.role_id === 1) {
            return 'Clinical Admin';
        }

        if (user?.role_id === 2) {
            return 'Program Manager';
        }

        if (user?.role_id === 3  && !isChairManagerView) {
            return 'Clinician';
        } else {
            return 'Chair Manager';
        }

        return 'User';
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: '#f6f6f6',
            }}
        >
            {/* --- HEADER --- */}
            <AppBar position="static" sx={{backgroundColor: '#493979', py: 1}}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{position: 'relative'}}>

                        {/* 1. MOBILE HAMBURGER & DRAWER */}
                        <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                            <IconButton size="large" onClick={() => setOpenDrawer(true)} color="inherit">
                                <MenuIcon/>
                            </IconButton>

                            <Drawer
                                anchor="left"
                                open={openDrawer}
                                onClose={() => setOpenDrawer(false)}
                                slotProps={{
                                    paper: {
                                        sx: {backgroundColor: '#493979', color: 'white'},
                                    },
                                }}
                            >
                                <Box sx={{width: 260, display: 'flex', flexDirection: 'column', height: '100%'}}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        pt: 3,
                                        pb: 2
                                    }}>
                                        <Avatar
                                            src={user?.pfp || undefined}
                                            {...(!user?.pfp && stringAvatar(user?.name || 'User'))}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mb: 2,
                                                ...(!user?.pfp && stringAvatar(user?.name || 'User').sx)
                                            }}
                                        />
                                        <Typography sx={{fontWeight: 600, mb: 2, textAlign: 'center'}}>
                                            Welcome, {user?.name}!
                                        </Typography>

                                        <Chip
                                            label={getRoleLabel()}
                                            icon={<User color="#ffffff" size={18} />}
                                            sx={{
                                                color: 'white',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                fontWeight: 500,
                                                mb: 2,
                                            }}
                                        />

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {showSwitchButton && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => {
                                                        setOpenDrawer(false);
                                                        router.get(switchRoute);
                                                    }}
                                                    sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 5, textTransform: 'none', py: 1, px: 2 }}
                                                    startIcon={<ArrowLeftRight size={12} />}
                                                >
                                                    {switchText}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* DYNAMIC MOBILE NAV LIST */}
                                    <List sx={{ flexGrow: 1, pl: 1.5 }}>
                                        {navItems.map((item) => {
                                            const isActive = page.url.startsWith(item.path);

                                            return (
                                                <ListItem disablePadding key={item.label}>
                                                    <ListItemButton
                                                        onClick={() => {
                                                            setOpenDrawer(false);
                                                            router.get(item.path);
                                                        }}
                                                        sx={{
                                                            borderLeft: isActive ? '4px solid #E9B0F8' : '4px solid transparent',
                                                            backgroundColor: isActive ? 'rgba(233, 176, 248, 0.1)' : 'transparent',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        <ListItemIcon sx={{ color: isActive ? '#E9B0F8' : 'white', minWidth: 40 }}>
                                                            {item.icon}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={item.label}
                                                            sx={{
                                                                color: isActive ? '#E9B0F8' : 'white',
                                                                '& .MuiTypography-root': {
                                                                    fontWeight: isActive ? 600 : 400,
                                                                }
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            );
                                        })}
                                    </List>

                                    <Box sx={{p: 2, pb: 3}}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={handleLogout}
                                            sx={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: 4,
                                                color: 'white',
                                                py: 1.5
                                            }}
                                            startIcon={<LogoutIcon fontSize="small"/>}
                                        >
                                            Logout
                                        </Button>
                                    </Box>
                                </Box>
                            </Drawer>
                        </Box>

                        {/* 2. LOGO */}
                        <Box
                            component={Link as any}
                            href={isAdmin ? '/admin/home' : (isChairManagerView ? '/chair-manager/home' : '/clinician/home')}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none',
                                position: { xs: 'absolute', md: 'relative' }, left: { xs: '50%', md: 'auto' },
                                transform: { xs: 'translateX(-50%)', md: 'none' }, zIndex: 1,
                            }}
                        >
                            <Box component="img" src="/images/logo-light.png" alt="Logo" sx={{ height: 32 }} />
                            <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#E9B0F8', fontSize: 25 }}>
                                DenTrack
                            </Typography>
                        </Box>

                        {/* 3. DESKTOP NAV LINKS */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 4, lg: 8 }, justifyContent: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    onClick={() => router.get(item.path)}
                                    sx={{ color: 'white', textTransform: 'none' }}
                                    startIcon={item.icon}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* 4. DESKTOP RIGHT (NOTIFICATIONS & AVATAR) */}
                        <Box sx={{ ml: 'auto', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>

                            {!isManager && (
                                <>
                                    {/* Notifications Bell */}
                                    <IconButton onClick={handleNotifClick} size="small" sx={{ p: 0.5 }}>
                                        <Badge
                                            badgeContent={unreadCount}
                                            color="info"
                                            overlap="circular"
                                            sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 18, minWidth: 18, fontWeight: 600 } }}
                                        >
                                            <NotificationsIcon sx={{ fontSize: { xs: 26, sm: 30, md: 32 }, color: 'white' }} />
                                        </Badge>
                                    </IconButton>

                                    {/* Notifications Dropdown Menu */}
                                    <Menu
                                        anchorEl={notifAnchor}
                                        open={openNotif}
                                        onClose={handleNotifClose}
                                        slotProps={{ paper: { sx: { width: 320, borderRadius: 3, mt: 1.5, boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)', overflow: 'visible', '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 } } } }}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#493979', fontSize: 21 }}>Notifications</Typography>
                                            {unreadCount > 0 && (
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
                                                        key={notif.id}
                                                        onClick={() => {
                                                            // Trigger real database update, then navigate
                                                            router.post(`/notifications/${notif.id}/mark-read`, {}, {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    setNotifAnchor(null);
                                                                    router.get('/clinician-notifications');
                                                                }
                                                            });
                                                        }}
                                                        sx={{ py: 1.5, px: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', whiteSpace: 'normal', borderBottom: '1px solid #f0f0f0', backgroundColor: notif.is_read ? 'transparent' : 'rgba(73, 57, 121, 0.04)' }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: notif.is_read ? 500 : 700, flexGrow: 1 }}>{notif.title}</Typography>
                                                            {!notif.is_read && <Box sx={{ width: 8, height: 8, bgcolor: '#493979', borderRadius: '50%', ml: 1 }} />}
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>{notif.message}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                                                            {notif.time_ago}
                                                        </Typography>
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <Typography variant="body2" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No new notifications</Typography>
                                            )}
                                        </Box>
                                        <Button
                                            fullWidth
                                            onClick={() => {
                                                handleNotifClose(); router.get('/notifications');
                                            }}
                                            sx={{ py: 1.5, textTransform: 'none', color: '#493979', fontWeight: 600, fontSize: '0.875rem' }}
                                        >
                                            View all notifications
                                        </Button>
                                    </Menu>
                                </>
                            )}

                            {/* User Avatar & Dropdown */}
                            <IconButton size="small" onClick={handleAvatarClick} sx={{ p: 0, display: { xs: 'none', md: 'inline-flex' } }}>
                                <Avatar
                                    sx={{ width: 32, height: 32 }}
                                    src={user?.pfp || undefined}
                                    {...(!user?.pfp && stringAvatar(user?.name || 'User'))}
                                />
                            </IconButton>

                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                onClick={handleClose}
                                slotProps={{ paper: { elevation: 0, sx: { width: 240, borderRadius: 2, overflow: 'visible', filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))', mt: 1.5, '& .MuiMenuItem-root': { px: 2, py: 1.2, transition: 'all 0.2s ease', '&:hover': { bgcolor: 'action.hover', transform: 'translateX(2px)' } }, '& .MuiListItemIcon-root': { minWidth: 36, color: 'text.secondary' }, '&::before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 } } } }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontWeight: 500, color: '#493979' }}>
                                        {isAdmin ? 'Clinical Admin' : isManager ? 'Program Manager' : isChairManagerView ? 'Chair Manager' : 'Clinician'}
                                    </Typography>
                                </Box>
                                <Divider />

                                {showSwitchButton && (
                                    <MenuItem onClick={() => router.get(switchRoute)}>
                                        <ListItemIcon><SwitchAccountIcon fontSize="small" sx={{ color: '#4c438e' }} /></ListItemIcon>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{switchText}</Typography>
                                    </MenuItem>
                                )}

                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>

                    </Toolbar>
                </Container>
            </AppBar>

            {/* --- MAIN PAGE CONTENT --- */}
            <Box component="main" sx={{flexGrow: 1, p: {xs: 2, sm: 4}}}>
                {children}
            </Box>

            {/* --- FOOTER --- */}
            <Box
                sx={{
                    position: 'relative',
                    mt: 'auto',
                    display: 'flex',
                    height: 140,
                    width: '100%',
                    flexShrink: 0,
                    alignItems: 'center',
                    overflow: 'hidden',
                    borderTop: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    bgcolor: '#52397d',
                }}
            >
                <Box
                    component="img"
                    src="/images/footer-login.webp"
                    alt="Campus Skyline"
                    sx={{
                        position: 'absolute',
                        top: 0, right: 0, bottom: 0, left: 0,
                        height: '100%', width: '100%',
                        objectFit: 'cover', objectPosition: 'bottom',
                        opacity: 0.4, mixBlendMode: 'screen',
                    }}
                />
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 10,
                        pl: { xs: 3, sm: 6 },
                        pr: 3,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            lineHeight: 1.4,
                            fontFamily: 'Montserrat, sans-serif',
                        }}
                    >
                        © 2026 Copyright: Information Management Service, University of the Philippines Manila
                    </Typography>
                </Box>

                <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        bottom: 6,
                        right: 10,
                        color: 'rgba(255,255,255,0.15)',
                        fontSize: '0.52rem',
                        fontFamily: 'Montserrat, sans-serif',
                        letterSpacing: '0.03em',
                        zIndex: 11,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                >
                    DenTrack v2 developed by: Gervin P. Montiel
                </Typography>
            </Box>
        </Box>
    );
}
