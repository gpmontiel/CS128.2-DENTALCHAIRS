import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import ManagerHome from "./pages/ProgramManagerPage/ManagerHome.tsx";
import ClinicianSchedule from "./pages/ClinicianPage/Schedule/Schedule.tsx";
import ClinicianRequest from "./pages/ClinicianPage/Request/RequestSchedule.tsx";
import ClinicianNotification from "./pages/ClinicianPage/Notification/Notification.tsx";
import ClinicianProfile from "./pages/ClinicianPage/Profile/Profile.tsx";
import RequestForm from './pages/ClinicianPage/Request/RequestForm.tsx';
import Dashboard from "./pages/ChairManagerPage/pages/Dashboard.tsx";
import ChairManagerLayout from "./pages/ChairManagerPage/layouts/ChairManagerLayout.tsx"
import ManageRequests from "./pages/ChairManagerPage/pages/ManageRequests.tsx";
import RequestHistory from "./pages/ChairManagerPage/pages/RequestHistory.tsx";
import ClinicalAdminLayout from "./pages/ClinicalAdminPage/layouts/ClinicalAdminLayout.tsx";
import ClinicalAdminStudents from "./pages/ClinicalAdminPage/Students/Students.tsx";
import ClinicalAdminRequests from "./pages/ClinicalAdminPage/Requests/Requests.tsx";
import ClinicalAdminAttendance from "./pages/ClinicalAdminPage/Attendance/Attendance.tsx";

function App() {
    const [user, setUser] = useState<any>(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage onLoginSuccess={(userData) => setUser(userData)} />} />
                {/*<Route path="/admin" element={user?.role_id === 1 ? <ClinicalAdminHome /> : <Navigate to="/" />} />*/}
                <Route path="/manager" element={user?.role_id === 2 ? <ManagerHome /> : <Navigate to="/" />} />
                {/*<Route path="/clinician" element={user?.role_id === 3 ? <ClinicianSchedule /> : <Navigate to="/" />}/>*/}
                <Route path="/clinician" element={<ClinicianSchedule />} />

                <Route path="/clinicianRequest" element={<ClinicianRequest />} />
                <Route path="/clinicianNotification" element={<ClinicianNotification />} />
                <Route path="/clinicianProfile" element={<ClinicianProfile />} />
                <Route path="/requestForm" element={<RequestForm />} />

                <Route element={<ChairManagerLayout />}>
                    <Route path="/chair-manager-home" element={<Dashboard />} />
                    <Route path="/chair-manager/manage-requests/:assignmentId" element={<ManageRequests />}/>
                    <Route path="/chair-manager/history" element={<RequestHistory />}/>
                </Route>

                <Route element={<ClinicalAdminLayout />}>
                    <Route path="/clinicalAdminStudents" element={<ClinicalAdminStudents />} />
                    <Route path="/clinicalAdminRequests" element={<ClinicalAdminRequests />} />
                    <Route path="/clinicalAdminAttendance" element={<ClinicalAdminAttendance />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;