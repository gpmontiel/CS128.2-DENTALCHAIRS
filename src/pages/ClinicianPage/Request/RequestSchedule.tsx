import "./RequestSchedule.css"; 
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import {CircularProgress} from "@mui/material";

type Schedule = {
    assignment_id: number;
    date: string;
    shift: string;
    status: string;
    student_id: string;
    sections?: {
        section_name: string;
        rooms?: {
            room_name: string;
        };
    };
};

const RequestSchedule = () => {
    const navigate = useNavigate();
    const [schedFilter, setSchedFilter] = useState("Pending");
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

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
                sections (
                    section_name,
                    rooms (
                        room_name
                    )
                )
            `)
                .eq("student_id", userId)
                .order("date", { ascending: false })
                .order("shift", { ascending: true });

            if (error) {
                console.error(error);
            } else {
                console.log("Fetched Data:", data);
                // 2. CRITICAL: Cast data as any[] to appease the nested array type mismatch
                setSchedules((data as any[]) || []);
            }

            setLoading(false);
        };

        fetchSchedules();
    }, []);

    const filteredSchedules = schedules
        .filter((item) => item.status === schedFilter)
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (dateA !== dateB) return dateB - dateA;
            return a.shift.localeCompare(b.shift);
        });

    if (loading) {
        return (
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
                    <li 
                        className={schedFilter === "Pending" ? "filter-item active" : "filter-item"} 
                        onClick={() => setSchedFilter("Pending")}
                    >
                        Pending
                    </li> 
                    <li 
                        className={schedFilter === "Rejected" ? "filter-item active" : "filter-item"} 
                        onClick={() => setSchedFilter("Rejected")}
                    >
                        Rejected
                    </li> 
                </ul> 

                <Outlet />
            </div> 

            {/* DISPLAY SCHEDULES */}
            <div className="schedules-list-container">
                {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((item) => {
                        const dateObj = new Date(item.date);

                        return (
                            <div key={item.assignment_id} className="sched-display-container">
                                <div className="date-container">
                                    <p style={{ fontSize: "38px", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>
                                        {dateObj.getDate()}
                                    </p>
                                    <p style={{ fontSize: "20px", fontFamily: "Poppins, sans-serif" }}>
                                        {dateObj.toLocaleString("default", { month: "short" })}
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
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ 
                        textAlign: "center", 
                        marginTop: "50px", 
                        color: "#888", 
                        fontFamily: "Poppins, sans-serif" 
                    }}>
                        <p>No {schedFilter.toLowerCase()} requests found.</p>
                    </div>
                )}
            </div>

            <div>
                <button className="add-btn" onClick={() => navigate("/requestForm")}>
                    +
                </button>
            </div>
        </div> 
    );
};

export default RequestSchedule;