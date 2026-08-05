import { useForm, router, usePage } from "@inertiajs/react";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Autocomplete, Box, IconButton, Menu, MenuItem, Snackbar, Alert, TextField, Button, Typography, Paper, Tabs, Tab,
    Divider
} from "@mui/material";
import axios from 'axios';
import dayjs from "dayjs";
import React, { useState } from "react";

interface Schedule {
    id: number;
    date: string;
    shift: string;
    status: string;
    section_id: number;
    clinician_id: number;
    assistant_id: number | null;
    assistant?: {
        user?: {
            name: string;
        };
    };
    section?: {
        section_name: string;
        room?: {
            room_name: string;
        };
    };
}

interface ClinicianOption {
    id: number;
    name: string;
}

interface PageProps {
    [key: string]: any;
    schedules: Schedule[];
    clinicians: ClinicianOption[];
    flash: { success?: string; error?: string; };
}

export default function Home({ schedules = [], clinicians = [] }: PageProps) {
    const { flash, errors } = usePage<PageProps>().props;

    // --- UI STATES ---
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [assistantModalOpen, setAssistantModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(!!flash?.success || !!errors?.assistant);

    // --- FORMS ---
    const assistantForm = useForm({
        request_id: '',
        assistant_id: '',
    });

    const cancelForm = useForm({
        request_id: '',
    });

    // --- HANDLERS ---
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, schedule: Schedule) => {
        setAnchorEl(event.currentTarget);
        setSelectedSchedule(schedule);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const [availableClinicians, setAvailableClinicians] = useState<ClinicianOption[]>([]);

    const openAssistantModal = async (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        assistantForm.setData({
            request_id: schedule.id.toString(),
            assistant_id: schedule.assistant_id ? schedule.assistant_id.toString() : '',
        });

        try {
            const response = await axios.get('/clinician/available-assistants', {
                params: {
                    date: schedule.date,
                    shift: schedule.shift,
                    section_id: schedule.section_id,
                }
            });
            setAvailableClinicians(response.data);
        } catch (error) {
            console.error("Failed to fetch available clinicians", error);
        }

        setAssistantModalOpen(true);
    };

    const submitAssistant = (e: React.FormEvent) => {
        e.preventDefault();
        assistantForm.post('/clinician/edit-assistant', {
            onSuccess: () => {
                setAssistantModalOpen(false);
                setSnackbarOpen(true);
            },
        });
    };

    const openCancelModal = () => {
        setAnchorEl(null);

        if (selectedSchedule) {
            cancelForm.setData('request_id', selectedSchedule.id.toString());
        }

        setCancelModalOpen(true);
    };

    const submitCancel = (e: React.FormEvent) => {
        e.preventDefault();
        cancelForm.post('/clinician/cancel-chair-schedule', {
            onSuccess: () => {
                setCancelModalOpen(false);
                setSnackbarOpen(true);
                cancelForm.reset();
            },
        });
    };

    // --- DATE / STATUS HELPERS ---
    const now = new Date();
    const phTime = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit" }).formatToParts(now);
    const phDateStr = `${phTime.find(p => p.type === 'year')?.value}-${phTime.find(p => p.type === 'month')?.value}-${phTime.find(p => p.type === 'day')?.value}`;
    const phHour = parseInt(phTime.find(p => p.type === 'hour')?.value || "0");
    const phShift = phHour < 12 ? "AM" : "PM";

    const isCancelled = (item: Schedule) => item.status === 'Cancelled';

    const isHistory = (item: Schedule) => {
        const cleanDate = item.date.split('T')[0];
        const isPast = cleanDate < phDateStr || (cleanDate === phDateStr && phShift === "PM" && item.shift === "AM");

        return isCancelled(item) || isPast;
    };

    const isCurrent = (item: Schedule) => {
        if (isHistory(item)) {
            return false;
        }

        const cleanDate = item.date.split('T')[0];

        return cleanDate === phDateStr && item.shift === phShift;
    };

    const isUpcoming = (item: Schedule) => {
        if (isHistory(item)) {
            return false;
        }

        const cleanDate = item.date.split('T')[0];

        return cleanDate > phDateStr || (cleanDate === phDateStr && phShift === "AM" && item.shift === "PM");
    };

    const currentSchedules = schedules.filter(isCurrent);
    const upcomingSchedules = schedules.filter(isUpcoming);
    const historySchedules = schedules.filter(isHistory);

    // --- CARD RENDERER ---
    const renderScheduleCard = (item: Schedule, { showMenu = false, showAssistantButton = false } = {}) => {
        return (
            <Paper key={item.id} elevation={2} sx={{ display: 'flex', p: 2, borderRadius: 3, position: 'relative', alignItems: 'center' }}>
                {showMenu && (
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, item)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <MoreVertIcon />
                    </IconButton>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100, borderRight: '1px solid #eee', pr: 2, mr: 2 }}>
                    <Typography sx={{ fontSize: 38, fontWeight: 700, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{dayjs(item.date).format('D')}</Typography>
                    <Typography sx={{ fontSize: 18, fontFamily: 'Poppins, sans-serif', color: '#666' }}>{dayjs(item.date).format('MMM')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#493979', mt: 0.5 }}>{item.shift}</Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                        {item.section?.room?.room_name || "No Room"}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontFamily: 'Poppins, sans-serif', color: '#666', mb: 1 }}>
                        Section: {item.section?.section_name || "No Section"}
                    </Typography>

                    {item.status === 'Cancelled' && (
                        <Typography sx={{ fontSize: 13, fontFamily: 'Poppins, sans-serif', color: '#c62828', fontWeight: 600, mb: 0.5 }}>
                            Cancelled
                        </Typography>
                    )}

                    {item.assistant?.user && (
                        <Typography sx={{ fontSize: 14, fontFamily: 'Poppins, sans-serif', color: '#493979', fontWeight: 500 }}>
                            Assistant: {item.assistant.user.name}
                        </Typography>
                    )}

                    {showAssistantButton && (
                        <Button variant="contained" size="small" fullWidth disableElevation onClick={() => openAssistantModal(item)} sx={{ mt: 1, backgroundColor: '#493979', borderRadius: 2, textTransform: 'none', '&:hover': { backgroundColor: '#382d5f' } }}>
                            {item.assistant_id ? "Edit Assistant" : "Add Assistant"}
                        </Button>
                    )}
                </Box>
            </Paper>
        );
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative', minHeight: '80vh', px: 2 }}>

            <Paper elevation={1} sx={{ borderRadius: 5, mb: 4, overflow: 'hidden' }}>
                <Tabs value={tabValue} onChange={(_, newVal) => setTabValue(newVal)} variant="fullWidth" sx={{ '& .MuiTabs-indicator': { backgroundColor: '#493979', height: 4 }, '& .MuiTab-root': { fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#666' }, '& .Mui-selected': { color: '#493979 !important', fontWeight: 600 } }}>
                    <Tab label="Your Schedule" />
                    <Tab label="History" />
                </Tabs>
            </Paper>

            {tabValue === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* CURRENT SECTION */}
                    <Box>
                        <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: '#493979', mb: 1.5 }}>
                            Current Schedule
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {currentSchedules.length > 0 ? (
                                currentSchedules.map((item) => renderScheduleCard(item, { showMenu: false, showAssistantButton: true }))
                            ) : (
                                <Typography sx={{ textAlign: "center", color: "gray", fontFamily: 'Poppins, sans-serif', py: 2 }}>
                                    No current schedule.
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Divider></Divider>

                    {/* UPCOMING SECTION */}
                    <Box>
                        <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: '#493979', mb: 1.5 }}>
                            Upcoming Schedule
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {upcomingSchedules.length > 0 ? (
                                upcomingSchedules.map((item) => renderScheduleCard(item, { showMenu: true, showAssistantButton: true }))
                            ) : (
                                <Typography sx={{ textAlign: "center", color: "gray", fontFamily: 'Poppins, sans-serif', py: 2 }}>
                                    No upcoming schedules.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}

            {tabValue === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {historySchedules.length > 0 ? (
                        historySchedules.map((item) => renderScheduleCard(item, { showMenu: false, showAssistantButton: false }))
                    ) : (
                        <Typography sx={{ textAlign: "center", mt: 5, color: "gray", fontFamily: 'Poppins, sans-serif' }}>No schedules found.</Typography>
                    )}
                </Box>
            )}

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

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={openCancelModal} sx={{ fontFamily: "Poppins, sans-serif", color: 'error.main' }}>Cancel Schedule</MenuItem>
            </Menu>

            {/* ASSISTANT MODAL */}
            {assistantModalOpen && (
                <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)' }} onClick={() => setAssistantModalOpen(false)} />
                    <Paper elevation={4} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: 400, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
                            {assistantForm.data.assistant_id ? "Edit Assistant" : "Add Assistant"}
                        </Typography>

                        <form onSubmit={submitAssistant}>
                            <Autocomplete
                                options={availableClinicians}
                                getOptionLabel={(option) => option.name}
                                value={clinicians.find((c) => c.id.toString() === assistantForm.data.assistant_id) || null}
                                onChange={(_, newValue) => {
                                    assistantForm.setData('assistant_id', newValue ? newValue.id.toString() : '');
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Clinician Assistant"
                                        margin="normal"
                                        required
                                    />
                                )}
                                sx={{ mt: 2, mb: 1 }}
                            />

                            {errors.assistant_id && (
                                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                                    {errors.assistant_id}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                                <Button onClick={() => setAssistantModalOpen(false)} color="inherit">Cancel</Button>
                                <Button type="submit" variant="contained" disabled={assistantForm.processing} sx={{ bgcolor: '#493979' }}>
                                    {assistantForm.processing ? 'Saving...' : 'Submit'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Box>
            )}

            {/* CANCEL MODAL */}
            {cancelModalOpen && (
                <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)' }} onClick={() => setCancelModalOpen(false)} />

                    {/* Changed width to 90% and padding to 3 for better mobile view */}
                    <Paper elevation={4} sx={{ p: 3, zIndex: 1, width: '90%', maxWidth: 400, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1, color: '#c62828' }}>
                            Cancel Schedule?
                        </Typography>

                        <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#666', mb: 3 }}>
                            Are you sure you want to cancel this schedule? <strong>This action cannot be undone.</strong>
                        </Typography>

                        <form onSubmit={submitCancel}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setCancelModalOpen(false)} color="inherit">
                                    Go Back
                                </Button>
                                <Button type="submit" variant="contained" color="error" disableElevation disabled={cancelForm.processing}>
                                    {cancelForm.processing ? 'Canceling...' : 'Confirm'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Box>
            )}

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert severity={errors?.assistant ? "error" : "success"}>
                    {errors?.assistant || flash?.success || "Action completed."}
                </Alert>
            </Snackbar>
        </Box>
    );
}
