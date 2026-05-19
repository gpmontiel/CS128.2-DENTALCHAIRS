import React, { useEffect, useState } from "react";
import {
    Box, Typography, Avatar, Divider, ToggleButton,
    ToggleButtonGroup, CircularProgress, Menu, MenuItem, ListItemText, ListItemIcon,
    Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Grid, Paper
} from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import EventIcon from '@mui/icons-material/Event';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { supabase } from "../../../utils/supabase";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const Requests = () => {
    const [reqFilter, setReqFilter] = useState("Upcoming");
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [sortConfig, setSortConfig] = useState({ column: 'created_at', ascending: true });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [pendingAction, setPendingAction] = useState<'Confirmed' | 'Rejected' | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('chair_manager_assignment')
                .select(`*, sections:section_id (section_name)`);

            if (reqFilter === "Upcoming") {
                query = query.eq('status', 'Pending');
            } else {
                query = query.eq('shift', reqFilter).in('status', ['Confirmed', 'Rejected', 'Cancelled']);
            }

            const { data: assignments, error } = await query.order(sortConfig.column, { ascending: sortConfig.ascending });

            if (error) {
                console.error("❌ Error fetching base assignments:", error.message);
                setLoading(false);
                return;
            }

            if (assignments && assignments.length > 0) {
                const fullyLoadedRequests = await Promise.all(assignments.map(async (req) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('profile_id', req.student_id)
                        .maybeSingle();

                    const { data: clinician } = await supabase
                        .from('clinician')
                        .select('*, student_groups:group_id(group_name)')
                        .eq('clinician_id', req.student_id)
                        .maybeSingle();

                    return {
                        ...req,
                        profiles: {
                            ...profile,
                            clinician: clinician
                        }
                    };
                }));
                setRequests(fullyLoadedRequests);
            } else {
                setRequests([]);
            }
        } catch (catchErr) {
            console.error("💥 CRITICAL JAVASCRIPT ERROR IN FALLBACK FETCH:", catchErr);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [reqFilter, sortConfig]);

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortSelect = (column: string, ascending: boolean) => {
        setSortConfig({ column, ascending });
        setAnchorEl(null);
    };

    const preHandleAction = (assignment: any, action: 'Confirmed' | 'Rejected') => {
        setSelectedAssignment(assignment);
        setPendingAction(action);
        setConfirmOpen(true);
    };

    const executeAction = async () => {
        if (!selectedAssignment || !pendingAction) return;

        console.log(`Executing ${pendingAction} for Assignment ID:`, selectedAssignment.assignment_id);

        // 1. Validation Check for Confirmed Actions
        if (pendingAction === 'Confirmed') {
            const { data: existingConfirmation, error: checkError } = await supabase
                .from('chair_manager_assignment')
                .select('assignment_id')
                .eq('section_id', selectedAssignment.section_id)
                .eq('shift', selectedAssignment.shift)
                .eq('date', selectedAssignment.date)
                .eq('status', 'Confirmed');

            if (checkError) {
                console.error("Validation error check failed:", checkError);
                alert("An error occurred during verification. Please try again.");
                setConfirmOpen(false);
                return;
            }

            if (existingConfirmation && existingConfirmation.length > 0) {
                alert(`Validation Failed: A student has already been accepted for this Section, Shift, and Date!`);
                setConfirmOpen(false);
                return;
            }
        }

        // 2. Update the assignment status
        const { error: updateError } = await supabase
            .from('chair_manager_assignment')
            .update({ status: pendingAction })
            .eq('assignment_id', selectedAssignment.assignment_id);

        if (updateError) {
            console.error("Failed to update status:", updateError);
            alert("Failed to update request status.");
            setConfirmOpen(false);
            return;
        }

        // 3. Send out the row insert to the Notifications table
        try {
            if (selectedAssignment?.student_id) {
                const formattedDate = new Date(selectedAssignment.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                const sectionName = selectedAssignment.sections?.section_name || 'your assigned section';
                const shiftType = selectedAssignment.shift;

                // Dynamically build the text strings based on 'Confirmed' vs 'Rejected'
                const notificationTitle = "[CM] Chair Manager Request";
                const notificationType = pendingAction === 'Confirmed' ? 'accepted' : 'rejected';

                const notificationMessage = pendingAction === 'Confirmed'
                    ? `Your clinical admin accepted your request to be chair manager for ${formattedDate} (${shiftType}) on ${sectionName}. You can now accept and reject chair requests from clinicians.`
                    : `Your clinical admin rejected your request to be chair manager for ${formattedDate} (${shiftType}) on ${sectionName}.`;

                // Define the notification payload
                const notificationPayload = {
                    user_id: selectedAssignment.student_id,
                    type: notificationType,
                    title: notificationTitle,
                    message: notificationMessage,
                    is_read: false
                };

                // 🔍 LOGGING THE PAYLOAD BEFORE INSERT
                console.log("📤 SENDING NOTIFICATION PAYLOAD:", notificationPayload);

                const { error: notificationError } = await supabase
                    .from("notifications")
                    .insert(notificationPayload);

                if (notificationError) {
                    console.error("⚠️ Status updated, but notification failed to send:", notificationError.message);
                } else {
                    console.log("🚀 Notification successfully pushed to student!");
                }
            }
        } catch (notifCatchErr) {
            console.error("💥 Error compiling notification package:", notifCatchErr);
        }

        // 4. Close modal and refresh UI view state cleanly
        setConfirmOpen(false);
        fetchRequests();
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
        <Box sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#F9FAFC', minHeight: '100vh' }}>

            {/* Header section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" color="#493979" fontFamily="Poppins" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        CM Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                <MenuItem onClick={() => handleSortSelect('date', true)}>
                    <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Earliest Target Date</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSortSelect('created_at', true)}>
                    <ListItemIcon><SortIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Submission (Oldest First)</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSortSelect('created_at', false)}>
                    <ListItemIcon><SortIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Submission (Newest First)</ListItemText>
                </MenuItem>
            </Menu>

            {/* Shift Context Selection Toggles */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <ToggleButtonGroup
                    value={reqFilter}
                    exclusive
                    onChange={(_, next) => next && setReqFilter(next)}
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
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
                    <CircularProgress size={44} sx={{ color: '#493978' }} />
                    <Typography variant="body2" color="text.secondary">Loading latest profile data...</Typography>
                </Box>
            ) : requests.length === 0 ? (
                <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 2, borderRadius: 3, borderStyle: 'dashed', bgcolor: 'transparent' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>All Caught Up!</Typography>
                    <Typography variant="body2" color="text.disabled">No request criteria matches this filter context right now.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={2.5}>
                    {requests.map((req) => {
                        const clinicianRaw = req.profiles?.clinician;
                        const clinicianInfo = Array.isArray(clinicianRaw) ? clinicianRaw[0] : clinicianRaw;
                        const groupInfo = clinicianInfo?.student_groups;

                        return (
                            <Grid item xs={12} key={req.assignment_id}>
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
                                    {/* Layout Container Column Stack */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                                        {/* 1. TOP ROW: PFP Left, Profiles/Timestamps Right */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>

                                            {/* PFP Only on Left */}
                                            <Avatar
                                                src={req.profiles?.pfp}
                                                sx={{ width: 72, height: 72, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #fff', flexShrink: 0 }}
                                            />

                                            {/* Info Fields on Right */}
                                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                {/* Student Name */}
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2, mb: 0.5 }}>
                                                    {`${req.profiles?.first_name || 'Unknown'} ${req.profiles?.last_name || 'User'}`}
                                                </Typography>

                                                {/* Submitted Timestamp */}
                                                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                                                    <strong>Submitted:</strong> {new Date(req.created_at).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                                                </Typography>

                                                {/* Divider Line Separator */}
                                                <Divider sx={{ my: 1, borderColor: '#231b3a' }} />

                                                {/* Student Group and Year Level metadata */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                                                        <strong>Student Group:</strong> {groupInfo?.group_name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                                                        <strong>Year Level:</strong> {clinicianInfo?.year_level || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* 2. MIDDLE ROW: Highlighted Section, Shift, and Date Panel */}
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                            bgcolor: '#F8FAFC',
                                            p: 2,
                                            borderRadius: 2,
                                            borderLeft: '4px solid #493978',
                                            width: '100%'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1rem' }}>
                                                <Box component="span" sx={{ color: '#64748B', fontWeight: 500, display: 'inline-block', width: '70px' }}>Section:</Box>
                                                {req.sections?.section_name || 'N/A'}
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

                                        {/* 3. BOTTOM ROW: Full Width Controls Buttons or Statuses */}
                                        <Box sx={{ width: '100%' }}>
                                            {reqFilter === "Upcoming" ? (
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
                                            )}
                                        </Box>

                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Action Confirmation Dialog Modal */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: '440px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlinedIcon color={pendingAction === 'Confirmed' ? 'success' : 'error'} />
                    Confirm Action
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#475569', fontSize: '0.95rem' }}>
                        Are you sure you want to <strong>{pendingAction === 'Confirmed' ? 'ACCEPT' : 'REJECT'}</strong> this student request?
                        This modification will instantly update their roster status.
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
};

export default Requests;