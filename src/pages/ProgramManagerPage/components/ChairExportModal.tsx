import React, { useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import "../css/ExportModal.css";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: string;

  onExport: (params: {
    timeframe: "weekly" | "monthly" | "custom";
    startDate: string;
    endDate: string;
    group: string;
  }) => void;
}

const ChairExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  selectedGroup,
}) => {
  const [timeframe, setTimeframe] = useState<
    "weekly" | "monthly" | "custom"
  >("weekly");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleExport = () => {
    const today = new Date();

    let finalStartDate = "";
    let finalEndDate = "";

    if (timeframe === "weekly") {
      const day = today.getDay();

      const currentMonday = new Date(today);
      const diffToMonday = (day === 0 ? -6 : 1 - day);
      currentMonday.setDate(today.getDate() + diffToMonday);

      let start: Date;
      let end: Date;

      if (day === 6 || day === 0) {
        start = new Date(currentMonday);
        start.setDate(currentMonday.getDate() - 7);

        end = new Date(start);
        end.setDate(start.getDate() + 4);
      } else {
        start = new Date(currentMonday);
        end = new Date(currentMonday);
        end.setDate(currentMonday.getDate() + 4);
      }

      finalStartDate = formatDate(start);
      finalEndDate = formatDate(end);
    }

    if (timeframe === "monthly") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      finalStartDate = formatDate(start);
      finalEndDate = formatDate(end);
    }

    if (timeframe === "custom") {
      if (!startDate || !endDate) return;

      finalStartDate = startDate;
      finalEndDate = endDate;
    }

    onExport({
      timeframe,
      startDate: finalStartDate,
      endDate: finalEndDate,
      group: selectedGroup,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Exporting Options</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <label className="section-label">Select Timeframe</label>

          <div className="timeframe-selector">
            <button
              className={`time-tab ${timeframe === "weekly" ? "active" : ""}`}
              onClick={() => setTimeframe("weekly")}
            >
              <strong>Weekly</strong>
              <span>5 working days</span>
            </button>

            <button
              className={`time-tab ${timeframe === "monthly" ? "active" : ""}`}
              onClick={() => setTimeframe("monthly")}
            >
              <strong>Monthly</strong>
              <span>Current month</span>
            </button>

            <button
              className={`time-tab ${timeframe === "custom" ? "active" : ""}`}
              onClick={() => setTimeframe("custom")}
            >
              <strong>Custom Range</strong>
              <span>Set Dates</span>
            </button>
          </div>

          {timeframe === "custom" && (
            <div className="date-inputs-container">
              <div className="date-field">
                <label>Start Date:</label>
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
                <label>End Date:</label>
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

          <button className="download-btn" onClick={handleExport}>
            DOWNLOAD PDF <FiDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChairExportModal;