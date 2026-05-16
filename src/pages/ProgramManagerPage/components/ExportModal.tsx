import React, { useState } from "react";
import { FiX, FiDownload } from "react-icons/fi"; // ❌ removed FiCalendar
import "../css/ExportModal.css";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [timeframe, setTimeframe] = useState<
    "weekly" | "monthly" | "custom"
  >("weekly");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-header">
          <h2>Export Report Options</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <label className="section-label">
            Select Timeframe
          </label>

          {/* TIMEFRAME SELECTOR */}
          <div className="timeframe-selector">
            <button
              className={`time-tab ${
                timeframe === "weekly" ? "active" : ""
              }`}
              onClick={() => setTimeframe("weekly")}
            >
              <strong>Weekly</strong>
              <span>this week</span>
            </button>

            <button
              className={`time-tab ${
                timeframe === "monthly" ? "active" : ""
              }`}
              onClick={() => setTimeframe("monthly")}
            >
              <strong>Monthly</strong>
              <span>this month</span>
            </button>

            <button
              className={`time-tab ${
                timeframe === "custom" ? "active" : ""
              }`}
              onClick={() => setTimeframe("custom")}
            >
              <strong>Custom Range</strong>
              <span>Set Dates</span>
            </button>
          </div>

          {/* CUSTOM DATE PICKER */}
          {timeframe === "custom" && (
            <div className="date-inputs-container">
              <div className="date-field">
                <label>From:</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <span className="date-separator">to</span>

              <div className="date-field">
                <label>To:</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* DOWNLOAD BUTTON */}
          <button className="download-btn">
            DOWNLOAD PDF <FiDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;