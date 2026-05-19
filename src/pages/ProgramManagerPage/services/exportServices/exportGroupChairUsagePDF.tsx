import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImage from "../../asset/DentrackPDFLogo.png";
import { drawPDFCommonFooter } from "../exportUtilsAndComponents/pdfFooter";
import {
  formatPDFDate,
  formatPDFDateRange,
} from "../exportUtilsAndComponents/pdfDateFormatter";

export type ChairUsageRow = {
  attendance_id?: string | number;
  request_id?: number;
  date?: string;
  shift?: string;

  sections?: {
    section_name?: string;
    rooms?: {
      room_name?: string;
    };
  };

  dental_chairs_request_assignment?: {
    date?: string;
    shift?: string;
    sections?: {
      section_name?: string;
      rooms?: {
        room_name?: string;
      };
    };
  };
};

type ExportParams = {
  data: ChairUsageRow[];
  filterType: "weekly" | "monthly" | "custom";
  filterRangeLabel: string;

  startDate?: string;
  endDate?: string;
};

export const exportGroupChairUsagePDF = ({
  data,
  filterType,
  filterRangeLabel,
  startDate,
  endDate,
}: ExportParams) => {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 14;

  const ROOM_LIST = ["OD", "OS", "OM", "OP", "PROSTHO", "ORTHO"];

  // =========================================================
  // SAFE DATE FORMAT
  // =========================================================
  const toKey = (d: string) => {
    if (!d) return null;
    return d.split("T")[0];
  };

  const parseRangeKey = (label: string) => {
    const parts = label.split(" - ");
    if (parts.length < 2) return { start: "0000-01-01", end: "9999-12-31" };
    return {
      start: parts[0].trim(),
      end: parts[1].trim(),
    };
  };

  const getRange = () => {
    if (filterType === "custom") {
      const start = startDate ? toKey(startDate) : null;
      const end = endDate ? toKey(endDate) : null;

      if (start && end) return { start, end };
    }

    return parseRangeKey(filterRangeLabel);
  };

  const { start: startKey, end: endKey } = getRange();

  // =========================================================
  // FILTER DATA
  // =========================================================
  const filteredData = data.filter((row: any) => {
    const rawDate = row.date ?? row.dental_chairs_request_assignment?.date;
    const key = toKey(rawDate);
    if (!key) return false;

    return key >= startKey && key <= endKey;
  });

  // =========================================================
  // MATRIX
  // =========================================================
  const matrix: Record<
    string,
    Record<string, Record<string, Record<string, number>>>
  > = {};

  const seen = new Set<string>();

  filteredData.forEach((row: any) => {
    const rawDate = row.date ?? row.dental_chairs_request_assignment?.date;
    const shift = row.shift ?? row.dental_chairs_request_assignment?.shift;

    const rawRoom =
      row.dental_chairs_request_assignment?.sections?.rooms?.room_name ??
      row.sections?.rooms?.room_name ??
      "";

    const room = rawRoom.trim().toUpperCase();

    const subsection =
      row.dental_chairs_request_assignment?.sections?.section_name ??
      row.sections?.section_name ??
      "";

    const attendanceId = row.attendance_id ?? "N/A";
    const requestId = row.request_id ?? "N/A";

    if (!rawDate || !shift || !room || !subsection) return;

    const dateKey = toKey(rawDate);
    if (!dateKey) return;

    const key = `${attendanceId}-${requestId}-${dateKey}-${shift}-${room}-${subsection}`;

    if (seen.has(key)) return;
    seen.add(key);

    if (!matrix[dateKey]) matrix[dateKey] = {};
    if (!matrix[dateKey][shift]) matrix[dateKey][shift] = {};
    if (!matrix[dateKey][shift][room]) matrix[dateKey][shift][room] = {};
    if (!matrix[dateKey][shift][room][subsection]) {
      matrix[dateKey][shift][room][subsection] = 0;
    }

    matrix[dateKey][shift][room][subsection] += 1;
  });

  // =========================================================
  // TABLE BUILD
  // =========================================================
  const tableBody: any[] = [];
  const roomTotals: Record<string, number> = {};
  let overallTotal = 0;

  ROOM_LIST.forEach((r) => (roomTotals[r] = 0));

  Object.keys(matrix)
    .sort()
    .forEach((dateKey) => {
      const shifts = Object.keys(matrix[dateKey]).sort();

      shifts.forEach((shift, index) => {
        const row: any[] = [
          index === 0 ? formatPDFDate(dateKey) : "",
          shift,
        ];

        let rowTotal = 0;

        ROOM_LIST.forEach((room) => {
          const roomData = matrix[dateKey]?.[shift]?.[room];

          let roomShiftTotal = 0;

          if (roomData) {
            Object.values(roomData).forEach((count) => {
              roomShiftTotal += count;
            });
          }

          row.push(roomShiftTotal);
          roomTotals[room] += roomShiftTotal;
          rowTotal += roomShiftTotal;
        });

        row.push(rowTotal);
        overallTotal += rowTotal;
        tableBody.push(row);
      });
    });

  const grandTotalRow: any[] = ["GRAND TOTAL", ""];

  ROOM_LIST.forEach((room) => {
    grandTotalRow.push(roomTotals[room]);
  });

  grandTotalRow.push(overallTotal);
  tableBody.push(grandTotalRow);

  // =========================================================
  // HEADER
  // =========================================================
  const textXOffset = 86;
  const headerStartY = 18;
  const lineGap = 7;
  const fontFamily = "helvetica";

  const formattedType =
    filterType.charAt(0).toUpperCase() + filterType.slice(1);

  const displayRange = formatPDFDateRange(filterRangeLabel);

  doc.addImage(logoImage, "PNG", margin, 12, 65, 22);

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.6);
  doc.line(82, 12, 82, 34);

  doc.setFont(fontFamily);

  doc.setTextColor(74, 37, 107);
  doc.setFontSize(13);
  doc.setFont(fontFamily, "bold");
  doc.text("Dental Chair Usage Report", textXOffset, headerStartY);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(13);
  doc.setFont(fontFamily, "bold");
  doc.text("All Dental Clinical Rooms", textXOffset, headerStartY + lineGap);

  doc.setFontSize(11);
  doc.setFont(fontFamily, "normal");

  doc.text(
    `${formattedType}: ${displayRange}`,
    textXOffset,
    headerStartY + lineGap * 2
  );

  // =========================================================
  // FILENAME BUILDER (UPDATED - NO DATE FOR CUSTOM)
  // =========================================================
  const buildFileName = () => {
    const type = "DCU";

    const uniqueRooms = Array.from(
      new Set(
        data.map((r: any) =>
          (
            r.dental_chairs_request_assignment?.sections?.rooms?.room_name ??
            r.sections?.rooms?.room_name ??
            ""
          ).trim().toUpperCase()
        )
      )
    ).filter(Boolean);

    const isAllRooms =
      uniqueRooms.length === 0 ||
      uniqueRooms.length > 1 ||
      uniqueRooms.length === ROOM_LIST.length;

    const scope = isAllRooms ? "AllRooms" : `${uniqueRooms[0]}Room`;

    // CUSTOM → NO DATE RANGE (IMPORTANT CHANGE)
    if (filterType === "custom") {
      return `${type}_Custom_${scope}.pdf`;
    }

    return `${type}_${formattedType}_${scope}.pdf`;
  };

  // =========================================================
  // TABLE RENDER
  // =========================================================
  if (!tableBody.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      "No Records Found",
      doc.internal.pageSize.getWidth() / 2,
      90,
      { align: "center" }
    );

    drawPDFCommonFooter({ doc });
    const blob = doc.output("blob");
    window.open(URL.createObjectURL(blob));
    return;
  }

  autoTable(doc, {
    startY: 42,
    margin: { left: margin, right: margin },
    theme: "grid",

    head: [["Date", "Shift", ...ROOM_LIST, "TOTAL"]],
    body: tableBody,

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.5,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fillColor: [74, 37, 107],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },

    didParseCell: (data) => {
      if (data.section !== "body") return;

      const row = data.row.raw as any[];
      const isGrandTotal = row?.[0] === "GRAND TOTAL";

      if (isGrandTotal) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [0, 0, 0];
      }

      if (data.row.index % 2 === 1) {
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
  });

  drawPDFCommonFooter({ doc });

  const fileName = buildFileName();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
};