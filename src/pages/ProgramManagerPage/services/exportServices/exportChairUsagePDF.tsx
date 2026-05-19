import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImage from "../../asset/DentrackPDFLogo.png";
import { drawPDFCommonFooter } from "../exportUtilsAndComponents/pdfFooter";
import { formatPDFDate } from "../exportUtilsAndComponents/pdfDateFormatter";

export type ChairUsageRow = {
  date?: string;
  shift?: string;
  status?: "Used" | "Unused";
  sections?: any;

  dental_chairs_request_assignment?: {
    date?: string;
    shift?: string;
    status?: string;
    sections?: any;
  };
};

type ExportParams = {
  data: ChairUsageRow[];
  filterType: string;
  filterRangeLabel: string;
  roomName: string;
};

export const exportChairUsagePDF = ({
  data,
  filterType,
  filterRangeLabel,
  roomName,
}: ExportParams) => {
  const doc = new jsPDF("p", "mm", "a4");
  const tableMargin = 14;

  // -----------------------------
  // GROUP BY DATE + SHIFT
  // -----------------------------
  const groupedMap: Record<
    string,
    { date: string; shift: string; chairs: number }[]
  > = {};

  data.forEach((row: any) => {
    const rawDate =
      row.date ?? row.dental_chairs_request_assignment?.date;

    const shift =
      row.shift ?? row.dental_chairs_request_assignment?.shift;

    if (!rawDate || !shift) return;

    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return;

    const dateKey = dateObj.toISOString().split("T")[0];
    const displayDate = formatPDFDate(dateKey);

    if (!groupedMap[dateKey]) {
      groupedMap[dateKey] = [];
    }

    const existing = groupedMap[dateKey].find(
      (x) => x.shift === shift
    );

    if (existing) {
      existing.chairs += 1;
    } else {
      groupedMap[dateKey].push({
        date: displayDate,
        shift,
        chairs: 1,
      });
    }
  });

  // -----------------------------
  // FLATTEN TABLE DATA
  // -----------------------------
  const tableBody: any[] = [];

  Object.keys(groupedMap)
    .sort()
    .forEach((dateKey) => {
      const rows = groupedMap[dateKey];

      rows.forEach((row, index) => {
        tableBody.push([
          index === 0 ? row.date : "",
          row.shift,
          row.chairs.toString(),
        ]);
      });
    });

  // -----------------------------
  // GRAND TOTAL ROW
  // -----------------------------
  const grandTotal = tableBody.reduce(
    (sum, row) => sum + Number(row[2] || 0),
    0
  );

  tableBody.push([
    "",
    "Grand Total",
    grandTotal.toString(),
  ]);

  // -----------------------------
  // SECTION LABELS
  // -----------------------------
  const uniqueSections = Array.from(
    new Set(
      data
        .map(
          (row: any) =>
            row.sections?.section_name ??
            row.dental_chairs_request_assignment?.sections?.section_name
        )
        .filter(Boolean)
    )
  );

  const roomUpper = roomName.trim().toUpperCase();

  const filteredSections = uniqueSections.filter(
    (section) => section.trim().toUpperCase() !== roomUpper
  );

  const roomLabel =
    filteredSections.length > 0
      ? `${roomName} Room (${filteredSections.join(" and ")})`
      : `${roomName} Room`;

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
  doc.text("Dental Chair Usage Report:", textXOffset, headerStartY);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(13);
  doc.setFont(fontFamily, "bold");
  doc.text(roomLabel, textXOffset, headerStartY + lineGap);

  doc.setFontSize(11);
  doc.setFont(fontFamily, "normal");

  const formattedFilterType =
    filterType.charAt(0).toUpperCase() + filterType.slice(1);

  doc.text(
    `${formattedFilterType}: ${filterRangeLabel}`,
    textXOffset,
    headerStartY + lineGap * 2
  );

  const legendY = headerStartY + lineGap * 3;

  // -----------------------------
  // TABLE
  // -----------------------------
  if (tableBody.length === 0) {
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
      startY: legendY + 2,
      margin: { left: tableMargin, right: tableMargin },

      theme: "grid",
      head: [["Date", "Shift", "Chairs Utilized"]],
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
      },

      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
      },

      didParseCell: (data) => {
        const isBodyRow = data.section === "body";
        if (!isBodyRow) return;

        const rowIndex = data.row.index;
        const isGrandTotal = rowIndex === tableBody.length - 1;

        if (isGrandTotal) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [0, 0, 0];
        }

        if (rowIndex % 2 === 1) {
          data.cell.styles.fillColor = [245, 245, 245];
        } else {
          data.cell.styles.fillColor = [255, 255, 255];
        }
      },
    });
  }

  // -----------------------------
  // FOOTER & DOWNLOAD
  // -----------------------------
  drawPDFCommonFooter({ doc });

  // Capitalize filter types cleanly (e.g., "monthly" -> "Monthly")
  const fileFilter = filterType.charAt(0).toUpperCase() + filterType.slice(1).toLowerCase();
  
  // Clean room name by stripping "room" or "Room" strings if present, and discarding spaces
  const cleanRoom = roomName
    .replace(/(room)/i, "")
    .replace(/\s+/g, "");

  // Assemble dynamic filename: e.g., DCU_Monthly_ProsthoRoom.pdf
  const filename = `DCU_${fileFilter}_${cleanRoom}Room.pdf`;

  // Triggers immediate file download dialogue in browser
  doc.save(filename);
};