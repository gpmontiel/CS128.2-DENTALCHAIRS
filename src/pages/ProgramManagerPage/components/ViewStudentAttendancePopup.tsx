import React, { useEffect, useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import { FaTooth } from "react-icons/fa6";

import "../css/ViewStudentAttendancePopup.css";

import {
  fetchStudentAttendanceService,
  type AttendanceWithClinician,
} from "../services/fetchIndAttendanceService";

type Props = {
  isOpen: boolean;
  studentId: string | null;
  onClose: () => void;
};

const groupColors: Record<string, string> = {
  "PCB Sinag": "#F59E0B",
  "PCB Agos": "#2563EB",
  "PCB Banaag": "#7C3AED",
  "Non-PCB": "#10B981",
};

const ViewStudentAttendancePopup: React.FC<Props> = ({
  isOpen,
  studentId,
  onClose,
}) => {
  const [data, setData] = useState<AttendanceWithClinician[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("weekly");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !studentId) return;

      try {
        setLoading(true);
        const res = await fetchStudentAttendanceService(studentId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, studentId]);

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getFilteredData = () => {
    const today = new Date();
    let filtered: AttendanceWithClinician[] = [];

    if (filter === "weekly") {
      const day = today.getDay();
      let monday = new Date(today);

      if (day === 0) monday.setDate(today.getDate() - 6);
      else if (day === 6) monday.setDate(today.getDate() - 5);
      else monday.setDate(today.getDate() - (day - 1));

      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);

      monday.setHours(0, 0, 0, 0);
      friday.setHours(23, 59, 59, 999);

      filtered = data.filter((row) => {
        const d = new Date(row.date);
        return d >= monday && d <= friday;
      });
    } else if (filter === "monthly") {
      const month = today.getMonth();
      const year = today.getFullYear();

      filtered = data.filter((row) => {
        const d = new Date(row.date);
        const isWeekday = d.getDay() !== 0 && d.getDay() !== 6;

        return d.getMonth() === month && d.getFullYear() === year && isWeekday;
      });
    } else if (filter === "custom") {
      if (!customStart || !customEnd) return [];

      const start = new Date(customStart);
      const end = new Date(customEnd);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      filtered = data.filter((row) => {
        const d = new Date(row.date);
        return d >= start && d <= end;
      });
    } else {
      filtered = data;
    }

    return filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const filteredData = getFilteredData();

  if (!isOpen) return null;

  const firstName = data[0]?.profiles?.first_name ?? "—";
  const lastName = data[0]?.profiles?.last_name ?? "";
  const clinician = data[0]?.clinician;

  const groupName = clinician?.student_groups?.group_name ?? "—";
  const groupColor = groupColors[groupName] || "#64748b";

  return (
    <div className="popup-overlay">
      <div className="popup-container">

        <button className="close-btn" onClick={onClose}>
          <FiX size={18} />
        </button>

        {/* HEADER */}
        <div className="student-profile-header">
          <h2>Student Attendance Report</h2>

          <div className="student-header-row">

            {/* NAME ONLY (NO TOOTH HERE) */}
            <div className="main-name">
              <h3>{firstName} {lastName}</h3>
            </div>

            {/* RIGHT SIDE PILLS */}
            <div className="student-pills">

              <span className="pill">
                ID: {clinician?.student_number ?? "—"}
              </span>

              <span
                className="pill group-pill"
                style={{
                  backgroundColor: `${groupColor}15`,
                  border: `1px solid ${groupColor}40`,
                  color: groupColor,
                }}
              >
                <FaTooth className="pill-icon" />
                {groupName}
              </span>

            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="controls-bar">
          <div className="tabs-group">
            <button
              className={`tab-item ${filter === "weekly" ? "active" : ""}`}
              onClick={() => setFilter("weekly")}
            >
              Weekly
            </button>

            <button
              className={`tab-item ${filter === "monthly" ? "active" : ""}`}
              onClick={() => setFilter("monthly")}
            >
              Monthly
            </button>

            <button
              className={`tab-item ${filter === "custom" ? "active" : ""}`}
              onClick={() => setFilter("custom")}
            >
              Custom
            </button>
          </div>

          <button className="download-action-btn">
            <FiDownload size={16} />
            Download
          </button>
        </div>

        {/* CUSTOM PICKER */}
        {filter === "custom" && (
          <div className="custom-range-picker">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}

        {/* TABLE */}
        <div className="popup-content-body">
          {loading ? (
            <div className="state-message">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="state-message">No records found.</div>
          ) : (
            <table className="attendance-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Room</th>
                  <th>Section</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.assignment_id}>
                    <td>{formatDateString(row.date)}</td>
                    <td>{row.shift}</td>
                    <td>{row.sections?.rooms?.room_name ?? "—"}</td>
                    <td>{row.sections?.section_name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default ViewStudentAttendancePopup;