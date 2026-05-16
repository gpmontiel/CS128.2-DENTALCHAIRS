import React, { useEffect, useRef, useState } from "react";
import { FiSearch, FiX, FiFileText } from "react-icons/fi";
import "../css/StudentAttendancePage.css";
import ExportModal from "../components/ExportModal";

const groups = [
  "All Student Groups",
  "PCB Sinag",
  "PCB Agos",
  "PCB Banaag",
  "Non-PCB",
] as const;

type GroupType = typeof groups[number];

const StudentAttendanceView: React.FC = () => {
  const [selected, setSelected] = useState<GroupType>(groups[0]);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (group: GroupType) => {
    setSelected(group);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="attendance-wrapper">
      <div className="attendance-container">
        <div className="toolbar">

          {/* SEARCH BAR */}
          <div className="search-bar">
            <FiSearch className="search-icon" />

            {/* CONTROLLED INPUT */}
            <input
              type="text"
              placeholder="Search Student"
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* CLEAR BUTTON */}
            {search && (
              <button
                className="btn-clear"
                onClick={() => setSearch("")}
                type="button"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* DROPDOWN */}
          <div className="dropdown" ref={dropdownRef}>
            <div
              className="dropdown-trigger"
              onClick={() => setOpen(!open)}
            >
              <span>{selected}</span>
              <span>{open ? "▴" : "▾"}</span>
            </div>

            {open && (
              <div className="dropdown-list">
                {groups.map((group) => (
                  <div
                    key={group}
                    className={`dropdown-item ${
                      selected === group ? "active" : ""
                    }`}
                    onClick={() => handleSelect(group)}
                  >
                    {group}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EXPORT BUTTON */}
          <button
            className="btn-export-group"
            onClick={() => setIsModalOpen(true)}
          >
            <FiFileText style={{ marginRight: 6 }} />
            Group Export
          </button>
        </div>

        <div className="student-content">
          Student Attendance Content Here
        </div>
      </div>

      {/* MODAL */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default StudentAttendanceView;