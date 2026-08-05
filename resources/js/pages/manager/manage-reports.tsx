import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import {
    Typography, Box, TextField, InputAdornment, MenuItem, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Avatar, Dialog, DialogContent, IconButton, Tabs, Tab, TablePagination, Paper,
    Snackbar, Alert
} from "@mui/material";
import dayjs from "dayjs";
import { Download, FileDown, Armchair } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { exportAttendancePDF } from "../export/exportAttendancePDF";
import { exportChairUsagePDF } from "../export/exportChairUsagePDF";
import { exportGroupAttendancePDF } from "../export/exportGroupAttendancePDF";
import { exportGroupChairUsagePDF } from "../export/exportGroupChairUsagePDF";

// --- Types ---
interface StudentGroupOption {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    pfpUrl?: string | null;
    student_number: string;
    student_group_id: number | null;
    group_name: string;
}

interface AttendanceRecord {
    date: string;
    shift: string;
    room_name: string;
    section_name: string;
    status: string;
}

interface SectionData {
    id: number;
    name: string;
}

interface RoomUsage {
    id: number;
    room_name: string;
    chair_count: number;
    sections: SectionData[];
}

interface ManageReportsProps {
    students: Student[];
    studentGroups: StudentGroupOption[];
    rooms?: RoomUsage[];
}

// --- Date helpers ---
const getWeekdayRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);

    monday.setDate(now.getDate() + diffToMonday);
    const friday = new Date(monday);

    friday.setDate(monday.getDate() + 4);

    return { start: monday, end: friday };
};

const getMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return { start, end };
};

const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatRangeLabel = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const endStr = end.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    return `${startStr} - ${endStr}`;
};

const getActiveRange = (tab: number, customStart: string, customEnd: string) => {
    if (tab === 0) {
        return getWeekdayRange();
    }

    if (tab === 1) {
        return getMonthRange();
    }

    if (customStart && customEnd) {
        return { start: new Date(customStart), end: new Date(customEnd) };
    }

    return getWeekdayRange();
};

export default function ManageReports({ students, studentGroups, rooms = [] }: ManageReportsProps) {
    const apiPrefix = window.location.pathname.startsWith("/manager")
        ? "/manager/manage-reports"
        : "/admin/manage-reports";

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const showError = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }

        setSnackbarOpen(false);
    };

    // Helper for custom date validation
    const validateCustomDates = (start: string, end: string) => {
        if (!start || !end) {
            return "Please select both start and end dates.";
        }

        if (new Date(end) < new Date(start)) {
            return "End date cannot be earlier than start date.";
        }

        return null;
    };

    // --- Main Tab State ---
    const [mainTabValue, setMainTabValue] = useState(0);

    // ==========================================
    // TAB 1: STUDENT ATTENDANCE STATE & LOGIC
    // ==========================================
    const [searchTerm, setSearchTerm] = useState("");
    const [groupFilter, setGroupFilter] = useState<number | "all">("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportStudent, setExportStudent] = useState<Student | null>(null);
    const [exportTab, setExportTab] = useState(0);
    const [exportCustomStart, setExportCustomStart] = useState("");
    const [exportCustomEnd, setExportCustomEnd] = useState("");
    const [exportRecords, setExportRecords] = useState<AttendanceRecord[]>([]);
    const [exportLoading, setExportLoading] = useState(false);

    const [groupExportModalOpen, setGroupExportModalOpen] = useState(false);
    const [groupExportTab, setGroupExportTab] = useState(0);
    const [groupExportCustomStart, setGroupExportCustomStart] = useState("");
    const [groupExportCustomEnd, setGroupExportCustomEnd] = useState("");

    const filteredStudents = students
        .filter((s) => groupFilter === "all" || s.student_group_id === groupFilter)
        .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const selectedGroupName = groupFilter === "all" ? "All Groups" : studentGroups.find((g) => g.id === groupFilter)?.name ?? "";

    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const openExportModal = (student: Student) => {
        setExportStudent(student);
        setExportTab(0);
        setExportCustomStart("");
        setExportCustomEnd("");
        setExportRecords([]);
        setExportModalOpen(true);
    };

    const closeExportModal = () => {
        setExportModalOpen(false);
        setExportStudent(null);
    };

    const exportRange = useMemo(() => getActiveRange(exportTab, exportCustomStart, exportCustomEnd), [exportTab, exportCustomStart, exportCustomEnd]);

    useEffect(() => {
        if (!exportModalOpen || !exportStudent) {
            return;
        }

        if (exportTab === 2 && (!exportCustomStart || !exportCustomEnd)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExportRecords([]);

            return;
        }

        setExportLoading(true);
        fetch(`${apiPrefix}/students/${exportStudent.id}/attendance?start=${toISODate(exportRange.start)}&end=${toISODate(exportRange.end)}`)
            .then((res) => res.json())
            .then((data) => setExportRecords(data.records || []))
            .catch(() => setExportRecords([]))
            .finally(() => setExportLoading(false));
    }, [exportModalOpen, exportStudent, exportTab, exportCustomStart, exportCustomEnd, exportRange, apiPrefix]);

    const handleDownloadStudentReport = () => {
        if (!exportStudent) {
            return;
        }

        if (exportTab === 2) {
            const errorMsg = validateCustomDates(exportCustomStart, exportCustomEnd);

            if (errorMsg) {
                showError(errorMsg);

                return;
            }
        }

        // Figure out what text to show on the PDF header (Weekly, Monthly, or Custom)
        const filterTypes = ["Weekly", "Monthly", "Custom"];
        const currentFilterType = filterTypes[exportTab];

        // Ensure we format the dates so your PDF helper can read them
        const startStr = toISODate(exportRange.start);
        const endStr = toISODate(exportRange.end);
        const rangeLabel = `${startStr} - ${endStr}`;

        // Call your brand new function!
        exportAttendancePDF({
            data: exportRecords,
            studentName: exportStudent.name,
            studentGroup: exportStudent.group_name,
            filterType: currentFilterType,
            filterRangeLabel: rangeLabel,
            rooms: rooms // Passing the dynamic rooms directly from your Laravel controller!
        });
    };

    const groupExportRange = useMemo(() => getActiveRange(groupExportTab, groupExportCustomStart, groupExportCustomEnd), [groupExportTab, groupExportCustomStart, groupExportCustomEnd]);

    const openGroupExportModal = () => {
        setGroupExportTab(0);
        setGroupExportCustomStart("");
        setGroupExportCustomEnd("");
        setGroupExportModalOpen(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [groupExportLoading, setGroupExportLoading] = useState(false);
    const handleDownloadGroupReport = async () => {
        if (groupExportTab === 2) {
            const errorMsg = validateCustomDates(groupExportCustomStart, groupExportCustomEnd);

            if (errorMsg) {
                showError(errorMsg);

                return;
            }
        }

        const filterTypes = ["Weekly", "Monthly", "Custom"];
        const currentFilterType = filterTypes[groupExportTab] as "Weekly" | "Monthly" | "Custom";
        const rangeLabel = `${toISODate(groupExportRange.start)} - ${toISODate(groupExportRange.end)}`;

        try {
            const response = await fetch(`${apiPrefix}/export/group/${groupFilter}?start=${toISODate(groupExportRange.start)}&end=${toISODate(groupExportRange.end)}`);

            if (!response.ok) {
                throw new Error("Failed to fetch group attendance data");
            }

            const data = await response.json();

            exportGroupAttendancePDF({
                data: data.records || [],
                groupName: selectedGroupName,
                filterType: currentFilterType,
                filterRangeLabel: rangeLabel,
                rooms: rooms,
            });

            setGroupExportModalOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showError("Could not generate the group report. Please try again.");
        }
    };

    // ==========================================
    // TAB 2: DENTAL CHAIR USAGE STATE & LOGIC
    // ==========================================

    const [chairSearchTerm, setChairSearchTerm] = useState("");

    const [chairExportModalOpen, setChairExportModalOpen] = useState(false);
    const [exportChairTarget, setExportChairTarget] = useState<RoomUsage | null>(null);
    const [chairExportTab, setChairExportTab] = useState(0);
    const [chairExportCustomStart, setChairExportCustomStart] = useState("");
    const [chairExportCustomEnd, setChairExportCustomEnd] = useState("");

    const [chairGroupExportModalOpen, setChairGroupExportModalOpen] = useState(false);
    const [chairGroupExportTab, setChairGroupExportTab] = useState(0);
    const [chairGroupExportCustomStart, setChairGroupExportCustomStart] = useState("");
    const [chairGroupExportCustomEnd, setChairGroupExportCustomEnd] = useState("");

    const filteredRooms = rooms.filter((r) => {
        const matchesRoom = r.room_name.toLowerCase().includes(chairSearchTerm.toLowerCase());
        const matchesSection = r.sections.some(sec => sec.name.toLowerCase().includes(chairSearchTerm.toLowerCase()));

        return matchesRoom || matchesSection;
    });

    const openChairExportModal = (room: RoomUsage) => {
        setExportChairTarget(room);
        setChairExportTab(0);
        setChairExportCustomStart("");
        setChairExportCustomEnd("");
        setChairExportModalOpen(true);
    };

    const closeChairExportModal = () => {
        setChairExportModalOpen(false);
        setExportChairTarget(null);
    };

    const openChairGroupExportModal = () => {
        setChairGroupExportTab(0);
        setChairGroupExportCustomStart("");
        setChairGroupExportCustomEnd("");
        setChairGroupExportModalOpen(true);
    };

    const chairExportRange = useMemo(() => getActiveRange(chairExportTab, chairExportCustomStart, chairExportCustomEnd), [chairExportTab, chairExportCustomStart, chairExportCustomEnd]);
    const chairGroupExportRange = useMemo(() => getActiveRange(chairGroupExportTab, chairGroupExportCustomStart, chairGroupExportCustomEnd), [chairGroupExportTab, chairGroupExportCustomStart, chairGroupExportCustomEnd]);

    const handleDownloadChairReport = async () => {
        if (!exportChairTarget) {
            return;
        }

        if (chairExportTab === 2) {
            const errorMsg = validateCustomDates(chairExportCustomStart, chairExportCustomEnd);

            if (errorMsg) {
                showError(errorMsg);

                return;
            }
        }

        const filterTypes = ["Weekly", "Monthly", "Custom"];
        const currentFilterType = filterTypes[chairExportTab];
        const rangeLabel = `${toISODate(chairExportRange.start)} - ${toISODate(chairExportRange.end)}`;

        try {
            const response = await fetch(`${apiPrefix}/export/chair/${exportChairTarget.id}?start=${toISODate(chairExportRange.start)}&end=${toISODate(chairExportRange.end)}`);

            if (!response.ok) {
                throw new Error("Failed to fetch chair usage data");
            }

            const data = await response.json();

            exportChairUsagePDF({
                data: data.records || [],
                filterType: currentFilterType,
                filterRangeLabel: rangeLabel,
                roomName: exportChairTarget.room_name,
            });

            setChairExportModalOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showError("Could not generate the room usage report.");
        }
    };

    const handleDownloadAllChairReport = async () => {
        if (chairGroupExportTab === 2) {
            const errorMsg = validateCustomDates(chairGroupExportCustomStart, chairGroupExportCustomEnd);

            if (errorMsg) {
                showError(errorMsg);

                return;
            }
        }

        const filterTypes = ["Weekly", "Monthly", "Custom"] as const;
        const currentFilterType = filterTypes[chairGroupExportTab];
        const rangeLabel = `${toISODate(chairGroupExportRange.start)} - ${toISODate(chairGroupExportRange.end)}`;

        try {
            const response = await fetch(`${apiPrefix}/export/all-chair?start=${toISODate(chairGroupExportRange.start)}&end=${toISODate(chairGroupExportRange.end)}`);

            if (!response.ok) {
                throw new Error("Failed to fetch all chair usage data");
            }

            const data = await response.json();

            exportGroupChairUsagePDF({
                data: data.records || [],
                filterType: currentFilterType,
                filterRangeLabel: rangeLabel,
                rooms: rooms,
                startDate: chairGroupExportCustomStart,
                endDate: chairGroupExportCustomEnd,
            });

            setChairGroupExportModalOpen(false);
        } catch (error) {
            console.error(error);
            showError("Could not generate the total usage report. Please try again.");
        }
    };

    // Shared Styles
    const tabsSx = {
        bgcolor: "#f0f0f5",
        borderRadius: "10px",
        minHeight: "40px",
        mb: 2,
        "& .MuiTabs-indicator": { display: "none" },
        "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: "40px", borderRadius: "8px", color: "#493978" },
        "& .Mui-selected": { bgcolor: "#493978", color: "#fff !important" },
    };

    return (
        <Box sx={{ p: 2, fontFamily: "Inter" }}>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%", fontWeight: 600 }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Navigation Tabs */}
            <Paper elevation={1} sx={{ borderRadius: 5, mb: 3, overflow: 'hidden' }}>
                <Tabs
                    value={mainTabValue}
                    onChange={(_, newVal) => setMainTabValue(newVal)}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTabs-indicator': { backgroundColor: '#493979', height: 4 },
                        '& .MuiTab-root': { fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#666' },
                        '& .Mui-selected': { color: '#493979 !important', fontWeight: 600 }
                    }}
                >
                    <Tab label="Student Attendance" />
                    <Tab label="Dental Chair Usage" />
                </Tabs>
            </Paper>

            {/* ========================================== */}
            {/* TAB 1 CONTENT: STUDENT ATTENDANCE */}
            {/* ========================================== */}
            {mainTabValue === 0 && (
                <Box>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{ color: "#493979", fontWeight: "700", fontFamily: "Poppins", mb: 0.5 }}>
                            Attendance Report
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Search, filter, and export student attendance records.
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth placeholder="Search student by name..." variant="outlined" size="small"
                        value={searchTerm} onChange={(e) => {
                        setSearchTerm(e.target.value); setPage(0);
                    }}
                        sx={{ mb: 2, bgcolor: "#fff", borderRadius: "12px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e0e0e0" } }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#5c51b6" }} /></InputAdornment> } }}
                    />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                        <TextField
                            select label="Student Group" size="small" value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                            fullWidth sx={{ bgcolor: "#fff" }}
                        >
                            <MenuItem value="all">All Groups</MenuItem>
                            {studentGroups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                        </TextField>

                        <Button
                            variant="contained" startIcon={<GroupsIcon />} onClick={openGroupExportModal} fullWidth
                            sx={{ bgcolor: "#9268BC", textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#3f3693" } }}
                        >
                            Student Group Export
                        </Button>
                    </Box>

                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden", bgcolor: "#fff" }}>
                        <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
                            <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ "& .MuiTableCell-root": { bgcolor: "#493978", color: "#fff", fontWeight: 700, py: 2 } }}>
                                        <TableCell sx={{ width: "5%" }}>No.</TableCell>
                                        <TableCell sx={{ width: "20%" }}>Student Name</TableCell>
                                        <TableCell sx={{ width: "20%" }}>Student Group</TableCell>
                                        <TableCell sx={{ width: "20%" }} align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedStudents.length > 0 ? (
                                        paginatedStudents.map((s, idx) => (
                                            <TableRow key={s.id} hover>
                                                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>{s.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={s.group_name} size="small" sx={{ bgcolor: "#eef0fb", color: "#493978" }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        size="small" variant="outlined" startIcon={<FileDown size={14} />} onClick={() => openExportModal(s)}
                                                        sx={{ textTransform: "none", borderColor: "#9268bc", color: "#9268bc", "&:hover": { borderColor: "#3f3693", bgcolor: "#f4f3f8" } }}
                                                    >
                                                        Export
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} sx={{ textAlign: "center", color: "#999", py: 4 }}>
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]} component="div" count={filteredStudents.length}
                            rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Box>
                </Box>
            )}

            {/* ========================================== */}
            {/* TAB 2 CONTENT: DENTAL CHAIR USAGE */}
            {/* ========================================== */}
            {mainTabValue === 1 && (
                <Box>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{ color: "#493979", fontWeight: "700", fontFamily: "Poppins", mb: 0.5 }}>
                            Chair Usage Report
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Search, filter, and export dental chair usage records.
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth placeholder="Search by rooms or sections..." variant="outlined" size="small"
                        value={chairSearchTerm} onChange={(e) => setChairSearchTerm(e.target.value)}
                        sx={{ mb: 2, bgcolor: "#fff", borderRadius: "12px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e0e0e0" } }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#5c51b6" }} /></InputAdornment> } }}
                    />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                        <Button
                            variant="contained" startIcon={<Download size={16} />} onClick={openChairGroupExportModal} fullWidth
                            sx={{ bgcolor: "#9268BC", textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#3f3693" } }}
                        >
                            Export All Chair Usage
                        </Button>
                    </Box>

                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden", bgcolor: "#fff" }}>
                        <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
                            <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ "& .MuiTableCell-root": { bgcolor: "#493978", color: "#fff", fontWeight: 700, py: 2 } }}>
                                        <TableCell sx={{ width: "5%" }}>No.</TableCell>
                                        <TableCell sx={{ width: "20%" }}>Rooms</TableCell>
                                        <TableCell sx={{ width: "35%" }}>Sections</TableCell>
                                        <TableCell sx={{ width: "20%" }}>Chair Count</TableCell>
                                        <TableCell sx={{ width: "25%" }} align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRooms.length > 0 ? (
                                        filteredRooms.map((r, idx) => (
                                            <TableRow key={r.id} hover>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>{r.room_name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                        {r.sections.map(sec => (
                                                            <Chip key={sec.id} label={sec.name} size="small" sx={{ bgcolor: "#eef0fb", color: "#493978", fontWeight: 600 }} />
                                                        ))}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>{r.chair_count} Chairs</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        size="small" variant="outlined" startIcon={<FileDown size={14} />} onClick={() => openChairExportModal(r)}
                                                        sx={{ textTransform: "none", borderColor: "#9268bc", color: "#9268bc", "&:hover": { borderColor: "#3f3693", bgcolor: "#f4f3f8" } }}
                                                    >
                                                        Export
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: "center", color: "#999", py: 4 }}>
                                                No rooms found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            )}

            {/* ========================================== */}
            {/* TAB 1 MODALS: SINGLE STUDENT EXPORT */}
            {/* ========================================== */}
            <Dialog open={exportModalOpen} onClose={closeExportModal} fullWidth maxWidth="xs" sx={{ "& .MuiDialog-paper": { borderRadius: "20px" } }}>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontWeight: 800, letterSpacing: 0.5, color: "#493978", fontSize: "0.85rem", textTransform: "uppercase" }}>
                            Attendance Report
                        </Typography>
                        <IconButton onClick={closeExportModal} size="small" sx={{ bgcolor: "#f0f0f5" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                        <Avatar src={exportStudent?.pfpUrl || undefined} sx={{ width: 60, height: 60 }}>
                            <AccountCircleIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#222" }}>{exportStudent?.name}</Typography>
                            <Typography sx={{ mt: 0.3, color: "text.secondary", fontSize: "0.875rem" }}>{exportStudent?.group_name}</Typography>
                        </Box>
                    </Box>

                    <Tabs value={exportTab} onChange={(_, v) => setExportTab(v)} variant="fullWidth" sx={tabsSx}>
                        <Tab label="Weekly" />
                        <Tab label="Monthly" />
                        <Tab label="Custom" />
                    </Tabs>

                    {exportTab === 2 ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <TextField type="date" size="small" fullWidth value={exportCustomStart} onChange={(e) => setExportCustomStart(e.target.value)} />
                            <Typography color="textSecondary">to</Typography>
                            <TextField type="date" size="small" fullWidth value={exportCustomEnd} onChange={(e) => setExportCustomEnd(e.target.value)} />
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: "center", color: "#666", mb: 2 }}>
                            Date Range: {formatRangeLabel(exportRange.start, exportRange.end)}
                        </Typography>
                    )}

                    <Box
                        sx={{
                            border: "1px solid #eee",
                            borderRadius: "12px",
                            maxHeight: 280,
                            overflowY: "auto",
                        }}
                    >
                        {exportLoading ? (
                            <Typography sx={{ p: 3, textAlign: "center", color: "#999" }}>
                                Loading...
                            </Typography>
                        ) : exportRecords.length > 0 ? (
                            exportRecords.map((rec, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        p: 2,
                                        borderBottom:
                                            i < exportRecords.length - 1
                                                ? "1px solid #f2f2f2"
                                                : "none",
                                    }}
                                >
                                    {/* Date + Shift */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                color: "#333",
                                            }}
                                        >
                                            {dayjs(rec.date).format("MMMM DD, YYYY")}
                                        </Typography>

                                        <Chip
                                            label={rec.shift}
                                            size="small"
                                            sx={{
                                                bgcolor: "#eef0fb",
                                                color: "#493978",
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>

                                    {/* Room + Section */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {rec.room_name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {rec.section_name}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Typography
                                sx={{
                                    p: 3,
                                    textAlign: "center",
                                    color: "#999",
                                    fontWeight: 600,
                                }}
                            >
                                No attendance records found.
                            </Typography>
                        )}
                    </Box>

                    <Button
                        fullWidth variant="contained" startIcon={<Download size={16} />} onClick={handleDownloadStudentReport}
                        sx={{ bgcolor: "#493978", textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1.2, mt: 2, "&:hover": { bgcolor: "#3f3693" } }}
                    >
                        Download
                    </Button>
                </DialogContent>
            </Dialog>

            {/* --- TAB 1 MODALS: GROUP STUDENT EXPORT --- */}
            <Dialog open={groupExportModalOpen} onClose={() => setGroupExportModalOpen(false)} fullWidth maxWidth="xs" sx={{ "& .MuiDialog-paper": { borderRadius: "20px" } }}>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#493978" }}>Exporting Options</Typography>
                        <IconButton onClick={() => setGroupExportModalOpen(false)} size="small" sx={{ bgcolor: "#f0f0f5" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Select Timeframe</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Attendance Report for {selectedGroupName}</Typography>

                    <Tabs value={groupExportTab} onChange={(_, v) => setGroupExportTab(v)} variant="fullWidth" sx={tabsSx}>
                        <Tab label="Weekly" />
                        <Tab label="Monthly" />
                        <Tab label="Custom" />
                    </Tabs>

                    {groupExportTab === 2 ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                            <TextField type="date" size="small" fullWidth value={groupExportCustomStart} onChange={(e) => setGroupExportCustomStart(e.target.value)} />
                            <Typography color="textSecondary">to</Typography>
                            <TextField type="date" size="small" fullWidth value={groupExportCustomEnd} onChange={(e) => setGroupExportCustomEnd(e.target.value)} />
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: "center", color: "#666", mt: 2 }}>
                            Date Range: {formatRangeLabel(groupExportRange.start, groupExportRange.end)}
                        </Typography>
                    )}

                    <Button
                        fullWidth variant="contained" startIcon={<FileDownloadIcon />} onClick={handleDownloadGroupReport}
                        disabled={groupExportLoading}
                        sx={{ bgcolor: "#493978", textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1.2, mt: 3, "&:hover": { bgcolor: "#3f3693" } }}
                    >
                        {groupExportLoading ? "Generating PDF..." : "Download PDF"}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* ========================================== */}
            {/* TAB 2 MODALS: SINGLE CHAIR EXPORT */}
            {/* ========================================== */}
            <Dialog open={chairExportModalOpen} onClose={closeChairExportModal} fullWidth maxWidth="xs" sx={{ "& .MuiDialog-paper": { borderRadius: "20px" } }}>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontWeight: 800, letterSpacing: 0.5, color: "#493978", fontSize: "0.85rem", textTransform: "uppercase" }}>
                            Dental Chair Usage Report
                        </Typography>
                        <IconButton onClick={closeChairExportModal} size="small" sx={{ bgcolor: "#f0f0f5" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: "#eef0fb", color: "#493978" }}>
                            <Armchair size={32} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#222" }}>{exportChairTarget?.room_name}</Typography>
                            <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                {exportChairTarget?.sections.map(sec => (
                                    <Chip key={sec.id} label={sec.name} size="small" sx={{ bgcolor: "#eaf1ff", color: "#3f6fd1", fontWeight: 600 }} />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    <Tabs value={chairExportTab} onChange={(_, v) => setChairExportTab(v)} variant="fullWidth" sx={tabsSx}>
                        <Tab label="Weekly" />
                        <Tab label="Monthly" />
                        <Tab label="Custom" />
                    </Tabs>

                    {chairExportTab === 2 ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <TextField type="date" size="small" fullWidth value={chairExportCustomStart} onChange={(e) => setChairExportCustomStart(e.target.value)} />
                            <Typography color="textSecondary">to</Typography>
                            <TextField type="date" size="small" fullWidth value={chairExportCustomEnd} onChange={(e) => setChairExportCustomEnd(e.target.value)} />
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: "center", color: "#666", mb: 2 }}>
                            Date Range: {formatRangeLabel(chairExportRange.start, chairExportRange.end)}
                        </Typography>
                    )}

                    <Button
                        fullWidth variant="contained" startIcon={<Download size={16} />} onClick={handleDownloadChairReport}
                        sx={{ bgcolor: "#493978", textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1.2, mt: 2, "&:hover": { bgcolor: "#3f3693" } }}
                    >
                        Download
                    </Button>
                </DialogContent>
            </Dialog>

            {/* --- TAB 2 MODALS: GROUP CHAIR EXPORT --- */}
            <Dialog open={chairGroupExportModalOpen} onClose={() => setChairGroupExportModalOpen(false)} fullWidth maxWidth="xs" sx={{ "& .MuiDialog-paper": { borderRadius: "20px" } }}>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#493978" }}>Exporting Options</Typography>
                        <IconButton onClick={() => setChairGroupExportModalOpen(false)} size="small" sx={{ bgcolor: "#f0f0f5" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Select Timeframe</Typography>

                    <Tabs value={chairGroupExportTab} onChange={(_, v) => setChairGroupExportTab(v)} variant="fullWidth" sx={tabsSx}>
                        <Tab label="Weekly" />
                        <Tab label="Monthly" />
                        <Tab label="Custom" />
                    </Tabs>

                    {chairGroupExportTab === 2 ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                            <TextField type="date" size="small" fullWidth value={chairGroupExportCustomStart} onChange={(e) => setChairGroupExportCustomStart(e.target.value)} />
                            <Typography color="textSecondary">to</Typography>
                            <TextField type="date" size="small" fullWidth value={chairGroupExportCustomEnd} onChange={(e) => setChairGroupExportCustomEnd(e.target.value)} />
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ textAlign: "center", color: "#666", mt: 2 }}>
                            Date Range: {formatRangeLabel(chairGroupExportRange.start, chairGroupExportRange.end)}
                        </Typography>
                    )}

                    <Button
                        fullWidth variant="contained" startIcon={<FileDownloadIcon />} onClick={handleDownloadAllChairReport}
                        sx={{ bgcolor: "#493978", textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1.2, mt: 3, "&:hover": { bgcolor: "#3f3693" } }}
                    >
                        Download PDF
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
