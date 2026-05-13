import {Box, Typography, Button, Card, LinearProgress, Divider, Avatar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useLocation, useNavigate} from "react-router-dom";
import TodayIcon from "@mui/icons-material/Today";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { supabase } from "../../../utils/supabase.ts";
import { useEffect, useState } from "react";

const ManageRequests = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const assignment = location.state?.assignment;

    // Fetch the Max Capacity (Total Seats)
    const [totalSeats, setTotalSeats] = useState(0);
    useEffect(() => {
        const fetchSection = async () => {
            if (!assignment?.section_id) return;

            const { data, error } = await supabase
                .from("sections")
                .select("chair_count")
                .eq("section_id", assignment.section_id)
                .single();

            if (error) {
                console.error("Error fetching section:", error);
                return;
            }

            setTotalSeats(data?.chair_count || 0);
        };

        fetchSection();
    }, [assignment]);

    // Fetch the Count of Students assigned to this section/shift/date
    const [requestCount, setRequestCount] = useState(0);
    useEffect(() => {
        const fetchRequestCount = async () => {
            if (!assignment?.section_id || !assignment?.date || !assignment?.shift) {
                console.warn("One or more filter values are missing. Skipping fetch.");
                return;
            }

            const { count, error } = await supabase
                .from("dental_chairs_request_assignment")
                .select("*", { count: 'exact', head: true })
                .eq("section_id", Number(assignment.section_id))
                .eq("date", assignment.date)
                .eq("shift", assignment.shift);

            if (error) {
                console.error("Supabase Error:", error.message);
                return;
            }

            console.log("Count received from Supabase:", count);
            setRequestCount(count || 0);
        };

        fetchRequestCount();
    }, [assignment]);

    const getProgressStyles = (available, total) => {
        const ratio = available / total;

        if (ratio === 0) {
            return { bg: "#FFEBEE", bar: "#D32F2F", text: "#B71C1C", label: "Full Capacity" };
        }

        // Danger: 20% or less seats left
        if (ratio <= 0.2) {
            return { bg: "#FFEBEE", bar: "#D32F2F", text: "#B71C1C", label: "Almost Full Capacity" };
        }
        // Warning: 50% or less seats left
        if (ratio <= 0.5) {
            return { bg: "#FFF3E0", bar: "#ED6C02", text: "#E65100", label: "Limited Capacity" };
        }
        // Success: More than 50% seats left
        return { bg: "#E8F5E9", bar: "#2E7D32", text: "#1B5E20", label: "Open Capacity" };
    };

    const availableSeats = 13;
    const progressValue = totalSeats > 0 ? (availableSeats / totalSeats) * 100 : 0;
    const status = getProgressStyles(availableSeats, totalSeats);

    const [requestList, setRequestList] = useState<any[]>([]);
    useEffect(() => {
        const fetchStudents = async () => {
            if (!assignment?.section_id || !assignment?.date || !assignment?.shift) {
                console.warn("Missing assignment filters");
                return;
            }

            const { data, error } = await supabase
                .from("dental_chairs_request_assignment")
                .select(`
                    request_id,
                    student_id,
                    assistant_id,
                    section_id,
                    date,
                    shift,
                    req_timestamp,
                    status,
            
                    student:student_id (
                        profile_id,
                        first_name,
                        last_name,
                        pfp,
            
                        clinician (
                            clinician_id,
                            group_id,
                            student_groups (
                                group_name
                            )
                        )
                    ),
            
                    assistant:assistant_id (
                        profile_id,
                        first_name,
                        last_name
                    )
                `)
                .eq("section_id", assignment.section_id)
                .eq("date", assignment.date)
                .eq("shift", assignment.shift)
                .order("req_timestamp", { ascending: true });

            if (error) {
                console.error("Error fetching students:", error);
                return;
            }

            console.log("RAW STUDENTS:", data);

            const formatted = (data || []).map((item: any) => ({
                id: item.request_id,

                first_name: item.student?.first_name,
                last_name: item.student?.last_name,
                pfp: item.student?.pfp,

                student_group: item.student?.clinician?.student_groups?.group_name || "No Group",

                assistant_first_name: item.assistant?.first_name,
                assistant_last_name: item.assistant?.last_name,

                created_at: item.req_timestamp,
                status: item.status
            }));

            setRequestList(formatted);
        };

        fetchStudents();
    }, [assignment]);

    const StudentCard = ({ student }: any) => {
        return (
            <Card
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
                    border: "1px solid #E0E0E0",
                }}
            >
                {/* LEFT SIDE: PFP */}
                <Avatar
                    src={student.pfp}
                    sx={{ width: 56, height: 56 }}
                >
                    {student.first_name?.[0]}{student.last_name?.[0]}
                </Avatar>

                {/* RIGHT SIDE: INFO SECTION + BUTTONS */}
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>

                    {/* INFO SECTION */}
                    <Box>
                        <Typography fontWeight={700} variant="subtitle1" sx={{ fontSize: 18 }}>
                            {student.last_name}, {student.first_name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Student Group: {student.student_group}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Assistant: {student.assistant_first_name
                            ? `${student.assistant_last_name}, ${student.assistant_first_name}`
                            : "None"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            Request Time:{" "}
                            {student.created_at
                                ? (() => {
                                    const d = new Date(student.created_at);

                                    const year = d.getFullYear();
                                    const month = String(d.getMonth() + 1).padStart(2, "0");
                                    const day = String(d.getDate()).padStart(2, "0");

                                    let hours = d.getHours();
                                    const minutes = String(d.getMinutes()).padStart(2, "0");

                                    const ampm = hours >= 12 ? "PM" : "AM";
                                    hours = hours % 12;
                                    hours = hours ? hours : 12;

                                    const formattedTime = `${hours}:${minutes} ${ampm}`;

                                    return `${year}-${month}-${day}, ${formattedTime}`;
                                })()
                                : "N/A"}
                        </Typography>
                    </Box>

                    {/* BUTTONS SECTION (Side by side) */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            sx={{ textTransform: "none", backgroundColor: "#EF4444",  color: "#fff" }}
                        >
                            Reject
                        </Button>

                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            sx={{ textTransform: "none", backgroundColor: "#7C3AED" }}
                        >
                            Accept
                        </Button>
                    </Box>
                </Box>
            </Card>
        );
    };

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
                Requests
            </Typography>

            <Card
                sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#F4F0FA",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #493979",
                }}
            >
                <Typography variant="subtitle1" fontWeight="400" sx={{ fontSize: 12 }}>
                    {assignment?.room + " Room" || "No Room Selected"}
                </Typography>

                {/* Section */}
                <Typography variant="h5" fontWeight="600" color="#493979" sx={{ mb: 1 }}>
                    {assignment?.section.toUpperCase() + " SECTION" || "N/A"}
                </Typography>

                {/* Date + Shift row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TodayIcon sx={{ fontSize: 18, color: "#6b5ca5" }} />
                        <Typography variant="body2">
                            Date: {assignment?.date || "N/A"}
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

                {/* Progress Bar Section */}
                <Box sx={{ mt: 2, mx: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="700" sx={{ color: status.text }}>
                            {status.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="700" sx={{ color: status.text }}>
                            {availableSeats} / {totalSeats} Seats
                        </Typography>
                    </Box>

                    <LinearProgress variant="determinate" value={progressValue}
                                    sx={{
                                        height: 12,
                                        borderRadius: 5,
                                        backgroundColor: status.bg,
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: status.bar,
                                            borderRadius: 5,
                                        }
                                    }}
                    />
                </Box>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1}}>
                <Typography variant="h6" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ m: 0 }}>
                    Student List
                </Typography>

                <Typography variant="body2" fontWeight="400" color="#493979">
                    Total: {requestCount}
                </Typography>
            </Box>

            <Box>
                {requestList?.map((student) => (
                    <StudentCard key={student.id} student={student} />
                ))}
            </Box>

        </Box>
    );
};

export default ManageRequests;