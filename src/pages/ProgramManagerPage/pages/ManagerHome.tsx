import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ResponsiveAppBar from "../components/ProgramManagerNavbar";
import AdminNavbar from "../../ClinicalAdminPage/components/AdminNavbar.tsx";

import StudentAttendanceView from "./StudentAttendanceView";
import DentalChairUsageView from "./DentalChairUsageView";

import TabPills from "../components/TabPills";
import { TABS, type TabValue } from "../config/tabs";
import '../css/ManagerHomePage.css';

const ManagerHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("attendance");
  const location = useLocation();

    const isAdminView = location.pathname.startsWith("/clinicalAdmin");

    return (
        <div className="manager-program-page bg-gray-50">
            {isAdminView ? (
                <AdminNavbar />
            ) : (
                <ResponsiveAppBar />
            )}

            <TabPills
                tabs={TABS}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div>
                {activeTab === "attendance" ? (
                    <StudentAttendanceView />
                ) : (
                    <DentalChairUsageView />
                )}
            </div>
        </div>
    );
};

export default ManagerHome;
