import { Box, Typography, Button, Card, Chip, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { supabase } from "../../../utils/supabase.ts";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
dayjs.extend(localeData);

const RequestHistory = () => {
    const navigate = useNavigate();

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
                    .order('date', { ascending: false });

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

    const [search, setSearch] = useState('');
    const [shiftFilter, setShiftFilter] = useState('All');
    const [monthFilter, setMonthFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredHistory = historyData.filter((item) => {
        const status = getHistoryStatus(item);

        const matchesSearch =
            item.room.toLowerCase().includes(search.toLowerCase()) ||
            item.section.toLowerCase().includes(search.toLowerCase());

        const matchesShift =
            shiftFilter === 'All' || item.shift === shiftFilter;

        const matchesMonth =
            monthFilter === 'All' || dayjs(item.date).format('MMMM') === monthFilter;

        const matchesStatus =
            statusFilter === 'All' || status === statusFilter;

        return matchesSearch && matchesShift && matchesMonth && matchesStatus;
    });

    return (
        <Box fontFamily="Inter" sx={{ p: 3 }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1,}}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/chair-manager-home")}
                    sx={{
                        textTransform: 'none',
                        color: '#493979',
                        minWidth: 'auto',
                        p: 0,
                        mr: 1
                    }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Typography variant="h4" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ my: 2 }}>
                History
            </Typography>

            <Box sx={{ mb: 3 }}>
                {/* Search Bar */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search room or section..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff'
                        }
                    }}
                />

                {/* Filters Row */}
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    {/* Shift Filter */}
                    <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Shift</InputLabel>
                        <Select
                            value={shiftFilter}
                            label="Shift"
                            onChange={(e) => setShiftFilter(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="AM">AM</MenuItem>
                            <MenuItem value="PM">PM</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Month Filter */}
                    <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={monthFilter}
                            label="Month"
                            onChange={(e) => setMonthFilter(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            {dayjs.months().map((month) => (
                                <MenuItem key={month} value={month}>{month}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Status Filter */}
                    <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Ongoing">Ongoing</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                {/* Recent History Items */}
                <Box>
                    {historyData.length === 0 ? (
                        <Typography color="text.secondary" fontFamily="Inter" sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
                            No history yet
                        </Typography>
                    ) : (
                        <>
                            {filteredHistory.map((item) => {
                                // 1. Determine the status string using your existing logic
                                const statusLabel = getHistoryStatus(item);
                                // 2. Get the specific colors for that status
                                const style = getStatusStyle(statusLabel);

                                return (
                                    <Card
                                        key={item.assignment_id}
                                        variant="outlined"
                                        sx={{ mb: 1.5, p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            {/* Date Badge */}
                                            <Box sx={{ textAlign: 'center', backgroundColor: '#F3F0FA', p: 1, borderRadius: 1.5, minWidth: 50, border: '1px solid #E0D7F7' }}>
                                                <Typography variant="caption" fontWeight="700" color="#493979" sx={{ display: 'block', lineHeight: 1 }}>
                                                    {dayjs(item.date).format('D')}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: 9, textTransform: 'uppercase' }}>
                                                    {dayjs(item.date).format('MMM')}
                                                </Typography>
                                            </Box>

                                            {/* Details */}
                                            <Box>
                                                <Typography variant="body2" fontWeight="600" sx={{ color: '#493979', lineHeight: 1.2 }}>
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

                                        {/* Status and Action Container */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                            <Chip
                                                label={statusLabel}
                                                size="small"
                                                sx={{
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    height: '20px',
                                                    backgroundColor: style.bg,
                                                    color: style.color,
                                                    borderRadius: '4px'
                                                }}
                                            />

                                            {(statusLabel === 'Ongoing' || statusLabel === 'Completed') && (
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    sx={{
                                                        textTransform: 'none',
                                                        color: '#493979',
                                                        fontWeight: 600,
                                                        fontSize: 12,
                                                        p: 0,
                                                        minWidth: 0
                                                    }}
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
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default RequestHistory;