import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.ts";
import {Container, Row, Col, Form, Button, InputGroup, Toast, ToastBody, ToastContainer} from "react-bootstrap";
import { FaEnvelope, FaExclamationTriangle } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import "./LoginPage.css"

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

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log("Login attempt:", email, password);

        // Supabase Authentication
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error || !data.user) {
            console.log("Login failed:", error?.message);
            setToastMessage("Incorrect username or password.");
            setShowToast(true);
            return;
        }

        console.log("Auth success:", data.user);

        // Profile fetching for roles
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

        console.log("Profile fetched:", profile);

        onLoginSuccess(profile);

        if (profile.role_id === 1) navigate("/admin");
        else if (profile.role_id === 2) navigate("/manager");
        else if (profile.role_id === 3) navigate("/clinician");
        else alert("Unknown role");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevShowPassword => !prevShowPassword);
    };

    return (
        <Container fluid style={{ backgroundColor: "#4A3878", minHeight: "100vh", padding: 0, fontFamily: "Inter, sans-serif" }}>

            {/* toast notification */}
            <ToastContainer className="p-3" position="top-center">
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={10000}
                    autohide
                    style={{
                        backgroundColor: "#FFF4E5",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        borderRadius: "8px",
                    }}
                >
                    <ToastBody className="d-flex align-items-center justify-content-center gap-3">
                        <FaExclamationTriangle style={{ color: "#EF7B2B" }} size={20} />
                        <span style={{ color: "#663C01", fontWeight: "500"}}>
                            {toastMessage}
                        </span>
                    </ToastBody>
                </Toast>
            </ToastContainer>

            <Row className="justify-content-center pt-3 px-3" style={{ margin: 0, minHeight: "100vh" }}>
                <Col xs={12} sm={12} md={9} lg={6} xl={5} style={{ padding: 0, display: "flex", flexDirection: "column" }}>
                    <div className="text-center mb-4" style={{ paddingTop: "2rem" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                            }}
                        >
                            <img src="src/assets/logo-light.png" alt="Logo" style={{ width: "50px" }} />
                            <h1 style={{
                                    color: "#E9B0F8",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: 700,
                                    margin: 0,
                                    fontSize: "2.5rem",
                                }}
                            >
                                DenTrack
                            </h1>
                        </div>

                        <p className="text-center mx-4"
                            style={{
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                marginTop: "20px",
                                marginBottom: "15px",
                            }}
                        >
                            Dental Chair Assignment & Student Attendance
                            Monitoring and Management System
                        </p>
                    </div>

                    <style>
                        {`
                        /* mobile (default) */
                        .login-card-mobile {
                            background-color: white;
                            border-top-left-radius: 30px;
                            border-top-right-radius: 30px;
                            border-bottom-left-radius: 0;
                            border-bottom-right-radius: 0;
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                        }
          
                        /* desktop */
                        @media (min-width: 800px) {
                            .login-card-mobile {
                                background-color: #FAF4FF !important;
                                border-radius: 20px !important;
                                margin: 0 1rem !important;
                                min-height: auto !important;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                                padding: 1.5rem !important;
                                flex: none !important;
                            }
                        }
                    `}
                    </style>

                    <div className="login-card-mobile px-3 px-lg-0">
                        <div style={{ maxWidth: "500px", margin: "0 auto", width: "100%", padding: "2rem 1rem" }}>
                            <h1
                                className="fw-bold text-center mb-1 mt-1"
                                style={{ fontSize: "2.3rem" }}
                            >
                                Welcome Back!
                            </h1>
                            <p className="text-center mb-4" style={{ fontSize: "0.8rem", color: "#555" }}>
                                Please enter your login credentials
                            </p>

                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "600"}}>Email</Form.Label>
                                    <InputGroup>
                                        <Form.Control required
                                                      type="email"
                                                      placeholder="Enter your email"
                                                      value={email}
                                                      onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <InputGroup.Text style={{ backgroundColor: "white" }}>
                                            <FaEnvelope color="#4A3878" />
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-5">
                                    <Form.Label style={{ fontWeight: "600"}}>Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control required
                                                      type={showPassword ? "text" : "password"}
                                                      placeholder="Enter your password"
                                                      value={password}
                                                      onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <InputGroup.Text
                                            style={{ backgroundColor: "white", cursor: "pointer" }}
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <IoMdEyeOff color="#4A3878" size={20} />
                                            ) : (
                                                <IoMdEye color="#4A3878" size={20} />
                                            )}
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                <Button type="submit" className="w-100 login-btn">
                                    Login
                                </Button>
                            </Form>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;