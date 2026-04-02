import { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, Grid, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert} from "@mui/material";

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

import ChairManagerNavbar from "./components/ChairManagerNavbar.tsx";
import { supabase } from "../../utils/supabase.ts";
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
    })

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
            // Reset section when room changes
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

            const { data, error } = await supabase
                .from('chair_manager_assignment')
                .select(`
                    *,
                    section:section_id (
                        section_name,
                        room:room_id (
                            room_name
                        )
                    )
                `)
                .eq('status', 'Pending')
                .gte('date', today);

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

            const assignmentData = {
                student_id: user.id,
                section_id: selectedSection.section_id,
                shift: formData.shift,
                date: formattedDate,
            };

            const { data, error } = await supabase
                .from('chair_manager_assignment')
                .insert(assignmentData)
                .select()

            if (error) throw error;

            setPendingRequests(prev => [data[0], ...prev]);

            setFormData({ room: '', section: '', shift: '', date: null });
            handleClose()

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
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                const { data, error } = await supabase
                    .from('chair_manager_assignment')
                    .select(`
                    *,
                    section:section_id (
                        section_name,
                        room:room_id (
                            room_name
                        )
                    )
                `)
                    .eq('status', 'Confirmed')
                    .gte('date', today);

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
                console.error('Error cancelling request:', error);
                setSnackbarMessage('Failed to cancel request');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        };

        fetchAssignments();
    }, [])

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const handleCancelClick = (assignment_id: number) => {
        setSelectedAssignmentId(assignment_id);
        setCancelDialogOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedAssignmentId) return;

        try {
            const { error } = await supabase
                .from('chair_manager_assignment')
                .update({ status: 'Cancelled' })
                .eq('assignment_id', selectedAssignmentId);

            if (error) throw error;

            await fetchPendingRequests();

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

    return (
        <Box fontFamily="Inter">
            <ChairManagerNavbar/>

            <Typography variant="h5" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ my: 2, mx: 3 }}>
                Dashboard
            </Typography>

            {/* Status Card */}
            {isChairManager ? (
                // Chair Manager View
                <Card
                    sx={{
                        mx: 3,
                        mb: 3,
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
                                color: "#1E7E34",
                                backgroundColor: "#E6F4EA",
                                "& .MuiChip-icon": {
                                    fontSize: 10,
                                    color: "#1E7E34"
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

                    <Typography variant="h6" fontWeight="600" fontFamily="Poppins" sx={{ mb: 2 }}>
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
                                        {assignmentData[0]?.room}
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
                                        {assignmentData[0]?.section}
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
                                        {assignmentData[0]?.date}
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
                                        {assignmentData[0]?.shift}
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
                    >
                        View Requests
                    </Button>
                </Card>
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

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        {pendingRequests.length > 0 ? "Track your pending chair manager request"
                            : " Submit a request to manage a future shift"}
                    </Typography>

                    {pendingRequests.length > 0 ? (
                        <Card sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#F3F0FF',
                            border: '1px solid #D8CCFF',
                            boxShadow: 1
                        }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#5E3A8C' }}>  {/* Darker purple text */}
                                Your Current Request
                            </Typography>

                            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <SchoolIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />  {/* Purple icon */}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Room
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>  {/* Dark purple text */}
                                                {pendingRequests[0]?.room}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <MeetingRoomIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />  {/* Purple icon */}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Section
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>  {/* Dark purple text */}
                                                {pendingRequests[0]?.section}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <TodayIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />  {/* Purple icon */}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Date
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>  {/* Dark purple text */}
                                                {pendingRequests[0]?.date}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <AccessTimeIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />  {/* Purple icon */}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                                                Shift
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: 14, color: '#4A2B73' }}>  {/* Dark purple text */}
                                                {pendingRequests[0]?.shift}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                onClick={() => handleCancelClick(pendingRequests[0]?.assignment_id)}
                                sx={{
                                    mt: 2,
                                    borderColor: '#dc3545',
                                    color: '#dc3545',
                                    textTransform: 'none',
                                    fontFamily: 'Inter',
                                }}
                                startIcon={<CancelIcon fontSize="small"/>}
                            >
                                Cancel Request
                            </Button>
                        </Card>
                    ) : (
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ borderColor: '#493979', color: '#493979', textTransform: 'none', fontFamily: 'Inter'}}
                            startIcon={<AssignmentIndIcon/>}
                            onClick={handleOpen}
                        >
                            Request Role
                        </Button>
                    )}

                    {/* Dialog Form for Requesting to be a Chair Manager */}
                    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ fontWeight: 'bold', pb: 0 }}> Request Role </DialogTitle>
                        <Typography variant="caption" sx={{ px: 3, color: 'text.secondary' }}>
                            Please fill in all required information
                        </Typography>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Rooms */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>
                                        Room
                                    </Typography>

                                    <FormControl fullWidth required size="small">
                                        <InputLabel>Select Room</InputLabel>
                                        <Select
                                            value={formData.room}
                                            label="Select Room"
                                            onChange={(e) => handleFormChange('room', e.target.value)}
                                        >
                                            {rooms.map((room) => (
                                                <MenuItem key={room.room_id} value={room.room_name}>
                                                    {room.room_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Sections */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>
                                        Section
                                    </Typography>

                                    <FormControl fullWidth required disabled={!formData.room} size="small">
                                        <InputLabel>Select Section</InputLabel>
                                        <Select
                                            value={formData.section}
                                            label="Select Section"
                                            onChange={(e) => handleFormChange('section', e.target.value)}
                                        >
                                            {availableSections.map((section) => (
                                                <MenuItem key={section.section_id} value={section.section_name}>
                                                    {section.section_name}
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        {!formData.room && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                Please select a room first
                                            </Typography>
                                        )}

                                    </FormControl>
                                </Box>

                                {/* Shift Dropdown */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>
                                        Shift
                                    </Typography>

                                    <FormControl fullWidth required size="small">
                                        <InputLabel>Select Shift</InputLabel>
                                        <Select
                                            value={formData.shift}
                                            label="Select Shift"
                                            onChange={(e) => handleFormChange('shift', e.target.value)}
                                        >
                                            {shifts.map((shift) => (
                                                <MenuItem key={shift} value={shift}>
                                                    {shift}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Date Picker */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>
                                        Date
                                    </Typography>

                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Choose a Date"
                                            value={formData.date}
                                            onChange={(newValue) => handleFormChange('date', newValue)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    required: true,
                                                    size: "small"
                                                }
                                            }}
                                            disablePast
                                        />
                                    </LocalizationProvider>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ gap: 0.5, width: '100%', mb: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    borderColor: '#493979',
                                    color: '#493979',
                                    ml: 1
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    backgroundColor: '#493979',
                                    color: 'white',
                                    mr: 1,
                                    '&.Mui-disabled': {
                                        backgroundColor: '#ccc',
                                        color: '#888',
                                    },
                                }}
                            >
                                Submit
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Dialog for Cancelling Chair Manager Request */}
                    <Dialog
                        open={cancelDialogOpen}
                        onClose={handleCancelDialogClose}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{
                            fontWeight: 'bold',
                            color: '#dc3545',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <CancelIcon color="error" />
                            Cancel Request
                        </DialogTitle>

                        <DialogContent>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Are you sure you want to cancel your request? <b> This action cannot be undone. </b>
                            </Typography>
                        </DialogContent>

                        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={handleCancelDialogClose}
                                sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    borderColor: '#6c757d',
                                    color: '#6c757d'
                                }}
                            >
                                Close
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleConfirmCancel}
                                sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    backgroundColor: '#dc3545',
                                }}
                            >
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleSnackbarClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{ mx: 1, my: 1 }}
                    >
                        <Alert
                            onClose={handleSnackbarClose}
                            severity={snackbarSeverity}
                            sx={{ width: '100%' }}
                        >
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Card>
            )}

            {/* History Section */}
        </Box>
    )
}

export default Dashboard;