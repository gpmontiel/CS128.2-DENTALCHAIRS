import React from "react";
import "../css/TabPills.css";
import { type TabValue } from "../config/tabs";

type Tab = {
  label: string;
  value: TabValue;
};

type Props = {
  tabs: readonly Tab[];
  activeTab: TabValue;
  setActiveTab: (value: TabValue) => void;
};

const TabPills: React.FC<Props> = ({
  tabs,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="tab-container">
      <div className="tab-pill-wrapper">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`tab-button ${
              activeTab === tab.value ? "active" : ""
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabPills;