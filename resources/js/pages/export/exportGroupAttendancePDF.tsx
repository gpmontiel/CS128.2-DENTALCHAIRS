import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPDFDateRange } from "./pdfDateFormatter";
import { drawPDFCommonFooter } from "./pdfFooter";

interface RoomUsage {
    id: number;
    room_name: string;
}

export const exportGroupAttendancePDF = ({data, groupName, filterType, filterRangeLabel, rooms,}: {
    data: any[];
    groupName: string;
    filterType: "Weekly" | "Monthly" | "Custom";
    filterRangeLabel: string;
    rooms: RoomUsage[];
}) => {
    const doc = new jsPDF("p", "mm", "a4");

    const tableMargin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - tableMargin * 2;

    const totalWidth = 18;
    const nameWidth = 58;

    const roomsList = rooms.map(r => r.room_name.toUpperCase().trim());

    const defaultRoomWidth = roomsList.length > 0
        ? (usableWidth - totalWidth - nameWidth) / roomsList.length
        : 20;

    const getRoomWidth = (roomName: string) => {
        if (roomName.length >= 7) {
            return Math.max(defaultRoomWidth, 26);
        }
        if (roomName.length === 6) {
            return Math.max(defaultRoomWidth, 22);
        }

        return defaultRoomWidth;
    };

    const formatNumber = (num: number) =>
        Number.isInteger(num) ? num.toString() : num.toFixed(1);

    // =========================
    // GROUP STUDENTS
    // =========================
    const studentMap: Record<string, { name: string; rooms: Record<string, number>; total: number }> = {};

    data.forEach((row) => {

        const id = row.student_id;

        if (!id) {
            return;
        }

        const name = row.name || "Unknown";
        const room = (row.room_name || "").toUpperCase().trim();

        if (!studentMap[id]) {
            studentMap[id] = {
                name,
                rooms: {},
                total: 0,
            };

            roomsList.forEach(r => studentMap[id].rooms[r] = 0);
        }

        studentMap[id].total += 0.5;

        if (roomsList.includes(room)) {
            studentMap[id].rooms[room] += 0.5;
        }
    });

    const body = Object.values(studentMap).map((student) => [
        student.name,
        ...roomsList.map((room) =>
            student.rooms[room] ? formatNumber(student.rooms[room]) : ""
        ),
        formatNumber(student.total),
    ]);

    // =========================
    // HEADER
    // =========================
    const logoImage = "/images/DentrackPdfLogo.png";

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
    const isAllGroups = groupName.toUpperCase() === "ALL GROUPS";
    doc.text(isAllGroups ? `${groupName}` : `${groupName} Student Group`, textXOffset, headerStartY + lineGap);

    doc.setFontSize(11);
    doc.setFont(fontFamily, "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`${filterType}: ${formatPDFDateRange(filterRangeLabel)}`, textXOffset, headerStartY + lineGap * 2);

    // NOTE
    const noteY = 46;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Note: One shift per student = 0.5 credit", tableMargin, noteY);

    const tableStartY = noteY + 3;

    // =========================
    // TABLE OR EMPTY STATE
    // =========================
    const hasData = Object.keys(studentMap).length > 0;

    if (!hasData) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(140);
        doc.text("No Records Found", pageWidth / 2, 90, { align: "center" });
    } else {
        const dynamicColumnStyles: any = {
            0: { halign: "left", cellWidth: nameWidth },
        };
        roomsList.forEach((roomName, idx) => {
            dynamicColumnStyles[idx + 1] = {
                cellWidth: getRoomWidth(roomName),
                halign: "center",
                fontSize: roomName.length > 6 ? 8 : 9
            };
        });
        dynamicColumnStyles[roomsList.length + 1] = { fontStyle: "bold", cellWidth: totalWidth };

        autoTable(doc, {
            startY: tableStartY,
            head: [["NAME", ...roomsList, "TOTAL"]],
            body,
            theme: "grid",
            tableWidth: usableWidth,
            margin: { left: tableMargin, right: tableMargin },
            styles: {
                font: "helvetica",
                fontSize: 9,
                halign: "center",
                valign: "middle",
                cellPadding: { top: 2.5, bottom: 2.5, left: 2.25, right: 2.25 },
                overflow: "linebreak",
                lineColor: [220, 220, 220],
                lineWidth: 0.2,
            },
            headStyles: {
                fillColor: [74, 37, 107],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 9.5,
            },
            alternateRowStyles: { fillColor: [248, 248, 248] },
            bodyStyles: { textColor: 20 },
            columnStyles: dynamicColumnStyles,
        });
    }

    // =========================
    // FOOTER & DOWNLOAD
    // =========================
    drawPDFCommonFooter({ doc });

    let groupSegment = groupName.trim();

    if (isAllGroups) {
        groupSegment = groupSegment.replace(/\s+/g, "_");
    } else {
        groupSegment = groupSegment.replace(/\s+/g, "");
    }

    const filename = `SAR_${filterType}_${groupSegment}.pdf`;
    doc.save(filename);
};
