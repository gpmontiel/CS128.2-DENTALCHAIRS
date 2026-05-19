import React, { useEffect, useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import { FaTooth } from "react-icons/fa6";

import "../css/StudentAttendancePopup.css";

import { fetchStudentAttendanceService } from "../services/fetchStudentAttendanceService";
import type { AttendanceServiceRow } from "../services/fetchStudentAttendanceService";

import { exportAttendancePDF } from "../services/exportServices/exportAttendancePDF";

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

// ===============================
// DATE RANGE ENGINE (UNCHANGED)
// ===============================
const getWeekRange = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();

  let monday = new Date(d);

  if (day === 0) monday.setDate(d.getDate() - 6);
  else if (day === 6) monday.setDate(d.getDate() - 5);
  else monday.setDate(d.getDate() - (day - 1));

  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  return { start: monday, end: friday };
};

const getMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const formatRange = (start: Date, end: Date) => {
  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })}`;
};

const ViewStudentAttendancePopup: React.FC<Props> = ({
  isOpen,
  studentId,
  onClose,
}) => {
  const [data, setData] = useState<AttendanceServiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("weekly");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // ===============================
  // FETCH (UPDATED SOURCE ONLY)
  // ===============================
  useEffect(() => {
    const load = async () => {
      if (!isOpen || !studentId) return;

      try {
        setLoading(true);
        const res = await fetchStudentAttendanceService(studentId!);

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
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // ===============================
  // FILTER ENGINE (UNCHANGED)
  // ===============================
  const getFilteredData = () => {
    const today = new Date();
    let range: { start: Date; end: Date };

    if (filter === "weekly") {
      range = getWeekRange(today);
    } else if (filter === "monthly") {
      range = getMonthRange(today);
    } else if (filter === "custom") {
      if (!customStart || !customEnd) return [];

      range = {
        start: new Date(customStart),
        end: new Date(customEnd),
      };

      range.start.setHours(0, 0, 0, 0);
      range.end.setHours(23, 59, 59, 999);
    } else {
      return data;
    }

    return data
      .filter((row) => {
        const d = new Date(row.date);
        return d >= range.start && d <= range.end;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredData = getFilteredData();

  const getFilterLabel = () => {
    const today = new Date();

    if (filter === "weekly") {
      const { start, end } = getWeekRange(today);
      return formatRange(start, end);
    }

    if (filter === "monthly") {
      const { start, end } = getMonthRange(today);
      return formatRange(start, end);
    }

    if (filter === "custom") {
      if (!customStart || !customEnd) return "Custom Range";
      return formatRange(new Date(customStart), new Date(customEnd));
    }

    return "All Records";
  };

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

        {/* HEADER (UNCHANGED) */}
        <div className="student-profile-header">
          <h2>Student Attendance Report</h2>

          <div className="student-header-row">
            <div className="main-name">
              <h3>{firstName} {lastName}</h3>
            </div>

            <div className="student-pills">
              <span className="pill">
                ID: {clinician?.student_number ?? "—"}
              </span>

              <span
                className="pill"
                style={{
                  backgroundColor: `${groupColor}15`,
                  border: `1px solid ${groupColor}40`,
                  color: groupColor,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FaTooth />
                {groupName}
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLS (UNCHANGED) */}
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

          <button
            className="download-action-btn"
            onClick={() =>
              exportAttendancePDF({
                data: filteredData.map((item) => ({
                  date: item.date,
                  shift: item.shift,
                  status: "Present",
                  profiles: item.profiles,
                  clinician: item.clinician,
                  sections: item.sections,
                })),

                studentName: `${firstName} ${lastName}`,
                studentGroup: groupName,

                filterType: filter,
                filterRangeLabel: getFilterLabel(),
              })
            }
          >
            <FiDownload size={16} />
            Download
          </button>
        </div>

        {/* CUSTOM RANGE (UNCHANGED) */}
        {filter === "custom" && (
          <div className="custom-range-picker">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <span>to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        )}

        <div className="range-label">
          {(filter === "weekly" || filter === "monthly") && (
            <span className="range-text">
              <span className="range-title">Date Range:</span>{" "}
              {getFilterLabel()}
            </span>
          )}
        </div>

        {/* TABLE (UNCHANGED UI) */}
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
                  <tr key={row.attendance_id}>
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