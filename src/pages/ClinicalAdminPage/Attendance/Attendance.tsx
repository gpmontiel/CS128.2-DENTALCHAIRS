import React, { useState, useEffect } from "react";
import { 
    Box, Typography, Button, IconButton, List, ListItem, 
    ListItemAvatar, ListItemText, Avatar, Paper, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, 
    InputLabel, Select, MenuItem, TextField, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarsIcon from '@mui/icons-material/Stars';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { supabase } from "../../../utils/supabase";
import dayjs from "dayjs";

interface RoomItem {
    room_id: number;
    room_name: string;
}

interface ProfileItem {
    profile_id: string;
    first_name: string;
    last_name: string;
    pfp: string;
    role_id: number;
}

interface SectionItem {
    section_id: number;
    section_name: string;
    room_id: number;
}

interface BatchItem {
    id: number;
    label: string;
}

const Attendance: React.FC = () => {
    const [view, setView] = useState<'calendar' | 'rooms' | 'list'>('calendar');
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
    const [selectedRoom, setSelectedRoom] = useState<{id: number, name: string} | null>(null);
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // --- REASON POPUP STATE ---
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [activeAction, setActiveAction] = useState<{ requestId: number; status: 'Present' | 'Absent'; isAssistant: boolean } | null>(null);
    const [reason, setReason] = useState<string>("");
    const [customReason, setCustomReason] = useState<string>(" ");

    // --- MANUAL ENTRY STATE ---
    const [manualDialogOpen, setManualDialogOpen] = useState<boolean>(false);
    const [students, setStudents] = useState<ProfileItem[]>([]);
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [manualForm, setManualForm] = useState({
        studentId: "", 
        roomId: "",
        sectionId: "", 
        date: dayjs().format('YYYY-MM-DD'),
        shift: "",
        status: "Present" 
    });

    // --- PDF REPORT CONFIGURATION STATE ---
    const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
    const [reportType, setReportType] = useState<'batch' | 'overall'>('batch');
    const [batches, setBatches] = useState<BatchItem[]>([]); 
    const [selectedBatchId, setSelectedBatchId] = useState<number | "">("");
    const [reportWeekStart, setReportWeekStart] = useState<string>(dayjs().startOf('week').format('YYYY-MM-DD'));
    const [reportMonth, setReportMonth] = useState<string>(dayjs().format('YYYY-MM'));

    // --- NEW IN-APP PRINT PREVIEW OVERLAY STATE ---
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewHtml, setPreviewHtml] = useState<string>("");

    // Explicit structural clinic ledger categories
    const targetedColumns = ["OD", "TRIAGE", "OS", "OM", "OP", "PROSTHO", "COH"];

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: roomData } = await supabase.from('rooms').select('*');
            if (roomData) setRooms(roomData as RoomItem[]);

            const { data: studentData } = await supabase
                .from('profiles')
                .select('profile_id, first_name, last_name, pfp, role_id')
                .eq('role_id', 3); 
            if (studentData) setStudents(studentData as ProfileItem[]);

            const { data: sectionData } = await supabase.from('sections').select('*');
            if (sectionData) setSections(sectionData as SectionItem[]);

            const { data: groupData, error: groupError } = await supabase
                .from('student_groups')
                .select('group_id, group_name')
                .order('group_id', { ascending: true });
            
            if (groupData && !groupError) {
                const formattedBatches = groupData.map((g: any) => ({
                    id: g.group_id,
                    label: g.group_name
                }));
                setBatches(formattedBatches);
            } else {
                setBatches([
                    { id: 2, label: "PCB Sinag" },
                    { id: 3, label: "PCB Banaag" },
                    { id: 4, label: "PCB Agos" }
                ]);
            }
        };
        fetchInitialData();
    }, []);

    // --- BULLETPROOF FETCH LOGIC ---
    const fetchAttendance = async (roomId: number) => {
        setLoading(true);
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        
        const { data, error } = await supabase
            .from('dental_chairs_request_assignment')
            .select(`
                request_id, 
                status, 
                shift,
                date,
                student_id (
                    clinician_id,
                    profiles (first_name, last_name, pfp)
                ),
                assistant_id (
                    clinician_id,
                    profiles (first_name, last_name, pfp)
                ),
                sections (
                    section_name,
                    room_id
                ),
                attendance (status, reason)
            `)
            .eq('date', formattedDate);

        if (!error && data) {
            const matchingRows = data.filter((item: any) => {
                const statusMatch = item.status === 'Accepted';
                const roomMatch = Number(item.sections?.room_id) === Number(roomId); 
                return statusMatch && roomMatch;
            });

            const flattenedList: any[] = [];

            matchingRows.forEach((item: any) => {
                let primaryStatus = null;
                let assistantStatus = null;

                // Robust multi-format parsing for the attendance link
                if (item.attendance) {
                    const attArray = Array.isArray(item.attendance) ? item.attendance : [item.attendance];

                    if (attArray.length > 0) {
                        // 1. Isolate Assistant records explicitly tracking 'Assistant'
                        const assistLog = attArray.find((a: any) => a && a.reason === 'Assistant');
                        
                        // 2. Isolate Primary records explicitly tracking non-assistant keys
                        const mainLog = attArray.find((a: any) => a && a.reason !== 'Assistant' && a.reason !== null && a.reason !== '');

                        // 3. Fallback: If there is exactly ONE attendance entry, and reason is NULL or unassigned
                        if (attArray.length === 1 && (attArray[0].reason === null || attArray[0].reason === '')) {
                            // Apply the status to BOTH so whoever exists on the card displays their badge safely!
                            primaryStatus = attArray[0].status;
                            assistantStatus = attArray[0].status;
                        } else {
                            // Standard multi-row tracking mapping layout rules
                            primaryStatus = mainLog ? mainLog.status : (attArray.find((a: any) => a.reason !== 'Assistant')?.status || null);
                            assistantStatus = assistLog ? assistLog.status : null;
                        }
                    }
                }

                // 1. Resolve raw arrays for Student
                const studentData = Array.isArray(item.student_id) ? item.student_id[0] : item.student_id;
                const rawStudentProfile = studentData?.profiles 
                    ? (Array.isArray(studentData.profiles) ? studentData.profiles[0] : studentData.profiles)
                    : null;

                // 2. Resolve raw arrays for Assistant
                const assistantData = Array.isArray(item.assistant_id) ? item.assistant_id[0] : item.assistant_id;
                const rawAssistantProfile = assistantData?.profiles 
                    ? (Array.isArray(assistantData.profiles) ? assistantData.profiles[0] : assistantData.profiles)
                    : null;

                // 3. Normalization Helper
                const createNormalizedProfile = (profile: any) => {
                    if (!profile) return null;
                    const fName = profile.first_name || profile.firstName || "";
                    const lName = profile.last_name || profile.lastName || "";
                    const avatar = profile.pfp || "";
                    
                    return {
                        first_name: fName,
                        last_name: lName,
                        firstName: fName,
                        lastName: lName,
                        pfp: avatar
                    };
                };

                const primaryProfile = createNormalizedProfile(rawStudentProfile);
                const assistantProfile = createNormalizedProfile(rawAssistantProfile);

                // A. Push Primary Clinician
                if (primaryProfile) {
                    flattenedList.push({
                        request_id: item.request_id,
                        shift: item.shift,
                        unique_key: `${item.request_id}-primary-${primaryProfile.lastName}`,
                        display_profile: primaryProfile, 
                        current_attendance: primaryStatus,
                        isAssistant: false
                    });
                }

                // B. Push Assistant if they exist
                if (assistantProfile) {
                    flattenedList.push({
                        request_id: item.request_id,
                        shift: item.shift,
                        unique_key: `${item.request_id}-assistant-${assistantProfile.lastName}`,
                        display_profile: assistantProfile,
                        current_attendance: assistantStatus, //  Fixed: Changed from primaryStatus to assistantStatus
                        isAssistant: true
                    });
                }
            });

            setAttendanceList(flattenedList);

        } else if (error) {
            console.error("Fetch Error:", error.message);
        }
        setLoading(false);
    };

    const handleRoomClick = (room: RoomItem) => {
        setSelectedRoom({ id: room.room_id, name: room.room_name });
        fetchAttendance(room.room_id);
        setView('list');
    };

    const handleOpenDialog = (requestId: number, status: 'Present' | 'Absent', isAssistant: boolean) => {
        setActiveAction({ requestId, status, isAssistant });

        if (isAssistant) {
            setReason("Assistant");
        } else {
            setReason(""); // Clears it out for Primary Clinician custom dropdown picking
        }

        setCustomReason("");
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setActiveAction(null);
    };

    const handleAttendanceAction = async () => {
        if (!activeAction) return;
        const { requestId, status } = activeAction;

        // Find the item within our state using the active transaction ID
        const targetedItem = attendanceList.find(
            item => item.request_id === requestId && 
            ((activeAction as any).isAssistant ? item.isAssistant : !item.isAssistant)
        );

        // If it's an assistant, set the reason automatically, otherwise use the state select value
        const finalRemarks = targetedItem?.isAssistant ? "Assistant" : (reason === "Others" ? customReason : reason);

        // Upsert to your attendance matrix tracking setup
        // Note: If your schema relies on a composite index of (request_id, reason), this allows two entries!
        const { error } = await supabase
            .from('attendance')
            .upsert(
                { 
                    request_id: requestId, 
                    status: status, 
                    reason: finalRemarks 
                }, 
                { onConflict: 'request_id, reason' } // Adjust based on your schema's constraints
            );

        if (error) {
            alert("Error saving attendance entry: " + error.message); 
        } else {
            handleCloseDialog();
            if (selectedRoom) await fetchAttendance(selectedRoom.id);
        }
    };

    const handleManualSubmit = async () => {
        setLoading(true);
        try {
            const matchedSection = sections.find(s => s.room_id === Number(manualForm.roomId));
            const finalSectionId = matchedSection ? matchedSection.section_id : null;

            const { data: assignmentData, error: primaryAssignErr } = await supabase
                .from('dental_chairs_request_assignment')
                .insert({
                    student_id: manualForm.studentId,
                    date: manualForm.date,
                    shift: manualForm.shift,
                    status: 'Accepted', 
                    section_id: finalSectionId 
                })
                .select().single();

            if (primaryAssignErr) throw primaryAssignErr;

            if (assignmentData) {
                await supabase.from('attendance').insert({
                    request_id: assignmentData.request_id,
                    status: manualForm.status,
                    reason: "Manually Added Entry"
                });

                const { data: clinicianData, error: clinicianErr } = await supabase
                    .from('clinician')
                    .select('assistant_id')
                    .eq('clinician_id', manualForm.studentId)
                    .maybeSingle();

                if (!clinicianErr && clinicianData?.assistant_id) {
                    const { data: assistantAssignData, error: assistantAssignErr } = await supabase
                        .from('dental_chairs_request_assignment')
                        .insert({
                            student_id: clinicianData.assistant_id,
                            date: manualForm.date,
                            shift: manualForm.shift,
                            status: 'Accepted', 
                            section_id: finalSectionId 
                        })
                        .select().single();

                    if (!assistantAssignErr && assistantAssignData) {
                        await supabase.from('attendance').insert({
                            request_id: assistantAssignData.request_id,
                            status: manualForm.status,
                            reason: "Assistant"
                        });
                    }
                }
            }

            setManualDialogOpen(false);
            setManualForm({
                studentId: "", roomId: "", sectionId: "",
                date: dayjs().format('YYYY-MM-DD'), shift: "", status: "Present"
            });
            if (selectedRoom) await fetchAttendance(selectedRoom.id);
        } catch (error: any) {
            alert("Error processing manual entry setup: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompileReportData = async () => {
        setLoading(true);
        let dynamicHTMLContent = "";

        try {
            if (reportType === 'batch') {
                if (!selectedBatchId) {
                    alert("Please select a student batch.");
                    setLoading(false);
                    return;
                }

                const startOfWeek = dayjs(reportWeekStart).format('YYYY-MM-DD');
                const endOfWeek = dayjs(reportWeekStart).add(4, 'day').format('YYYY-MM-DD'); 
                const targetBatchObj = batches.find(b => b.id === selectedBatchId);
                const batchLabelText = targetBatchObj ? targetBatchObj.label : `Group ID: ${selectedBatchId}`;

                const { data: groupClinicians, error: clinicianErr } = await supabase
                    .from('clinician')
                    .select('clinician_id')
                    .eq('group_id', selectedBatchId);

                if (clinicianErr) throw clinicianErr;
                const studentIdsInGroup = groupClinicians?.map(c => c.clinician_id) || [];

                const { data: groupProfiles, error: profilesErr } = await supabase
                    .from('profiles')
                    .select('profile_id, first_name, last_name')
                    .in('profile_id', studentIdsInGroup.length > 0 ? studentIdsInGroup : ["00000000-0000-0000-0000-000000000000"]);

                if (profilesErr) throw profilesErr;

                const { data: logs, error: logErr } = await supabase
                    .from('dental_chairs_request_assignment')
                    .select(`
                        student_id, shift, section_id,
                        sections (section_name),
                        attendance!inner (status)
                    `)
                    .gte('date', startOfWeek)
                    .lte('date', endOfWeek)
                    .eq('status', 'Accepted')
                    .eq('attendance.status', 'Present')
                    .in('student_id', studentIdsInGroup.length > 0 ? studentIdsInGroup : ["00000000-0000-0000-0000-000000000000"]);

                if (logErr) throw logErr;

                const calculationMap: Record<string, any> = {};
                const roomTotals: Record<string, number> = {};
                targetedColumns.forEach(col => { roomTotals[col] = 0; });
                let overallWeeklySum = 0;

                groupProfiles?.forEach(p => {
                    calculationMap[p.profile_id] = {
                        name: `${p.last_name?.toUpperCase()}, ${p.first_name}`,
                        total: 0
                    };
                    targetedColumns.forEach(col => { calculationMap[p.profile_id][col] = 0; });
                });

                if (logs) {
                    logs.forEach((row: any) => {
                        const studentId = row.student_id;
                        if (!calculationMap[studentId]) return;

                        let rawSectionName = row.sections?.section_name?.toUpperCase() || "";
                        if (rawSectionName === "COMPLETE DENTURE") rawSectionName = "PROSTHO";
                        
                        const matchedColumn = targetedColumns.find(c => c === rawSectionName || rawSectionName.startsWith(c));
                        const scoreValue = 0.5;

                        if (matchedColumn) {
                            calculationMap[studentId][matchedColumn] += scoreValue;
                            calculationMap[studentId].total += scoreValue;
                            roomTotals[matchedColumn] += scoreValue;
                            overallWeeklySum += scoreValue;
                        }
                    });
                }

                const sortedOutputRows = Object.values(calculationMap).sort((a: any, b: any) => a.name.localeCompare(b.name));

                let dataRowsHTML = sortedOutputRows.map((student: any, index) => `
                    <tr>
                        <td style="padding: 4px; border: 1px solid #000; font-weight:bold; font-size:9px;">${index + 1}</td>
                        <td style="padding: 4px; border: 1px solid #000; text-align: left; font-weight: 600; padding-left:4px; font-size:9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${student.name}</td>
                        ${targetedColumns.map(col => `<td style="padding: 4px; border: 1px solid #000; font-weight:500; font-size:9px;">${student[col] > 0 ? student[col] : ""}</td>`).join("")}
                        <td style="padding: 4px; border: 1px solid #000; color: #d32f2f; font-weight: bold; background: #fff5f5; font-size:9px;">${student.total > 0 ? student.total : "0"}</td>
                    </tr>
                `).join("");

                let totalFooterHTML = `
                    <tr style="background-color: #f7fafc; font-weight: bold;">
                        <td colspan="2" style="padding: 5px; border: 1px solid #000; text-align: right; padding-right:8px; font-size:9px;">TOTAL</td>
                        ${targetedColumns.map(col => `<td style="padding: 5px; border: 1px solid #000; font-size:9px;">${roomTotals[col] > 0 ? roomTotals[col] : ""}</td>`).join("")}
                        <td style="padding: 5px; border: 1px solid #000; color: #d32f2f; font-weight: bold; background: #fff5f5; font-size:9px;">${overallWeeklySum > 0 ? overallWeeklySum : ""}</td>
                    </tr>
                `;

                dynamicHTMLContent = `
                    <div class="portrait-mode-container" style="padding: 0; font-family: Arial, sans-serif; width: 100%;">
                        <div style="margin-bottom: 8px; text-align: center;">
                            <h3 style="margin: 0; font-size: 12px; font-weight: bold; letter-spacing:0.5px;">CLINIC ATTENDANCE SUMMARY</h3>
                            <div style="font-size: 10px; font-weight: 600; margin-top: 2px;">WEEK ${dayjs(startOfWeek).format('w')} | ${dayjs(startOfWeek).format('MMM DD')} - ${dayjs(endOfWeek).format('MMM DD, YYYY')}</div>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 9px; table-layout: fixed;">
                            <thead>
                                <tr style="background-color: #ffffff; color: #000;">
                                    <th style="padding: 4px 2px; border: 1px solid #000; width: 6%;">#</th>
                                    <th style="padding: 4px; border: 1px solid #000; text-align: left; width: 34%; font-weight:bold; font-size:10px;">${batchLabelText.toUpperCase()}</th>
                                    ${targetedColumns.map(col => `<th style="padding: 4px 2px; border: 1px solid #000; width: 8%; font-weight:bold;">${col}</th>`).join("")}
                                    <th style="padding: 4px 2px; border: 1px solid #000; width: 12%; font-weight:bold;">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dataRowsHTML || '<tr><td colspan="10" style="padding: 20px; color:#718096;">No records found.</td></tr>'}
                                ${dataRowsHTML ? totalFooterHTML : ''}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                const totalDays = dayjs(reportMonth).daysInMonth();
                let rowHTMLBuilder = "";
                const monthlyRoomTotals: Record<string, number> = {};
                targetedColumns.forEach(col => { monthlyRoomTotals[col] = 0; });
                let runningGrandTotal = 0;

                for (let day = 1; day <= totalDays; day++) {
                    const loopDate = dayjs(`${reportMonth}-${day}`).format('YYYY-MM-DD');
                    const { data } = await supabase
                        .from('dental_chairs_request_assignment')
                        .select(`shift, sections (section_name), attendance!inner (status)`)
                        .eq('date', loopDate)
                        .eq('status', 'Accepted')
                        .eq('attendance.status', 'Present');

                    ['AM', 'PM'].forEach(shiftName => {
                        let rowSum = 0;
                        let roomCellsHTML = targetedColumns.map(col => {
                            const matchCount = data?.filter(d => {
                                let itemSecName = d.sections?.section_name?.toUpperCase() || "";
                                if (itemSecName === "COMPLETE DENTURE") itemSecName = "PROSTHO";
                                
                                const isCorrectRoom = itemSecName === col || itemSecName.startsWith(col);
                                const isCorrectShift = (shiftName === 'AM' && (d.shift === 'Morning' || d.shift === 'AM')) || 
                                                       (shiftName === 'PM' && (d.shift === 'Afternoon' || d.shift === 'PM'));
                                return isCorrectRoom && isCorrectShift;
                            }).length || 0;

                            const computedPoints = matchCount * 0.5;
                            rowSum += computedPoints;
                            monthlyRoomTotals[col] += computedPoints;
                            return `<td style="padding: 3px; border: 1px solid #000; font-size: 8.5px;">${computedPoints || ""}</td>`;
                        }).join("");

                        runningGrandTotal += rowSum;
                        rowHTMLBuilder += `
                            <tr style="height:18px;">
                                ${shiftName === 'AM' ? `<td rowspan="2" style="font-weight:bold; border: 1px solid #000; text-align:center; font-size:9px; background:#fbfbfb;">${day}</td>` : ''}
                                <td style="padding: 3px; border: 1px solid #000; font-size:8px; font-weight:bold; background:#fafafa;">${shiftName}</td>
                                ${roomCellsHTML}
                                <td style="padding: 3px; border: 1px solid #000; font-weight:bold; font-size: 8.5px; background: #fff5f5;">${rowSum || ""}</td>
                            </tr>
                        `;
                    });
                }

                dynamicHTMLContent = `
                    <div class="portrait-mode-container" style="padding: 0; font-family: Arial, sans-serif; width: 100%;">
                        <div style="text-align:center; margin-bottom: 8px;">
                            <h2 style="margin: 0; font-size: 13px; font-weight: bold; letter-spacing:0.5px;">CHAIR USAGE REPORT</h2>
                            <div style="margin-top: 2px; font-size: 10px; font-weight:bold; color: #444;">MONTH: ${dayjs(reportMonth).format('MMMM YYYY').toUpperCase()}</div>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 8.5px; table-layout: fixed;">
                            <thead>
                                <tr style="background: #ffffff; font-weight:bold;">
                                    <th style="padding: 4px 2px; border: 1px solid #000; width: 10%;">DAY</th>
                                    <th style="padding: 4px 2px; border: 1px solid #000; width: 10%;">SHIFT</th>
                                    ${targetedColumns.map(col => `<th style="padding: 4px 2px; border: 1px solid #000; width: 10%; font-size:9px;">${col}</th>`).join("")}
                                    <th style="padding: 4px 2px; border: 1px solid #000; width: 10%; font-size:8px; font-weight:bold; line-height:1.1;">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowHTMLBuilder}
                                <tr style="font-weight: bold; height:20px; background:#f7fafc;">
                                    <td colspan="2" style="padding: 4px; border: 1px solid #000; text-align:center; font-size:9px;">GRAND TOTAL</td>
                                    ${targetedColumns.map(col => `<td style="padding: 4px; border: 1px solid #000; font-size:9px;">${monthlyRoomTotals[col] || ""}</td>`).join("")}
                                    <td style="padding: 4px; border: 1px solid #000; font-weight:bold; font-size:9px; background: #fff5f5; color: #d32f2f;">${runningGrandTotal || ""}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }

            setPreviewHtml(dynamicHTMLContent);
            setReportDialogOpen(false);
            setPreviewOpen(true); 
        } catch (err: any) {
            alert("Failed to build report view: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const triggerSystemPrintEngine = () => {
        const targetElement = document.getElementById("printable-canvas-area");
        if (!targetElement) return;

        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";
        
        document.body.appendChild(printFrame);
        const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
        if (frameDoc) {
            frameDoc.write(`
                <html>
                <head>
                    <style>
                        @page { 
                            size: portrait !important; 
                            margin: 10mm 8mm 10mm 8mm !important; 
                        }
                        html, body { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            font-family: Arial, sans-serif !important; 
                            width: 100% !important;
                            background: #fff !important;
                        }
                        .portrait-mode-container {
                            width: 100% !important;
                            max-width: 100% !important;
                            display: block !important;
                        }
                        table { 
                            width: 100% !important; 
                            border-collapse: collapse !important; 
                            table-layout: fixed !important; 
                        }
                        th, td { 
                            border: 1px solid #000 !important; 
                            padding: 4px 2px !important;
                            overflow: hidden !important;
                            text-overflow: ellipsis !important;
                            word-wrap: break-word !important;
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important; 
                        }
                    </style>
                </head>
                <body>
                    <div class="portrait-mode-container">
                        ${targetElement.innerHTML}
                    </div>
                </body>
                </html>
            `);
            frameDoc.close();
            setTimeout(() => {
                printFrame.contentWindow?.focus();
                printFrame.contentWindow?.print();
                document.body.removeChild(printFrame);
            }, 600);
        }
    };

    const renderCalendar = () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#493979' }}>
                    Attendance
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => setReportDialogOpen(true)}
                    sx={{ bgcolor: '#5c51b6', textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    startIcon={<AssessmentIcon />}
                >
                    Generate Report
                </Button>
            </Box>
            
            <Box sx={{ 
                display: 'flex', gap: 2, overflowX: 'auto', pb: 3, px: 0.5,
                '&::-webkit-scrollbar': { display: 'none' }
            }}>
                {[...Array(14)].map((_, i) => {
                    const date = dayjs().add(i - 3, 'day');
                    const isSelected = date.isSame(selectedDate, 'day');
                    const isToday = date.isSame(dayjs(), 'day');

                    return (
                        <Paper 
                            key={i} elevation={isSelected ? 4 : 0} onClick={() => setSelectedDate(date)}
                            sx={{ 
                                minWidth: 65, py: 2, textAlign: 'center', cursor: 'pointer', borderRadius: 4,
                                bgcolor: isSelected ? '#5c51b6' : 'white', color: isSelected ? 'white' : '#666',
                                border: isSelected ? 'none' : '1px solid #eee', transition: '0.2s all ease-in-out'
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>{date.format('ddd')}</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>{date.format('DD')}</Typography>
                            {isToday && !isSelected && <Box sx={{ width: 4, height: 4, bgcolor: '#5c51b6', borderRadius: '50%', mx: 'auto', mt: 0.5 }} />}
                        </Paper>
                    );
                })}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" fullWidth onClick={() => setView('rooms')} sx={{ bgcolor: '#5c51b6', py: 2, borderRadius: 4, textTransform: 'none', fontWeight: 700 }}>
                    View Rooms for {selectedDate.format('MMM DD')}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => setManualDialogOpen(true)} sx={{ color: '#5c51b6', borderColor: '#5c51b6', py: 1.5, borderRadius: 4, textTransform: 'none', fontWeight: 600 }}>
                    Create Manual Attendance Entry
                </Button>
            </Box>
        </Box>
    );

    const renderRooms = () => (
        <Box sx={{ p: 0 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => setView('calendar')}><ArrowBackIcon /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedDate.format('MMM DD, YYYY')}</Typography>
            </Box>
            <List sx={{ px: 2 }}>
                {rooms.map((room) => (
                    <Button key={room.room_id} fullWidth variant="contained" onClick={() => handleRoomClick(room)} sx={{ mb: 2, py: 2, bgcolor: '#5c51b6', borderRadius: 2, justifyContent: 'flex-start', textTransform: 'none' }} startIcon={<StarsIcon />}>
                        {room.room_name}
                    </Button>
                ))}
            </List>
        </Box>
    );

    const renderAttendanceList = () => (
        <Box>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => setView('rooms')}><ArrowBackIcon /></IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedRoom?.name} - {selectedDate.format('MMM DD')}
                </Typography>
            </Box>

            <Box sx={{ px: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : attendanceList.length > 0 ? (
                    <List>
                        {attendanceList.map((req) => (
                            /* Fixed: Changed key to unique_key to prevent list overlap */
                            <ListItem key={req.unique_key} sx={{ px: 0, py: 2, borderBottom: '1px solid #eee' }}>
                                <ListItemAvatar>
                                    {/* Fixed: Point to display_profile */}
                                    <Avatar src={req.display_profile?.pfp} />
                                </ListItemAvatar>
                                <ListItemText 
                                    /* Fixed: Point to display_profile attributes */
                                    primary={`${req.display_profile?.firstName} ${req.display_profile?.lastName}`}
                                    secondary={`Shift: ${req.shift}`}
                                />
                                {req.current_attendance ? (
                                    <Chip 
                                        label={req.current_attendance} variant="filled"
                                        sx={{ fontWeight: 600, borderRadius: 2, minWidth: 80, bgcolor: req.current_attendance === 'Present' ? '#5c51b6' : '#d32f2f', color: 'white' }}
                                    />
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {/* Fixed: Forward req.isAssistant argument to handleOpenDialog */}
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            onClick={() => handleOpenDialog(req.request_id, 'Present', req.isAssistant)} 
                                            sx={{ textTransform: 'none', borderRadius: 2, color: '#5c51b6', borderColor: '#5c51b6' }}
                                        >
                                            Present
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            color="error" 
                                            onClick={() => handleOpenDialog(req.request_id, 'Absent', req.isAssistant)} 
                                            sx={{ textTransform: 'none', borderRadius: 2, color: '#d32f2f', borderColor: '#d32f2f' }}
                                        >
                                            Absent
                                        </Button>
                                    </Box>
                                )}
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 5, color: '#999' }}>No approved requests found.</Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', mx: 'auto' }}>
            {view === 'calendar' && renderCalendar()}
            {view === 'rooms' && renderRooms()}
            {view === 'list' && renderAttendanceList()}

            {/* --- GENERATE REPORT CONFIGURATION POPUP MODAL --- */}
            <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Generate Chair Usage Report</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <FormControl>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Select Report Scope:</Typography>
                        <RadioGroup value={reportType} onChange={(e) => setReportType(e.target.value as 'batch' | 'overall')}>
                            <FormControlLabel value="batch" control={<Radio color="secondary" />} label="Per Batch (Weekly Summary Layout)" />
                            <FormControlLabel value="overall" control={<Radio color="secondary" />} label="Overall Chair Usage (Monthly Matrix Layout)" />
                        </RadioGroup>
                    </FormControl>

                    {reportType === 'batch' ? (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Select Student Batch / Group</InputLabel>
                                <Select value={selectedBatchId} label="Select Student Batch / Group" onChange={(e) => setSelectedBatchId(e.target.value as number)}>
                                    {batches.map((batch) => (
                                        <MenuItem key={batch.id} value={batch.id}>{batch.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField label="Choose Roster Week Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={reportWeekStart} onChange={(e) => setReportWeekStart(e.target.value)} />
                        </>
                    ) : (
                        <TextField label="Select Target Operational Month" type="month" fullWidth InputLabelProps={{ shrink: true }} value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setReportDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleCompileReportData} 
                        variant="contained" 
                        disabled={loading || (reportType === 'batch' && selectedBatchId === "")}
                        sx={{ bgcolor: '#5c51b6', textTransform: 'none' }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Prepare Preview"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- IN-APP PRINT PREVIEW WINDOW --- */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Print Preview (Portrait Canvas)</Typography>
                    <IconButton onClick={() => setPreviewOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2, bgcolor: '#f4f6f8' }}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: '#fff', minHeight: '400px', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
                        <div id="printable-canvas-area" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setPreviewOpen(false)} color="inherit">Close Preview</Button>
                    <Button onClick={triggerSystemPrintEngine} variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#493979', '&:hover': { bgcolor: '#3c2e65' } }}>
                        Print / Save as PDF
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- REASON DIALOG MODAL --- */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Attendance Remarks</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="attendance-reason-label">Reason</InputLabel>
                        <Select
                            labelId="attendance-reason-label"
                            value={reason}
                            label="Reason"
                            onChange={(e) => setReason(e.target.value)}
                            disabled={activeAction?.isAssistant} 
                        >
                            {activeAction?.isAssistant ? (
                                <MenuItem value="Assistant">Assistant</MenuItem>
                            ) : (
                                [
                                    <MenuItem key="regular" value="Regular">Regular Duty</MenuItem>,
                                    <MenuItem key="exam" value="Discussion">Case Discussion</MenuItem>,
                                    <MenuItem key="others" value="Others">Others</MenuItem>
                                ]
                            )}
                        </Select>
                    </FormControl>
                    {reason === "Others" && (
                        <TextField 
                            fullWidth label="Specify Reason" sx={{ mt: 2 }} 
                            value={customReason} onChange={(e) => setCustomReason(e.target.value)} 
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleAttendanceAction} variant="contained" sx={{ bgcolor: '#5c51b6' }}>Submit</Button>
                </DialogActions>
            </Dialog>

            {/* --- MANUAL ENTRY DIALOG MODAL --- */}
            <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 700 }}>Manual Attendance Entry</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Student</InputLabel>
                        <Select 
                            value={manualForm.studentId} label="Select Student"
                            onChange={(e) => setManualForm({ ...manualForm, studentId: e.target.value as string })}
                        >
                            {students.map((student) => (
                                <MenuItem key={student.profile_id} value={student.profile_id}>
                                    {student.first_name} {student.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Select Room</InputLabel>
                        <Select 
                            value={manualForm.roomId} label="Select Room"
                            onChange={(e) => setManualForm({ ...manualForm, roomId: e.target.value as string })}
                        >
                            {rooms.map((room) => (
                                <MenuItem key={room.room_id} value={room.room_id}>{room.room_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField 
                        label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} 
                        value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} 
                    />
                    <FormControl fullWidth>
                        <InputLabel>Shift</InputLabel>
                        <Select 
                            value={manualForm.shift} label="Shift"
                            onChange={(e) => setManualForm({ ...manualForm, shift: e.target.value as string })}
                        >
                            <MenuItem value="Morning">Morning (AM)</MenuItem>
                            <MenuItem value="Afternoon">Afternoon (PM)</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select 
                            value={manualForm.status} label="Status"
                            onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as string })}
                        >
                            <MenuItem value="Present">Present</MenuItem>
                            <MenuItem value="Absent">Absent</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setManualDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleManualSubmit} variant="contained" sx={{ bgcolor: '#5c51b6' }}>Add Entry</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Attendance;