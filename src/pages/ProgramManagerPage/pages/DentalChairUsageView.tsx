import React, { useEffect, useState } from 'react';
import '../css/DentalChairUsagePage.css';

import { FaFilePdf } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { FiEye } from "react-icons/fi";

import ExportModal from "../components/ExportModal";
import { fetchDentalRoomService } from "../services/fetchDentalRoomService";

type GroupedRoom = {
  id: string;
  name: string;
  descriptions: string[];
  chairCount: number;
};

const DentalChairUsageView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clinicSections, setClinicSections] = useState<GroupedRoom[]>([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchDentalRoomService();
        const groupedRooms: Record<string, GroupedRoom> = {};

        data.forEach((item: any) => {
          if (!item.rooms) return;
          const roomId = item.rooms.room_id;
          if (!groupedRooms[roomId]) {
            groupedRooms[roomId] = {
              id: roomId,
              name: item.rooms.room_name,
              descriptions: [],
              chairCount: 0,
            };
          }

          if (item.section_name) {
            groupedRooms[roomId].descriptions.push(
              item.section_name
            );
          }

          groupedRooms[roomId].chairCount +=
            item.chair_count || 0;
        });

        setClinicSections(
          Object.values(groupedRooms)
        );
      } catch (error) {
        console.error(
          "Failed to fetch dental rooms:",
          error
        );
      }
    };

    loadRooms();

  }, []);

  return (
    <div className="dentrack-container">

      {/* TOP BUTTON */}
      <div className="global-action-container">
        <button
          className="btn-download-all"
          onClick={() => setIsModalOpen(true)}
        >
          <FaFilePdf />
          Export All Chair Usage
        </button>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="dent-table">
          <thead>
            <tr>
              <th>Clinic Rooms</th>
              <th>Clinic Sections</th>
              <th>Chair Count</th>
              <th>Dental Chair Usage Report</th>
            </tr>
          </thead>
          <tbody>
            {clinicSections.map((section) => (
              <tr key={section.id}>

                {/* ROOM */}
                <td
                  className="col-section"
                  data-label="Clinic Rooms"
                >
                  <div className="section-flex">
                    <span className="section-title-badge">
                      {section.name}
                    </span>
                  </div>
                </td>

                {/* SECTIONS */}
                <td
                  className="col-details-narrow"
                  data-label="Clinic Sections"
                >
                  <div className="pill-container">
                    {section.descriptions.length === 0 ? (
                      <span className="pill-badge pill-empty">
                        No Recorded Sections
                      </span>
                    ) : (
                      section.descriptions.map((tag, i) => (
                        <span
                          key={i}
                          className="pill-badge"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </td>

                {/* COUNT */}
                <td
                  className="col-count"
                  data-label="Chair Count"
                >
                  <div className="chair-count-flex">
                    <MdAirlineSeatReclineNormal
                      className="icon-chair"
                    />
                    <span className="count-number">
                      {section.chairCount}
                    </span>
                  </div>
                </td>

                {/* ACTION */}
                <td className="col-action" data-label="Report">
                  <button
                    className="btn-row-download"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FiEye />
                    View Room Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* MODAL */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DentalChairUsageView;