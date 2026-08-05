import {router} from "@inertiajs/react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChairIcon from '@mui/icons-material/Chair';
import PeopleIcon from '@mui/icons-material/People';
import StarsIcon from '@mui/icons-material/Stars';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import {
    Alert, Autocomplete,
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";
import {ArrowLeft} from "lucide-react";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export interface RoomItem {
    id: number;
    room_name: string;
}

export interface ProfileItem {
    profile_id: number;
    first_name: string;
    last_name: string;
    pfp: string | null;
}

export interface SectionItem {
    section_id: number;
    section_name: string;
    room_id: number;
    chair_count: number;
}

export interface AttendanceListItem {
    request_id: number | null;
    attendance_id: number | null;
    shift: string;
    section_name: string;
    room_id: number;
    unique_key: string;
    display_profile: { profile_id: number | null, firstName: string, lastName: string, pfp: string | null };
    current_attendance: string | null;
    attendance_reason: string | null;
    isAssistant: boolean;
    assistant: {
        attendance_id: number | null;
        unique_key: string;
        display_profile: { profile_id: number | null, firstName: string, lastName: string, pfp: string | null };
        current_attendance: string | null;
        attendance_reason: string | null;
    } | null;
}

export interface DashboardProps {
    currentDate: string;
    rooms: RoomItem[];
    sections: SectionItem[];
    students: ProfileItem[];
    totalChairsCount: number;
    activeChairsCount: number;
    presentStudentsCount: number;
    weeklyChartData: any[];
    attendanceList: AttendanceListItem[];
}

export default function Home({currentDate, rooms, sections, students, totalChairsCount, activeChairsCount, presentStudentsCount, weeklyChartData, attendanceList}: DashboardProps) {
    const selectedDate = dayjs(currentDate);

    const [view, setView] = useState<'calendar' | 'rooms' | 'list'>('calendar');
    const [selectedRoom, setSelectedRoom] = useState<{ id: number, name: string } | null>(null);

    const [filterShift, setFilterShift] = useState<string>("All");
    const [filterSection, setFilterSection] = useState<string>("All");
    const [loading, setLoading] = useState(false);

    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [activeAction, setActiveAction] = useState<{ requestId: number | null; status: 'Present' | 'Absent'; isAssistant: boolean; attendanceId: number | null } | null>(null);

    const [manualDialogOpen, setManualDialogOpen] = useState<boolean>(false);
    const [manualForm, setManualForm] = useState({
        studentId: "", sectionId: "", date: currentDate, shift: "AM", status: "Present", reason: "Case Discussion", customReason: ""
    });

    const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

    const handleDateChange = (dateObj: dayjs.Dayjs) => {
        router.get('/admin/home', { date: dateObj.format('YYYY-MM-DD') }, { preserveState: true, replace: true });
    };

    const handleRoomClick = (room: RoomItem) => {
        setSelectedRoom({ id: room.id, name: room.room_name });
        setFilterShift("All");
        setFilterSection("All");
        setView('list');
    };

    const handleOpenConfirmDialog = (requestId: number | null, status: 'Present' | 'Absent', isAssistant: boolean, attendanceId: number | null) => {
        setActiveAction({ requestId, status, isAssistant, attendanceId });
        setConfirmDialogOpen(true);
    };

    const handleAttendanceAction = () => {
        if (!activeAction) {
            return;
        }

        setLoading(true);
        router.post('/admin/attendance/mark', {
            request_id: activeAction.requestId,
            attendance_id: activeAction.attendanceId,
            status: activeAction.status,
            isAssistant: activeAction.isAssistant,
            date: currentDate
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmDialogOpen(false);
                setToast({ open: true, message: "Attendance verified!", severity: "success" });
            },
            onFinish: () => setLoading(false)
        });
    };

    const handleManualSubmit = () => {
        setLoading(true);
        router.post('/admin/attendance/manual', manualForm, {
            preserveScroll: true,
            onSuccess: () => {
                setManualDialogOpen(false);
                setManualForm({ ...manualForm, studentId: "", sectionId: "", reason: "Case Discussion", customReason: "" });
                setToast({ open: true, message: "Manual entry added!", severity: "success" });
            },
            onFinish: () => setLoading(false)
        });
    };

    const availableDates = useMemo(() => {
        const days: dayjs.Dayjs[] = [];

        const startOfThisWeek = dayjs().startOf('week').add(1, 'day');

        let current = startOfThisWeek.subtract(1, 'week');

        for (let i = 0; i < 14; i++) {
            if (current.day() !== 0 && current.day() !== 6) {
                days.push(current.clone());
            }

            current = current.add(1, 'day');
        }

        return days;
    }, []);

    const dateListRef = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        const selectedElement = dateListRef.current[dateStr];

        if (selectedElement) {
            setTimeout(() => {
                selectedElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }, 50);
        }
    }, [selectedDate]);

    const availableStudentsForManual = useMemo(() => {
        if (manualForm.date !== currentDate) {
            return students;
        }

        const listedIds = new Set<number>();

        attendanceList.forEach((item) => {
            if (item.shift === manualForm.shift) {
                if (item.display_profile?.profile_id) {
                    listedIds.add(item.display_profile.profile_id);
                }

                if (item.assistant?.display_profile?.profile_id) {
                    listedIds.add(item.assistant.display_profile.profile_id);
                }
            }
        });

        return students.filter(student => !listedIds.has(student.profile_id));
    }, [students, attendanceList, manualForm.date, manualForm.shift, currentDate]);

    const renderCalendar = () => {
        const usagePercentage = totalChairsCount > 0 ? Math.round((activeChairsCount / totalChairsCount) * 100) : 0;

        return (
            <Box sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e1b4b', fontFamily:"Poppins" }}>
                        Overview
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.25 }}>
                        Viewing data for <strong>{selectedDate.format('dddd, MMMM DD, YYYY')}</strong>
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, width: '100%', flexDirection: 'row' }}>
                    <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box sx={{ p: 0.8, bgcolor: '#ffffff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.03)', mb: 1.5 }}>
                            <ChairIcon sx={{ color: '#2563eb', fontSize: '1.2rem' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', mb: 0.25 }}>Active Chairs</Typography>
                        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontFamily: 'Poppins', mb: 0.25 }}>{activeChairsCount}/{totalChairsCount}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>{usagePercentage}% Usage</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box sx={{ p: 0.8, bgcolor: '#ffffff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.03)', mb: 1.5 }}>
                            <PeopleIcon sx={{ color: '#9333ea', fontSize: '1.2rem' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', mb: 0.25 }}>Students</Typography>
                        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontFamily: 'Poppins', mb: 0.25 }}>{presentStudentsCount}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>Verified Present</Typography>
                    </Paper>
                </Box>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
                        Weekly Attendance Overview
                    </Typography>
                    <Box sx={{ width: '100%', height: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyChartData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontFamily: 'Poppins' }} />
                                <Bar dataKey="Present" fill="#5c51b6" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Divider sx={{ mb: 3, borderColor: '#231b3a' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#493979', fontFamily: "Poppins" }}>Attendance</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                            View, manage, and verify daily clinician clock-in records adn shift statuses.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ position: 'relative', width: '100%', mb: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1, px: 0.5, fontWeight: 500 }}>
                        Scroll horizontally to change target date:
                    </Typography>

                    <Box sx={{
                        display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2, px: 0.5, position: 'relative', zIndex: 1,
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}>
                        {availableDates.map((date, i) => {
                            const dateStr = date.format('YYYY-MM-DD');
                            const isSelected = date.isSame(selectedDate, 'day');
                            const isToday = date.isSame(dayjs(), 'day');

                            return (
                                <Box
                                    key={i}
                                    sx={{ minWidth: 55 }}
                                    ref={(el) => {
                                        dateListRef.current[dateStr] = el as HTMLElement | null;
                                    }}
                                >
                                    <Paper
                                        elevation={isSelected ? 3 : 0}
                                        onClick={() => handleDateChange(date)}
                                        sx={{
                                            width: '100%', py: 1.5, textAlign: 'center', cursor: 'pointer', borderRadius: 3,
                                            bgcolor: isSelected ? '#5c51b6' : 'white', color: isSelected ? 'white' : '#666',
                                            border: isSelected ? 'none' : '1px solid #eee', transition: '0.2s all ease-in-out',
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                            {date.format('ddd')}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {date.format('DD')}
                                        </Typography>
                                        {isToday && !isSelected && (
                                            <Box sx={{ width: 4, height: 4, bgcolor: '#5c51b6', borderRadius: '50%', mx: 'auto', mt: 0.5 }} />
                                        )}
                                    </Paper>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box sx={{ mt: 1.5, px: 0.5 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={selectedDate}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        handleDateChange(newValue);
                                    }
                                }}
                                label="or choose a custom date"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button variant="contained" fullWidth onClick={() => setView('rooms')} sx={{ bgcolor: '#5c51b6', py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                        View Rooms for {selectedDate.format('MMM DD')}
                    </Button>
                    <Button variant="contained" fullWidth onClick={() => setManualDialogOpen(true)} sx={{ bgcolor: '#493979', py: 1.2, borderRadius: 3, textTransform: 'none', fontWeight: 600 }}>
                        Create Manual Attendance Entry
                    </Button>
                </Box>
            </Box>
        );
    };

    const renderRooms = () => (
        <Box sx={{ p: 0 }}>
            <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => setView('calendar')}><ArrowLeft /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#311c56" }}>{selectedDate.format('MMM DD, YYYY')}</Typography>
            </Box>
            <List sx={{ px: 2 }}>
                {rooms.map((room) => (
                    <Button key={room.id} fullWidth variant="contained" onClick={() => handleRoomClick(room)} sx={{ mb: 2, py: 2, bgcolor: '#5c51b6', borderRadius: 2, justifyContent: 'flex-start', textTransform: 'none' }} startIcon={<StarsIcon />}>
                        {room.room_name}
                    </Button>
                ))}
            </List>
        </Box>
    );

    const renderAttendanceList = () => {
        const roomSpecificSections = sections.filter(sec => sec.room_id === selectedRoom?.id);

        const filteredAttendance = attendanceList.filter((item) => {
            if (item.room_id !== selectedRoom?.id) {
                return false;
            }

            const matchShift = filterShift === "All" || item.shift === filterShift;
            const matchSection = filterSection === "All" || item.section_name === filterSection;

            return matchShift && matchSection;
        });

        return (
            <Box>
                <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => setView('rooms')}><ArrowBackIcon /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#311c56" }}>
                        {selectedRoom?.name} - {selectedDate.format('MMM DD')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, px: 3, mb: 2, width: '100%' }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Shift</InputLabel>
                        <Select value={filterShift} label="Shift" onChange={(e) => setFilterShift(e.target.value)} sx={{ borderRadius: 2 }}>
                            <MenuItem value="All">All Shifts</MenuItem>
                            <MenuItem value="AM">AM Only</MenuItem>
                            <MenuItem value="PM">PM Only</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Section</InputLabel>
                        <Select value={filterSection} label="Section" onChange={(e) => setFilterSection(e.target.value)} sx={{ borderRadius: 2 }}>
                            <MenuItem value="All">All Sections</MenuItem>
                            {roomSpecificSections.map((sec) => (
                                <MenuItem key={sec.section_id} value={sec.section_name}>{sec.section_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ px: 3 }}>
                    {filteredAttendance.length > 0 ? (
                        <List>
                            {filteredAttendance.map((req) => (
                                <React.Fragment key={req.unique_key}>
                                    <ListItem sx={{ px: 0, py: 2, borderBottom: req.assistant ? 'none' : '1px solid #eee' }}>
                                        <ListItemAvatar><Avatar src={req.display_profile?.pfp || undefined} /></ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#493979' }}>
                                                    {`${req.display_profile?.firstName} ${req.display_profile?.lastName}`}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                                                    {req.section_name && <Typography component="span" variant="body2" sx={{ color: '#1e1b4b', fontWeight: 600 }}>Section: {req.section_name}</Typography>}
                                                    <Typography component="span" variant="body2" color="text.secondary">Shift: {req.shift}</Typography>
                                                    {req.current_attendance && req.attendance_reason && (
                                                        <Typography component="span" variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontStyle: 'italic' }}>Remarks: {req.attendance_reason}</Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        {req.current_attendance ? (
                                            <Chip label={req.current_attendance} variant="filled" sx={{ fontWeight: 600, borderRadius: 2, minWidth: 80, bgcolor: req.current_attendance === 'Present' ? '#5c51b6' : '#d32f2f', color: 'white' }} />
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                <Button variant="outlined" size="small" onClick={() => handleOpenConfirmDialog(req.request_id, 'Present', false, req.attendance_id)} sx={{ textTransform: 'none', borderRadius: 2, color: '#5c51b6', borderColor: '#5c51b6' }}>Present</Button>
                                                <Button variant="outlined" size="small" color="error" onClick={() => handleOpenConfirmDialog(req.request_id, 'Absent', false, req.attendance_id)} sx={{ textTransform: 'none', borderRadius: 2 }}>Absent</Button>
                                            </Box>
                                        )}
                                    </ListItem>

                                    {req.assistant && (
                                        <ListItem sx={{ py: 1.5, pb: 2, borderBottom: '1px solid #eee', bgcolor: 'rgba(248, 250, 252, 0.6)' }}>
                                            <SubdirectoryArrowRightIcon sx={{ color: '#94a3b8', fontSize: '1.2rem', mr: 1 }} />
                                            <ListItemAvatar sx={{ minWidth: 44 }}><Avatar src={req.assistant.display_profile?.pfp || undefined} sx={{ width: 32, height: 32 }} /></ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                                                        {`${req.assistant.display_profile?.firstName} ${req.assistant.display_profile?.lastName}`}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography component="span" variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Role: Assistant</Typography>
                                                        {req.assistant.current_attendance && req.assistant.attendance_reason && (
                                                            <Typography component="span" variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontStyle: 'italic' }}>Remarks: {req.assistant.attendance_reason}</Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            {req.assistant.current_attendance ? (
                                                <Chip label={req.assistant.current_attendance} size="small" variant="filled" sx={{ fontWeight: 600, borderRadius: 1.5, minWidth: 70, fontSize: '0.75rem', bgcolor: req.assistant.current_attendance === 'Present' ? '#7c3aed' : '#d32f2f', color: 'white' }} />
                                            ) : (
                                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                    <Button variant="outlined" size="small" onClick={() => handleOpenConfirmDialog(req.request_id, 'Present', true, req.assistant!.attendance_id)} sx={{ textTransform: 'none', borderRadius: 1.5, height: 26, fontSize: '0.75rem', color: '#7c3aed', borderColor: '#7c3aed' }}>Present</Button>
                                                    <Button variant="outlined" size="small" color="error" onClick={() => handleOpenConfirmDialog(req.request_id, 'Absent', true, req.assistant!.attendance_id)} sx={{ textTransform: 'none', borderRadius: 1.5, height: 26, fontSize: '0.75rem' }}>Absent</Button>
                                                </Box>
                                            )}
                                        </ListItem>
                                    )}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 5, color: '#999' }}>No attendance sessions found for the selected filter.</Typography>
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Box>
            {view === 'calendar' && renderCalendar()}
            {view === 'rooms' && renderRooms()}
            {view === 'list' && renderAttendanceList()}

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirm Attendance</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Mark clinician as <strong>{activeAction?.status}</strong> under <em>{activeAction?.isAssistant ? "Assistant" : "Regular Duty"}</em>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleAttendanceAction} disabled={loading} variant="contained" sx={{ bgcolor: '#5c51b6', textTransform: 'none' }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 700 }}>Manual Attendance Entry</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <FormControl fullWidth>
                        <Autocomplete
                            fullWidth
                            options={availableStudentsForManual}
                            getOptionLabel={(option: { first_name: any; last_name: any; }) => `${option.first_name} ${option.last_name}`}
                            isOptionEqualToValue={(option, value) => option.profile_id === value.profile_id}
                            value={availableStudentsForManual.find(student => student.profile_id.toString() === manualForm.studentId.toString()) || null}
                            onChange={(event, newValue) => {
                                setManualForm({
                                    ...manualForm,
                                    studentId: newValue ? newValue.profile_id.toString() : ""
                                });
                            }}
                            noOptionsText="All students have attendance for this shift"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Student"
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Select Section</InputLabel>
                        <Select value={manualForm.sectionId} label="Select Section" onChange={(e) => setManualForm({ ...manualForm, sectionId: e.target.value })}>
                            {sections.map((sec) => (
                                <MenuItem key={sec.section_id} value={sec.section_id}>{sec.section_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date"
                            value={manualForm.date ? dayjs(manualForm.date) : null}
                            onChange={(newValue) => {
                                setManualForm({ ...manualForm, date: newValue ? newValue.format("YYYY-MM-DD") : "" });
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "medium",
                                    sx: { mt: 0.5 }
                                },
                            }}
                        />
                    </LocalizationProvider>
                    <FormControl fullWidth>
                        <InputLabel>Shift</InputLabel>
                        <Select value={manualForm.shift} label="Shift" onChange={(e) => setManualForm({ ...manualForm, shift: e.target.value })}>
                            <MenuItem value="AM">AM</MenuItem>
                            <MenuItem value="PM">PM</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select value={manualForm.status} label="Status" onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}>
                            <MenuItem value="Present">Present</MenuItem>
                            <MenuItem value="Absent">Absent</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Reason / Category</InputLabel>
                        <Select value={manualForm.reason} label="Reason / Category" onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}>
                            <MenuItem value="Case Discussion">Case Discussion</MenuItem>
                            <MenuItem value="Others">Others</MenuItem>
                        </Select>
                    </FormControl>
                    {manualForm.reason === "Others" && (
                        <TextField fullWidth label="Specify Reason Description" value={manualForm.customReason} onChange={(e) => setManualForm({ ...manualForm, customReason: e.target.value })} />
                    )}
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setManualDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleManualSubmit} disabled={loading} variant="contained" sx={{ bgcolor: '#5c51b6', textTransform: 'none' }}>Add Attendance</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert severity={toast.severity} sx={{ width: "100%", fontWeight: 600, borderRadius: 2 }}>{toast.message}</Alert>
            </Snackbar>
        </Box>
    );
}
