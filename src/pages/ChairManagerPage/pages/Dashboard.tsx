import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Card, Button, Grid, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert
} from "@mui/material";

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import TodayIcon from '@mui/icons-material/Today';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import CircleIcon from '@mui/icons-material/Circle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CancelIcon from '@mui/icons-material/Cancel';

import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

import { supabase } from "../../../utils/supabase.ts";
import dayjs from "dayjs";

interface Room {
    room_id: number;
    room_name: string;
}

interface Section {
    section_id: number;
    room_id: number;
    section_name: string;
    chair_count: number;
}

const Dashboard : React.FC = () => {
    const [isChairManager, setIsChairManager] = useState(false);
    const navigate = useNavigate();

    // for dialog
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };

    // for snackbar, alert
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // backend connection
    const [rooms, setRooms] = useState<Room[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const shifts = ['AM', 'PM'];

    const [formData, setFormData] = useState({
        room: '',
        section: '',
        date: null,
        shift: ''
    });

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const { data, error } = await supabase
                    .from('rooms')
                    .select('*')
                    .order('room_name');

                if (error) throw error;
                setRooms(data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchRooms();
    }, []);

    const fetchSections = async (room_id: number) => {
        try {
            const { data, error } = await supabase
                .from('sections')
                .select('*')
                .eq('room_id', room_id)
                .order('section_name');

            if (error) throw error;
            setSections(data);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    }

    useEffect(() => {
        if (formData.room) {
            const selectedRoom = rooms.find(r => r.room_name === formData.room);
            if (selectedRoom) {
                fetchSections(selectedRoom.room_id);
            }
        } else {
            setSections([]);
        }
    }, [formData.room, rooms]);

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'room') {
                newData.section = '';
            }
            return newData;
        });
    };

    const isFormValid = formData.room && formData.section && formData.date && formData.shift;

    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    const fetchPendingRequests = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('chair_manager_assignment')
                .select(`
                    assignment_id,
                    date,
                    shift,
                    status,
                    section:section_id (
                        section_name,
                        room:room_id (
                            room_name
                        )
                    )
                `)
                .eq('status', 'Pending')
                .eq('student_id', user.id)
                .gte('date', today)
                .order('date', { ascending: true });

            if (error) throw error;

            const transformedData = data?.map(item => ({
                ...item,
                room: item.section?.room?.room_name || 'N/A',
                section: item.section?.section_name || 'N/A',
                date: item.date,
                shift: item.shift
            })) || [];

            setPendingRequests(transformedData);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const handleSubmit = async () => {
        try {
            const formattedDate = formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : null;
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const selectedSection = sections.find(s => s.section_name === formData.section);
            if (!selectedSection) {
                throw new Error('Selected section not found');
            }

            // Slot verification checks...
            const { data: slotTaken, error: slotCheckError } = await supabase
                .from('chair_manager_assignment')
                .select('assignment_id')
                .eq('section_id', selectedSection.section_id)
                .eq('date', formattedDate)
                .eq('shift', formData.shift)
                .in('status', ['Accepted', 'Confirmed']);

            if (slotCheckError) throw slotCheckError;

            if (slotTaken && slotTaken.length > 0) {
                setSnackbarMessage('A chair manager is already assigned for this section, date, and shift.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }

            const { data: userExistingShift, error: userCheckError } = await supabase
                .from('chair_manager_assignment')
                .select('assignment_id, shift')
                .eq('student_id', user.id)
                .eq('section_id', selectedSection.section_id)
                .eq('date', formattedDate)
                .in('status', ['Pending', 'Accepted', 'Confirmed']);

            if (userCheckError) throw userCheckError;

            if (userExistingShift && userExistingShift.length > 0) {
                const existingShift = userExistingShift[0].shift;
                setSnackbarMessage(`You can only have one shift per section per day. Existing: ${existingShift}.`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }

            const assignmentData = {
                student_id: user.id,
                section_id: selectedSection.section_id,
                shift: formData.shift,
                date: formattedDate,
            };

            const { error } = await supabase
                .from('chair_manager_assignment')
                .insert(assignmentData)
                .select();

            if (error) throw error;

            // NOTIFICATION TO CLINICAL ADMINS
            try {
                // Step A: Fetch the student's name
                const { data: studentProfile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('profile_id', user.id)
                    .maybeSingle();

                const studentName = studentProfile
                    ? `${studentProfile.first_name} ${studentProfile.last_name}`
                    : "A student";

                // Step B: Fetch Clinical Admin IDs
                const { data: admins } = await supabase
                    .from('profiles')
                    .select('profile_id')
                    .eq('role_id', 1);

                if (admins && admins.length > 0) {
                    const prettyDate = dayjs(formattedDate).format('MMMM D, YYYY');

                    const notificationPayloads = admins.map(admin => ({
                        user_id: admin.profile_id,
                        type: 'incoming_request',
                        title: 'Request for Chair Manager',
                        message: `${studentName} requested to be a chair manager for ${prettyDate} (${formData.shift}) on ${formData.section}. Please review the request in the Requests section to accept or reject it.`,
                        is_read: false
                    }));

                    await supabase.from('notifications').insert(notificationPayloads);
                }
            } catch (notifErr) {
                console.error('Non-blocking notification generation failure:', notifErr);
            }

            await fetchPendingRequests();
            setFormData({ room: '', section: '', shift: '', date: null });
            handleClose();

            setSnackbarMessage('Request submitted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error submitting request:', error);
            setSnackbarMessage('Failed to submit request. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({ room: '', section: '', date: null, shift: '' });
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const availableSections = formData.room ? sections.filter(s => {
        const selectedRoom = rooms.find(r => r.room_name === formData.room);
        return s.room_id === selectedRoom?.room_id;
    }) : [];

    useEffect(() => {
        const checkChairManagerStatus = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsChairManager(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('chair_manager_assignment')
                    .select('assignment_id')
                    .eq('student_id', user.id)
                    .eq('status', 'Confirmed')
                    .gte('date', today);

                if (error) throw error;

                setIsChairManager(data.length > 0);
            } catch (error) {
                console.error('Error checking chair manager status:', error);
                setIsChairManager(false);
            }
        };

        checkChairManagerStatus();
    }, [])

    const [assignmentData, setAssignmentData] = useState<any[]>([]);

    const fetchAssignments = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('chair_manager_assignment')
                .select(`
                    assignment_id,
                    date,
                    shift,
                    status,
                    section:section_id (
                        section_name,
                        room:room_id (
                            room_name
                        )
                    )
                `)
                .eq('status', 'Confirmed')
                .eq('student_id', user.id)
                .gte('date', today)
                .order('date', { ascending: true });

            if (error) throw error;

            const transformedData = data?.map(item => ({
                ...item,
                room: item.section?.room?.room_name || 'N/A',
                section: item.section?.section_name || 'N/A',
                date: item.date,
                shift: item.shift
            })) || [];

            setAssignmentData(transformedData);
        } catch (error) {
            console.error('Error fetching active assignments:', error);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const handleCancelClick = (assignment_id: number) => {
        setSelectedAssignmentId(assignment_id);
        setCancelDialogOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedAssignmentId) return;

        try {
            // Fetch targeted data details before cancellation changes status
            const { data: targetReq } = await supabase
                .from('chair_manager_assignment')
                .select(`
                student_id, date, shift,
                sections:section_id (section_name)
            `)
                .eq('assignment_id', selectedAssignmentId)
                .maybeSingle();

            const { error } = await supabase
                .from('chair_manager_assignment')
                .update({ status: 'Cancelled' })
                .eq('assignment_id', selectedAssignmentId);

            if (error) throw error;

            if (targetReq) {
                try {
                    const { data: studentProfile } = await supabase
                        .from('profiles')
                        .select('first_name, last_name')
                        .eq('profile_id', targetReq.student_id)
                        .maybeSingle();

                    const studentName = studentProfile
                        ? `${studentProfile.first_name} ${studentProfile.last_name}`
                        : "A student";

                    const { data: admins } = await supabase
                        .from('profiles')
                        .select('profile_id')
                        .eq('role_id', 1);

                    if (admins && admins.length > 0) {
                        const prettyDate = dayjs(targetReq.date).format('MMMM D, YYYY');
                        const sectionName = targetReq.sections?.section_name || 'N/A';

                        const cancellationPayloads = admins.map(admin => ({
                            user_id: admin.profile_id,
                            type: 'cancelled_request',
                            title: 'Chair Manager Request Cancelled',
                            message: `${studentName} cancelled their request for ${prettyDate} (${targetReq.shift}) on ${sectionName}. Please review other available requests for this schedule if needed.`,
                            is_read: false
                        }));

                        await supabase.from('notifications').insert(cancellationPayloads);
                    }
                } catch (cancelNotifErr) {
                    console.error('Non-blocking cancellation notification error:', cancelNotifErr);
                }
            }

            // Update UI by updating all relevant data arrays
            await fetchPendingRequests();
            await fetchAssignments();

            setSnackbarMessage('Request cancelled successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setCancelDialogOpen(false);
            setSelectedAssignmentId(null);
        } catch (error) {
            console.error('Error cancelling request:', error);
            setSnackbarMessage('Failed to cancel request');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCancelDialogClose = () => {
        setCancelDialogOpen(false);
        setSelectedAssignmentId(null);
    };

    const [historyData, setHistoryData] = useState<any[]>([]);
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) return;

                const { data, error } = await supabase
                    .from('chair_manager_assignment')
                    .select(`
                    assignment_id,
                    date,
                    shift,
                    status,
                    section:section_id (
                        section_name,
                        room:room_id (
                            room_name
                        )
                    )
                `)
                    .eq('student_id', user.id)
                    .order('date', { ascending: false })
                    .limit(3);

                if (error) throw error;

                const formatted = data?.map(item => ({
                    assignment_id: item.assignment_id,
                    date: item.date,
                    shift: item.shift,
                    status: item.status,
                    room: item.section?.room?.room_name || 'N/A',
                    section: item.section?.section_name || 'N/A',
                })) || [];

                setHistoryData(formatted);
            } catch (err) {
                console.error('Error fetching history:', err);
            }
        };

        fetchHistory();
    }, []);

    const getHistoryStatus = (item: any) => {
        const today = dayjs().startOf('day');
        const itemDate = dayjs(item.date).startOf('day');

        if (item.status === 'Pending') return 'Pending';
        if (item.status === 'Cancelled') return 'Cancelled';
        if (item.status === 'Rejected') return 'Rejected';

        if (item.status === 'Confirmed') {
            if (itemDate.isBefore(today)) return 'Completed';
            return 'Ongoing';
        }

        return 'Unknown';
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending':
                return { bg: '#E8F0FE', color: '#1A73E8' };
            case 'Ongoing':
                return { bg: '#FFF4CC', color: '#B26A00' };
            case 'Completed':
                return { bg: '#E6F4EA', color: '#1E7E34' };
            case 'Cancelled':
                return { bg: '#F1F3F4', color: '#5F6368' };
            case 'Rejected':
                return { bg: '#FDECEA', color: '#B3261E' };
            default:
                return { bg: '#F1F3F4', color: '#5F6368' };
        }
    };

    // Shared UI block helper to render pending cards cleanly under either mode
    const renderPendingRequestsSection = () => {
        if (pendingRequests.length === 0) return null;

        return (
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" color="#493979" sx={{ mb: 1.5, fontFamily: 'Poppins, sans-serif' }}>
                    Pending Requests ({pendingRequests.length})
                </Typography>
                {pendingRequests.map((request) => (
                    <Card key={request.assignment_id} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: '#F3F0FF', border: '1px solid #D8CCFF', boxShadow: 1 }}>
                        <Grid container rowSpacing={1.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <SchoolIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>Room</Typography>
                                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>{request.room}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <MeetingRoomIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>Section</Typography>
                                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>{request.section}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <TodayIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>Date</Typography>
                                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>{request.date}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <AccessTimeIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>Shift</Typography>
                                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>{request.shift}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                        <Button
                            variant="outlined" fullWidth size="small" onClick={() => handleCancelClick(request.assignment_id)}
                            sx={{ mt: 2, borderColor: '#dc3545', color: '#dc3545', textTransform: 'none', fontFamily: 'Inter', '&:hover': { borderColor: '#bd2130', bgcolor: '#fdf2f2' } }}
                            startIcon={<CancelIcon fontSize="small"/>}
                        >
                            Cancel Request
                        </Button>
                    </Card>
                ))}
            </Box>
        );
    };

    return (
        <Box
            fontFamily="Inter"
            sx={{ backgroundColor: '#ffffff', backgroundImage: 'none !important', minHeight: '100vh'}}
        >
            <Typography variant="h4" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ my: 2, mx: 3, fontFamily: 'Poppins, sans-serif !important' }}>
                Dashboard
            </Typography>

            {/* Status Section */}
            {isChairManager ? (
                // Chair Manager View (Supports Multiple Cards)
                <Box sx={{ mx: 3, mb: 3 }}>
                    <Typography
                        variant="h6"
                        color="#493979"
                        fontWeight="700"
                        fontFamily="Poppins"
                        sx={{ mb: 2, fontFamily: 'Poppins, sans-serif !important' }}
                    >
                        Active Assignments ({assignmentData.length})
                    </Typography>

                    {assignmentData.map((assignment) => (
                        <Card
                            key={assignment.assignment_id}
                            sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                boxShadow: 2,
                                borderLeft: "5px solid #493979",
                                backgroundColor: "#F3F0FA"
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                    label="ACTIVE ROLE"
                                    icon={<CircleIcon />}
                                    size="small"
                                    sx={{
                                        fontSize: 10,
                                        px: 0.5,
                                        height: 18,
                                        color: "#B26A00",
                                        backgroundColor: "#FFF4CC",
                                        "& .MuiChip-icon": {
                                            fontSize: 10,
                                            color: "#B26A00"
                                        }
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        fontSize: 10,
                                        fontWeight: 300,
                                        color: "text.secondary"
                                    }}
                                >
                                    <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#56567e" }} />
                                    Current Assignment
                                </Typography>
                            </Box>

                            <Typography variant="h6" fontWeight="600" fontFamily="Poppins" sx={{ mb: 2, mt: 1 }}>
                                Assigned Chair Manager
                            </Typography>

                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <SchoolIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Room
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14 }}>
                                                {assignment.room}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <MeetingRoomIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Section
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14 }}>
                                                {assignment.section}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <TodayIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Date
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14 }}>
                                                {assignment.date}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <AccessTimeIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Shift
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14 }}>
                                                {assignment.shift}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Button
                                variant="contained"
                                fullWidth
                                disableElevation
                                sx={{ backgroundColor: '#493979', fontFamily: 'Inter', textTransform: 'none' }}
                                startIcon={<GroupsIcon/>}
                                onClick={() => navigate(`/chair-manager/manage-requests/${assignment.assignment_id}`)}
                            >
                                View Requests
                            </Button>
                        </Card>
                    ))}

                    {/* Request Role Section for active chair managers */}
                    <Box sx={{ mt: 3, borderTop: '1px solid #4A3979', pt: 2  }}>
                        <Typography
                            variant="h6"
                            color="#493979"
                            fontWeight="700"
                            fontFamily="Poppins"
                            sx={{ mb: 0.5, fontFamily: 'Poppins, sans-serif !important' }}
                        >
                            Request Role
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Submit another request to manage a different shift
                        </Typography>

                        {renderPendingRequestsSection()}

                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ borderColor: '#493979', color: '#493979', textTransform: 'none', fontFamily: 'Inter'}}
                            startIcon={<AssignmentIndIcon/>}
                            onClick={handleOpen}
                        >
                            Request Role
                        </Button>
                    </Box>
                </Box>
            ) : (
                // Non-Chair Manager View
                <Card sx={{ mx: 3, mb: 3, p: 2, borderRadius: 2, boxShadow: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'left', gap: 1 }}>
                        <Chip
                            label={pendingRequests.length > 0 ? "PENDING ROLE" : "INACTIVE ROLE"}
                            icon={<PanoramaFishEyeIcon />}
                            size="small"
                            sx={{
                                fontSize: 10,
                                px: 0.5,
                                height: 18,
                                color: "#5F6368",
                                backgroundColor: "#F1F3F4",
                                "& .MuiChip-icon": {
                                    fontSize: 10,
                                    color: "#5F6368"
                                }
                            }}
                        />
                    </Box>

                    <Typography variant="h6" fontWeight="600" fontFamily="Poppins" >
                        Assigned Chair Manager
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {pendingRequests.length > 0 ? "Track your pending chair manager requests"
                            : " Submit a request to manage a future shift"}
                    </Typography>

                    {renderPendingRequestsSection()}

                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ borderColor: '#493979', color: '#493979', textTransform: 'none', fontFamily: 'Inter'}}
                        startIcon={<AssignmentIndIcon/>}
                        onClick={handleOpen}
                    >
                        Request Role
                    </Button>
                </Card>
            )}

            {/* Dialog components remain intact */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', pb: 0 }}> Request Role </DialogTitle>
                <Typography variant="caption" sx={{ px: 3, color: 'text.secondary' }}>
                    Please fill in all required information
                </Typography>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>Room</Typography>
                            <FormControl fullWidth required size="small">
                                <InputLabel>Select Room</InputLabel>
                                <Select value={formData.room} label="Select Room" onChange={(e) => handleFormChange('room', e.target.value)}>
                                    {rooms.map((room) => (
                                        <MenuItem key={room.room_id} value={room.room_name}>{room.room_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>Section</Typography>
                            <FormControl fullWidth required disabled={!formData.room} size="small">
                                <InputLabel>Select Section</InputLabel>
                                <Select value={formData.section} label="Select Section" onChange={(e) => handleFormChange('section', e.target.value)}>
                                    {availableSections.map((section) => (
                                        <MenuItem key={section.section_id} value={section.section_name}>{section.section_name}</MenuItem>
                                    ))}
                                </Select>
                                {!formData.room && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>Please select a room first</Typography>
                                )}
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>Shift</Typography>
                            <FormControl fullWidth required size="small">
                                <InputLabel>Select Shift</InputLabel>
                                <Select value={formData.shift} label="Select Shift" onChange={(e) => handleFormChange('shift', e.target.value)}>
                                    {shifts.map((shift) => (
                                        <MenuItem key={shift} value={shift}>{shift}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>Date</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Choose a Date" value={formData.date} onChange={(newValue) => handleFormChange('date', newValue)}
                                    slotProps={{ textField: { fullWidth: true, required: true, size: "small" } }} disablePast
                                />
                            </LocalizationProvider>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ gap: 0.5, width: '100%', mb: 1 }}>
                    <Button variant="outlined" onClick={handleClose} sx={{ flex: 1, textTransform: 'none', borderColor: '#493979', color: '#493979', ml: 1 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid} sx={{ flex: 1, textTransform: 'none', backgroundColor: '#493979', color: 'white', mr: 1, '&.Mui-disabled': { backgroundColor: '#ccc', color: '#888' } }}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialogOpen} onClose={handleCancelDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#dc3545', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CancelIcon color="error" /> Cancel Request
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Are you sure you want to cancel your request? <b> This action cannot be undone. </b>
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button variant="outlined" onClick={handleCancelDialogClose} sx={{ flex: 1, textTransform: 'none', borderColor: '#6c757d', color: '#6c757d' }}>
                        Close
                    </Button>
                    <Button variant="contained" onClick={handleConfirmCancel} sx={{ flex: 1, textTransform: 'none', backgroundColor: '#dc3545' }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ mx: 1, my: 1 }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>

            {/* History Section */}
            <Box sx={{ mx: 3, mb: 3, borderTop: '1px solid #4A3979', pt: 2 }}>
                <Typography variant="h6" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ mb: 2 }}>
                    History
                </Typography>
                <Box>
                    {historyData.length === 0 ? (
                        <Typography color="text.secondary" fontFamily="Inter" sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
                            No history yet
                        </Typography>
                    ) : (
                        <>
                            {historyData.map((item) => {
                                const statusLabel = getHistoryStatus(item);
                                const style = getStatusStyle(statusLabel);

                                return (
                                    <Card
                                        key={item.assignment_id}
                                        variant="outlined"
                                        sx={{ mb: 1.5, p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box sx={{ textAlign: 'center', backgroundColor: '#F3F0FA', p: 1, borderRadius: 1.5, minWidth: 50, border: '1px solid #E0D7F7' }}>
                                                <Typography variant="caption" fontWeight="700" color="#493979" sx={{ display: 'block', lineHeight: 1 }}>
                                                    {dayjs(item.date).format('D')}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: 9, textTransform: 'uppercase' }}>
                                                    {dayjs(item.date).format('MMM')}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600" sx={{ color: '#493979', lineHeight: 1.2, fontSize: 18 }}>
                                                    {item.section}
                                                </Typography>
                                                <Typography variant="caption" sx={{ lineHeight: 1.2, display: 'block', mt: 0 }}>
                                                    {item.room}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTimeIcon sx={{ fontSize: 12 }} /> {item.shift} Shift
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                            <Chip label={statusLabel} size="small" sx={{ fontSize: '10px', fontWeight: 'bold', height: '20px', backgroundColor: style.bg, color: style.color, borderRadius: '4px' }} />
                                            {(statusLabel === 'Ongoing' || statusLabel === 'Completed') && (
                                                <Button
                                                    size="small" variant="text" sx={{ textTransform: 'none', color: '#493979', fontWeight: 600, fontSize: 12, p: 0, minWidth: 0 }}
                                                    onClick={() => {
                                                        const status = getHistoryStatus(item);
                                                        if (status === "Ongoing") {
                                                            navigate(`/chair-manager/manage-requests/${item.assignment_id}`);
                                                        } else {
                                                            navigate(`/chair-manager/history/${item.assignment_id}`);
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            )}
                                        </Box>
                                    </Card>
                                );
                            })}
                            <Button fullWidth sx={{ mt: 1, mb: 4, color: 'text.secondary', textTransform: 'none', fontSize: 13, textDecoration: 'underline' }} onClick={() => navigate('/chair-manager/history')}>
                                View more on history page
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard;