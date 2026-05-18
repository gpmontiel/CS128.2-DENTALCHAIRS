import React, { useState } from "react";
import ResponsiveAppBar from "../components/ProgramManagerNavbar";

import StudentAttendanceView from "./StudentAttendanceView";
import DentalChairUsageView from "./DentalChairUsageView";

import TabPills from "../components/TabPills";
import { TABS, type TabValue } from "../config/tabs";
import '../css/ManagerHomePage.css';

const ManagerHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("attendance");

  return (
    <div className="manager-program-pagecd CS128.2-DENTALCHAIRS bg-gray-50">
      <ResponsiveAppBar />

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