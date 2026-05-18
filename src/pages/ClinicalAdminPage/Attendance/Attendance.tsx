import React, { useState, useEffect } from "react";
import { 
    Box, Typography, Button, IconButton, List, ListItem, 
    ListItemAvatar, ListItemText, Avatar, Paper, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, 
    InputLabel, Select, MenuItem, TextField 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarsIcon from '@mui/icons-material/Stars';
import ArticleIcon from '@mui/icons-material/Article';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from "../../../utils/supabase";
import dayjs from "dayjs";

const Attendance = () => {
    const [view, setView] = useState<'calendar' | 'rooms' | 'list'>('calendar');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedRoom, setSelectedRoom] = useState<{id: number, name: string} | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // --- REASON POPUP STATE ---
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeAction, setActiveAction] = useState<{ requestId: number; status: 'Present' | 'Absent' } | null>(null);
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    // --- MANUAL ENTRY STATE ---
    const [manualDialogOpen, setManualDialogOpen] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [manualForm, setManualForm] = useState({
        studentId: "", // This will store the profile_id string
        roomId: "",
        sectionId: "", 
        date: dayjs().format('YYYY-MM-DD'),
        shift: "",
        status: "Present" 
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: roomData } = await supabase.from('rooms').select('*');
            if (roomData) setRooms(roomData);

            // Fetch students using the exact database column names shown in your schema image
            const { data: studentData } = await supabase
                .from('profiles')
                .select('profile_id, first_name, last_name, pfp, role_id')
                .eq('role_id', 3); // Automatically filters to fetch only accounts that are Students
            if (studentData) setStudents(studentData);

            const { data: sectionData } = await supabase.from('sections').select('*');
            if (sectionData) setSections(sectionData);
        };
        fetchInitialData();
    }, []);

    const fetchAttendance = async (roomId: number) => {
        setLoading(true);
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        
        const { data, error } = await supabase
            .from('dental_chairs_request_assignment')
            .select(`
                request_id,
                status, 
                shift,
                profiles:student_id (first_name, last_name, pfp),
                sections!inner (
                    section_name,
                    rooms!inner (room_id, room_name)
                ),
                attendance (
                    status
                )
            `)
            .eq('date', formattedDate)
            .eq('status', 'Accepted') 
            .eq('sections.rooms.room_id', roomId);

        if (!error && data) {
            const formattedData = data.map((item: any) => {
                let currentStatus = null;
                if (item.attendance) {
                    if (Array.isArray(item.attendance) && item.attendance.length > 0) {
                        currentStatus = item.attendance[0].status;
                    } else if (!Array.isArray(item.attendance)) {
                        currentStatus = (item.attendance as any).status;
                    }
                }

                return {
                    ...item,
                    current_attendance: currentStatus
                };
            });
            setAttendanceList(formattedData);
        } else if (error) {
            console.error("Fetch Error:", error.message);
        }
        setLoading(false);
    };

    const handleRoomClick = (room: any) => {
        setSelectedRoom({ id: room.room_id, name: room.room_name });
        fetchAttendance(room.room_id);
        setView('list');
    };

    const handleOpenDialog = (requestId: number, status: 'Present' | 'Absent') => {
        setActiveAction({ requestId, status });
        setReason("");
        setCustomReason("");
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setActiveAction(null);
    };

    const handleAttendanceAction = async () => {
        if (!activeAction) return;
        
        const { requestId, status } = activeAction;
        const finalRemarks = reason === "Others" ? customReason : reason;

        const { error } = await supabase
            .from('attendance')
            .upsert(
                { request_id: requestId, status: status, reason: finalRemarks }, 
                { onConflict: 'request_id' } 
            );

        if (error) {
            alert("Error saving attendance: " + error.message); 
        } else {
            handleCloseDialog();
            if (selectedRoom) await fetchAttendance(selectedRoom.id);
        }
    };

    const handleManualSubmit = async () => {
        setLoading(true);
        const matchedSection = sections.find(s => s.room_id === manualForm.roomId);
        const finalSectionId = matchedSection ? matchedSection.section_id : null;

        const { data: assignmentData, error: assignmentError } = await supabase
            .from('dental_chairs_request_assignment')
            .insert({
                student_id: manualForm.studentId, // Correct profile_id UUID bound here
                date: manualForm.date,
                shift: manualForm.shift,
                status: 'Accepted', 
                section_id: finalSectionId 
            })
            .select()
            .single();

        if (assignmentError) {
            console.error("Assignment Creation Error:", assignmentError.message);
            alert("Failed to create assignment: " + assignmentError.message);
            setLoading(false);
            return;
        }

        if (assignmentData) {
            const { error: attendanceError } = await supabase
                .from('attendance')
                .insert({
                    request_id: assignmentData.request_id,
                    status: manualForm.status,
                    reason: "Manually Added Entry"
                });

            if (attendanceError) {
                alert("Assignment created, but marking attendance failed: " + attendanceError.message);
            } else {
                alert("Manual attendance entry logged successfully!");
                setManualDialogOpen(false);
                setManualForm({
                    studentId: "", roomId: "", sectionId: "",
                    date: dayjs().format('YYYY-MM-DD'), shift: "", status: "Present"
                });
                if (selectedRoom) await fetchAttendance(selectedRoom.id);
            }
        }
        setLoading(false);
    };

    const renderCalendar = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#493979', mb: 3 }}>
                Attendance
            </Typography>
            
            <Box sx={{ 
                display: 'flex', gap: 2, overflowX: 'auto', pb: 3, px: 0.5,
                '&::-webkit-scrollbar': { display: 'none' }
            }}>
                {[...Array(14)].map((_, i) => {
                    const date = dayjs().add(i - 3, 'day');
                    const isSelected = date.isSame(selectedDate, 'day');
                    const isToday = date.isSame(dayjs(), 'day');

                    return (
                        <Paper 
                            key={i}
                            elevation={isSelected ? 4 : 0}
                            onClick={() => setSelectedDate(date)}
                            sx={{ 
                                minWidth: 65, py: 2, textAlign: 'center', cursor: 'pointer', borderRadius: 4,
                                bgcolor: isSelected ? '#5c51b6' : 'white',
                                color: isSelected ? 'white' : '#666',
                                border: isSelected ? 'none' : '1px solid #eee',
                                transition: '0.2s all ease-in-out'
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                {date.format('ddd')}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                {date.format('DD')}
                            </Typography>
                            {isToday && !isSelected && (
                                <Box sx={{ width: 4, height: 4, bgcolor: '#5c51b6', borderRadius: '50%', mx: 'auto', mt: 0.5 }} />
                            )}
                        </Paper>
                    );
                })}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                    variant="contained" fullWidth onClick={() => setView('rooms')}
                    sx={{ bgcolor: '#5c51b6', py: 2, borderRadius: 4, textTransform: 'none', fontWeight: 700, boxShadow: '0 4px 14px 0 rgba(92, 81, 182, 0.39)' }}
                    startIcon={<ArticleIcon />}
                >
                    View Rooms for {selectedDate.format('MMM DD')}
                </Button>

                <Button 
                    variant="outlined" fullWidth onClick={() => setManualDialogOpen(true)}
                    sx={{ 
                        color: '#5c51b6', borderColor: '#5c51b6', py: 1.5, borderRadius: 4, textTransform: 'none', fontWeight: 600,
                        '&:hover': { borderColor: '#493979', bgcolor: 'rgba(92, 81, 182, 0.04)' }
                    }}
                    startIcon={<PersonAddIcon />}
                >
                    Create Manual Attendance Entry
                </Button>
            </Box>
        </Box>
    );

    const renderRooms = () => (
        <Box sx={{ p: 0 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => setView('calendar')}><ArrowBackIcon /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedDate.format('MMM DD, YYYY')}</Typography>
            </Box>
            <List sx={{ px: 2 }}>
                {rooms.map((room) => (
                    <Button 
                        key={room.room_id} fullWidth variant="contained" onClick={() => handleRoomClick(room)}
                        sx={{ mb: 2, py: 2, bgcolor: '#5c51b6', borderRadius: 2, justifyContent: 'flex-start', textTransform: 'none' }}
                        startIcon={<StarsIcon />}
                    >
                        {room.room_name}
                    </Button>
                ))}
            </List>
        </Box>
    );

    const renderAttendanceList = () => (
        <Box>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => setView('rooms')}><ArrowBackIcon /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedRoom?.name} - {selectedDate.format('MMM DD')}
                </Typography>
            </Box>

            <Box sx={{ px: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : attendanceList.length > 0 ? (
                    <List>
                        {attendanceList.map((req) => (
                            <ListItem key={req.request_id} sx={{ px: 0, py: 2, borderBottom: '1px solid #eee' }}>
                                <ListItemAvatar>
                                    <Avatar src={req.profiles?.pfp} />
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={`${req.profiles?.first_name} ${req.profiles?.last_name}`}
                                    secondary={`Shift: ${req.shift}`}
                                />
                                {req.current_attendance ? (
                                    <Chip 
                                        label={req.current_attendance} variant="filled"
                                        sx={{ fontWeight: 600, borderRadius: 2, minWidth: 80, bgcolor: req.current_attendance === 'Present' ? '#5c51b6' : '#d32f2f', color: 'white' }}
                                    />
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button variant="outlined" size="small" onClick={() => handleOpenDialog(req.request_id, 'Present')} sx={{ textTransform: 'none', borderRadius: 2, color: '#5c51b6', borderColor: '#5c51b6' }}>Present</Button>
                                        <Button variant="outlined" size="small" color="error" onClick={() => handleOpenDialog(req.request_id, 'Absent')} sx={{ textTransform: 'none', borderRadius: 2, color: '#d32f2f', borderColor: '#d32f2f' }}>Absent</Button>
                                    </Box>
                                )}
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 5, color: '#999' }}>No approved requests found.</Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', mx: 'auto' }}>
            {view === 'calendar' && renderCalendar()}
            {view === 'rooms' && renderRooms()}
            {view === 'list' && renderAttendanceList()}

            {/* --- REASON DIALOG POPUP --- */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Log Attendance Reason ({activeAction?.status})</DialogTitle>
                <DialogContent>
                    {activeAction?.status === 'Present' ? (
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="reason-select-label">Select Reason</InputLabel>
                            <Select labelId="reason-select-label" value={reason} label="Select Reason" onChange={(e) => setReason(e.target.value)}>
                                <MenuItem value="Working">Working</MenuItem>
                                <MenuItem value="Case Discussion">Case Discussion</MenuItem>
                                <MenuItem value="Assistant">Assistant</MenuItem>
                                <MenuItem value="Others">Others (Please specify)</MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        <TextField autoFocus margin="dense" label="Reason for Absence / Comments" fullWidth variant="outlined" multiline rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
                    )}

                    {activeAction?.status === 'Present' && reason === 'Others' && (
                        <TextField margin="dense" label="Specify Reason" fullWidth variant="outlined" value={customReason} onChange={(e) => setCustomReason(e.target.value)} sx={{ mt: 2 }} />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleAttendanceAction} variant="contained" disabled={!reason || (activeAction?.status === 'Present' && reason === 'Others' && !customReason.trim())} sx={{ bgcolor: activeAction?.status === 'Present' ? '#5c51b6' : '#d32f2f', textTransform: 'none' }}>Submit</Button>
                </DialogActions>
            </Dialog>

            {/* --- MANUAL ENTRY DIALOG POPUP (MAPPED TO EXACT profile_id SCHEMA) --- */}
            <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, p: 1 } }} disableEnforceFocus>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add Manual Attendance Entry</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    
                    {/* Student Picker - Explicitly tracking profile_id */}
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="manual-student-label">Select Student</InputLabel>
                        <Select
                            labelId="manual-student-label"
                            value={manualForm.studentId || ""}
                            label="Select Student"
                            onChange={(e) => setManualForm({ ...manualForm, studentId: e.target.value as string })}
                            renderValue={(selected) => {
                                const student = students.find(s => s.profile_id === selected);
                                return student ? `${student.first_name} ${student.last_name}` : "";
                            }}
                        >
                            {students.map((student) => (
                                <MenuItem key={student.profile_id} value={student.profile_id}>
                                    {student.first_name} {student.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Room Picker */}
                    <FormControl fullWidth>
                        <InputLabel id="manual-room-label">Select Room</InputLabel>
                        <Select
                            labelId="manual-room-label"
                            value={manualForm.roomId || ""}
                            label="Select Room"
                            onChange={(e) => setManualForm({ ...manualForm, roomId: e.target.value as string })}
                        >
                            {rooms.map((room) => (
                                <MenuItem key={room.room_id} value={room.room_id}>
                                    {room.room_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={manualForm.date}
                        onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="manual-shift-label">Select Shift</InputLabel>
                        <Select
                            labelId="manual-shift-label"
                            value={manualForm.shift || ""}
                            label="Select Shift"
                            onChange={(e) => setManualForm({ ...manualForm, shift: e.target.value as string })}
                        >
                            <MenuItem value="AM">AM</MenuItem>
                            <MenuItem value="PM">PM</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="manual-status-label">Initial Status</InputLabel>
                        <Select
                            labelId="manual-status-label"
                            value={manualForm.status || "Present"}
                            label="Initial Status"
                            onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as string })}
                        >
                            <MenuItem value="Present">Present</MenuItem>
                            <MenuItem value="Absent">Absent</MenuItem>
                        </Select>
                    </FormControl>

                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setManualDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button 
                        onClick={handleManualSubmit} 
                        variant="contained" 
                        disabled={!manualForm.studentId || !manualForm.roomId || !manualForm.date || !manualForm.shift}
                        sx={{ bgcolor: '#5c51b6', textTransform: 'none', '&:hover': { bgcolor: '#493979' } }}
                    >
                        Save Record
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Attendance;