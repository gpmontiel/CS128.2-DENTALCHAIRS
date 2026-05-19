import React, { useEffect, useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import { FaTooth } from "react-icons/fa6";

import "../css/DentalChairUsagePopup.css";

import { fetchChairUsageService } from "../services/fetchChairUsageService";
import { exportChairUsagePDF } from "../services/exportServices/exportChairUsagePDF";

type Props = {
  isOpen: boolean;
  roomName: string;
  onClose: () => void;
};

const ViewDentalChairUsagePopup: React.FC<Props> = ({
  isOpen,
  roomName,
  onClose,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("weekly");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // ===============================
  // FETCH
  // ===============================
  useEffect(() => {
    const load = async () => {
      if (!isOpen || !roomName) return;

      setLoading(true);
      try {
        const res = await fetchChairUsageService(roomName);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, roomName]);

  if (!isOpen) return null;

  // ===============================
  // DATE RANGE FUNCTIONS (UNCHANGED)
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

  const getRange = () => {
    if (filter === "weekly") return getWeekRange(new Date());
    if (filter === "monthly") return getMonthRange(new Date());

    if (filter === "custom") {
      if (!customStart || !customEnd) return null;

      const start = new Date(customStart);
      const end = new Date(customEnd);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    }

    return null;
  };

  const range = getRange();

  // ===============================
  // FILTER DATA (UNCHANGED)
  // ===============================
  const filteredData = data.filter((row: any) => {
    const assignment = row.dental_chairs_request_assignment;
    if (!assignment?.date) return false;

    const date = new Date(assignment.date);

    if (filter === "custom" && !range) return false;
    if (!range) return true;

    return date >= range.start && date <= range.end;
  });

  // ===============================
  // 🔥 NEW: GROUP BY DATE + SECTION + AM/PM
  // ===============================
  const groupedMap: Record<
    string,
    {
      date: string;
      section: string;
      AM: number;
      PM: number;
    }
  > = {};

  filteredData.forEach((row: any) => {
    const a = row.dental_chairs_request_assignment;
    if (!a?.date) return;

    const dateKey = new Date(a.date).toISOString().split("T")[0];
    const section = a?.sections?.section_name ?? "—";
    const shift = a?.shift;

    const key = `${dateKey}-${section}`;

    if (!groupedMap[key]) {
      groupedMap[key] = {
        date: a.date,
        section,
        AM: 0,
        PM: 0,
      };
    }

    if (shift === "AM") groupedMap[key].AM += 1;
    if (shift === "PM") groupedMap[key].PM += 1;
  });

  const sortedData = Object.values(groupedMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // ===============================
  // LABEL (UNCHANGED)
  // ===============================
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

  const formatFullDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleDownload = () => {
    exportChairUsagePDF({
      data: filteredData,
      filterType: filter,
      filterRangeLabel: getFilterLabel(),
      roomName,
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">

        <button className="close-btn" onClick={onClose}>
          <FiX size={18} />
        </button>

        {/* HEADER */}
        <div className="usage-header">
          <h2>Dental Chair Usage Report</h2>

          <div className="student-header-row">
            <div className="main-name">
              <h3>
                <FaTooth style={{ marginRight: 8 }} />
                {roomName}
              </h3>
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

          <button className="download-action-btn" onClick={handleDownload}>
            <FiDownload size={16} />
            Download
          </button>
        </div>

        {/* CUSTOM RANGE */}
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

        <div className="range-label">
          {(filter === "weekly" || filter === "monthly") && (
            <span className="range-text">
              <span className="range-title">Date Range:</span>{" "}
              {getFilterLabel()}
            </span>
          )}
        </div>

        {/* TABLE */}
        <div className="popup-content-body">

          {loading ? (
            <div className="state-message">Loading...</div>
          ) : sortedData.length === 0 ? (
            <div className="state-message">No records found.</div>
          ) : (
            <table className="attendance-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Section</th>
                  <th>AM</th>
                  <th>PM</th>
                </tr>
              </thead>

              <tbody>
                {sortedData.map((row: any, index: number) => (
                  <tr key={index}>
                    <td>{formatFullDate(row.date)}</td>
                    <td>{row.section}</td>
                    <td>{row.AM || ""}</td>
                    <td>{row.PM || ""}</td>
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

export default ViewDentalChairUsagePopup;