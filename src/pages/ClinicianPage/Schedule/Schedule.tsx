import "../Request/RequestSchedule.css"
import { Outlet, useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; 
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Snackbar, Alert, CircularProgress} from "@mui/material";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { supabase } from "../../../utils/supabase";
import dayjs from "dayjs";

type Schedule = {
    request_id: number;
    date: string;
    shift: string;
    status: string;
    student_id: string;
    assistant_id: string | null;
    sections?: {
        section_name: string;
        rooms?: {
            room_name: string;
        };
    };
};

type AssistantProfile = {
    profile_id: string;
    first_name: string;
    last_name: string;
};

const ITEM_HEIGHT = 48;

const Schedule = () => { 
    const navigate = useNavigate();
    const [schedFilter, setSchedFilter] = useState("Current");
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [assistantModalOpen, setAssistantModalOpen] = useState(false);
    const [assistantModalMode, setAssistantModalMode] = useState<"add" | "edit">("add");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");
    const [cancelReason, setCancelReason] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [currentAssistant, setCurrentAssistant] = useState<AssistantProfile | null>(null);
    const [studentName, setStudentName] = useState("");
    const open = Boolean(anchorEl);

    useEffect(() => {
        const fetchStudentName = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("first_name, last_name")
                    .eq("profile_id", user.id)
                    .single();
                
                if (profile) {
                    setStudentName(`${profile.first_name} ${profile.last_name}`);
                }
            }
        };
        
        fetchStudentName();
    }, []);

    useEffect(() => {
        const fetchSchedules = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData.user) {
                console.error("User not found");
                setLoading(false);
                return;
            }

            const userId = userData.user.id;

            const { data, error } = await supabase
                .from('dental_chairs_request_assignment')
                .select(`
                    request_id,
                    date,
                    shift,
                    status,
                    student_id,
                    assistant_id,
                    sections (
                        section_name,
                        rooms (
                            room_name
                        )
                    )
                `)
            .eq("student_id", userId)
            .eq("status", "Accepted")
            .order("date", { ascending: true }) 
            .order("shift", { ascending: true });

            console.log("Fetched Data:", data);
            console.log("Error:", error);

            if (error) {
                console.error(error);
            } else {
                console.log("Fetched Data:", data); 
                setSchedules(data || []);
            }

            setLoading(false); 
        };

        fetchSchedules();
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, schedule: Schedule) => {
        setAnchorEl(event.currentTarget);
        setSelectedSchedule(schedule);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        if (!assistantModalOpen && !cancelModalOpen) {
            setSelectedSchedule(null);
        }
    };

    const openAddAssistantModal = async (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setAssistantModalMode("add");
        setFirstName("");
        setLastName("");
        setCurrentAssistant(null);
        setAssistantModalOpen(true);
    };

    const openEditAssistantModal = async (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setAssistantModalMode("edit");
        
        if (schedule.assistant_id) {
            const { data: assistantProfile } = await supabase
                .from("profiles")
                .select("profile_id, first_name, last_name")
                .eq("profile_id", schedule.assistant_id)
                .single();
            
            if (assistantProfile) {
                setCurrentAssistant(assistantProfile);
                setFirstName(assistantProfile.first_name);
                setLastName(assistantProfile.last_name);
            } else {
                setCurrentAssistant(null);
                setFirstName("");
                setLastName("");
            }
        } else {
            setCurrentAssistant(null);
            setFirstName("");
            setLastName("");
        }
        
        setAssistantModalOpen(true);
    };

    const closeAssistantModal = () => {
        setAssistantModalOpen(false);
        setSelectedSchedule(null);
        setFirstName("");
        setLastName("");
        setCurrentAssistant(null);
    };

    const openCancelModal = () => {
        setAnchorEl(null);
        setCancelReason("");
        setCancelModalOpen(true);
    };

    const closeCancelModal = () => {
        setCancelModalOpen(false);
        setSelectedSchedule(null);
        setCancelReason("");
    };

    const findAssistantProfile = async (firstName: string, lastName: string): Promise<AssistantProfile | null> => {
        const { data, error } = await supabase
            .from("profiles")
            .select("profile_id, first_name, last_name")
            .ilike("first_name", firstName.trim())
            .ilike("last_name", lastName.trim())
            .eq("role_id", 3)
            .single();

        if (error || !data) {
            return null;
        }

        return data;
    };

    const handleAddAssistant = async () => {
        if (!selectedSchedule) {
            console.log("No selected schedule");
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            setSnackbarMessage("Please provide both first name and last name.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const assistantProfile = await findAssistantProfile(firstName.trim(), lastName.trim());

        if (!assistantProfile) {
            setSnackbarMessage("The name you entered is not in the clinician list.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            const { error } = await supabase
                .from('dental_chairs_request_assignment')
                .update({ assistant_id: assistantProfile.profile_id })
                .eq("student_id", selectedSchedule.student_id)
                .eq("date", selectedSchedule.date)
                .eq("shift", selectedSchedule.shift)
                .eq("status", "Accepted");

            if (error) {
                console.error("Error adding assistant:", error);
                setSnackbarMessage("Failed to add assistant. Please try again.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage("Assistant added successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);

                await refreshSchedules();
                closeAssistantModal();
            }
        } catch (error) {
            console.error("Error:", error);
            setSnackbarMessage("An error occurred. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleEditAssistant = async () => {
        if (!selectedSchedule) {
            console.log("No selected schedule");
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            setSnackbarMessage("Please provide both first name and last name.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const assistantProfile = await findAssistantProfile(firstName.trim(), lastName.trim());

        if (!assistantProfile) {
            setSnackbarMessage("The name you entered is not in the clinician list.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (currentAssistant && assistantProfile.profile_id === currentAssistant.profile_id) {
            setSnackbarMessage("This is your current assistant.");
            setSnackbarSeverity("info");
            setSnackbarOpen(true);
            return;
        }

        try {
            const { error } = await supabase
                .from('dental_chairs_request_assignment')
                .update({ assistant_id: assistantProfile.profile_id })
                .eq("student_id", selectedSchedule.student_id)
                .eq("date", selectedSchedule.date)
                .eq("shift", selectedSchedule.shift)
                .eq("status", "Accepted");

            if (error) {
                console.error("Error editing assistant:", error);
                setSnackbarMessage("Failed to edit assistant. Please try again.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage("Assistant edited successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);

                await refreshSchedules();
                closeAssistantModal();
            }
        } catch (error) {
            console.error("Error:", error);
            setSnackbarMessage("An error occurred. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleCancelSchedule = async () => {
        if (!selectedSchedule) {
            console.log("No selected schedule");
            return;
        }

        if (!cancelReason.trim()) {
            setSnackbarMessage("Please provide a reason for cancellation.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        console.log("Attempting to cancel schedule:", selectedSchedule);
        console.log("With reason:", cancelReason);

        try {
            const { error } = await supabase
                .from('dental_chairs_request_assignment')
                .update({ status: "Cancelled" })
                .eq("student_id", selectedSchedule.student_id)
                .eq("date", selectedSchedule.date)
                .eq("shift", selectedSchedule.shift)
                .eq("status", "Accepted");
            
            if (error) {
                console.error("Error cancelling schedule:", error);
                setSnackbarMessage("Failed to cancel schedule. Please try again.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage("Schedule cancelled successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);

                const formattedDate = dayjs(selectedSchedule.date).format("MMMM D, YYYY");
                const sectionName = selectedSchedule.sections?.section_name || "Unknown Section";

                const { data: chairManagerAssignment, error: chairManagerError } = await supabase
                    .from("chair_manager_assignment")
                    .select("student_id")
                    .eq("date", selectedSchedule.date)
                    .single();

                if (chairManagerError) {
                    console.error("Error finding chair manager for this date:", chairManagerError);
                } else if (chairManagerAssignment) {
                    const { error: notifError } = await supabase
                        .from("notifications")
                        .insert({
                            user_id: chairManagerAssignment.student_id,
                            type: "cancellation",
                            title: "[CM] Schedule Cancellation",
                            message: `${studentName || "A student"} has cancelled their schedule for ${sectionName} - ${selectedSchedule.shift} shift on ${formattedDate}. Reason for cancellation: ${cancelReason}.`,
                            is_read: false,
                        });

                    if (notifError) {
                        console.error("Error sending notification:", notifError);
                    } else {
                        console.log("Cancellation notification sent to chair manager successfully");
                    }
                }

                await refreshSchedules();
            }
        } catch (error) {
            console.error("Error:", error);
            setSnackbarMessage("An error occurred. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
        closeCancelModal();
    };

    const refreshSchedules = async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
            const { data: updatedData } = await supabase
                .from('dental_chairs_request_assignment')
                .select(`
                    request_id,
                    date,
                    shift,
                    status,
                    student_id,
                    assistant_id,
                    sections (
                        section_name,
                        rooms (
                            room_name
                        )
                    )
                `)
                .eq("student_id", userData.user.id)
                .eq("status", "Accepted")
                .order("date", { ascending: true })
                .order("shift", { ascending: true });
            
            setSchedules(updatedData || []);
        }
    };

    const [assistantNames, setAssistantNames] = useState<Record<string, string>>({});
    
    useEffect(() => {
        const fetchAllAssistantNames = async () => {
            const names: Record<string, string> = {};
            for (const schedule of schedules) {
                if (schedule.assistant_id && !names[schedule.assistant_id]) {
                    const { data } = await supabase
                        .from("profiles")
                        .select("first_name, last_name")
                        .eq("profile_id", schedule.assistant_id)
                        .single();
                    
                    if (data) {
                        names[schedule.assistant_id] = `${data.last_name}, ${data.first_name}`;
                    }
                }
            }
            setAssistantNames(names);
        };
        
        if (schedules.length > 0) {
            fetchAllAssistantNames();
        }
    }, [schedules]);

    const filteredSchedules = schedules.filter((item) => {
        // Get current Date in PH (Asia/Manila)
        const now = new Date();
        const phTime = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Manila",
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit"
        }).formatToParts(now);

        const phDateStr = `${phTime.find(p => p.type === 'year')?.value}-${phTime.find(p => p.type === 'month')?.value}-${phTime.find(p => p.type === 'day')?.value}`;
        const phHour = parseInt(phTime.find(p => p.type === 'hour')?.value || "0");
        const phShift = phHour < 12 ? "AM" : "PM";

        if (schedFilter === "Current") {
            return item.date === phDateStr && item.shift === phShift;
        } 
        
        if (schedFilter === "Upcoming") {
            if (item.date > phDateStr) return true;
            if (item.date === phDateStr && phShift === "AM" && item.shift === "PM") return true;
            return false;
        }

        if (schedFilter === "History") {
            if (item.date < phDateStr) return true;
            if (item.date === phDateStr && phShift === "PM" && item.shift === "AM") return true;
            return false;
        }

        return false;
    })
    .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (schedFilter === "History") {
            if (dateA !== dateB) return dateB - dateA;
            return b.shift.localeCompare(a.shift); 
        } else {
            if (dateA !== dateB) return dateA - dateB;
            return a.shift.localeCompare(b.shift);
        }
    });

    if (loading) {
        return (
            // Use a flex column layout for the whole page
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar />
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexGrow: 1
                }}>
                    <CircularProgress />
                </div>
            </div>
        );
    }
    
    return (
        <div className="request-sched-container"> 
            <Navbar /> 
            <div className="request-body"> 
                <ul className="request-filter"> 
                    <li className={schedFilter === "Current" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("Current")}>Current</li> 
                    <li className={schedFilter === "Upcoming" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("Upcoming")}>Upcoming</li> 
                    <li className={schedFilter === "History" ? "filter-item active" : "filter-item"} onClick={() => setSchedFilter("History")}>History</li> 
                </ul> 
                <Outlet />
            </div> 

            <div className="schedules-list">
                {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((item) => {
                        const dateObj = new Date(item.date);
                        return (
                            <div key={item.request_id} className="sched-display-container" style={{ position: 'relative' }}>
                                {/* Kebab menu for Upcoming filter only */}
                                {schedFilter === "Upcoming" && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <IconButton
                                            aria-label="more"
                                            onClick={(e) => handleMenuClick(e, item)}
                                            size="small"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </div>
                                )}

                                <div className="date-container">
                                    <p style={{ fontSize: "38px", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>
                                        {dateObj.getUTCDate()}
                                    </p>
                                    <p style={{ fontSize: "20px", fontFamily: "Poppins, sans-serif" }}>
                                        {dateObj.toLocaleString("default", { month: "short", timeZone: "UTC" })}
                                    </p>
                                    <p className="shift-display" style={{ fontFamily: "Poppins, sans-serif" }}>
                                        {item.shift}
                                    </p>
                                </div>
                                
                                <div className="room-section-display-container">
                                    <p style={{ fontSize: "23px", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>
                                        {item.sections?.rooms?.room_name || "No Room"}
                                    </p>
                                    <p style={{ fontSize: "15px", fontFamily: "Poppins, sans-serif" }}>
                                        Section: {item.sections?.section_name || "No Section"}
                                    </p>

                                    {/* Display Assistant if exists */}
                                    {item.assistant_id && assistantNames[item.assistant_id] && (
                                        <p style={{ fontSize: "14px", fontFamily: "Poppins, sans-serif",color: "#493979" }}>
                                            Assistant: {assistantNames[item.assistant_id]}
                                        </p>
                                    )}

                                    {/* Add/Edit Assistant button for Current & Upcoming filters only */}
                                    {(schedFilter === "Current" || schedFilter === "Upcoming") && (
                                        <button 
                                            onClick={() => item.assistant_id ? openEditAssistantModal(item) : openAddAssistantModal(item)}
                                            style={{
                                                marginTop: "5px",
                                                padding: "7px 0",
                                                width: "100%",
                                                backgroundColor: "#493979",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px"
                                            }}
                                        >
                                            {item.assistant_id ? "Edit Assistant" : "Add Assistant"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: "center", marginTop: "50px", color: "gray" }}>
                        No {schedFilter.toLowerCase()} schedules found.
                    </div>
                )}
            </div>

            {/* Kebab Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '20ch',
                        },
                    },
                    list: {
                        'aria-labelledby': 'long-button',
                    },
                }}
            >
                <MenuItem onClick={openCancelModal} sx={{fontFamily: "Poppins, sans-serif"}}>
                    Cancel Schedule
                </MenuItem>
            </Menu>

            {/* Add/Edit Assistant Modal */}
            {assistantModalOpen && (
                <div className="submit-modal">
                    <div className="submit-modal-overlay" onClick={closeAssistantModal}></div>
                    <div className="submit-modal-content">
                        <h2 style={{fontWeight: 650, fontSize: "23px", fontFamily: "Poppins, sans-serif"}}>
                            {assistantModalMode === "add" ? "Add Assistant" : "Edit Assistant"}
                        </h2>
                        <p style={{fontSize: "17px"}}>
                            {assistantModalMode === "add" 
                                ? "Please provide the name of your assistant." 
                                : "Please provide the name of your new assistant."}
                        </p>

                        <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                                variant="outlined"
                                sx={{
                                    "& label.Mui-focused": {
                                        color: "#382d5f",
                                    },
                                    "& .MuiInputBase-root": {
                                        fontFamily: "Poppins, sans-serif",
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#382d5f",
                                        }
                                    }
                                }}  
                            />
                        </Box>

                        <Box sx={{ width: '100%', mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                                variant="outlined"
                                sx={{
                                    "& label.Mui-focused": {
                                        color: "#382d5f",
                                    },
                                    "& .MuiInputBase-root": {
                                        fontFamily: "Poppins, sans-serif",
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#382d5f",
                                        }
                                    }
                                }}  
                            />
                        </Box>

                        <div className="submit-modal-btn">
                            <button className="go-back-btn" onClick={closeAssistantModal}>
                                Go Back
                            </button>
                            <button className="submit-btn" onClick={assistantModalMode === "add" ? handleAddAssistant : handleEditAssistant}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Schedule Confirmation Modal */}
            {cancelModalOpen && (
                <div className="submit-modal">
                    <div className="submit-modal-overlay" onClick={closeCancelModal}></div>
                    <div className="submit-modal-content">
                        <h2 style={{fontWeight: 650, fontSize: "23px", fontFamily: "Poppins, sans-serif"}}>
                            Cancel Schedule?
                        </h2>
                        <p style={{fontSize: "17px"}}>
                            Please provide a reason for cancellation.
                        </p>

                        <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Reason for cancellation"
                                id="cancel-reason"
                                multiline
                                rows={3}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="e.g., Sick, Emergency, Schedule conflict, etc."
                                variant="outlined"
                                sx={{
                                    "& label.Mui-focused": {
                                    color: "#382d5f",
                                    },
                                    "& .MuiInputBase-root": {
                                        fontFamily: "Poppins, sans-serif",
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#382d5f",
                                        }
                                    }
                                }}  
                            />
                        </Box>

                        <div className="submit-modal-btn">
                            <button className="go-back-btn" onClick={closeCancelModal}>
                                Go Back
                            </button>
                            <button className="submit-btn" onClick={handleCancelSchedule}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbars for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                sx={{ mt: 2 }}
            >
                <Alert severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {!assistantModalOpen && !cancelModalOpen && (
                <div>
                    <button className="add-btn"  onClick={() => navigate("/requestForm")}>+</button>
                </div>
            )}
        </div> 
    );
}; 

export default Schedule;