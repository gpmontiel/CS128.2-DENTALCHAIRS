import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.ts";
import { Box, Container, TextField, Button, Typography, InputAdornment,
    IconButton, Snackbar, Alert, Paper,} from "@mui/material";
import { Visibility, VisibilityOff, WarningAmber } from "@mui/icons-material";

interface LoginPageProps {
    onLoginSuccess: (profile: any) => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            setToastMessage("Incorrect username or password.");
            setShowToast(true);
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("profile_id", data.user.id)
            .single();

        if (profileError || !profile) {
            setToastMessage("Failed to fetch user profile.");
            setShowToast(true);
            return;
        }

        onLoginSuccess(profile);

        if (profile.role_id === 1) navigate("/admin");
        else if (profile.role_id === 2) navigate("/manager");
        else if (profile.role_id === 3) navigate("/clinician");
        else alert("Unknown role");
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(330deg, hsla(277, 42%, 38%, 1) 15%, hsla(257, 36%, 35%, 1) 52%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, sans-serif",
                px: 5,
            }}
        >
            {/* warning */}
            <Snackbar
                open={showToast}
                autoHideDuration={3000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                sx={{ mt: 2 }}
            >
                <Alert
                    icon={<WarningAmber />}
                    severity="warning"
                    sx={{
                        backgroundColor: "#FFF4E5",
                        color: "#663C01",
                        fontWeight: 500,
                    }}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>

            {/* logo and title */}
            <Box textAlign="center" mb={5}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <img src="/src/assets/logo-light.png" alt="Logo" width={70} />
                    <Typography
                        variant="h3"
                        sx={{
                            color: "#E9B0F8",
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 700,
                        }}
                    >
                        DenTrack
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        color: "white",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        mt: 2
                    }}
                >
                    Dental Chair Assignment & Student Attendance <br/>
                    Monitoring and Management System
                </Typography>
            </Box>

            {/* login card */}
            <Paper
                elevation={3}
                sx={{
                    width: "100%",
                    maxWidth: 500,
                    borderRadius: { xs: "30px", md: "20px" },
                    backgroundColor: { xs: "white", md: "#FAF4FF" },
                    p: { xs: 3, sm: 4, md: 5 },
                    animation: "fadeSlideUp 0.8s ease",
                }}
            >
                <Typography variant="h5" textAlign="center" fontWeight="bold" fontSize="30px">
                    Welcome Back!
                </Typography>

                <Typography
                    textAlign="center"
                    sx={{ fontSize: "0.8rem", color: "#555", mb: 3 }}
                >
                    Please enter your login credentials
                </Typography>

                <Box component="form" onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        required
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        required
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        sx={{ mb: 5 }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <VisibilityOff sx={{ color: "#4A3878" }} />
                                            ) : (
                                                <Visibility sx={{ color: "#4A3878" }} />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            backgroundColor: "#4A3878",
                            py: 1.5,
                            fontWeight: "bold",
                            borderRadius: "10px",
                            "&:hover": {
                                backgroundColor: "#37295c",
                            },
                        }}
                    >
                        Login
                    </Button>
                </Box>
            </Paper>

            <style>
                {`
                @keyframes fadeSlideUp {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                  }
                `}
            </style>
        </Container>
    );
};

export default LoginPage;