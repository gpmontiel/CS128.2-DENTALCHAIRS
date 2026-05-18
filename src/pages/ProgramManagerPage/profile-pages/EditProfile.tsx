import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import {
    TextField,
    MenuItem,
    FormControl,
    Select,
    Button,
    Snackbar,
    Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import profileImage from "../../../assets/profile-icon-blank.png";
import ResponsiveAppBar from "../components/ProgramManagerNavbar";
import { supabase } from "../../../utils/supabase";
import "../css/EditProfilePage.css";

const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return isDesktop;
};

const EditProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isDesktop = useIsDesktop();

    // ✅ FIXED: do NOT default to true
    const fromProgramManager = location.state?.fromProgramManager || false;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [sex, setSex] = useState("");
    const [pfpUrl, setPfpUrl] = useState("");

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        "success" | "error" | "info" | "warning"
    >("success");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            if (!userId) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("first_name, last_name, sex, pfp")
                .eq("profile_id", userId)
                .single();

            if (error) {
                setSnackbarMessage("Failed to load profile");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } else {
                setFirstName(data.first_name || "");
                setLastName(data.last_name || "");
                setSex(data.sex === "F" ? "Female" : "Male");
                setPfpUrl(data.pfp || "");
            }

            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);

        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            if (!userId) return;

            const updates = {
                first_name: firstName,
                last_name: lastName,
                sex: sex === "Female" ? "F" : "M"
            };

            await supabase
                .from("profiles")
                .update(updates)
                .eq("profile_id", userId);

            setSnackbarMessage("Profile updated!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            setTimeout(() => {
                navigate("/program-manager/profile", {
                    state: { fromProgramManager: true }
                });
            }, 1000);

        } catch (err: any) {
            setSnackbarMessage(err.message || "Error saving profile");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <ResponsiveAppBar />
                <p className="edit-profile-loading">Loading...</p>
            </>
        );
    }

    return (
        <div className="edit-profile-page">
            <ResponsiveAppBar />

            <div className="edit-profile-container">

                {/* HEADER */}
                <div className="edit-profile-header">

                    <button
                        className="edit-profile-back-btn"
                        onClick={() =>
                            navigate("/program-manager/profile", {
                                state: { fromProgramManager: true }
                            })
                        }
                    >
                        <ArrowBackIcon />
                    </button>

                    <h2>Edit Profile</h2>
                </div>

                {/* IMAGE */}
                <div className="edit-profile-image-wrapper">
                    <img
                        src={pfpUrl || profileImage}
                        className="edit-profile-image"
                    />
                </div>

                {/* FORM */}
                <div className="edit-profile-form">

                    <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <Select
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="edit-profile-save-btn"
                        fullWidth
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>

                </div>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EditProfile;