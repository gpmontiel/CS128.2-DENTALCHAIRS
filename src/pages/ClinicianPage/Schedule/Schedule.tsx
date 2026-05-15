import "../Request/RequestSchedule.css"
import { Outlet, useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; 
import { supabase } from "../../../utils/supabase";

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

const Schedule = () => { 
    const navigate = useNavigate();
    const [schedFilter, setSchedFilter] = useState("Current");
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
            <div>
                <Navbar />
                <div style={{ paddingTop: "20px", textAlign: "center" }}>
                    <p>Loading...</p>
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
                            <div key={item.assignment_id} className="sched-display-container">
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
                                    <p style={{ fontSize: "25px", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>
                                        {item.sections?.rooms?.room_name || "No Room"}
                                    </p>
                                    <p style={{ fontSize: "18px", fontFamily: "Poppins, sans-serif" }}>
                                        Section: {item.sections?.section_name || "No Section"}
                                    </p>
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

            <div>
                <button className="add-btn"  onClick={() => navigate("/requestForm")}>+</button>
            </div>
        </div> 
    );
}; 

export default Schedule;