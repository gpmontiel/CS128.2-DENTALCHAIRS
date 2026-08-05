import { router } from "@inertiajs/react";
import AddIcon from '@mui/icons-material/Add';
import {
    Box, Typography, Paper, Tabs, Tab, IconButton
} from "@mui/material";
import React, { useState } from "react";
import dayjs from "dayjs";

type Schedule = {
    id: number;
    date: string;
    shift: string;
    status: string;
    section?: {
        section_name: string;
        room?: {
            room_name: string;
        };
    };
};

interface PageProps {
    schedules: Schedule[];
}

const RequestSchedule = ({ schedules }: PageProps) => {
    const [tabValue, setTabValue] = useState(0);

    const pendingSchedules = schedules
        .filter((item) => item.status === "Pending")
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (dateA !== dateB) {
                return dateA - dateB;
            }

            return a.shift.localeCompare(b.shift);
        });

    const rejectedSchedules = schedules
        .filter((item) => item.status === "Rejected")
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (dateA !== dateB) {
                return dateB - dateA;
            }

            return a.shift.localeCompare(b.shift);
        });

    const renderScheduleCard = (item: Schedule) => {
        return (
            <Paper key={item.id} elevation={2} sx={{ display: 'flex', p: 2, borderRadius: 3, position: 'relative', alignItems: 'center' }}>
                {/* LEFT DATE BLOCK */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100, borderRight: '1px solid #eee', pr: 2, mr: 2 }}>
                    <Typography sx={{ fontSize: 38, fontWeight: 700, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
                        {dayjs(item.date).format('D')}
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                        {dayjs(item.date).format('MMM')}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: '#493979', mt: 0.5 }}>
                        {item.shift}
                    </Typography>
                </Box>

                {/* RIGHT INFO BLOCK */}
                <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                        {item.section?.room?.room_name || "No Room"}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontFamily: 'Poppins, sans-serif', color: '#666', mb: 0.5 }}>
                        Section: {item.section?.section_name || "No Section"}
                    </Typography>
                </Box>
            </Paper>
        );
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f7", pb: 10 }}>
            <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
                <Typography variant="h5" sx={{ color: "#493979", fontWeight: 700, fontFamily: "Poppins, sans-serif", mb: 2, mt: 1 }}>
                    Track Your Requests
                </Typography>

                {/* TABS CONTAINER */}
                <Paper elevation={1} sx={{ borderRadius: 10, mb: 4, overflow: 'hidden' }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, newVal) => setTabValue(newVal)}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTabs-indicator': { backgroundColor: '#493979', height: 4 },
                            '& .MuiTab-root': { fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#666' },
                            '& .Mui-selected': { color: '#493979 !important', fontWeight: 600 }
                        }}
                    >
                        <Tab label="Pending" />
                        <Tab label="Rejected" />
                    </Tabs>
                </Paper>

                {/* PENDING TAB PANEL */}
                {tabValue === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {pendingSchedules.length > 0 ? (
                            pendingSchedules.map((item) => renderScheduleCard(item))
                        ) : (
                            <Typography sx={{ textAlign: "center", color: "gray", fontFamily: 'Poppins, sans-serif', py: 4 }}>
                                No pending requests found.
                            </Typography>
                        )}
                    </Box>
                )}

                {/* REJECTED TAB PANEL */}
                {tabValue === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {rejectedSchedules.length > 0 ? (
                            rejectedSchedules.map((item) => renderScheduleCard(item))
                        ) : (
                            <Typography sx={{ textAlign: "center", color: "gray", fontFamily: 'Poppins, sans-serif', py: 4 }}>
                                No rejected requests found.
                            </Typography>
                        )}
                    </Box>
                )}

            </Box>

            <IconButton
                onClick={() => router.get('/clinician/create-chair-request')}
                sx={{
                    position: 'fixed',
                    bottom: 40,
                    right: 40,
                    backgroundColor: '#493979',
                    color: 'white',
                    width: 60,
                    height: 60,
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    '&:hover': { backgroundColor: '#382d5f', transform: 'scale(1.05)' }
                }}
            >
                <AddIcon fontSize="large" />
            </IconButton>
        </Box>
    );
};

export default RequestSchedule;
