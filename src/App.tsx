import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import AdminHome from "./pages/ClinicalAdminPage/AdminHome.tsx";
import ManagerHome from "./pages/ProgramManagerPage/ManagerHome.tsx";
import ClinicianSchedule from "./pages/ClinicianPage/Schedule/Schedule.tsx";
import ClinicianRequest from "./pages/ClinicianPage/Request/RequestSchedule.tsx";
import ClinicianProfile from "./pages/ClinicianPage/Profile/Profile.tsx";
import ClinicianEditProfile from "./pages/ClinicianPage/Profile/EditProfile.tsx";
import RequestForm from './pages/ClinicianPage/Request/RequestForm.tsx';
import Dashboard from "./pages/ChairManagerPage/pages/Dashboard.tsx";
import ChairManagerLayout from "./pages/ChairManagerPage/layouts/ChairManagerLayout.tsx"
import ManageRequests from "./pages/ChairManagerPage/pages/ManageRequests.tsx";
import RequestHistory from "./pages/ChairManagerPage/pages/RequestHistory.tsx";
import RequestHistoryDetails from "./pages/ChairManagerPage/pages/RequestHistoryDetails.tsx";
import ChairManagerNotificationsPage from "./pages/ChairManagerPage/pages/ChairManagerNotificationsPage.tsx";
import ClinicianNotificationsPage from './pages/ClinicianPage/Notification/ClinicianNotifications.tsx';

function App() {
    const [user, setUser] = useState<any>(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage onLoginSuccess={(userData) => setUser(userData)} />} />
                <Route path="/admin" element={user?.role_id === 1 ? <AdminHome /> : <Navigate to="/" />} />
                <Route path="/manager" element={user?.role_id === 2 ? <ManagerHome /> : <Navigate to="/" />} />
                {/*<Route path="/clinician" element={user?.role_id === 3 ? <ClinicianSchedule /> : <Navigate to="/" />}/>*/}
                <Route path="/clinician" element={<ClinicianSchedule />} />

                <Route path="/clinicianRequest" element={<ClinicianRequest />} />
                <Route path="/profile" element={<ClinicianProfile />} />
                <Route path="/edit-profile" element={<ClinicianEditProfile />} />
                <Route path="/requestForm" element={<RequestForm />} />
                <Route path="/clinician-notifications" element={<ClinicianNotificationsPage />} />

                <Route element={<ChairManagerLayout />}>
                    <Route path="/chair-manager-home" element={<Dashboard />} />
                    <Route path="/chair-manager/manage-requests" element={<ManageRequests />} />
                    <Route path="/chair-manager/manage-requests/:assignmentId" element={<ManageRequests />}/>
                    <Route path="/chair-manager/history" element={<RequestHistory />}/>
                    <Route path="/chair-manager/history/:assignmentId" element={<RequestHistoryDetails />}/>
                    <Route path="/chair-manager-notifications" element={<ChairManagerNotificationsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;