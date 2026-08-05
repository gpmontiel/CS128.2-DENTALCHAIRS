import {router, useForm} from "@inertiajs/react";
import type { SelectChangeEvent} from "@mui/material";
import {
    Box, Typography, Button, Select, MenuItem,
    FormControl, Grid, Snackbar, Alert,
    Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Paper,
    ListSubheader, ToggleButton, ToggleButtonGroup, Stack
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import {ClipboardPlus} from "lucide-react";
import React, { useState, useEffect } from "react";

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

interface PageProps {
    rooms: Room[];
    occupiedChairs?: number[];
}

const CreateChairRequest = ({ rooms, occupiedChairs = [] }: PageProps) => {
    const { data, setData, post, processing, errors } = useForm({
        date: "",
        shift: "AM",
        section_id: "",
        chair_number: null as number | null,
    });

    const [submitModal, setSubmitModal] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" as "error" | "success" });

    useEffect(() => {
        if (data.date && data.shift && data.section_id) {
            router.get(
                window.location.pathname,
                {
                    date: data.date,
                    shift: data.shift,
                    section_id: data.section_id,
                },
                {
                    only: ['occupiedChairs'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }
    }, [data.date, data.shift, data.section_id]);

    // Find the currently selected section to know how many chairs to render
    const selectedSection = rooms
        .flatMap(r => r.sections)
        .find(s => s.id === Number(data.section_id));

    const handleShiftChange = (event: React.MouseEvent<HTMLElement>, newShift: string | null) => {
        if (newShift !== null) {
            setData("shift", newShift);
        }
    };

    const handleSectionChange = (e: SelectChangeEvent) => {
        setData({
            ...data,
            section_id: e.target.value,
            chair_number: null
        });
    };

    const showSnackbar = (message: string, severity: "error" | "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleConfirmClick = () => {
        if (!data.date || !data.shift || !data.section_id || !data.chair_number) {
            showSnackbar("Please complete all fields before continuing.", "error");

            return;
        }

        setSubmitModal(true);
    };

    const submitRequest = () => {
        post('/clinician/store-chair-request', {
            onSuccess: () => {
                setSubmitModal(false);
                showSnackbar("Request submitted successfully!", "success");

                router.visit('/clinician/request-tracker');
            },
            onError: (err) => {
                setSubmitModal(false);
                const errorMessage = err.date || err.section_id || err.chair_number || "An error occurred while submitting.";
                showSnackbar(errorMessage, "error");
            }
        });
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f7" }}>
            {/* Form Body */}
            <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 4, position: "relative", mt: 4 }}>

                    <Box sx={{
                        position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)",
                        backgroundColor: "#493979", p: 2, borderRadius: "50%", boxShadow: 2, display: "flex",
                    }}>
                        <ClipboardPlus color="white" size={38} />
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#382d5f", textAlign: "center", mt: 2, fontFamily: "Poppins, sans-serif" }}>
                        Request Schedule
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mb: 4, fontFamily: "Poppins, sans-serif" }}>
                        Fill in the details below to request your dental chair.
                    </Typography>

                    <Stack spacing={3}>
                        {/* Date and Shift Row */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: "#493979" }}>DATE</Typography>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        value={data.date ? dayjs(data.date) : null}
                                        onChange={(newValue) => {
                                            setData("date", newValue ? newValue.format("YYYY-MM-DD") : "");
                                        }}
                                        minDate={dayjs()}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "medium",
                                                error: !!errors.date,
                                                helperText: errors.date,
                                                sx: { mt: 0.5 }
                                            },

                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: "#493979" }}>SHIFT</Typography>
                                <ToggleButtonGroup
                                    value={data.shift}
                                    exclusive
                                    onChange={handleShiftChange}
                                    fullWidth
                                    sx={{ mt: 0.5, height: '56px' }}
                                >
                                    <ToggleButton
                                        value="AM"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#493979",
                                            borderColor: "#493979",
                                            "&.Mui-selected": {
                                                bgcolor: "#493979",
                                                color: "white",
                                                "&:hover": { bgcolor: "#382d5f" }
                                            }
                                        }}
                                    >
                                        AM
                                    </ToggleButton>

                                    <ToggleButton
                                        value="PM"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#493979",
                                            borderColor: "#493979",
                                            "&.Mui-selected": {
                                                bgcolor: "#493979",
                                                color: "white",
                                                "&:hover": { bgcolor: "#382d5f" }
                                            }
                                        }}
                                    >
                                        PM
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                        </Grid>

                        {/* Room and Section Dropdown */}
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#493979" }}>ROOM AND SECTION</Typography>
                            <FormControl fullWidth error={!!errors.section_id} sx={{ mt: 0.5 }}>
                                <Select
                                    value={data.section_id}
                                    onChange={handleSectionChange}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select Room and Section</MenuItem>
                                    {rooms.map((room) => {
                                        const items = [<ListSubheader key={`header-${room.id}`}>{room.room_name}</ListSubheader>];
                                        room.sections.forEach(section => {
                                            items.push(
                                                <MenuItem key={section.id} value={section.id.toString()}>
                                                    {room.room_name} - {section.section_name}
                                                </MenuItem>
                                            );
                                        });

                                        return items;
                                    })}
                                </Select>
                                {errors.section_id && <Typography variant="caption" color="error" sx={{ mt: 2 }}>{errors.section_id}</Typography>}
                            </FormControl>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#493979" }}>CHAIR RESERVATION</Typography>

                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, border: '2px solid #4A3978' }} />
                                    <Typography variant="caption" color="textSecondary">Available</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: '#4E3E7A' }} />
                                    <Typography variant="caption" color="textSecondary">Selected</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: '#E0E0E0' }} />
                                    <Typography variant="caption" color="textSecondary">Reserved</Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        {/* Chair Grid */}
                        {selectedSection && (
                            <Box>
                                <Grid container spacing={1.5}>
                                    {Array.from({ length: selectedSection.chair_count }, (_, index) => {
                                        const chairNumber = index + 1;
                                        const isSelected = data.chair_number === chairNumber;
                                        const isOccupied = occupiedChairs.includes(chairNumber);

                                        return (
                                            <Grid size={{xs: 4}} key={chairNumber}>
                                                <Button
                                                    fullWidth
                                                    variant={isSelected ? "contained" : (isOccupied ? "contained" : "outlined")}
                                                    onClick={() => !isOccupied && setData("chair_number", chairNumber)}
                                                    disabled={isOccupied}
                                                    sx={{
                                                        borderRadius: 3,
                                                        py: 1,
                                                        textTransform: 'none',
                                                        fontWeight: isSelected ? 600 : 400,
                                                        ...(isSelected && { bgcolor: '#4E3E7A', '&:hover': { bgcolor: '#382d5f' } }),
                                                        ...(!isSelected && !isOccupied && { color: '#000', borderColor: '#4A3978' }),
                                                        ...(isOccupied && { bgcolor: '#F3F4F6', color: '#9CA3AF', '&.Mui-disabled': { bgcolor: '#F3F4F6' } })
                                                    }}
                                                >
                                                    Chair {chairNumber}
                                                </Button>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                                {errors.chair_number && <Typography variant="caption" color="error">{errors.chair_number}</Typography>}
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleConfirmClick}
                            disabled={processing}
                            sx={{ mt: 2, bgcolor: "#493979", py: 1.5, borderRadius: 2, fontWeight: "bold", "&:hover": { bgcolor: "#2d2449" } }}
                        >
                            {processing ? "SUBMITTING..." : "CONFIRM"}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            onClick={() => router.visit('/clinician/home')}
                            disabled={processing}
                            sx={{ py: 1.5, borderRadius: 2, fontWeight: "bold", color: "#493979", borderColor: "#493979", }}>
                            Cancel
                        </Button>
                    </Stack>
                </Paper>
            </Box>

            {/* Toasts */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Confirmation Dialog */}
            <Dialog open={submitModal} onClose={() => setSubmitModal(false)} sx={{ borderRadius: 3, p: 1 }}>
                <DialogTitle sx={{ fontWeight: 700, color: "#493979", textAlign: "center" }}>
                    Are you sure?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ textAlign: "center", color: "text.primary" }}>
                        This action cannot be undone. Please make sure your details are correct before submitting.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", gap: 1, pb: 2 }}>
                    <Button onClick={() => setSubmitModal(false)} variant="outlined" disabled={processing} sx={{ borderRadius: 4, px: 4, color: "#493979", borderColor: "#493979" }}>
                        Go Back
                    </Button>
                    <Button onClick={submitRequest} variant="contained" disabled={processing} sx={{ borderRadius: 4, px: 4, bgcolor: "#493979" }}>
                        SUBMIT
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CreateChairRequest;
