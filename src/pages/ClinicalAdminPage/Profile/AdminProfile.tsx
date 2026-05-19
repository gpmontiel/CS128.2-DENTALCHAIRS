import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import ResponsiveAppBar from "../../ChairManagerPage/components/ChairManagerNavbar";
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Button, Snackbar, Alert } from "@mui/material";
import profileImage from "../../../assets/profile-icon-blank.png";
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from "react"
import { supabase } from "../../../utils/supabase";

const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return isDesktop;
};

const AdminProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const location = useLocation();
    const fromChairManager = location.state?.fromChairManager || false;

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");
    const [successOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            if (!userId) {
                console.error("No user session found");
                setSnackbarMessage("You must be logged in to view this page");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select(`
                first_name,
                last_name,
                sex,
                pfp,
                clinician (
                    student_number,
                    year_level,
                    student_groups (group_name)
                )
                `)
                .eq("profile_id", userId)
                .single();

            console.log("Fetched Data:", data);
            console.log("Error:", error);

            if (error) {
                console.error(error);
                setSnackbarMessage("Failed to load profile data");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } else {
                console.log("Fetched Data:", data);
                setProfile(data || []);
            }

            setLoading(false);
        }

        fetchProfile();
    }, []);

    const formatSex = (sex: string) => {
        if (sex === "F") return "Female";
        if (sex === "M") return "Male";
        return sex;
    };

    if (loading) {
        return (
            <div>
                {fromChairManager ? <ResponsiveAppBar /> : <AdminNavbar />}
                <div style={{ paddingTop: "20px", textAlign: "center" }}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {fromChairManager ? <ResponsiveAppBar /> : <AdminNavbar />}
            <div style={{
                maxWidth: isDesktop ? "750px" : "100%",
                margin: isDesktop ? "50px auto" : "0",
                background: "white",
                borderRadius: isDesktop ? "16px" : "0",
                boxShadow: isDesktop ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
                padding: "20px 0",
            }}>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        padding: "0 20px",
                    }}
                >
                    <p
                        style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 500,
                            fontSize: "23px",
                            color: "#382d5f",
                            margin: 0,
                        }}
                    >
                        Profile
                    </p>

                    {isDesktop && (
                        <button
                            className="confirm-btn"
                            onClick={() => navigate("/edit-profile", { state: { fromChairManager } })}
                            style={{
                                position: "absolute",
                                right: 20,
                                padding: "8px 8px",
                                fontWeight: "bold",
                                width: "45px",
                            }}
                        >
                            <EditIcon/>
                        </button>
                    )}
                </div>
                <div style={{
                    display: "flex",
                    paddingTop: 15,
                    flexDirection: isDesktop ? "row" : "column",
                    alignItems: "center",
                    gap: isDesktop ? "24px" : "0",
                    justifyContent: "center",
                    paddingLeft: isDesktop ? "0" : "0",
                    marginBottom: isDesktop ? "24px" : "0",
                }}>
                    <img
                        src={profile?.pfp || profileImage}
                        alt="Profile Image"
                        style={{ width: "130px", height: "130px", border: "3px solid #382d5f", borderRadius: "50%", objectFit: "cover"}}
                    />
                </div>
                <p className="request-schedule-title" style={{fontFamily: "Poppins, sans-serif", textAlign: "center", paddingTop: isDesktop ? 0 : 10}}>{profile?.first_name} {profile?.last_name}</p>
                <hr style={{width: "90%", margin: "15px auto"}}></hr>

                <div style={{
                    margin: 5
                }}>

                    {/* Personal Information */}
                    <p style={{fontFamily: "Poppins, sans-serif", textAlign: "left", paddingLeft: "20px", fontWeight: "500", fontSize: "16px", color: "#4b5563"}}>Personal Information</p>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f3f4f6", padding: "8px 20px", margin: "8px 20px", borderRadius: "12px"}}>
                        <p style={{margin: 0, color: "#9ca3af"}}>First Name</p>
                        <p style={{margin: 0, color: "#2b2b2bff", fontWeight: "600"}}>{profile?.first_name}</p>
                    </div>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f3f4f6", padding: "8px 20px", margin: "8px 20px", borderRadius: "12px"}}>
                        <p style={{margin: 0, color: "#9ca3af"}}>Last Name</p>
                        <p style={{margin: 0, color: "#2b2b2bff", fontWeight: "600"}}>{profile?.last_name}</p>
                    </div>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f3f4f6", padding: "8px 20px", margin: "8px 20px", borderRadius: "12px"}}>
                        <p style={{margin: 0, color: "#9ca3af"}}>Sex</p>
                        <p style={{margin: 0, color: "#2b2b2bff", fontWeight: "600"}}>{formatSex(profile?.sex)}</p>
                    </div>

                    {!isDesktop && (
                        <div style={{
                            paddingTop: 10,
                            bottom: 20,
                            left: 0,
                            right: 0,
                            display: "flex",
                            justifyContent: "center",
                        }}>
                            <button
                                className="confirm-btn"
                                onClick={() => navigate("/admin-edit-profile", { state: { fromChairManager } })}
                                style={{
                                    width: "90%",
                                    padding: "12px 20px",
                                    fontWeight: "bold",
                                    margin: 0
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "center", gap: 7}}>
                                    <EditIcon fontSize="small"/>
                                    Edit Profile
                                </div>

                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                sx={{ mt: 2 }}
            >
                <Alert
                    severity={snackbarSeverity}
                    onClose={() => setSnackbarOpen(false)}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AdminProfile;