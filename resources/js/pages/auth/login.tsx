import { Head, useForm } from '@inertiajs/react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google'; // Added Google Icon
import {
    Alert,
    Box,
    Button,
    Container,
    Divider, // Added Divider
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import { CircleAlert } from "lucide-react";
import React, { useState } from 'react';

import logoLight from "/public/images/logo-light.png";

type Props = {
    status?: string;
    canResetPassword: boolean;
    error?: string;
};

export default function Login({ status, error }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
    });

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        post('/login', {
            onError: (err) => {
                setToastMessage(err.email || "Incorrect email or password.");
                setShowToast(true);
            },
        });
    };

    const handleGoogleLogin = () => {
        // Must be a standard browser redirect, NOT an Inertia request, to avoid CORS issues
        window.location.href = '/auth/google';
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
            <Head title="Log in" />

            <Snackbar
                open={showToast}
                autoHideDuration={4000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                sx={{ mt: 2 }}
            >
                <Alert
                    icon={<CircleAlert />}
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

            <Box sx={{ textAlign: "center", mb: 5 }}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                }}>
                    <img src={logoLight} alt="Logo" width={70} />
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
                    Dental Chair Assignment & Student Attendance <br />
                    Monitoring and Management System
                </Typography>
            </Box>

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
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "30px",
                    }}
                >
                    Welcome Back!
                </Typography>

                <Typography
                    sx={{ textAlign:"center", fontSize: "0.8rem", color: "#555", mb: 3 }}
                >
                    Please enter your login credentials
                </Typography>

                {status && (
                    <Typography
                        variant="body2"
                        align="center"
                        className="mb-4 font-medium text-green-600"
                    >
                        {status}
                    </Typography>
                )}

                {error && (
                    <Typography
                        variant="body2"
                        align="center"
                        className="mb-4 font-medium text-red-600"
                    >
                        {error}
                    </Typography>
                )}

                <Box component="form" onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        required
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        margin="normal"
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        fullWidth
                        required
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        margin="normal"
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{ mb: 3 }}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
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
                        disabled={processing}
                        sx={{
                            backgroundColor: "#4A3878",
                            py: 1.5,
                            fontWeight: "bold",
                            borderRadius: "10px",
                            "&:hover": {
                                backgroundColor: "#37295c",
                            },
                            ...(processing && { opacity: 0.7 })
                        }}
                    >
                        {processing ? 'Logging in...' : 'Login'}
                    </Button>

                    <Divider sx={{ my: 3, color: '#888', fontSize: '0.875rem' }}>
                        OR
                    </Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon sx={{ color: '#4A3878' }} />}
                        onClick={handleGoogleLogin}
                        sx={{
                            py: 1.5,
                            fontWeight: "bold",
                            borderRadius: "10px",
                            borderColor: "#ccc",
                            color: "#555",
                            "&:hover": {
                                backgroundColor: "#f9f9f9",
                                borderColor: "#aaa",
                            }
                        }}
                    >
                        Sign in with Google
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
}

Login.layout = (page: React.ReactNode) => <>{page}</>;
