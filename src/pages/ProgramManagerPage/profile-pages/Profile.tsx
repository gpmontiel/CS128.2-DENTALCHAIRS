import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/ProgramManagerNavbar";
import ResponsiveAppBar from "../components/ProgramManagerNavbar";
import profileImage from "../../../assets/profile-icon-blank.png";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import "../css/ProfilePage.css";
import {CircularProgress} from "@mui/material";

const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return isDesktop;
};

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const location = useLocation();

    const fromProgramManager =
        location.state?.fromProgramManager || false;

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        "success" | "error" | "info" | "warning"
    >("success");

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            if (!userId) {
                setSnackbarMessage("You must be logged in");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("first_name, last_name, sex, pfp")
                .eq("profile_id", userId)
                .single();

            if (!error) setProfile(data);

            setLoading(false);
        };

        fetchProfile();
    }, []);

    const formatSex = (sex: string) => {
        if (sex === "F") return "Female";
        if (sex === "M") return "Male";
        return sex;
    };

    if (loading) {
        return (
            // 1. Make the outer container fill the entire screen height using Flexbox
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

                {fromProgramManager ? (
                    <ResponsiveAppBar />
                ) : (
                    <Navbar />
                )}

                {/* 2. This container will stretch to fill the rest of the screen and center the spinner */}
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
        <div>
            {fromProgramManager ? (
                <ResponsiveAppBar />
            ) : (
                <Navbar />
            )}

            <div className="pm-profile-container">
                <div className="pm-profile-header">
                    <p>Profile</p>

                    {isDesktop && (
                        <button
                            className="pm-edit-btn"
                            onClick={() =>
                                navigate(
                                    "/program-manager/profile/edit",
                                    {
                                        state: {
                                            fromProgramManager: true,
                                        },
                                    }
                                )
                            }
                        >
                            <EditIcon />
                        </button>
                    )}
                </div>

                <div className="pm-profile-img-wrapper">
                    <img
                        src={profile?.pfp || profileImage}
                        className="pm-profile-img"
                    />
                </div>

                <p className="pm-name">
                    {profile?.first_name} {profile?.last_name}
                </p>

                <hr className="pm-divider" />

                <div className="pm-info-section">
                    <p className="pm-section-title">
                        Personal Information
                    </p>

                    <div className="pm-info-row">
                        <span>First Name</span>
                        <span>{profile?.first_name}</span>
                    </div>

                    <div className="pm-info-row">
                        <span>Last Name</span>
                        <span>{profile?.last_name}</span>
                    </div>

                    <div className="pm-info-row">
                        <span>Sex</span>
                        <span>{formatSex(profile?.sex)}</span>
                    </div>

                    {!isDesktop && (
                        <button
                            className="pm-mobile-edit-btn"
                            onClick={() =>
                                navigate(
                                    "/program-manager/profile/edit",
                                    {
                                        state: {
                                            fromProgramManager: true,
                                        },
                                    }
                                )
                            }
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;