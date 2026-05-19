import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import ChairIcon from '@mui/icons-material/Chair';
import PeopleIcon from '@mui/icons-material/People';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "../../../utils/supabase";
import dayjs from "dayjs";

const DashboardOverview: React.FC = () => {
    const [activeChairsCount, setActiveChairsCount] = useState<number>(0);
    const [totalChairsCount] = useState<number>(20);
    const [presentStudentsCount, setPresentStudentsCount] = useState<number>(0);
    const [weeklyChartData, setWeeklyChartData] = useState([
        { day: 'Mon', Present: 0 },
        { day: 'Tue', Present: 0 },
        { day: 'Wed', Present: 0 },
        { day: 'Thu', Present: 0 },
        { day: 'Fri', Present: 0 },
    ]);

    const todayStr = dayjs().format('YYYY-MM-DD');

    useEffect(() => {
        const fetchDashboardMetrics = async () => {
            // 1. Fetch active chair assignments
            const { data: activeAssignments } = await supabase
                .from('dental_chairs_request_assignment')
                .select(`
                    request_id, 
                    status,
                    attendance!inner (status, reason)
                `)
                .eq('date', todayStr)
                .eq('status', 'Accepted')
                .eq('attendance.status', 'Present');

            // 2. Fetch manual standalone entries (where request_id is null)
            const { data: manualEntries } = await supabase
                .from('attendance')
                .select('status, reason')
                .eq('date', todayStr)
                .eq('status', 'Present')
                .is('request_id', null);

            const chairsCount = activeAssignments ? activeAssignments.length : 0;
            let studentsCount = 0;

            // Loop and add every individual body checked into a chair (clinician + assistant)
            if (activeAssignments) {
                activeAssignments.forEach((item: any) => {
                    if (!item.attendance) return;
                    const attArray = Array.isArray(item.attendance) ? item.attendance : [item.attendance];
                    studentsCount += attArray.filter((a: any) => a.status === 'Present').length;
                });
            }

            // Append direct manual list row counts
            if (manualEntries) {
                studentsCount += manualEntries.length;
            }

            setActiveChairsCount(chairsCount);
            setPresentStudentsCount(studentsCount);
        };

        const fetchWeeklyAnalytics = async () => {
            const startOfWeek = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'); // Monday
            const endOfWeek = dayjs().startOf('week').add(5, 'day').format('YYYY-MM-DD');   // Friday

            // Fetch standard sessions with full inner attendance metrics arrays
            const { data: chairLogs } = await supabase
                .from('dental_chairs_request_assignment')
                .select(`date, attendance (status)`)
                .gte('date', startOfWeek)
                .lte('date', endOfWeek)
                .eq('status', 'Accepted');

            // Fetch direct logs targeting cases outside chair lanes
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

        fetchDashboardMetrics();
        fetchWeeklyAnalytics();
    }, [todayStr]);

    const usagePercentage = totalChairsCount > 0 ? Math.round((activeChairsCount / totalChairsCount) * 100) : 0;

    return (
        <Box sx={{ p: 3 }}>
            {/* --- OVERVIEW HEADERS --- */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" fontFamily="Poppins" sx={{ fontWeight: 800, color: '#1e1b4b', tracking: '-0.5px' }}>
                    Overview
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.25 }}>
                    {dayjs().format('dddd, MMMM DD, YYYY')}
                </Typography>
            </Box>

            {/* --- METRIC BLOCKS (SIDE-BY-SIDE IN ROW TINT) --- */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, width: '100%', flexDirection: 'row' }}>
                <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 4, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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

                <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 4, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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

            {/* --- WEEKLY ATTENDANCE OVERVIEW CHART --- */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
                    Weekly Attendance Overview
                </Typography>
                <Box sx={{ width: '100%', height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyChartData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontFamily: 'Poppins' }} />
                            <Bar dataKey="Present" fill="#5c51b6" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default DashboardOverview;