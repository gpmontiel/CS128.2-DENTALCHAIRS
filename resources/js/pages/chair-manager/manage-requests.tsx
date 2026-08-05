import { router } from '@inertiajs/react';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from "@mui/icons-material/Today";
import {
    Box, Typography, Button, Card, LinearProgress, Divider, Avatar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    useTheme, useMediaQuery
} from "@mui/material";
import dayjs from "dayjs";
import {ArrowLeft} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

export interface Assignment {
    id: number;
    date: string;
    shift: string;
    section: string;
    room: string;
}

export interface StudentRequest {
    id: number;
    student_id: number;
    student_name: string;
    pfp: string | null;
    student_group: string;
    assistant_name: string | null;
    chair_number: number | null;
    created_at: string;
    status: "Pending" | "Accepted" | "Rejected" | "Cancelled" | string;
}

export interface ManageRequestsProps {
    assignment: Assignment;
    totalSeats: number;
    requestList: StudentRequest[];
}

export default function ManageRequests({ assignment, totalSeats, requestList }: ManageRequestsProps) {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    const [selectedChair, setSelectedChair] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [openDialog, setOpenDialog] = useState(false);
    const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentRequest | null>(null);

    const CARDS_PER_PAGE = isDesktop ? 10 : 8;

    const isAdmin = window.location.pathname.startsWith('/admin');

    const backPath = isAdmin ? "/admin/manage-requests" : "/chair-manager/home";
    const postActionPath = isAdmin
        ? `/admin/manage-requests/${assignment.id}/request/`
        : `/chair-manager/manage-requests/${assignment.id}/request/`;

    const getProgressStyles = (available: number, total: number) => {
        if (total === 0) {
        return { bg: "#FFEBEE", bar: "#D32F2F", text: "#B71C1C", label: "Full Capacity" };
        }

        const ratio = available / total;

        if (ratio === 0) {
            return { bg: "#FFEBEE", bar: "#D32F2F", text: "#B71C1C", label: "Full Capacity" };
        }

        if (ratio <= 0.2) {
            return { bg: "#FFEBEE", bar: "#D32F2F", text: "#B71C1C", label: "Almost Full Capacity" };
        }

        if (ratio <= 0.5) {
            return { bg: "#FFF3E0", bar: "#ED6C02", text: "#E65100", label: "Limited Capacity" };
        }

        return { bg: "#E8F5E9", bar: "#2E7D32", text: "#1B5E20", label: "Open Capacity" };
    };

    const occupiedSeats = requestList.filter(s => s.status === "Accepted").length;
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);
    const progressValue = totalSeats > 0 ? (availableSeats / totalSeats) * 100 : 0;
    const status = getProgressStyles(availableSeats, totalSeats);

    const filteredRequestList = selectedChair
        ? requestList.filter(student => Number(student.chair_number) === selectedChair)
        : requestList;

    const sequentialChairsList = useMemo(() => {
        return Array.from({ length: totalSeats }, (_, i) => {
            const chairNum = i + 1;
            const chairRequests = requestList.filter(r => Number(r.chair_number) === chairNum);
            const totalRequestsCount = chairRequests.length;
            const isAccepted = chairRequests.some(r => r.status === "Accepted");

            return { chairNum, totalRequestsCount, isAccepted };
        });
    }, [totalSeats, requestList]);

    const totalPages = Math.ceil(sequentialChairsList.length / CARDS_PER_PAGE) || 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedChairs = useMemo(() => {
        const startIndex = (currentPage - 1) * CARDS_PER_PAGE;

        return sequentialChairsList.slice(startIndex, startIndex + CARDS_PER_PAGE);
    }, [sequentialChairsList, currentPage]);

    const handleOpenDialog = (type: "accept" | "reject", student: StudentRequest) => {
        setActionType(type);
        setSelectedStudent(student);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setActionType(null);
        setSelectedStudent(null);
    };

    const handleConfirmAction = () => {
        if (!selectedStudent || !actionType) {
            return;
        }

        if (actionType === "accept" && availableSeats <= 0) {
            alert("Cannot accept student. This section has reached maximum capacity.");
            handleCloseDialog();

            return;
        }

        router.post(`${postActionPath}${selectedStudent.id}`,
            { action: actionType },
            {
                preserveScroll: true,
                onSuccess: () => handleCloseDialog(),
            }
        );
    };

    const StudentCard = ({ student }: { student: StudentRequest }) => (
        <Card sx={{ display: "flex", alignItems: "flex-start", gap: 2, p: 2, mb: 1.5, borderRadius: 2, boxShadow: "0px 3px 10px rgba(0,0,0,0.08)", border: "1px solid #E0E0E0" }}>
            <Avatar src={student.pfp || undefined} sx={{ width: 56, height: 56 }}>
                {student.student_name?.[0]}
            </Avatar>

            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontSize: 18, fontWeight:700 }}>
                        {student.student_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        Student Group: {student.student_group}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        Assistant: {student.assistant_name || "None"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        Chair Assigned: {student.chair_number ? `Chair ${student.chair_number}` : "None"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Request Time:
                        </Typography>
                        <Box sx={{ backgroundColor: "#FFF7ED", color: "#C2410C", px: 1, py: 0.25, borderRadius: 1, fontWeight: 700, fontSize: 12 }}>
                            {student.created_at ? dayjs(student.created_at).format('MMM D, h:mm A') : "N/A"}
                        </Box>
                    </Box>
                </Box>

                <Box>
                    {student.status === "Pending" ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                fullWidth variant="outlined" startIcon={<CancelIcon />}
                                sx={{ textTransform: "none", backgroundColor: "#EF4444", color: "#fff", '&:hover': { backgroundColor: "#DC2626" } }}
                                onClick={() => handleOpenDialog("reject", student)}
                            >
                                Reject
                            </Button>
                            <Button
                                fullWidth variant="contained" startIcon={<CheckCircleIcon />}
                                disabled={availableSeats <= 0}
                                sx={{ textTransform: "none", backgroundColor: "#7C3AED", '&:hover': { backgroundColor: "#6D28D9" } }}
                                onClick={() => handleOpenDialog("accept", student)}
                            >
                                Accept
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                px: 2, py: 1, borderRadius: 2, width: "100%", textAlign: "center",
                                backgroundColor: student.status === "Accepted" ? "#E8F5E9" : student.status === "Rejected" ? "#FFEBEE" : "#EEEEEE",
                            }}
                        >
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: student.status === "Accepted" ? "#2E7D32" : student.status === "Rejected" ? "#D32F2F" : "#616161" }}>
                                {student.status}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Card>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1400px", margin: "0 auto", fontFamily:"Inter" }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1,}}>
                <Button
                    startIcon={<ArrowLeft />}
                    onClick={() => router.get(backPath)}
                    sx={{
                        textTransform: 'none',
                        color: '#493979',
                        minWidth: 'auto',
                        p: 0,
                        mr: 1
                    }}
                >
                    {isAdmin ? "Back to Requests" : "Back to Dashboard"}
                </Button>
            </Box>

            <Typography variant="h4" sx={{ color:"#493979", fontWeight:"700",fontFamily: "Poppins", my: 2 }}>
                Chair Requests
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 380px' }, gap: 3, alignItems: 'start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, gridOrder: { xs: 1, md: 1 } }}>
                    <Card sx={{ p: 2, borderRadius: 2, backgroundColor: "#F4F0FA", boxShadow: "0px 4px 12px rgba(0,0,0,0.08)", border: "1px solid #493979" }}>
                        <Typography variant="subtitle1" sx={{ fontSize: 12, fontWeight: "400" }}>
                            {assignment?.room ? `${assignment.room} Room` : "No Room Selected"}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight:"600", color:"#493979", mb: 1 }}>
                            {assignment?.section ? `${assignment.section.toUpperCase()} SECTION` : "N/A"}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <TodayIcon sx={{ fontSize: 18, color: "#6b5ca5" }} />
                                <Typography variant="body2">
                                    Date: {assignment?.date ? dayjs(assignment.date).format('MMMM D, YYYY') : "N/A"}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 18, color: "#6b5ca5" }} />
                                <Typography variant="body2">
                                    Shift: {assignment?.shift || "N/A"}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2, opacity: 1 }} />

                        <Box sx={{ mt: 2, mx: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: "700", color: status.text }}>
                                    {status.label}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "700", color: status.text }}>
                                    {availableSeats} / {totalSeats} Seats
                                </Typography>
                            </Box>

                            <LinearProgress variant="determinate" value={progressValue}
                                            sx={{
                                                height: 12, borderRadius: 5, backgroundColor: status.bg,
                                                '& .MuiLinearProgress-bar': { backgroundColor: status.bar, borderRadius: 5 }
                                            }}
                            />
                        </Box>
                    </Card>

                    {!isDesktop && (
                        <Box>
                            <Typography variant="h6" sx={{ color:"#493979", fontWeight: "700", fontFamily:"Poppins", mb: 1.5 }}>
                                Chair Manager
                            </Typography>
                            <ChairFilterPanel
                                paginatedChairs={paginatedChairs}
                                selectedChair={selectedChair}
                                setSelectedChair={setSelectedChair}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </Box>
                    )}

                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="h6" sx={{ color:"#493979", fontWeight:"700", fontFamily:"Poppins", m: 0 }}>
                                {selectedChair ? `Requests for Chair ${selectedChair}` : "Student List"}
                            </Typography>
                            <Typography variant="body2" sx={{fontWeight:"600", color: "#493979"}}>
                                Total: {filteredRequestList.length}
                            </Typography>
                        </Box>

                        <Box>
                            {filteredRequestList.length > 0 ? (
                                filteredRequestList.map((student) => <StudentCard key={student.id} student={student} />)
                            ) : (
                                <Typography variant="body2" sx={{ textAlign: 'center',  py: 4, backgroundColor: 'white', borderRadius: 2, border: '1px dashed #E0E0E0', color: "black" }}>
                                    No ongoing student requests found for this chair.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>

                {isDesktop && (
                    <Box sx={{ position: 'sticky', top: '24px' }}>
                        <Typography variant="h6" sx={{ color:"#493979", fontWeight:"700", fontFamily:"Poppins", mb: 1.5 }}>
                            Chair Manager
                        </Typography>
                        <ChairFilterPanel
                            paginatedChairs={paginatedChairs}
                            selectedChair={selectedChair}
                            setSelectedChair={setSelectedChair}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            isDesktop={isDesktop}
                        />
                    </Box>
                )}
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirm {actionType === "accept" ? "Acceptance" : "Rejection"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to <strong>{actionType === "accept" ? "accept" : "reject"}</strong> this request? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmAction} color={actionType === "accept" ? "success" : "error"} variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

const ChairFilterPanel = ({ paginatedChairs, selectedChair, setSelectedChair, totalPages, currentPage, setCurrentPage, isDesktop = false }: any) => (
    <Card sx={{ p: 2, borderRadius: 2, border: "1px solid #C0B1E5", boxShadow: "0px 2px 8px rgba(0,0,0,0.04)", backgroundColor: "#FFFFFF" }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, minHeight: '24px' }}>
            {!selectedChair ? (
                <Typography variant="body2" sx={{fontWeight:"600", color:"text.secondary"}}>
                    Select a chair to filter requests
                </Typography>
            ) : (
                <Typography variant="body2" sx={{fontWeight:"700", color:"#493979"}}>
                    Filtering by Chair {selectedChair}
                </Typography>
            )}
            {selectedChair && (
                <Button variant="text" size="small" onClick={() => setSelectedChair(null)} sx={{ textTransform: 'none', color: '#493979', fontWeight: 600, p: 0, minWidth: 'auto' }}>
                    Clear Filter
                </Button>
            )}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(105px, 1fr))', gap: 1.25, py: 0.5 }}>
            {paginatedChairs.map(({ chairNum, totalRequestsCount, isAccepted }: any) => {
                const isSelected = selectedChair === chairNum;
                let badgeBg = "#E0E0E0", labelText = "Empty", fontColor = "#616161";

                if (isAccepted) {
 badgeBg = "#E6F4EA"; fontColor = "#1F7E34"; labelText = `Reserved`;
} else if (totalRequestsCount > 0) {
 badgeBg = "#FFF5CC"; fontColor = "#B16B02"; labelText = `${totalRequestsCount} Request/s`;
}

                return (
                    <Box key={chairNum} onClick={() => setSelectedChair(isSelected ? null : chairNum)}
                         sx={{
                             p: 1.25, borderRadius: 2, border: isSelected ? "2px solid #493979" : "1px solid #E0E0E0",
                             backgroundColor: isSelected ? "#F4F0FA" : "#FFFFFF", textAlign: 'center', cursor: 'pointer',
                             display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5,
                             transition: 'all 0.15s ease-in-out', '&:hover': { borderColor: '#493979', boxShadow: "0px 2px 6px rgba(0,0,0,0.05)" }
                         }}
                    >
                        <Typography sx={{ color: '#1A1A1A', fontSize: 13, fontFamily: "Poppins", fontWeight: 600 }}>
                            Chair {chairNum}
                        </Typography>
                        <Box sx={{ backgroundColor: badgeBg, borderRadius: '4px', width: '100%', py: 0.25 }}>
                            <Typography sx={{ fontSize: 9, fontWeight: 800, color: fontColor, whiteSpace: 'nowrap' }}>{labelText}</Typography>
                        </Box>
                    </Box>
                );
            })}
        </Box>
        {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2.5 }}>
                <Button size="small" variant="outlined" disabled={currentPage === 1} onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))} sx={{ minWidth: 'auto', p: 0.5, color: '#493979', borderColor: '#D1C7ED' }}>
                    <NavigateBeforeIcon fontSize="small" />
                </Button>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#493979' }}>{currentPage} of {totalPages}</Typography>
                <Button size="small" variant="outlined" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))} sx={{ minWidth: 'auto', p: 0.5, color: '#493979', borderColor: '#D1C7ED' }}>
                    <NavigateNextIcon fontSize="small" />
                </Button>
            </Box>
        )}
    </Card>
);
