import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase.ts";

interface LoginPageProps {
    onLoginSuccess: (profile: any) => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log("Login attempt:", email, password);

        // Supabase Authentication
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error || !data.user) {
            alert("Login failed: " + error?.message);
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
            alert("Failed to fetch user profile.");
            return;
        }

        console.log("Profile fetched:", profile);

        onLoginSuccess(profile);

        if (profile.role_id === 1) navigate("/admin");
        else if (profile.role_id === 2) navigate("/manager");
        else if (profile.role_id === 3) navigate("/clinician");
        else alert("Unknown role");
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Email</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;