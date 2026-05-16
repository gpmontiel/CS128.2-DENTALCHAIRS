import React, { useState } from 'react';
import '../css/DentalChairUsagePage.css';

import { FaFilePdf } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import ExportModal from "../components/ExportModal";

const clinicSections = [
  {
    id: 'OD',
    name: 'OD',
    description: 'Oral Diagnosis, Triage',
    chairCount: 4,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'OS',
    name: 'OS',
    description: 'No Recorded Sections',
    chairCount: 8,
    image: 'https://www.docseducation.com/sites/default/files/inline-images/bl-ex-5_25.jpg',
  },
  {
    id: 'OM',
    name: 'OM',
    description: 'Perio, Endo',
    chairCount: 26,
    image: 'https://s3-media0.fl.yelpcdn.com/bphoto/cxqdwB4u1F0DEHF6yK9jxg/348s.jpg',
  },
  {
    id: 'OP',
    name: 'OP',
    description: 'FPD, Resto',
    chairCount: 28,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRFLGFgh3M1T0c3eUB9ogPo7GlL9T04CdGZQ&s',
  },
  {
    id: 'PROSTHO',
    name: 'PROSTHO',
    description: 'RPD, Complete Dentures',
    chairCount: 26,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmRyX4oupk9hcDKh6ijR6ddjv5kZKdA3a7aA&s',
  },
  {
    id: 'ORTHO',
    name: 'ORTHO',
    description: 'No Recorded Sections',
    chairCount: 12,
    image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=300&q=80',
  },
];

const DentalChairUsageView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              <th>Clinic Section</th>
              <th>Detailed Sections</th>
              <th>Chair Count</th>
              <th>Report</th>
            </tr>
          </thead>

          <tbody>
            {clinicSections.map((section) => (
              <tr key={section.id}>

                {/* SECTION */}
                <td className="col-section" data-label="Clinic Section">
                  <div className="section-flex">
                    <img
                      src={section.image}
                      className="section-img-enlarged"
                      alt={section.name}
                    />
                    <span className="section-title-badge">
                      {section.name}
                    </span>
                  </div>
                </td>

                {/* DETAILS */}
                <td className="col-details-narrow" data-label="Detailed Sections">
                  <div className="pill-container">
                    {section.description.includes('No Recorded Sections') ? (
                      <span className="pill-badge pill-empty">
                        {section.description}
                      </span>
                    ) : (
                      section.description.split(',').map((tag, i) => (
                        <span key={i} className="pill-badge">
                          {tag.trim()}
                        </span>
                      ))
                    )}
                  </div>
                </td>

                {/* COUNT */}
                <td className="col-count" data-label="Chair Count">
                  <div className="chair-count-flex">
                    <MdAirlineSeatReclineNormal className="icon-chair" />
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
                    <FaFilePdf />
                    Generate Report
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