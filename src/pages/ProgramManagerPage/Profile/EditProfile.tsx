import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    TextField,
    MenuItem,
    FormControl,
    Select,
    Button,
    Snackbar,
    Alert
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Navbar from "../components/ProgramManagerNavbar";
import ResponsiveAppBar from "../../ProgramManagerPage/components/ProgramManagerNavbar";
import profileImage from "../../../assets/profile-icon-blank.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../../../utils/supabase";

interface StudentGroup {
    group_name: string;
}

interface Clinician {
    student_number: string;
    year_level: string;
    student_groups: StudentGroup;
}

interface ProfileData {
    first_name: string;
    last_name: string;
    sex: string;
    pfp: string;
    clinician: Clinician;
}

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

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const isDesktop = useIsDesktop();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [studentNumber, setStudentNumber] = useState("");
    const [sex, setSex] = useState("");
    const [yearLevel, setYearLevel] = useState("");
    const [studentGroup, setStudentGroup] = useState("");
    const [pfpUrl, setPfpUrl] = useState("");

    const [cancelHovered, setCancelHovered] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        "success" | "error" | "info" | "warning"
    >("success");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [originalData, setOriginalData] = useState({
        firstName: "",
        lastName: "",
        studentNumber: "",
        sex: "",
        yearLevel: "",
        studentGroup: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            if (!userId) {
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
                .single() as { data: ProfileData | null; error: any };

            if (error) {
                setSnackbarMessage("Failed to load profile data");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } else {
                setProfile(data);

                setFirstName(data?.first_name || "");
                setLastName(data?.last_name || "");
                setStudentNumber(data?.clinician?.student_number || "");
                setSex(data?.sex === "F" ? "Female" : data?.sex === "M" ? "Male" : "");
                setYearLevel(data?.clinician?.year_level || "");
                setStudentGroup(data?.clinician?.student_groups?.group_name || "");
                setPfpUrl(data?.pfp || "");

                setOriginalData({
                    firstName: data?.first_name || "",
                    lastName: data?.last_name || "",
                    studentNumber: data?.clinician?.student_number || "",
                    sex: data?.sex === "F" ? "Female" : data?.sex === "M" ? "Male" : "",
                    yearLevel: data?.clinician?.year_level || "",
                    studentGroup: data?.clinician?.student_groups?.group_name || ""
                });
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

            const profileUpdates: any = {};
            const clinicianUpdates: any = {};

            if (firstName !== originalData.firstName) profileUpdates.first_name = firstName;
            if (lastName !== originalData.lastName) profileUpdates.last_name = lastName;
            if (sex !== originalData.sex)
                profileUpdates.sex = sex === "Female" ? "F" : sex === "Male" ? "M" : sex;

            if (studentNumber !== originalData.studentNumber)
                clinicianUpdates.student_number = studentNumber;

            if (yearLevel !== originalData.yearLevel)
                clinicianUpdates.year_level = yearLevel;

            const groupIdMap: Record<string, number> = {
                "Non-PCB": 1,
                "PCB Sinag": 2,
                "PCB Banaag": 3,
                "PCB Agos": 4
            };

            if (studentGroup !== originalData.studentGroup)
                clinicianUpdates.group_id = groupIdMap[studentGroup] || null;

            if (selectedFile) {
                const fileExt = selectedFile.name.split(".").pop();
                const filePath = `${userId}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("profiles")
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;

                const { data: publicData } = supabase.storage
                    .from("profiles")
                    .getPublicUrl(filePath);

                profileUpdates.pfp = publicData.publicUrl;
            }

            if (Object.keys(profileUpdates).length > 0) {
                await supabase
                    .from("profiles")
                    .update(profileUpdates)
                    .eq("profile_id", userId);
            }

            if (Object.keys(clinicianUpdates).length > 0) {
                await supabase
                    .from("clinician")
                    .update(clinicianUpdates)
                    .eq("clinician_id", userId);
            }

            setSnackbarMessage("Profile updated successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            setTimeout(() => {
                navigate("/profile");
            }, 1200);
        } catch (err: any) {
            setSnackbarMessage(err.message || "Failed to save profile");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <p style={{ textAlign: "center" }}>Loading...</p>
            </>
        );
    }

    return (
        <div>
            <Navbar />

            <div style={{ maxWidth: isDesktop ? 750 : "100%", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                    <button
                        onClick={() => navigate("/profile")}
                        style={{
                            position: "absolute",
                            left: 20
                        }}
                    >
                        <ArrowBackIcon />
                    </button>

                    <h2>Edit Profile</h2>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <img
                        src={previewUrl || pfpUrl || profileImage}
                        style={{
                            width: 130,
                            height: 130,
                            borderRadius: "50%"
                        }}
                    />
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />

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

                <TextField
                    label="Student Number"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    fullWidth
                />

                <FormControl fullWidth>
                    <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                    </Select>
                </FormControl>

                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
            </Snackbar>
        </div>
    );
};

export default EditProfile;