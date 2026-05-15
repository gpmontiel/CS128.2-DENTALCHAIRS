import React, { useState } from "react";
import ResponsiveAppBar from "../components/ProgramManagerNavbar";

import StudentAttendanceView from "./StudentAttendanceView";
import DentalChairUsageView from "./DentalChairUsageView";

import TabPills from "../components/TabPills";
import { TABS, type TabValue } from "../config/tabs";

const ManagerHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("attendance");

  return (
    <div className="min-h-screen bg-gray-50">
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