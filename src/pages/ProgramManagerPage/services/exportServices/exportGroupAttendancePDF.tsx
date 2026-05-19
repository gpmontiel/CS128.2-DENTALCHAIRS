import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImage from "../../asset/DentrackPDFLogo.png";
import { drawPDFCommonFooter } from "../exportUtilsAndComponents/pdfFooter";
import { formatPDFDateRange } from "../exportUtilsAndComponents/pdfDateFormatter";

const roomsList = ["OD", "OS", "OM", "OP", "PROSTHO", "ORTHO"];

export const exportGroupAttendancePDF = ({
  data,
  groupName,
  filterType,
  filterRangeLabel,
}: {
  data: any[];
  groupName: string;
  filterType: "weekly" | "monthly" | "custom";
  filterRangeLabel: string;
}) => {
  const doc = new jsPDF("p", "mm", "a4");

  const tableMargin = 14;

  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - tableMargin * 2;

  const totalWidth = 18;
  const prosthoWidth = 22;
  const orthoWidth = 22;
  const nameWidth = 62;

  const smallColsWidth =
    (usableWidth -
      totalWidth -
      prosthoWidth -
      orthoWidth -
      nameWidth) /
    4;

  const formatNumber = (num: number) =>
    Number.isInteger(num) ? num.toString() : num.toFixed(1);

  // =========================
  // GROUP STUDENTS
  // =========================
  const studentMap: Record<
    string,
    {
      name: string;
      rooms: Record<string, number>;
      total: number;
    }
  > = {};

  data.forEach((row) => {
    const id =
      row?.student_id ||
      row?.clinician?.clinician_id;

    if (!id) return;

    const firstName =
      row?.clinician?.profiles?.first_name || "";

    const lastName =
      row?.clinician?.profiles?.last_name || "";

    const name =
      `${firstName} ${lastName}`.trim() || "Unknown";

    const room = (row?.sections?.rooms?.room_name || "")
      .toUpperCase()
      .trim();

    if (!studentMap[id]) {
      studentMap[id] = {
        name,
        rooms: {
          OD: 0,
          OS: 0,
          OM: 0,
          OP: 0,
          PROSTHO: 0,
          ORTHO: 0,
        },
        total: 0,
      };
    }

    studentMap[id].total += 0.5;

    if (roomsList.includes(room)) {
      studentMap[id].rooms[room] += 0.5;
    }
  });

  const body = Object.values(studentMap).map((student) => [
    student.name,
    ...roomsList.map((room) =>
      student.rooms[room]
        ? formatNumber(student.rooms[room])
        : ""
    ),
    formatNumber(student.total),
  ]);

  // =========================
  // HEADER
  // =========================
  doc.addImage(
    logoImage,
    "PNG",
    tableMargin,
    12,
    65,
    22
  );

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.6);
  doc.line(82, 12, 82, 34);

  const textXOffset = 86;
  const headerStartY = 18;
  const lineGap = 7;

  const fontFamily = "helvetica";

  doc.setFont(fontFamily);

  doc.setTextColor(74, 37, 107);
  doc.setFontSize(13);
  doc.setFont(fontFamily, "bold");

  doc.text(
    "Student Dental Clinic Attendance Report:",
    textXOffset,
    headerStartY
  );

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont(fontFamily, "bold");

  const isAllGroups = groupName.toUpperCase() === "ALL STUDENT GROUPS";

  doc.text(
    isAllGroups ? `${groupName}` : `${groupName} Student Group`,
    textXOffset,
    headerStartY + lineGap
  );

  const prettyFilter = filterType.charAt(0).toUpperCase() + filterType.slice(1).toLowerCase();

  doc.setFontSize(11);
  doc.setFont(fontFamily, "normal");
  doc.setTextColor(60, 60, 60);

  doc.text(
    `${prettyFilter}: ${formatPDFDateRange(
      filterRangeLabel
    )}`,
    textXOffset,
    headerStartY + lineGap * 2
  );

  // NOTE
  const noteY = 46;

  doc.setFontSize(9);
  doc.setTextColor(100);

  doc.text(
    "Note: One shift per student = 0.5 credit",
    tableMargin,
    noteY
  );

  const tableStartY = noteY + 3;

  // =========================
  // EMPTY STATE FIX
  // =========================
  const hasData = Object.keys(studentMap).length > 0;

  if (!hasData) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(140);

    doc.text(
      "No Records Found",
      pageWidth / 2,
      90,
      { align: "center" }
    );
  } else {
    // =========================
    // TABLE
    // =========================
    autoTable(doc, {
      startY: tableStartY,
      head: [["NAME", ...roomsList, "TOTAL"]],
      body,
      theme: "grid",
      tableWidth: usableWidth,
      margin: {
        left: tableMargin,
        right: tableMargin,
      },

      styles: {
        font: "helvetica",
        fontSize: 9,
        halign: "center",
        valign: "middle",
        cellPadding: {
          top: 2.5,
          bottom: 2.5,
          left: 2.25,
          right: 2.25,
        },
        overflow: "linebreak",
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [74, 37, 107],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9.5,
        cellPadding: {
          top: 3.5,
          bottom: 3.5,
          left: 2,
          right: 2,
        },
      },

      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },

      bodyStyles: {
        textColor: 20,
      },

      columnStyles: {
        0: { halign: "left", cellWidth: nameWidth },
        1: { cellWidth: smallColsWidth },
        2: { cellWidth: smallColsWidth },
        3: { cellWidth: smallColsWidth },
        4: { cellWidth: smallColsWidth },
        5: { cellWidth: prosthoWidth },
        6: { cellWidth: orthoWidth },
        7: { fontStyle: "bold", cellWidth: totalWidth },
      },
    });
  }

  // =========================
  // FOOTER & DOWNLOAD
  // =========================
  drawPDFCommonFooter({ doc });

  // Format the group name target for filename generation
  let groupSegment = groupName.trim();
  if (isAllGroups) {
    groupSegment = groupSegment.replace(/\s+/g, "_");
  } else {
    groupSegment = groupSegment.replace(/\s+/g, "");
  }

  const filename = `SAR_${prettyFilter}_${groupSegment}.pdf`;

  doc.save(filename);
};
