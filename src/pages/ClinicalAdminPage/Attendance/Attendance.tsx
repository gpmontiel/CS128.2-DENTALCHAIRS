import React, { useState, useEffect, useRef } from "react";
import {
    Box, Typography, Button, IconButton, List, ListItem,
    ListItemAvatar, ListItemText, Avatar, Paper, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
    InputLabel, Select, MenuItem, TextField, Divider,
    Snackbar, Alert
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarsIcon from '@mui/icons-material/Stars';
import ChairIcon from '@mui/icons-material/Chair';
import PeopleIcon from '@mui/icons-material/People';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { supabase } from "../../../utils/supabase";
import dayjs from "dayjs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RoomItem {
    room_id: number;
    room_name: string;
}

interface ProfileItem {
    profile_id: string;
    first_name: string;
    last_name: string;
    pfp: string;
    role_id: number;
}

interface SectionItem {
    section_id: number;
    section_name: string;
    room_id: number;
    chair_count: number;
}

const Attendance: React.FC = () => {
    const [view, setView] = useState<'calendar' | 'rooms' | 'list'>('calendar');
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
    const [selectedRoom, setSelectedRoom] = useState<{id: number, name: string} | null>(null);
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // --- LIVE LIST FILTER SELECTION STATE ---
    const [filterShift, setFilterShift] = useState<string>("All");
    const [filterSection, setFilterSection] = useState<string>("All");

    // --- DASHBOARD METRICS STATE ---
    const [activeChairsCount, setActiveChairsCount] = useState<number>(0);
    const [totalChairsCount, setTotalChairsCount] = useState<number>(0);
    const [presentStudentsCount, setPresentStudentsCount] = useState<number>(0);

    // --- WEEKLY CHART ANALYTICS STATE ---
    const [weeklyChartData, setWeeklyChartData] = useState([
        { day: 'Mon', Present: 0 }, { day: 'Tue', Present: 0 }, { day: 'Wed', Present: 0 }, { day: 'Thu', Present: 0 }, { day: 'Fri', Present: 0 },
    ]);

    const dateListRef = useRef<{ [key: string]: HTMLDivElement | Element | null }>({});

    // --- CONVERTED CONFIRMATION POPUP STATE ---
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [activeAction, setActiveAction] = useState<{ requestId: number | null; status: 'Present' | 'Absent'; isAssistant: boolean; attendanceId?: number } | null>(null);

    // --- MANUAL ENTRY STATE ---
    const [manualDialogOpen, setManualDialogOpen] = useState<boolean>(false);
    const [students, setStudents] = useState<ProfileItem[]>([]);
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [manualForm, setManualForm] = useState({
        studentId: "", roomId: "", sectionId: "", date: dayjs().format('YYYY-MM-DD'), shift: "AM", status: "Present", reason: "Case Discussion", customReason: ""
    });

    // --- FLOATING TOAST NOTIFICATION STATE ---
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success"
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: roomData } = await supabase.from('rooms').select('*');
            if (roomData) setRooms(roomData as RoomItem[]);

            const { data: studentData } = await supabase
                .from('profiles')
                .select('profile_id, first_name, last_name, pfp, role_id')
                .eq('role_id', 3);
            if (studentData) setStudents(studentData as ProfileItem[]);

            const { data: sectionData } = await supabase.from('sections').select('*');
            if (sectionData) {
                setSections(sectionData as SectionItem[]);

                const totalChairs = (sectionData as SectionItem[]).reduce(
                    (sum, section) => sum + (section.chair_count || 0), 0
                );
                setTotalChairsCount(totalChairs);
            }

            await fetchDashboardMetrics();
        };
        fetchInitialData();
    }, [selectedDate]);

    // --- WEEKLY ANALYTICS CHART LOADING EFFECT ---
    useEffect(() => {
        const fetchWeeklyAnalytics = async () => {
            const startOfWeek = selectedDate.startOf('week').add(1, 'day').format('YYYY-MM-DD');
            const endOfWeek = selectedDate.startOf('week').add(5, 'day').format('YYYY-MM-DD');

            const { data: chairLogs } = await supabase
                .from('dental_chairs_request_assignment')
                .select(`date, attendance (status)`)
                .gte('date', startOfWeek)
                .lte('date', endOfWeek)
                .eq('status', 'Accepted');

            const { data: standaloneLogs } = await supabase
                .from('attendance')
                .select('date, status')
                .gte('date', startOfWeek)
                .lte('date', endOfWeek)
                .eq('status', 'Present')
                .is('request_id', null);

            const daysMap: Record<string, string> = { '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri' };
            const counts: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };

            if (chairLogs) {
                chairLogs.forEach((row: any) => {
                    if (!row.attendance) return;
                    const attArray = Array.isArray(row.attendance) ? row.attendance : [row.attendance];
                    const presentsCount = attArray.filter((a: any) => a.status === 'Present').length;
                    const dayIndex = dayjs(row.date).day().toString();
                    const dayName = daysMap[dayIndex];
                    if (dayName) counts[dayName] += presentsCount;
                });
            }

            if (standaloneLogs) {
                standaloneLogs.forEach((row: any) => {
                    const dayIndex = dayjs(row.date).day().toString();
                    const dayName = daysMap[dayIndex];
                    if (dayName) counts[dayName]++;
                });
            }

            const formattedChart = Object.keys(counts).map(key => ({
                day: key,
                Present: counts[key]
            }));

            setWeeklyChartData(formattedChart);
        };
        fetchWeeklyAnalytics();
    }, [selectedDate]);

    // --- COMBINED METRICS ENGINE ---
    const fetchDashboardMetrics = async () => {
        const formattedDate = selectedDate.format('YYYY-MM-DD');

        const { data: activeAssignments } = await supabase
            .from('dental_chairs_request_assignment')
            .select(`request_id, status, attendance!inner (status, reason)`)
            .eq('date', formattedDate)
            .eq('status', 'Accepted')
            .eq('attendance.status', 'Present');

        const { data: manualEntries } = await supabase
            .from('attendance')
            .select('status, reason')
            .eq('date', formattedDate)
            .eq('status', 'Present')
            .is('request_id', null);

        const chairsCount = activeAssignments ? activeAssignments.length : 0;
        let studentsCount = 0;

        if (activeAssignments) {
            activeAssignments.forEach((item: any) => {
                if (!item.attendance) return;
                const attArray = Array.isArray(item.attendance) ? item.attendance : [item.attendance];
                studentsCount += attArray.filter((a: any) => a.status === 'Present').length;
            });
        }

        if (manualEntries) {
            studentsCount += manualEntries.length;
        }

        setActiveChairsCount(chairsCount);
        setPresentStudentsCount(studentsCount);
    };

    // --- COMBINED FETCH ENGINE ---
    const fetchAttendance = async (roomId: number) => {
        setLoading(true);
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        const flattenedList: any[] = [];

        const { data: assignmentData, error: assignmentErr } = await supabase
            .from('dental_chairs_request_assignment')
            .select(`
                request_id, status, shift, date,
                student_id (clinician_id, profiles (first_name, last_name, pfp)),
                assistant_id (clinician_id, profiles (first_name, last_name, pfp)),
                sections (section_name, room_id),
                attendance (attendance_id, status, reason)
            `)
            .eq('date', formattedDate);

        if (!assignmentErr && assignmentData) {
            const matchingRows = assignmentData.filter((item: any) => {
                return item.status === 'Accepted' && Number(item.sections?.room_id) === Number(roomId);
            });

            matchingRows.forEach((item: any) => {
                let primaryStatus = null;
                let assistantStatus = null;
                let primaryReason = null;
                let assistantReason = null;
                const sectionName = item.sections?.section_name || "";

                if (item.attendance) {
                    const attArray = Array.isArray(item.attendance) ? item.attendance : [item.attendance];
                    if (attArray.length > 0) {
                        const assistLog = attArray.find((a: any) => a && a.reason === 'Assistant');
                        const mainLog = attArray.find((a: any) => a && a.reason !== 'Assistant' && a.reason !== null && a.reason !== '');

                        if (attArray.length === 1 && (attArray[0].reason === null || attArray[0].reason === '')) {
                            primaryStatus = attArray[0].status;
                            assistantStatus = attArray[0].status;
                            primaryReason = attArray[0].reason;
                            assistantReason = attArray[0].reason;
                        } else {
                            primaryStatus = mainLog ? mainLog.status : (attArray.find((a: any) => a.reason !== 'Assistant')?.status || null);
                            assistantStatus = assistLog ? assistLog.status : null;
                            primaryReason = mainLog ? mainLog.reason : (attArray.find((a: any) => a.reason !== 'Assistant')?.reason || null);
                            assistantReason = assistLog ? assistLog.reason : null;
                        }
                    }
                }

                const studentData = Array.isArray(item.student_id) ? item.student_id[0] : item.student_id;
                const rawStudentProfile = studentData?.profiles ? (Array.isArray(studentData.profiles) ? studentData.profiles[0] : studentData.profiles) : null;
                const assistantData = Array.isArray(item.assistant_id) ? item.assistant_id[0] : item.assistant_id;
                const rawAssistantProfile = assistantData?.profiles ? (Array.isArray(assistantData.profiles) ? assistantData.profiles[0] : assistantData.profiles) : null;

                const createNormalizedProfile = (profile: any) => {
                    if (!profile) return null;
                    return {
                        firstName: profile.first_name || profile.firstName || "",
                        lastName: profile.last_name || profile.lastName || "",
                        pfp: profile.pfp || ""
                    };
                };

                const primaryProfile = createNormalizedProfile(rawStudentProfile);
                const assistantProfile = createNormalizedProfile(rawAssistantProfile);

                if (primaryProfile) {
                    flattenedList.push({
                        request_id: item.request_id,
                        attendance_id: null,
                        shift: item.shift === 'Morning' || item.shift === 'AM' ? 'AM' : 'PM',
                        section_name: sectionName,
                        unique_key: `${item.request_id}-primary-${primaryProfile.lastName}`,
                        display_profile: primaryProfile,
                        current_attendance: primaryStatus,
                        attendance_reason: primaryReason,
                        isAssistant: false,
                        assistant: assistantProfile ? {
                            unique_key: `${item.request_id}-assistant-${assistantProfile.lastName}`,
                            display_profile: assistantProfile,
                            current_attendance: assistantStatus,
                            attendance_reason: assistantReason,
                        } : null
                    });
                }
            });
        }

        const { data: standaloneManualData, error: manualErr } = await supabase
            .from('attendance')
            .select(`
                attendance_id, status, reason, date, shift,
                student_id (first_name, last_name, pfp),
                sections (section_name, room_id)
            `)
            .eq('date', formattedDate)
            .is('request_id', null);

        if (!manualErr && standaloneManualData) {
            const filteredManualRows = standaloneManualData.filter((m: any) => Number(m.sections?.room_id) === Number(roomId));

            filteredManualRows.forEach((m: any) => {
                const profile = Array.isArray(m.student_id) ? m.student_id[0] : m.student_id;
                if (!profile) return;

                flattenedList.push({
                    request_id: null,
                    attendance_id: m.attendance_id,
                    shift: m.shift,
                    section_name: m.sections?.section_name || "",
                    unique_key: `manual-${m.attendance_id}-${profile.last_name}`,
                    display_profile: {
                        firstName: profile.first_name || "",
                        lastName: profile.last_name || "",
                        pfp: profile.pfp || ""
                    },
                    current_attendance: m.status,
                    attendance_reason: m.reason,
                    isAssistant: false,
                    assistant: null
                });
            });
        }

        setAttendanceList(flattenedList);
        setLoading(false);
    };

    const handleRoomClick = (room: RoomItem) => {
        setSelectedRoom({ id: room.room_id, name: room.room_name });
        setFilterShift("All");
        setFilterSection("All");
        fetchAttendance(room.room_id);
        setView('list');
    };

    const handleOpenConfirmDialog = (requestId: number | null, status: 'Present' | 'Absent', isAssistant: boolean, attendanceId?: number) => {
        setActiveAction({ requestId, status, isAssistant, attendanceId });
        setConfirmDialogOpen(true);
    };

    const handleAttendanceAction = async () => {
        if (!activeAction) return;
        const { requestId, status, isAssistant, attendanceId } = activeAction;
        const finalRemarks = isAssistant ? "Assistant" : "Regular Duty";

        if (requestId === null && attendanceId) {
            await supabase
                .from('attendance')
                .update({ status: status, reason: finalRemarks })
                .eq('attendance_id', attendanceId);
        } else {
            await supabase
                .from('attendance')
                .upsert(
                    { request_id: requestId, status: status, reason: finalRemarks },
                    { onConflict: 'request_id, reason' }
                );
        }

        setConfirmDialogOpen(false);
        setActiveAction(null);
        if (selectedRoom) await fetchAttendance(selectedRoom.id);
        await fetchDashboardMetrics();
    };

    const handleManualSubmit = async () => {
        setLoading(true);
        try {
            const finalRemarks = manualForm.reason === "Others" ? manualForm.customReason : manualForm.reason;

            const { error: insertErr } = await supabase
                .from('attendance')
                .insert({
                    request_id: null,
                    status: manualForm.status,
                    reason: finalRemarks,
                    student_id: manualForm.studentId,
                    section_id: manualForm.sectionId ? Number(manualForm.sectionId) : null,
                    date: manualForm.date,
                    shift: manualForm.shift
                });

            if (insertErr) throw insertErr;

            setManualDialogOpen(false);
            setManualForm({
                studentId: "", roomId: "", sectionId: "", date: dayjs().format('YYYY-MM-DD'), shift: "AM", status: "Present", reason: "Case Discussion", customReason: ""
            });

            setToast({
                open: true,
                message: "Attendance entry added successfully!",
                severity: "success"
            });

            if (selectedRoom) await fetchAttendance(selectedRoom.id);
            await fetchDashboardMetrics();
        } catch (error: any) {
            setToast({
                open: true,
                message: "Failed to add log: " + error.message,
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseToast = () => {
        setToast((prev) => ({ ...prev, open: false }));
    };

    const renderCalendar = () => {
        const usagePercentage = totalChairsCount > 0 ? Math.round((activeChairsCount / totalChairsCount) * 100) : 0;

        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" fontFamily="Poppins" sx={{ fontWeight: 800, color: '#1e1b4b', tracking: '-0.5px' }}>
                        Overview
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.25 }}>
                        {dayjs().format('dddd, MMMM DD, YYYY')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, width: '100%', flexDirection: 'row' }}>
                    <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box sx={{ p: 0.8, bgcolor: '#ffffff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.03)', mb: 1.5 }}>
                            <ChairIcon sx={{ color: '#2563eb', fontSize: '1.2rem' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', mb: 0.25 }}>
                            Active Chairs
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontFamily: 'Poppins', mb: 0.25 }}>
                            {activeChairsCount}/{totalChairsCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>
                            {usagePercentage}% Usage
                        </Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box sx={{ p: 0.8, bgcolor: '#ffffff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 2px 6px rgba(0,0,0,0.03)', mb: 1.5 }}>
                            <PeopleIcon sx={{ color: '#9333ea', fontSize: '1.2rem' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', mb: 0.25 }}>
                            Students
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontFamily: 'Poppins', mb: 0.25 }}>
                            {presentStudentsCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>
                            Verified Present
                        </Typography>
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

                <Divider sx={{ mb: 3, borderColor: '#231b3a', borderWidth: '1px' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2.5, gap: 1 }}>
                    <Box>
                        <Typography variant="h5" fontFamily="Poppins" sx={{ fontWeight: 700, color: '#493979' }}>
                            Attendance
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                            View, manage, and verify daily clinician clock-in records and shift statuses.
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
                        maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)'
                    }}>
                        {[...Array(14)].map((_, i) => {
                            const date = dayjs().add(i - 3, 'day');
                            const isSelected = date.isSame(selectedDate, 'day');
                            const isToday = date.isSame(dayjs(), 'day');
                            const dateStr = date.format('YYYY-MM-DD');

                            return (
                                <Box key={i} ref={(el) => { dateListRef.current[dateStr] = el as HTMLDivElement | null; }} sx={{ minWidth: 55 }}>
                                    <Paper
                                        elevation={isSelected ? 3 : 0} onClick={() => setSelectedDate(date)}
                                        sx={{
                                            width: '100%', py: 1.5, textAlign: 'center', cursor: 'pointer', borderRadius: 3,
                                            bgcolor: isSelected ? '#5c51b6' : 'white', color: isSelected ? 'white' : '#666',
                                            border: isSelected ? 'none' : '1px solid #eee', transition: '0.2s all ease-in-out',
                                            '&:hover': { transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>{date.format('ddd')}</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{date.format('DD')}</Typography>
                                        {isToday && !isSelected && <Box sx={{ width: 4, height: 4, bgcolor: '#5c51b6', borderRadius: '50%', mx: 'auto', mt: 0.5 }} />}
                                    </Paper>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box sx={{ mt: 1.5, px: 0.5 }}>
                        <TextField
                            label="or choose custom date"
                            type="date"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={selectedDate.format('YYYY-MM-DD')}
                            onChange={(e) => {
                                if(e.target.value) {
                                    setSelectedDate(dayjs(e.target.value));
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <CalendarMonthIcon sx={{ color: '#5c51b6', mr: 1, fontSize: '1.2rem' }} />
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#f8fafc',
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: '#5c51b6' },
                                    '&.Mui-focused fieldset': { borderColor: '#5c51b6' }
                                },
                                '& .MuiInputLabel-root': {
                                    fontFamily: 'Poppins',
                                    fontWeight: 500,
                                    color: '#64748b'
                                }
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button variant="contained" fullWidth onClick={() => setView('rooms')} sx={{ bgcolor: '#5c51b6', py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                        View Rooms for {selectedDate.format('MMM DD')}
                    </Button>
                    <Button variant="contained" fullWidth onClick={() => setManualDialogOpen(true)} sx={{ bgcolor: '#493979', py: 1.2, borderRadius: 3, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                        Create Manual Attendance Entry
                    </Button>
                </Box>
            </Box>
        );
    };

    const renderRooms = () => (
        <Box sx={{ p: 0 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => setView('calendar')}><ArrowBackIcon /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedDate.format('MMM DD, YYYY')}</Typography>
            </Box>
            <List sx={{ px: 2 }}>
                {rooms.map((room) => (
                    <Button key={room.room_id} fullWidth variant="contained" onClick={() => handleRoomClick(room)} sx={{ mb: 2, py: 2, bgcolor: '#5c51b6', borderRadius: 2, justifyContent: 'flex-start', textTransform: 'none' }} startIcon={<StarsIcon />}>
                        {room.room_name}
                    </Button>
                ))}
            </List>
        </Box>
    );

    const renderAttendanceList = () => {
        const roomSpecificSections = sections.filter(sec => Number(sec.room_id) === Number(selectedRoom?.id));

        const filteredAttendance = attendanceList.filter((item) => {
            const matchShift = filterShift === "All" || item.shift === filterShift;
            const matchSection = filterSection === "All" || item.section_name === filterSection;
            return matchShift && matchSection;
        });

        return (
            <Box>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => setView('rooms')}><ArrowBackIcon /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedRoom?.name} - {selectedDate.format('MMM DD')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, px: 3, mb: 2, width: '100%' }}>
                    <FormControl size="small" fullWidth sx={{ flex: 1 }}>
                        <InputLabel>Shift</InputLabel>
                        <Select
                            value={filterShift} label="Shift"
                            onChange={(e) => setFilterShift(e.target.value)}
                            sx={{ borderRadius: 2, height: 40 }}
                        >
                            <MenuItem value="All">All Shifts</MenuItem>
                            <MenuItem value="AM">AM Only</MenuItem>
                            <MenuItem value="PM">PM Only</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth sx={{ flex: 1 }}>
                        <InputLabel>Section</InputLabel>
                        <Select
                            value={filterSection} label="Section"
                            onChange={(e) => setFilterSection(e.target.value)}
                            sx={{ borderRadius: 2, height: 40 }}
                        >
                            <MenuItem value="All">All Sections</MenuItem>
                            {roomSpecificSections.map((sec) => (
                                <MenuItem key={sec.section_id} value={sec.section_name}>
                                    {sec.section_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ px: 3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                    ) : filteredAttendance.length > 0 ? (
                        <List>
                            {filteredAttendance.map((req) => (
                                <React.Fragment key={req.unique_key}>
                                    <ListItem sx={{ px: 0, py: 2, borderBottom: req.assistant ? 'none' : '1px solid #eee' }}>
                                        <ListItemAvatar>
                                            <Avatar src={req.display_profile?.pfp} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#493979' }}>
                                                    {`${req.display_profile?.firstName} ${req.display_profile?.lastName}`}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                                                    {req.section_name && (
                                                        <Typography component="span" variant="body2" sx={{ color: '#1e1b4b', fontWeight: 600 }}>
                                                            Section: {req.section_name}
                                                        </Typography>
                                                    )}
                                                    <Typography component="span" variant="body2" color="text.secondary">
                                                        Shift: {req.shift}
                                                    </Typography>
                                                    {req.current_attendance && req.attendance_reason && (
                                                        <Typography component="span" variant="caption" sx={{ color: '#6b7280', fontWeight: 600, mt: 0.25, fontStyle: 'italic' }}>
                                                            Remarks: {req.attendance_reason}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        {req.current_attendance ? (
                                            <Chip
                                                label={req.current_attendance} variant="filled"
                                                sx={{ fontWeight: 600, borderRadius: 2, minWidth: 80, bgcolor: req.current_attendance === 'Present' ? '#5c51b6' : '#d32f2f', color: 'white' }}
                                            />
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="outlined" size="small"
                                                    onClick={() => handleOpenConfirmDialog(req.request_id, 'Present', false, req.attendance_id)}
                                                    sx={{ textTransform: 'none', borderRadius: 2, color: '#5c51b6', borderColor: '#5c51b6' }}
                                                >
                                                    Present
                                                </Button>
                                                <Button
                                                    variant="outlined" size="small" color="error"
                                                    onClick={() => handleOpenConfirmDialog(req.request_id, 'Absent', false, req.attendance_id)}
                                                    sx={{ textTransform: 'none', borderRadius: 2, color: '#d32f2f', borderColor: '#d32f2f' }}
                                                >
                                                    Absent
                                                </Button>
                                            </Box>
                                        )}
                                    </ListItem>

                                    {req.assistant && (
                                        <ListItem sx={{ pl: 4, py: 1.5, pb: 2, borderBottom: '1px solid #eee', bgcolor: 'rgba(248, 250, 252, 0.6)' }}>
                                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                                <SubdirectoryArrowRightIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                                            </Box>
                                            <ListItemAvatar sx={{ minWidth: 44 }}>
                                                <Avatar src={req.assistant.display_profile?.pfp} sx={{ width: 32, height: 32 }} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                                                        {`${req.assistant.display_profile?.firstName} ${req.assistant.display_profile?.lastName}`}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography component="span" variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', fontSize: '0.65rem' }}>
                                                            Role: Assistant
                                                        </Typography>
                                                        {req.assistant.current_attendance && req.assistant.attendance_reason && (
                                                            <Typography component="span" variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontStyle: 'italic' }}>
                                                                Remarks: {req.assistant.attendance_reason}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            {req.assistant.current_attendance ? (
                                                <Chip
                                                    label={req.assistant.current_attendance} size="small" variant="filled"
                                                    sx={{ fontWeight: 600, borderRadius: 1.5, minWidth: 70, fontSize: '0.75rem', bgcolor: req.assistant.current_attendance === 'Present' ? '#7c3aed' : '#d32f2f', color: 'white' }}
                                                />
                                            ) : (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        variant="outlined" size="small"
                                                        onClick={() => handleOpenConfirmDialog(req.request_id, 'Present', true, req.attendance_id)}
                                                        sx={{ textTransform: 'none', borderRadius: 1.5, height: 26, fontSize: '0.75rem', color: '#7c3aed', borderColor: '#7c3aed' }}
                                                    >
                                                        Present
                                                    </Button>
                                                    <Button
                                                        variant="outlined" size="small" color="error"
                                                        onClick={() => handleOpenConfirmDialog(req.request_id, 'Absent', true, req.attendance_id)}
                                                        sx={{ textTransform: 'none', borderRadius: 1.5, height: 26, fontSize: '0.75rem', color: '#d32f2f', borderColor: '#d32f2f' }}
                                                    >
                                                        Absent
                                                    </Button>
                                                </Box>
                                            )}
                                        </ListItem>
                                    )}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 5, color: '#999' }}>
                            No rosters match your selected filter.
                        </Typography>
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', mx: 'auto' }}>
            {view === 'calendar' && renderCalendar()}
            {view === 'rooms' && renderRooms()}
            {view === 'list' && renderAttendanceList()}

            {/* --- SIMPLIFIED VERIFICATION CONFIRMATION BOX --- */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirm Attendance Action</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to mark this clinician as <strong>{activeAction?.status}</strong>? This action marks status under <em>{activeAction?.isAssistant ? "Assistant" : "Regular Duty"}</em>.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleAttendanceAction} variant="contained" sx={{ bgcolor: '#5c51b6', textTransform: 'none' }}>
                        Confirm Verify
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- MANUAL ENTRY DIALOG MODAL --- */}
            <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 700 }}>Manual Attendance Entry</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Student</InputLabel>
                        <Select value={manualForm.studentId} label="Select Student" onChange={(e) => setManualForm({ ...manualForm, studentId: e.target.value as string })}>
                            {students.map((student) => (
                                <MenuItem key={student.profile_id} value={student.profile_id}>{student.first_name} {student.last_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Select Section</InputLabel>
                        <Select value={manualForm.sectionId} label="Select Section" onChange={(e) => setManualForm({ ...manualForm, sectionId: e.target.value as string })}>
                            {sections.map((sec) => (
                                <MenuItem key={sec.section_id} value={sec.section_id}>{sec.section_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} />
                    <FormControl fullWidth>
                        <InputLabel>Shift</InputLabel>
                        <Select value={manualForm.shift} label="Shift" onChange={(e) => setManualForm({ ...manualForm, shift: e.target.value as string })}>
                            <MenuItem value="AM">AM</MenuItem>
                            <MenuItem value="PM">PM</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select value={manualForm.status} label="Status" onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as string })}>
                            <MenuItem value="Present">Present</MenuItem>
                            <MenuItem value="Absent">Absent</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Reason / Category</InputLabel>
                        <Select value={manualForm.reason} label="Reason / Category" onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value as string })}>
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
                    <Button onClick={handleManualSubmit} variant="contained" sx={{ bgcolor: '#5c51b6', textTransform: 'none' }}>Add Attendance</Button>
                </DialogActions>
            </Dialog>

            {/* --- SNACKBAR NOTIFICATION CONTAINER VIEW --- */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseToast}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%", fontWeight: 600, borderRadius: 2 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Attendance;