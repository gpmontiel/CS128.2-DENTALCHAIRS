import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import logoImage from "../../asset/DentrackPDFLogo.png";
import { drawPDFCommonFooter } from "../exportUtilsAndComponents/pdfFooter";
import {
  formatPDFDate,
  formatPDFDateRange,
} from "../exportUtilsAndComponents/pdfDateFormatter";

export type AttendanceWithClinician = {
  date: string;
  shift: string;
  status: "Present";
  profiles?: any;
  clinician?: any;
  sections?: any;
};

type ExportParams = {
  data: AttendanceWithClinician[];
  studentName: string;
  studentGroup: string;
  filterType: string;
  filterRangeLabel: string;
};

const mapRoomToAcronym = (roomName: string): string => {
  if (!roomName) return "";

  const name = roomName.toUpperCase().trim();

  const map: Record<string, string> = {
    OD: "OD",
    OS: "OS",
    OM: "OM",
    OP: "OP",
    PROSTHO: "PROSTHO",
    ORTHO: "ORTHO",
  };

  return map[name] || "";
};

const DATE_BG: [number, number, number] = [245, 245, 245];

export const exportAttendancePDF = ({
  data,
  studentName,
  studentGroup,
  filterType,
  filterRangeLabel,
}: ExportParams) => {
  const doc = new jsPDF("p", "mm", "a4");

  const tableMargin = 14;

  const dateColWidth = 32;
  const totalColWidth = 22;

  const roomsList = ["OD", "OS", "OM", "OP", "PROSTHO", "ORTHO"];

  const roomColWidth =
    (doc.internal.pageSize.getWidth() -
      tableMargin * 2 -
      dateColWidth -
      totalColWidth) /
    6;

  // -----------------------------
  // GROUP DATA
  // -----------------------------
  const groupedData: Record<
    string,
    Record<string, { am: number; pm: number }> & { _label?: string }
  > = {};

  data.forEach((row) => {
    const dateObj = new Date(row.date);
    const formattedDate = dateObj.toISOString().split("T")[0];

    const displayDate = formatPDFDate(formattedDate);

    if (!groupedData[formattedDate]) {
      groupedData[formattedDate] = {
        OD: { am: 0, pm: 0 },
        OS: { am: 0, pm: 0 },
        OM: { am: 0, pm: 0 },
        OP: { am: 0, pm: 0 },
        PROSTHO: { am: 0, pm: 0 },
        ORTHO: { am: 0, pm: 0 },
      };
    }

    const roomKey = mapRoomToAcronym(
      row.sections?.rooms?.room_name || ""
    );

    const shift = (row.shift || "").toUpperCase();

    if (
      roomKey &&
      groupedData[formattedDate][roomKey]
    ) {
      if (row.status === "Present") {
        const val = shift === "AM" ? "am" : "pm";
        groupedData[formattedDate][roomKey][val] += 0.5;
      }
    }

    groupedData[formattedDate]._label = displayDate;
  });

  let grandTotal = 0;

  const tableBody = Object.keys(groupedData)
    .sort()
    .map((key) => {
      const row = groupedData[key];

      let rowTotal = 0;

      const cells = roomsList.map((room) => {
        const total = row[room].am + row[room].pm;
        rowTotal += total;

        if (total === 0) return "";

        const shiftTag = row[room].am > 0 ? "AM" : "PM";
        return `${total}|${shiftTag}`;
      });

      grandTotal += rowTotal;

      return [
        row._label || "",
        ...cells,
        rowTotal.toString(),
      ];
    });

  if (tableBody.length > 0) {
    tableBody.push([
      "GRAND TOTAL",
      "",
      "",
      "",
      "",
      "",
      "",
      grandTotal.toString(),
    ]);
  }

  // -----------------------------
  // HEADER
  // -----------------------------
  doc.addImage(logoImage, "PNG", tableMargin, 12, 65, 22);

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
  doc.text(
    `${studentName} (${studentGroup})`,
    textXOffset,
    headerStartY + lineGap
  );

  const prettyFilter =
    filterType.charAt(0).toUpperCase() +
    filterType.slice(1);

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

  const legendY = headerStartY + lineGap * 3 + 3;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Legend: AM (Blue), PM (Orange)",
    tableMargin,
    legendY
  );

  doc.text(
    "Note: One shift per student = 0.5 credit",
    tableMargin,
    legendY + 4
  );

  // -----------------------------
  // TABLE OR EMPTY STATE
  // -----------------------------
  const hasData = Object.keys(groupedData).length > 0;

  if (!hasData) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(120);

    doc.text(
      "No Records Found",
      doc.internal.pageSize.getWidth() / 2,
      90,
      { align: "center" }
    );
  } else {
    autoTable(doc, {
      startY: legendY + 7,

      margin: {
        left: tableMargin,
        right: tableMargin,
      },

      theme: "grid",
      head: [["Date", ...roomsList, "TOTAL"]],

      body: tableBody,

      styles: {
        font: fontFamily,
        fontSize: 9,
        cellPadding: 2.5,
        halign: "center",
        valign: "middle",
        textColor: [50, 50, 50],
      },

      headStyles: {
        fillColor: [74, 37, 107],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        font: fontFamily,
      },

      columnStyles: {
        0: {
          cellWidth: dateColWidth,
          fillColor: DATE_BG,
        },
        1: { cellWidth: roomColWidth },
        2: { cellWidth: roomColWidth },
        3: { cellWidth: roomColWidth },
        4: { cellWidth: roomColWidth },
        5: { cellWidth: roomColWidth },
        6: { cellWidth: roomColWidth },
        7: {
          cellWidth: totalColWidth,
          fontStyle: "bold",
        },
      },

      didParseCell: (data) => {
        const isGT =
          data.row.index === tableBody.length - 1;

        if (isGT) {
          const isLastCol = data.column.index === 7;

          if (isLastCol) {
            data.cell.styles.fillColor = [
              229, 169, 242,
            ];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.fontStyle = "normal";
          }
          return;
        }
        if (
          data.column.index > 0 &&
          data.column.index < 7
        ) {
          const raw = data.cell.raw;
          if (
            typeof raw === "string" &&
            raw.includes("|")
          ) {
            const [value, shift] = raw.split("|");
            data.cell.text = [value];

            if (shift === "AM") {
              data.cell.styles.fillColor = [
                173, 216, 255,
              ];
            }

            if (shift === "PM") {
              data.cell.styles.fillColor = [
                255, 220, 180,
              ];
            }
          }
        }
      },
    });
  }

  // -----------------------------
  // FOOTER
  // -----------------------------
  drawPDFCommonFooter({ doc });

  const blob = doc.output("blob");
  window.open(URL.createObjectURL(blob));
};