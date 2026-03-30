import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import AdminHome from "./pages/ClinicalAdminPage/AdminHome.tsx";
import ManagerHome from "./pages/ProgramManagerPage/ManagerHome.tsx";
import ClinicianSchedule from "./pages/ClinicianPage/Schedule/Schedule.tsx";
import ClinicianRequest from "./pages/ClinicianPage/Request/RequestSchedule.tsx";
import ClinicianNotification from "./pages/ClinicianPage/Notification/Notification.tsx";
import ClinicianProfile from "./pages/ClinicianPage/Profile/Profile.tsx";
import RequestForm from './pages/ClinicianPage/Request/RequestForm.tsx';

function App() {
    const [user, setUser] = useState<any>(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage onLoginSuccess={(userData) => setUser(userData)} />} />
                <Route path="/admin" element={user?.role_id === 1 ? <AdminHome /> : <Navigate to="/" />} />
                <Route path="/manager" element={user?.role_id === 2 ? <ManagerHome /> : <Navigate to="/" />} />
                <Route path="/clinician" element={user?.role_id === 3 ? <ClinicianSchedule /> : <Navigate to="/" />}/>
                <Route path="/clinicianRequest" element={<ClinicianRequest />} />
                <Route path="/clinicianNotification" element={<ClinicianNotification />} />
                <Route path="/clinicianProfile" element={<ClinicianProfile />} />
                <Route path="/requestForm" element={<RequestForm />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;