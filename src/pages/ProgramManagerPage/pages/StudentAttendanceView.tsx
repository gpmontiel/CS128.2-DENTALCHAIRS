import React, { useEffect, useRef, useState } from "react";
import { FiSearch, FiX, FiFileText, FiEye } from "react-icons/fi";
import { FaTooth } from "react-icons/fa6";

import "../css/StudentAttendancePage.css";
import ExportModal from "../components/ExportModal";

import { fetchStudentCMService } from "../services/fetchStudentCMService";
import type { ChairManagerStudent } from "../services/fetchStudentCMService";

import ViewStudentAttendancePopup from "../components/ViewStudentAttendancePopup";

const groups = [
  "All Student Groups",
  "PCB Sinag",
  "PCB Agos",
  "PCB Banaag",
  "Non-PCB",
] as const;

type GroupType = typeof groups[number];

const groupColors: Record<string, string> = {
  "PCB Sinag": "#F59E0B",
  "PCB Agos": "#2563EB",
  "PCB Banaag": "#7C3AED",
  "Non-PCB": "#10B981",
};

const StudentAttendanceView: React.FC = () => {
  const [selected, setSelected] = useState<GroupType>(groups[0]);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<ChairManagerStudent[]>([]);

  // POPUP STATES
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (group: GroupType) => {
    setSelected(group);
    setOpen(false);
  };

  // close dropdown on outside click
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

  // fetch data
  useEffect(() => {
    const load = async () => {
      const data = await fetchStudentCMService(selected, search);
      setStudents(data);
    };

    load();
  }, [selected, search]);

  return (
    <div className="attendance-wrapper">
      <div className="attendance-container">

        {/* TOOLBAR */}
        <div className="toolbar">

          {/* SEARCH */}
          <div className="search-bar">
            <FiSearch className="search-icon" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Student by Name"
              className="input-field"
            />

            {search && (
              <button className="btn-clear" onClick={() => setSearch("")}>
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

          {/* EXPORT GROUP */}
          <button
            className="btn-export-group"
            onClick={() => setIsModalOpen(true)}
          >
            <FiFileText style={{ marginRight: 6 }} />
            Group Export
          </button>

        </div>

        {/* STUDENTS */}
        <div className="student-content">

          {students.length === 0 ? (
            <p className="no-student-content">No students were found.</p>
          ) : (
            students.map((student) => {
              const color =
                groupColors[student.group_name] || "#64748b";

              return (
                <div
                  key={student.student_id}
                  className="student-card"
                >
                  <img
                    src={student.pfp || ""}
                    className="student-pfp"
                  />

                  <div className="student-info">
                    <h3>
                      {student.first_name} {student.last_name}
                    </h3>

                    <p className="student-number">
                      {student.student_number}
                    </p>

                    <span
                      className="group-badge"
                      style={{
                        backgroundColor: `${color}15`,
                        color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <FaTooth />
                      {student.group_name}
                    </span>
                  </div>

                  {/* ✅ OPEN POPUP FOR THIS STUDENT */}
                  <button
                    className="export-individual-btn"
                    onClick={() => {
                      setSelectedStudentId(String(student.student_id));
                      setIsPopupOpen(true);
                    }}
                  >
                    <FiEye />
                    View Attendance
                  </button>
                </div>
              );
            })
          )}

        </div>
      </div>

      {/* GROUP EXPORT MODAL */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* INDIVIDUAL STUDENT POPUP */}
      <ViewStudentAttendancePopup
        isOpen={isPopupOpen}
        studentId={selectedStudentId}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedStudentId(null);
        }}
      />
    </div>
  );
};

export default StudentAttendanceView;