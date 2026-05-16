import React, { useState, useEffect } from "react";
import { 
    Box, Typography, Button, IconButton, List, ListItem, 
    ListItemAvatar, ListItemText, Avatar, Paper, CircularProgress, Chip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarsIcon from '@mui/icons-material/Stars';
import ArticleIcon from '@mui/icons-material/Article';
import { supabase } from "../../../utils/supabase";
import dayjs from "dayjs";

const Attendance = () => {
    const [view, setView] = useState<'calendar' | 'rooms' | 'list'>('calendar');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedRoom, setSelectedRoom] = useState<{id: number, name: string} | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            const { data } = await supabase.from('rooms').select('*');
            if (data) setRooms(data);
        };
        fetchRooms();
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
                // Safely parse the status from the attendance table relation
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

    const handleAttendanceAction = async (requestId: number, status: string) => {
        console.log("Marking status in DB...", status);

        const { error } = await supabase
            .from('attendance')
            .upsert(
                { 
                    request_id: requestId, 
                    status: status 
                }, 
                { onConflict: 'request_id' } 
            );

        if (error) {
            console.error("Supabase Upsert Error:", error.message);
            alert("Error saving attendance: " + error.message); 
        } else {
            console.log("Saved successfully! Re-checking Supabase entry...");
            
            // This forces the app to go back to Supabase, check the entry, and update the UI
            if (selectedRoom) {
                await fetchAttendance(selectedRoom.id);
            }
        }
    };

    // --- DATE SCROLLER VIEW ---
    const renderCalendar = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#493979', mb: 3 }}>
                Attendance
            </Typography>
            
            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                overflowX: 'auto', 
                pb: 3, 
                px: 0.5,
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
                                minWidth: 65, 
                                py: 2, 
                                textAlign: 'center', 
                                cursor: 'pointer',
                                borderRadius: 4,
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

            <Button 
                variant="contained" 
                fullWidth 
                onClick={() => setView('rooms')}
                sx={{ 
                    bgcolor: '#5c51b6', 
                    py: 2, 
                    borderRadius: 4, 
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px 0 rgba(92, 81, 182, 0.39)'
                }}
                startIcon={<ArticleIcon />}
            >
                View Rooms for {selectedDate.format('MMM DD')}
            </Button>
            
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: '#999' }}>
                Select a date above to manage clinician shifts.
            </Typography>
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
                        key={room.room_id}
                        fullWidth 
                        variant="contained"
                        onClick={() => handleRoomClick(room)}
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
                            <ListItem 
                                key={req.request_id} 
                                sx={{ px: 0, py: 2, borderBottom: '1px solid #eee' }}
                            >
                                <ListItemAvatar>
                                    <Avatar src={req.profiles?.pfp} />
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={`${req.profiles?.first_name} ${req.profiles?.last_name}`}
                                    secondary={`Shift: ${req.shift}`}
                                />
                                
                                {/* LOOK HERE: Conditional rendering for status text vs buttons */}
                                {req.current_attendance ? (
                                    <Chip 
                                        label={req.current_attendance} 
                                        color={req.current_attendance === 'Present' ? 'success' : 'error'}
                                        variant="filled"
                                        sx={{ 
                                            fontWeight: 600, 
                                            borderRadius: 2,
                                            minWidth: 80,
                                            // Optional: Custom color match for your purple theme
                                            bgcolor: req.current_attendance === 'Present' ? '#5c51b6' : '#d32f2f',
                                            color: 'white'
                                        }}
                                    />
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button 
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleAttendanceAction(req.request_id, 'Present')}
                                            sx={{ 
                                                textTransform: 'none', 
                                                borderRadius: 2, 
                                                color: '#5c51b6',
                                                borderColor: '#5c51b6',
                                                '&:hover': { borderColor: '#493979', bgcolor: 'rgba(92, 81, 182, 0.04)' } 
                                            }}
                                        >
                                            Present
                                        </Button>
                                        <Button 
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            onClick={() => handleAttendanceAction(req.request_id, 'Absent')}
                                            sx={{ 
                                                textTransform: 'none', 
                                                borderRadius: 2,
                                                color: '#d32f2f',
                                                borderColor: '#d32f2f'
                                            }}
                                        >
                                            Absent
                                        </Button>
                                    </Box>
                                )}
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 5, color: '#999' }}>
                        No approved requests found for this date.
                    </Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', mx: 'auto' }}>
            {view === 'calendar' && renderCalendar()}
            {view === 'rooms' && renderRooms()}
            {view === 'list' && renderAttendanceList()}
        </Box>
    );
};

export default Attendance;