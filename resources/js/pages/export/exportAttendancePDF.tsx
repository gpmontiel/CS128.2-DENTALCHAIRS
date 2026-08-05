import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import { formatPDFDate, formatPDFDateRange } from "./pdfDateFormatter";
import { drawPDFCommonFooter } from "./pdfFooter";

export type AttendanceWithClinician = {
    date: string;
    shift: string;
    room_name: string;
    section_name: string;
    status: string;
};

interface RoomUsage {
    id: number;
    room_name: string;
}

type ExportParams = {
    data: AttendanceWithClinician[];
    studentName: string;
    studentGroup: string;
    filterType: string;
    filterRangeLabel: string;
    rooms: RoomUsage[];
};

const DATE_BG: [number, number, number] = [245, 245, 245];

export const exportAttendancePDF = ({data, studentName, studentGroup, filterType, filterRangeLabel, rooms,}: ExportParams) => {
    const doc = new jsPDF("p", "mm", "a4");

    const tableMargin = 14;
    const dateColWidth = 32;
    const totalColWidth = 22;

    const logoImage = "/images/DentrackPdfLogo.png";

    const roomsList = rooms.map(r => r.room_name.toUpperCase().trim());

    // -----------------------------
    // GROUP DATA
    // -----------------------------
    const groupedData: Record<string, any> = {};

    data.forEach((row) => {
        const dateObj = new Date(row.date);
        const formattedDate = dateObj.toISOString().split("T")[0];
        const displayDate = formatPDFDate(formattedDate);

        if (!groupedData[formattedDate]) {
            groupedData[formattedDate] = { _label: displayDate };
            roomsList.forEach(roomName => {
                groupedData[formattedDate][roomName] = { am: 0, pm: 0 };
            });
        }

        const roomKey = (row.room_name || "").toUpperCase().trim();
        const shift = (row.shift || "").toUpperCase();

        if (roomKey && groupedData[formattedDate][roomKey]) {
            if (row.status === "Present") {
                const val = shift === "AM" ? "am" : "pm";
                groupedData[formattedDate][roomKey][val] += 0.5;
            }
        }
    });

    let grandTotal = 0;

    const tableBody = Object.keys(groupedData)
        .sort()
        .map((key) => {
            const row = groupedData[key];
            let rowTotal = 0;

            const cells = roomsList.map((room) => {
                const amVal = row[room].am;
                const pmVal = row[room].pm;
                const total = amVal + pmVal;
                rowTotal += total;

                if (total === 0) {
                    return "";
                }

                let shiftTag = "";

                if (amVal > 0 && pmVal > 0) {
                    shiftTag = "BOTH";
                } else if (amVal > 0) {
                    shiftTag = "AM";
                } else if (pmVal > 0) {
                    shiftTag = "PM";
                }

                return `${total}|${shiftTag}`;
            });

            grandTotal += rowTotal;

            return [row._label || "", ...cells, rowTotal.toString()];
        });

    if (tableBody.length > 0) {
        tableBody.push(["GRAND TOTAL", ...roomsList.map(() => ""), grandTotal.toString()]);
    }

    // -----------------------------
    // HEADER
    // -----------------------------
    try {
        doc.addImage(logoImage, "PNG", tableMargin, 12, 65, 22);
    } catch(e) {
        console.warn("Logo not found, skipping image.");
    }

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.6);
    doc.line(82, 12, 82, 34);

    const textXOffset = 86;
    const headerStartY = 18;
    const lineGap = 7;
    const fontFamily = "helvetica";

    doc.setFont(fontFamily, "bold");
    doc.setTextColor(74, 37, 107);
    doc.setFontSize(13);
    doc.text("Student Dental Clinic Attendance Report:", textXOffset, headerStartY);

    doc.setTextColor(0, 0, 0);
    doc.text(`${studentName} (${studentGroup})`, textXOffset, headerStartY + lineGap);

    const prettyFilter = filterType.charAt(0).toUpperCase() + filterType.slice(1).toLowerCase();

    doc.setFontSize(11);
    doc.setFont(fontFamily, "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`${prettyFilter}: ${formatPDFDateRange(filterRangeLabel)}`, textXOffset, headerStartY + lineGap * 2);

    const legendY = headerStartY + lineGap * 3 + 3;

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Legend: AM (Blue), PM (Orange), Whole Day (Purple)", tableMargin, legendY);
    doc.text("Note: One shift per student = 0.5 credit", tableMargin, legendY + 4);

    // -----------------------------
    // TABLE
    // -----------------------------
    const hasData = Object.keys(groupedData).length > 0;

    if (!hasData) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(120);
        doc.text("No Records Found", doc.internal.pageSize.getWidth() / 2, 90, { align: "center" });
    } else {
        autoTable(doc, {
            startY: legendY + 7,
            margin: { left: tableMargin, right: tableMargin },
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
            },
            columnStyles: {
                0: { cellWidth: dateColWidth, fillColor: DATE_BG },
                [roomsList.length + 1]: { cellWidth: totalColWidth, fontStyle: "bold" },
            },
            didParseCell: (data) => {
                const isGT = data.row.index === tableBody.length - 1;

                if (isGT) {
                    if (data.column.index === roomsList.length + 1) {
                        data.cell.styles.fontStyle = "bold";
                    }

                    return;
                }

                if (data.column.index > 0 && data.column.index <= roomsList.length) {
                    const raw = data.cell.raw;

                    if (typeof raw === "string" && raw.includes("|")) {
                        const [value, shift] = raw.split("|");
                        data.cell.text = [value];

                        if (shift === "BOTH" || value === "1" || value === "1.0") {
                            data.cell.styles.fillColor = [232, 177, 248];
                        } else if (shift === "AM") {
                            data.cell.styles.fillColor = [173, 216, 255];
                        } else if (shift === "PM") {
                            data.cell.styles.fillColor = [255, 220, 180];
                        }
                    }
                }
            },
        });
    }

    // -----------------------------
    // FOOTER & DOWNLOAD
    // -----------------------------
    drawPDFCommonFooter({ doc });

    const nameSegment = (() => {
        if (!studentName?.trim()) {
return "Student";
}

        const nameParts = studentName.trim().split(/\s+/);

        if (nameParts.length > 1) {
            const lastName = nameParts[nameParts.length - 1];
            const firstName = nameParts.slice(0, -1).join("_");

            return `${lastName}_${firstName}`;
        }

        return nameParts[0];
    })();

    const filename = `SAR_${prettyFilter}_${nameSegment}.pdf`;
    doc.save(filename);
};
