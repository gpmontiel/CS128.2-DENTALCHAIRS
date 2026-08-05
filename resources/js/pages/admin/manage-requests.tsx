import {router, usePage} from "@inertiajs/react";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from '@mui/icons-material/Event';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SortIcon from '@mui/icons-material/Sort';
import {
    Box, Typography, Avatar, Divider, ToggleButton,
    ToggleButtonGroup, Menu, MenuItem, ListItemText, ListItemIcon,
    Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Paper,
    Alert, Snackbar, Grid
} from "@mui/material";
import { CircleCheckBig } from "lucide-react";

import React, {useEffect, useState} from "react";

export interface RequestProfile {
    first_name: string;
    last_name: string;
    pfp: string | null;
}

export interface CMRequest {
    assignment_id: number;
    student_id: number;
    section_id: number;
    shift: string;
    date: string;
    status: string;
    created_at: string;
    section_name: string;
    profiles: RequestProfile;
    group_name: string;
    year_level: string | number;
}

export interface ManageRequestsProps {
    requests: CMRequest[];
    filters: {
        reqFilter: string;
        sortBy: string;
        sortDesc: boolean;
    };
    errors?: any; // Automatically injected by Inertia on error
}

export default function ManageRequests({ requests, filters, errors }: ManageRequestsProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const { flash } = usePage<any>().props;
    const [successOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSuccessOpen(true);
        }
    }, [flash?.success]);

    const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessOpen(false);
    };

    // Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<CMRequest | null>(null);
    const [pendingAction, setPendingAction] = useState<'Confirmed' | 'Rejected' | null>(null);

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterChange = (event: React.MouseEvent<HTMLElement>, next: string | null) => {
        if (next) {
            router.get(
                '/admin/manage-requests',
                { filter: next, sortBy: filters.sortBy, sortDesc: filters.sortDesc },
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    const handleSortSelect = (column: string, sortDesc: boolean) => {
        setAnchorEl(null);
        router.get(
            '/admin/manage-requests',
            { filter: filters.reqFilter, sortBy: column, sortDesc },
            { preserveState: true, preserveScroll: true }
        );
    };

    const preHandleAction = (assignment: CMRequest, action: 'Confirmed' | 'Rejected') => {
        setSelectedAssignment(assignment);
        setPendingAction(action);
        setConfirmOpen(true);
    };

    const executeAction = () => {
        if (!selectedAssignment || !pendingAction) {
            return;
        }

        router.post(`/admin/manage-requests/${selectedAssignment.assignment_id}/action`, {
            action: pendingAction
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmOpen(false);
            },
            onError: () => {
                setConfirmOpen(false);
            }
        });
    };

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return { bgcolor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' };
            case 'Rejected': return { bgcolor: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' };
            case 'Cancelled': return { bgcolor: '#ECEFF1', color: '#455A64', border: '1px solid #CFD8DC' };
            default: return { bgcolor: '#FFF3E0', color: '#EF6C00', border: '1px solid #FFE0B2' };
        }
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F9FAFC', minHeight: '100vh' }}>

            <Snackbar open={!!errors?.message} autoHideDuration={6000}>
                <Alert severity="error" variant="filled">{errors?.message}</Alert>
            </Snackbar>

            <Snackbar
                open={successOpen}
                autoHideDuration={6000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSuccess} severity="success">
                    {flash?.success}
                </Alert>
            </Snackbar>

            {/* Header section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "#493979", fontFamily: "Poppins", fontWeight: "700", display: 'flex', alignItems: 'center', gap: 1 }}>
                        Requests
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#636364" }}>
                        Manage, review, and organize scheduled chair manager shift requests.
                    </Typography>
                </Box>

                <Button
                    onClick={handleSortClick}
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    sx={{ textTransform: 'none', borderColor: '#493978', color: '#493978', borderRadius: 2, '&:hover': { borderColor: '#6a52e0', bgcolor: 'rgba(73, 57, 120, 0.04)' } }}
                >
                    Sort / Filter Options
                </Button>
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => handleSortSelect('date', false)}>
                    <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Earliest Target Date</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSortSelect('created_at', false)}>
                    <ListItemIcon><SortIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Submission (Oldest First)</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSortSelect('created_at', true)}>
                    <ListItemIcon><SortIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Submission (Newest First)</ListItemText>
                </MenuItem>
            </Menu>

            {/* Shift Context Selection Toggles */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <ToggleButtonGroup
                    value={filters.reqFilter}
                    exclusive
                    onChange={handleFilterChange}
                    sx={{
                        width: '100%', maxWidth: '450px', bgcolor: '#fff', p: 0.5, borderRadius: '12px', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
                        '& .MuiToggleButton-root': {
                            flex: 1, borderRadius: '8px', border: 'none', py: 1,
                            textTransform: 'none', fontWeight: 600, color: '#64748B',
                            '&.Mui-selected': { bgcolor: '#493978', color: 'white', '&:hover': { bgcolor: '#493978' } }
                        }
                    }}
                >
                    <ToggleButton value="Upcoming">Pending</ToggleButton>
                    <ToggleButton value="AM">AM Shifts</ToggleButton>
                    <ToggleButton value="PM">PM Shifts</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* List & Cards Content Stream */}
            {requests.length === 0 ? (
                <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 2, borderRadius: 3, borderStyle: 'dashed', bgcolor: 'transparent' }}>
                    {/*<CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />*/}
                    <CircleCheckBig />
                    <Typography variant="h6" sx={{color:"text.secondary", fontWeight: 600}}>All Caught Up!</Typography>
                    <Typography variant="body2" color="text.disabled">No request criteria matches this filter context right now.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={2.5}>
                    {requests.map((req) => (
                        <Grid size={{ xs: 12 }} key={req.assignment_id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    border: '1px solid #E2E8F0',
                                    bgcolor: '#fff',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', borderColor: '#CBD5E1' }
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                                    {/* 1. TOP ROW */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                        <Avatar
                                            src={req.profiles.pfp || undefined}
                                            sx={{ width: 72, height: 72, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #fff', flexShrink: 0 }}
                                        />

                                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2, mb: 0.5 }}>
                                                {`${req.profiles.first_name} ${req.profiles.last_name}`}
                                            </Typography>

                                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                                                <strong>Submitted:</strong> {new Date(req.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                            </Typography>

                                            <Divider sx={{ my: 1, borderColor: '#231b3a' }} />

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                                                    <strong>Student Group:</strong> {req.group_name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                                                    <strong>Year Level:</strong> {req.year_level}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* 2. MIDDLE ROW */}
                                    <Box sx={{
                                        display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#F8FAFC',
                                        p: 2, borderRadius: 2, borderLeft: '4px solid #493978', width: '100%'
                                    }}>
                                        <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1rem' }}>
                                            <Box component="span" sx={{ color: '#64748B', fontWeight: 500, display: 'inline-block', width: '70px' }}>Section:</Box>
                                            {req.section_name}
                                        </Typography>

                                        <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1rem' }}>
                                            <Box component="span" sx={{ color: '#64748B', fontWeight: 500, display: 'inline-block', width: '70px' }}>Shift:</Box>
                                            <Chip
                                                label={req.shift}
                                                size="small"
                                                sx={{
                                                    bgcolor: req.shift === 'AM' ? '#E0F2FE' : '#F3E8FF',
                                                    color: req.shift === 'AM' ? '#0369A1' : '#6B21A8',
                                                    fontWeight: 800,
                                                    borderRadius: '6px'
                                                }}
                                            />
                                        </Typography>

                                        <Typography variant="body1" sx={{ color: '#493978', fontWeight: 800, fontSize: '1.05rem' }}>
                                            <Box component="span" sx={{ color: '#64748B', fontWeight: 500, display: 'inline-block', width: '70px' }}>Date:</Box>
                                            {new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'short' })}
                                        </Typography>
                                    </Box>

                                    {/* 3. BOTTOM ROW */}
                                    <Box sx={{ width: '100%' }}>
                                        {filters.reqFilter === "Upcoming" ? (
                                            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="large"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => preHandleAction(req, 'Rejected')}
                                                    sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#EF5350', fontWeight: 700, py: 1.2, flex: 1 }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    disableElevation
                                                    size="large"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => preHandleAction(req, 'Confirmed')}
                                                    sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2E7D32', fontWeight: 700, py: 1.2, flex: 1, '&:hover': { bgcolor: '#1B5E20' } }}
                                                >
                                                    Accept
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                                                <Chip
                                                    label={req.status}
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                        width: '100%',
                                                        py: 2.2,
                                                        borderRadius: '8px',
                                                        ...getStatusChipColor(req.status)
                                                    }}
                                                />
                                                {req.status === 'Confirmed' && (
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => router.get(`/admin/manage-requests/${req.assignment_id}/details`)}
                                                        sx={{
                                                            textTransform: 'none',
                                                            borderRadius: 2,
                                                            fontWeight: 700,
                                                            borderColor: '#493978',
                                                            color: '#493978',
                                                            '&:hover': {
                                                                borderColor: '#36295e',
                                                                backgroundColor: 'rgba(73, 57, 120, 0.04)'
                                                            }
                                                        }}
                                                    >
                                                        View Chair Requests
                                                    </Button>
                                                )}
                                            </Box>
                                        )}
                                    </Box>

                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Action Confirmation Dialog Modal */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                sx={{ borderRadius: 3, p: 1, maxWidth: '440px' }}
            >
                <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlinedIcon color={pendingAction === 'Confirmed' ? 'success' : 'error'} />
                    Confirm Action
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#475569', fontSize: '0.95rem' }}>
                        Are you sure you want to <strong>{pendingAction === 'Confirmed' ? 'ACCEPT' : 'REJECT'}</strong> this student request?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setConfirmOpen(false)} variant="text" sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>Cancel</Button>
                    <Button
                        onClick={executeAction}
                        variant="contained"
                        disableElevation
                        color={pendingAction === 'Confirmed' ? 'success' : 'error'}
                        sx={{ textTransform: 'none', borderRadius: 2, px: 3, fontWeight: 600 }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
