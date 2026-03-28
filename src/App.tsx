import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import AdminHome from "./pages/ClinicalAdminPage/AdminHome.tsx";
import ManagerHome from "./pages/ProgramManagerPage/ManagerHome.tsx";
import ClinicalHome from "./pages/ClinicianPage/ClinicianHome.tsx";

function App() {
    const [user, setUser] = useState<any>(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage onLoginSuccess={(userData) => setUser(userData)} />} />

                <Route path="/admin" element={user?.role_id === 1 ? <AdminHome /> : <Navigate to="/" />} />
                <Route path="/manager" element={user?.role_id === 2 ? <ManagerHome /> : <Navigate to="/" />} />
                <Route path="/clinician" element={user?.role_id === 3 ? <ClinicalHome /> : <Navigate to="/" />}/>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;