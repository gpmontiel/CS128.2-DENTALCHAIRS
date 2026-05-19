import { Outlet, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Button,
    Snackbar,
    Alert,
    CircularProgress
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Navbar from "../components/Navbar";
import ResponsiveAppBar from "../../ChairManagerPage/components/ChairManagerNavbar";
import profileImage from "../../../assets/profile-icon-blank.png";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const isDesktop = useIsDesktop();
    const location = useLocation();
    const fromChairManager = location.state?.fromChairManager || false;
    
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
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");
    const [successOpen, setSuccessOpen] = useState(false);  

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [originalData, setOriginalData] = useState({
        firstName: "", lastName: "", studentNumber: "",
        sex: "", yearLevel: "", studentGroup: ""
    });

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
                .single() as { data: ProfileData | null; error: any };

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
                    studentGroup: data?.clinician?.student_groups?.group_name || "",
                });
            }

           setLoading(false); 
        }

        fetchProfile();
    }, []);

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleSexChange = (event: SelectChangeEvent) => {
        setSex(event.target.value);
    };

    const handleYearLevelChange = (event: SelectChangeEvent) => {
        setYearLevel(event.target.value);
    };

    const handleStudentGroupChange = (event: SelectChangeEvent) => {
        setStudentGroup(event.target.value);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) { 
            setSnackbarMessage('Please upload an image file');
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;  
        }
        if (file.size > 5 * 1024 * 1024) { 
            setSnackbarMessage('File size must be less than 5MB');
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return; 
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setSnackbarMessage('Image selected. Click Save to upload.');
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
    };

    
    const handleSave = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            const groupIdMap: { [key: string]: number } = {
                "Non-PCB": 1,
                "PCB Sinag": 2,
                "PCB Banaag": 3,
                "PCB Agos": 4
            };

            // Profile fields that changed
            const profileUpdates: any = {};
            if (firstName !== originalData.firstName) profileUpdates.first_name = firstName;
            if (lastName !== originalData.lastName) profileUpdates.last_name = lastName;
            if (sex !== originalData.sex) profileUpdates.sex = sex === "Female" ? "F" : sex === "Male" ? "M" : sex;

            // Clinician fields that changed
            const clinicianUpdates: any = {};
            if (studentNumber !== originalData.studentNumber) clinicianUpdates.student_number = studentNumber;
            if (yearLevel !== originalData.yearLevel) clinicianUpdates.year_level = yearLevel;
            if (studentGroup !== originalData.studentGroup) clinicianUpdates.group_id = groupIdMap[studentGroup] || null;

            console.log("Saving with userId:", userId);  
            console.log("Data:", { firstName, lastName, sex, studentNumber, yearLevel, studentGroup });

            // Upload photo if changed
            if (selectedFile && userId) {
                if (pfpUrl) {
                    const oldPath = pfpUrl.split('/profiles/')[1];
                    if (oldPath) await supabase.storage.from('profiles').remove([oldPath]);
                }
                const fileExt = selectedFile.name.split('.').pop();
                const filePath = `${userId}/${userId}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, selectedFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
                profileUpdates.pfp = publicUrl;
            }

            // Only call update if there are changes
            if (Object.keys(profileUpdates).length > 0) {
                const { error: profileError } = await supabase
                    .from("profiles").update(profileUpdates).eq("profile_id", userId);
                if (profileError) throw profileError;
            }

            if (Object.keys(clinicianUpdates).length > 0) {
                const { error: clinicianError } = await supabase
                    .from("clinician").update(clinicianUpdates).eq("clinician_id", userId);
                if (clinicianError) throw clinicianError;
            }

            // Nothing changed at all
            if (Object.keys(profileUpdates).length === 0 && Object.keys(clinicianUpdates).length === 0 && !selectedFile) {
                setSnackbarMessage("No changes to save.");
                setSnackbarSeverity("info");
                setSnackbarOpen(true);
                return;
            }

            setSnackbarMessage("Profile updated successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            
            setTimeout(() => {
                navigate("/profile", { state: { fromChairManager } });
            }, 1500);
            
        } catch (error: any) {
            console.error("Error saving profile:", error);
            setSnackbarMessage(error.message || "Failed to save profile. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setSaving(false);
        }
    }

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

    return(
        <div >
            {fromChairManager ? <ResponsiveAppBar /> : <Navbar />}
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
                        marginBottom: "20px",
                    }}
                >
                    {isDesktop && (
                        <button
                            className="confirm-btn"
                            onClick={() => navigate("/profile", { state: { fromChairManager } })}
                            onMouseEnter={() => setCancelHovered(true)}
                            onMouseLeave={() => setCancelHovered(false)}
                            style={{
                                position: "absolute",
                                left: 20,
                                top: 0,
                                padding: "5px 5px",
                                fontWeight: "bold",
                                backgroundColor: cancelHovered ? "#dfdee1" : "white",
                                color: "#382d5f",
                                border: "2px solid #493979",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                width: "45px",
                            }}
                        >
                            <ArrowBackIcon/>
                        </button>
                    )}

                    <p
                        style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 500,
                            fontSize: "23px",
                            color: "#382d5f",
                            margin: 0,
                        }}
                    >
                        Edit Profile
                    </p>
                </div> 
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                />
                
                <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                    <img
                        src={previewUrl || pfpUrl || profileImage}
                        alt="Profile Image"
                        style={{ width: "130px", height: "130px", border: "3px solid #382d5f", borderRadius: "50%", objectFit: "cover"}}
                    />
                    <Button
                        onClick={handleCameraClick}
                        disabled={uploading}
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            right: "calc(50% - 65px)",
                            backgroundColor: "#382d5f",
                            color: "white",
                            width: 30,
                            height: 30,
                            minWidth: 0,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            p: 0,
                            "&:hover": {
                            backgroundColor: "#2a2348",
                            },
                        }}
                    >
                        <CameraAltIcon fontSize="smaller" />
                    </Button>
                </div> 

                {uploading && (
                    <p style={{ textAlign: "center", color: "#382d5f", marginTop: "10px" }}>
                        Uploading...
                    </p>
                )}

                <hr style={{width: "90%", margin: "15px auto"}}></hr>

                <div style={{ display: "flex", justifyContent: "center", paddingTop: 15 }}>
                    <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        size="small"
                        sx={{
                            width: "90%",
                            "& label.Mui-focused": {
                            color: "#382d5f",
                            },
                            "& .MuiInputBase-root": {
                                height: 50, 
                                fontFamily: "Poppins, sans-serif",
                                "&.Mui-focused fieldset": {
                                    borderColor: "#382d5f",
                                }
                            }
                        }}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "center", paddingTop: 15 }}>
                    <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        size="small"
                        sx={{
                            width: "90%",
                            "& label.Mui-focused": {
                            color: "#382d5f",
                            },
                            "& .MuiInputBase-root": {
                                height: 50, 
                                fontFamily: "Poppins, sans-serif",
                                "&.Mui-focused fieldset": {
                                    borderColor: "#382d5f",
                                }
                            }
                        }}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "center", paddingTop: 15 }}>
                    <TextField
                        label="Student Number"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        size="small"
                        sx={{
                            width: "90%",
                            "& label.Mui-focused": {
                            color: "#382d5f",
                            },
                            "& .MuiInputBase-root": {
                                height: 50, 
                                fontFamily: "Poppins, sans-serif",
                                "&.Mui-focused fieldset": {
                                    borderColor: "#382d5f",
                                }
                            }
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "15px",
                        marginBottom: "15px",
                        marginLeft: isDesktop ? 40 : 20,   
                        marginRight: isDesktop ? 40 : 20, 
                    }}
                >
                    {/* Sex */}
                    <div style={{ flex: 1}}>
                        <p
                            style={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: "500",
                                fontSize: "16px",
                                color: "#4b5563", 
                                paddingTop: 10,
                                marginBottom: 4                            
                            }}
                        >
                            Sex
                        </p>

                        <FormControl fullWidth>
                            <Select
                                displayEmpty
                                value={sex}
                                onChange={handleSexChange}
                                sx={{
                                    height: 50,
                                    fontFamily: "Poppins, sans-serif",
                                    "& .MuiSelect-select": {
                                        padding: "12px 14px",  
                                        display: "flex",
                                        alignItems: "center",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#382d5f",
                                    },
                                }}
                            >
                                <MenuItem disabled value="">Sex</MenuItem>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    {/* Year Level */}
                    <div style={{ flex: 1 }}>
                        <p
                            style={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: "500",
                                fontSize: "16px",
                                color: "#4b5563",
                                paddingTop: 10,
                                marginBottom: 4  
                            }}
                        >
                            Year Level
                        </p>

                        <FormControl fullWidth>
                            <Select
                                displayEmpty
                                value={yearLevel}
                                onChange={handleYearLevelChange}
                                sx={{
                                    height: 50,
                                    fontFamily: "Poppins, sans-serif",
                                    "& .MuiSelect-select": {
                                        padding: "12px 14px",  
                                        display: "flex",
                                        alignItems: "center",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#382d5f",
                                    },
                                }}
                            >
                                <MenuItem disabled value="">Year Level</MenuItem>
                                <MenuItem value="I">I</MenuItem>
                                <MenuItem value="II">II</MenuItem>
                                <MenuItem value="III">III</MenuItem>
                                <MenuItem value="IV">IV</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                {/* Student Group */}
                <div>
                    <p style={{fontFamily: "Poppins, sans-serif", textAlign: "left", paddingLeft: isDesktop ? 40 : 20, fontWeight: "500", fontSize: "16px", color: "#4b5563"}}>Student Group</p>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <FormControl sx={{ width: "90%" }}>
                        <Select
                            displayEmpty
                            value={studentGroup}
                            onChange={handleStudentGroupChange}
                            sx={{
                                height: 50,
                                fontFamily: "Poppins, sans-serif",

                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#382d5f",
                                },
                            }}
                        >
                            <MenuItem disabled value="">Student Group</MenuItem>
                            <MenuItem value="Non-PCB">Non-PCB</MenuItem>
                            <MenuItem value="PCB Sinag">PCB Sinag</MenuItem>
                            <MenuItem value="PCB Banaag">PCB Banaag</MenuItem>
                            <MenuItem value="PCB Agos">PCB Agos</MenuItem>
                        </Select>
                        </FormControl>
                    </div>
                </div>

                {isDesktop && (
                    <div style={{ 
                        paddingTop: "20px",      
                        paddingBottom: "10px",  
                        paddingLeft: "33px",    
                        paddingRight: "33px",         
                        display: "flex", 
                        justifyContent: "center"  
                    }}>
                        <button 
                            className="confirm-btn" 
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                flex: 1, 
                                fontWeight: "bold",
                            }}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}

                {!isDesktop && (
                    <div style={{display: "flex", gap: "15px", padding: "20px 20px", paddingTop: 20}}>
                        <button 
                            className="confirm-btn" 
                            onClick={() => navigate("/profile", { state: { fromChairManager } })}
                            onMouseEnter={() => setCancelHovered(true)}
                            onMouseLeave={() => setCancelHovered(false)}
                            style={{
                                flex: 1, 
                                padding: "10px 20px", 
                                backgroundColor: cancelHovered ? "#dfdee1" : "white", 
                                color: "#382d5f", 
                                border: "2px solid #493979",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                fontWeight: "bold"
                            }}>
                                Cancel
                        </button>
                        <button 
                            className="confirm-btn" 
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                flex: 1, 
                                padding: "10px 20px", 
                                fontWeight: "bold",
                                opacity: saving ? 0.7 : 1,
                                cursor: saving ? "not-allowed" : "pointer"
                            }}>
                                {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
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
    )
};

export default EditProfile;