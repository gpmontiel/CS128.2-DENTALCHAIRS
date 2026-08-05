import {useForm, router, usePage} from '@inertiajs/react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CancelIcon from '@mui/icons-material/Cancel';
import CircleIcon from '@mui/icons-material/Circle';
import GroupsIcon from '@mui/icons-material/Groups';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import SchoolIcon from '@mui/icons-material/School';
import TodayIcon from '@mui/icons-material/Today';
import {
    Box, Typography, Card, Button, Grid, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {CircleCheckBig} from "lucide-react";
import { useState, useEffect } from 'react';

// --- INTERFACES ---
interface Section {
    id: number;
    room_id: number;
    section_name: string;
    chair_count: number;
}

interface Room {
    id: number;
    room_name: string;
    sections: Section[];
}

interface Assignment {
    id: number;
    date: string;
    shift: string;
    status: string;
    section: {
        section_name: string;
        room: {
            room_name: string;
        }
    }
}

interface PageProps {
    [key: string]: any;
    rooms: Room[];
    pendingRequests: Assignment[];
    assignmentData: Assignment[];
    historyData: Assignment[];
    isChairManager: boolean;
    flash: { success?: string; error?: string; };
}

export default function Home({rooms = [], pendingRequests: rawPending = [], assignmentData: rawAssignments = [], historyData: rawHistory = [], isChairManager = false}: PageProps) {
    const flattenData = (data: Assignment[]) => data.map(item => ({
        ...item,
        assignment_id: item.id,
        room: item.section?.room?.room_name || 'N/A',
        section: item.section?.section_name || 'N/A'
    }));

    const pendingRequests = flattenData(rawPending);
    const assignmentData = flattenData(rawAssignments);
    const historyData = flattenData(rawHistory);

    // 2. UI States
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        reset();
    };

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

    const { flash, errors } = usePage<PageProps>().props;
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error || errors?.message) {
            const timer = setTimeout(() => {
                setSnackbarOpen(true);
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [flash, errors]);

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const { data: formData, setData, post, processing, reset, transform } = useForm({
        room: '',
        section: '',
        date: null as string | null,
        shift: ''
    });

    const shifts = ['AM', 'PM'];
    const selectedRoom = rooms.find(r => r.id === Number(formData.room));
    const availableSections = selectedRoom ? selectedRoom.sections : [];
    const isFormValid = formData.room && formData.section && formData.date && formData.shift && !processing;

    const handleFormChange = (field: string, value: any) => {
        if (field === 'room') {
            setData({ ...formData, room: value, section: '' });
        } else if (field === 'date') {
            setData('date', value ? dayjs(value).format('YYYY-MM-DD') : null);
        } else {
            setData(field as any, value);
        }
    };

    transform((currentData) => ({
        section_id: currentData.section,
        shift: currentData.shift,
        date: currentData.date
    }));

    const handleSubmit = () => {
        post('/chair-manager/request-role', {
            onSuccess: () => handleClose(),
        });
    };

    const handleCancelClick = (assignment_id: number) => {
        setSelectedAssignmentId(assignment_id);
        setCancelDialogOpen(true);
    };

    const handleCancelDialogClose = () => {
        setCancelDialogOpen(false);
        setSelectedAssignmentId(null);
    };

    const handleConfirmCancel = () => {
        if (!selectedAssignmentId) {
            return;
        }

        router.post(`/chair-manager/cancel-request/${selectedAssignmentId}`, {}, {
            onSuccess: () => {
                setCancelDialogOpen(false);
                setSelectedAssignmentId(null);
            }
        });
    };

    // 4. Layout Helpers
    const getHistoryStatus = (item: any) => {
        const today = dayjs().startOf('day');
        const itemDate = dayjs(item.date).startOf('day');

        if (item.status === 'Pending') {
            return 'Pending';
        }

        if (item.status === 'Cancelled') {
            return 'Cancelled';
        }

        if (item.status === 'Rejected') {
            return 'Rejected';
        }

        if (item.status === 'Confirmed') {
            if (itemDate.isBefore(today)) {
            return 'Completed';
        }

            return 'Ongoing';
        }

        return 'Unknown';
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return { bg: '#E8F0FE', color: '#1A73E8' };
            case 'Ongoing': return { bg: '#FFF4CC', color: '#B26A00' };
            case 'Completed': return { bg: '#E6F4EA', color: '#1E7E34' };
            case 'Cancelled': return { bg: '#F1F3F4', color: '#5F6368' };
            case 'Rejected': return { bg: '#FDECEA', color: '#B3261E' };
            default: return { bg: '#F1F3F4', color: '#5F6368' };
        }
    };

    const renderPendingRequestsSection = () => {
        if (pendingRequests.length === 0) {
            return null;
        }

        return (
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ variant:"subtitle1", fontWeight: "600", color:"#493979", mb: 1.5, fontFamily: 'Poppins, sans-serif' }}>
                    Pending Requests ({pendingRequests.length})
                </Typography>
                {pendingRequests.map((request) => (
                    <Card key={request.assignment_id} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: '#F3F0FF', border: '1px solid #D8CCFF', boxShadow: 1 }}>
                        <Grid container rowSpacing={1.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <SchoolIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography sx={{ variant:"caption", color: "text.secondary",display:"block", fontSize: 10 }}>Room</Typography>
                                        <Typography sx={{ variant: "body1", fontWeight: "600", fontSize: 14, color: '#4A2B73' }}>{request.room}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <MeetingRoomIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography sx={{ variant:"caption", color:"text.secondary", display:"block", fontSize: 10 }}>Section</Typography>
                                        <Typography sx={{ variant: "body1", fontWeight:"600", fontSize: 14, color: '#4A2B73' }}>{request.section}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <TodayIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography sx={{ variant:"caption", color:"text.secondary", display:"block", fontSize: 10 }}>Date</Typography>
                                        <Typography sx={{ variant: "body1", fontWeight: "600", fontSize: 14, color: '#4A2B73' }}>{dayjs(request.date).format('YYYY-MM-DD')}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={6}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <AccessTimeIcon sx={{ color: '#8B6FC8', fontSize: 24 }} />
                                    <Box>
                                        <Typography sx={{ variant:"caption", color:"text.secondary", display:"block", fontSize: 10 }}>Shift</Typography>
                                        <Typography sx={{ variant:"body1", fontWeight:"600", fontSize: 14, color: '#4A2B73' }}>{request.shift}</Typography>
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
        <Box sx={{ fontFamily:"Inter"}}>
            <Typography variant="h4" sx={{ color:"#493979", fontWeight:"700", fontFamily:"Poppins", my: 1, mx: 2}}>
                Dashboard
            </Typography>

            {/* Status Section */}
            {isChairManager ? (
                <Box sx={{ mx: 2, mb: 3 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#493979",
                            fontWeight: "700",
                            fontFamily: "Poppins",
                            mb: 2}}
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
                                    <CircleCheckBig size={14} color="#56567e" />
                                    Current Assignment
                                </Typography>
                            </Box>

                            <Typography sx={{ variant: "h6", fontWeight: "600", fontFamily: "Poppins", mb: 2, mt: 1 }}>
                                Assigned Chair Manager
                            </Typography>

                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <SchoolIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: 10,
                                                    color: 'text.secondary',
                                                    display: 'block',
                                                    typography: 'caption',
                                                }}
                                            >
                                                Room
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {assignment.room}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <MeetingRoomIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: 10,
                                                    color: 'text.secondary',
                                                    display: 'block',
                                                }}
                                            >
                                                Section
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {assignment.section}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <TodayIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: 10,
                                                    color: 'text.secondary',
                                                    display: 'block',
                                                }}
                                            >
                                                Date
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {dayjs(assignment.date).format('YYYY-MM-DD')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={6}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <AccessTimeIcon sx={{ color: '#6b5ca5', fontSize: 24 }} />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: 10,
                                                    color: 'text.secondary',
                                                    display: 'block',
                                                }}
                                            >
                                                Shift
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                }}
                                            >
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
                                onClick={() => router.get(`/chair-manager/manage-requests/${assignment.assignment_id}`)}
                            >
                                View Requests
                            </Button>
                        </Card>
                    ))}

                    <Box sx={{ mt: 3, borderTop: '1px solid #4A3979', pt: 2  }}>
                        <Typography
                            sx={{
                                color: '#493979',
                                fontWeight: 700,
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '1.25rem',
                                mb: 0.5,
                            }}
                        >
                            Request Role
                        </Typography>
                        <Typography variant="caption" sx={{ color:"text.secondary", mb: 1, display: 'block' }}>
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
                <Card sx={{ mx: 2, mb: 3, p: 2, borderRadius: 2, boxShadow: 2 }}>
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

                    <Typography
                        sx={{
                            fontWeight: 600,
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1.25rem', // h6
                        }}
                    >
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
                                        <MenuItem key={room.id} value={room.id}>{room.room_name}</MenuItem>
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
                                        <MenuItem key={section.id} value={section.id}>{section.section_name}</MenuItem>
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
                                    label="Choose a Date" value={formData.date ? dayjs(formData.date) : null} onChange={(newValue) => handleFormChange('date', newValue)}
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

            <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ mx: 1, my: 1 }}>
                <Alert
                    onClose={handleSnackbarClose}
                    severity={flash?.error ? 'error' : 'success'}
                    sx={{ width: '100%' }}
                >
                    {flash?.error || errors?.message || flash?.success}
                </Alert>
            </Snackbar>

            {/* History Section */}
            <Box sx={{ mx: 2, mb: 3, borderTop: '1px solid #4A3979', pt: 2 }}>
                <Typography
                    sx={{
                        color: '#493979',
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '1.25rem',
                        mb: 2,
                    }}
                >
                    History
                </Typography>
                <Box>
                    {historyData.length === 0 ? (
                        <Typography
                            sx={{
                                color: 'text.secondary',
                                fontFamily: 'Inter, sans-serif',
                                mb: 2,
                                textAlign: 'center',
                                width: '100%',
                            }}
                        >
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
                                                <Typography variant="caption" sx={{ fontWeight:"700", color:"#493979", display: 'block', lineHeight: 1 }}>
                                                    {dayjs(item.date).format('D')}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: 9, textTransform: 'uppercase' }}>
                                                    {dayjs(item.date).format('MMM')}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2"sx={{  fontWeight:"600", color: '#493979', lineHeight: 1.2, fontSize: 18 }}>
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
                                                            router.get(`/chair-manager/manage-requests/${item.assignment_id}`);
                                                        } else {
                                                            router.get(`/chair-manager/request-details/${item.assignment_id}`);
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
                            <Button fullWidth sx={{ mt: 1, color: 'text.secondary', textTransform: 'none', fontSize: 13, textDecoration: 'underline' }}
                                    onClick={() => router.get('/chair-manager/history')}>
                                View more on history page
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    )
}
