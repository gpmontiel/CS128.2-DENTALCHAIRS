import React, { useState, useEffect } from "react";
import {
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarsIcon from "@mui/icons-material/Stars";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import AddIcon from "@mui/icons-material/Add";
import { supabase } from "../../../utils/supabase";

// --- Types & Interfaces ---
interface Student {
  id: string;
  name: string;
  studentNumber: string;
  yearLevel: string;
  batchName?: string;
  pfpUrl?: string | null;
}

interface Batch {
  id: string;
  name: string;
  students: Student[];
}

interface UnassignedStudent {
  id: string;
  name: string;
  studentNumber: string;
  yearLevel: string;
}

interface Section {
  section_id: number;
  room_id: number;
  section_name: string;
  chair_count: number;
}

interface Room {
  room_id: number;
  room_name: string;
  sections?: Section[];
}

const Management: React.FC = () => {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"batch" | "all">("batch");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Snackbar States
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" }>({
    open: false,
    message: "",
    severity: "success"
  });

  // Global Delete Confirmation States
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: "room" | "section" | null; id: number | null; targetName: string }>({
    open: false,
    type: null,
    id: null,
    targetName: ""
  });

  // Student States
  const [batches, setBatches] = useState<Batch[]>([]);
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  // Discipline States
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newChairCount, setNewChairCount] = useState<number | string>("");
  const [hasCustomSection, setHasCustomSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  // Dynamic Section States
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [subSectionName, setSubSectionName] = useState("");
  const [subChairCount, setSubChairCount] = useState<number | string>("");

  // Dedicated Modal Editing States (Replaces Inline Editing)
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editedRoomName, setEditedRoomName] = useState("");

  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionRoomId, setEditingSectionRoomId] = useState<number | null>(null);
  const [editedSectionName, setEditedSectionName] = useState("");
  const [editedChairCount, setEditedChairCount] = useState<number | string>("");

  // --- SHOW SNACKBAR HELPER ---
  const showToast = (message: string, severity: "success" | "error" | "warning" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // --- FETCH DATASETS ---
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStudentsData(), fetchDisciplinesData()]);
    setLoading(false);
  };

  const fetchStudentsData = async () => {
    const { data, error } = await supabase
        .from("student_groups")
        .select(`
        group_id,
        group_name,
        clinician (
          clinician_id,
          student_number,
          year_level,
          profiles (
            first_name,
            last_name,
            pfp
          )
        )
      `);

    if (error) {
      console.error("Error fetching students:", error);
    } else if (data) {
      const formattedBatches: Batch[] = data.map((group: any) => ({
        id: group.group_id.toString(),
        name: group.group_name,
        students: (group.clinician || []).map((c: any) => ({
          id: c.clinician_id,
          studentNumber: c.student_number,
          yearLevel: c.year_level,
          name: c.profiles ? `${c.profiles.first_name} ${c.profiles.last_name}` : "Unknown Student",
          pfpUrl: c.profiles ? c.profiles.pfp : null
        }))
      }));
      setBatches(formattedBatches);
    }
  };

  const fetchDisciplinesData = async () => {
    const { data, error } = await supabase
        .from("rooms")
        .select(`
        room_id,
        room_name,
        sections (
          section_id,
          room_id,
          section_name,
          chair_count
        )
      `);

    if (error) {
      console.error("Error fetching rooms/disciplines:", error);
    } else if (data) {
      setRooms(data as Room[]);
    }
  };

  const fetchUnassignedStudents = async () => {
    setLoadingUnassigned(true);
    const { data, error } = await supabase
        .from("clinician")
        .select(`
        clinician_id,
        student_number,
        year_level,
        profiles (
          first_name,
          last_name
        )
      `)
        .is("group_id", null);

    if (error) {
      console.error("Error fetching unassigned students:", error);
    } else if (data) {
      const formattedUnassigned = data.map((c: any) => ({
        id: c.clinician_id,
        studentNumber: c.student_number,
        yearLevel: c.year_level,
        name: c.profiles ? `${c.profiles.first_name} ${c.profiles.last_name}` : "Unknown Student"
      }));
      setUnassignedStudents(formattedUnassigned);
    }
    setLoadingUnassigned(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- ACTION: ADD DISCIPLINE ---
  const handleAddDiscipline = async () => {
    if (!newRoomName || !newChairCount) {
      showToast("Please fill in the discipline details.", "warning");
      return;
    }

    const isRoomDuplicate = rooms.some(
        (room) => room.room_name.trim().toLowerCase() === newRoomName.trim().toLowerCase()
    );

    if (isRoomDuplicate) {
      showToast(`The discipline "${newRoomName}" already exists.`, "error");
      return;
    }

    const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert([{ room_name: newRoomName.trim() }])
        .select()
        .single();

    if (roomError) {
      showToast(`Error creating room: ${roomError.message}`, "error");
      return;
    }

    const parsedRoomId = roomData.room_id;
    const finalSectionName = hasCustomSection ? newSectionName.trim() : newRoomName.trim();
    const finalChairCount = parseInt(newChairCount as string, 10);

    const { error: sectionError } = await supabase
        .from("sections")
        .insert([
          {
            room_id: parsedRoomId,
            section_name: finalSectionName,
            chair_count: finalChairCount
          }
        ]);

    if (sectionError) {
      showToast(`Room added, but section setup failed: ${sectionError.message}`, "warning");
    } else {
      showToast("Discipline successfully added!");
      setNewRoomName("");
      setNewChairCount("");
      setNewSectionName("");
      setHasCustomSection(false);
      setIsDisciplineModalOpen(false);
      fetchDisciplinesData();
    }
  };

  // --- ACTION: OPEN MODAL EDIT DISCIPLINE ---
  const openEditRoomModal = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation(); // Stops accordion dropdown toggle action
    setEditingRoomId(room.room_id);
    setEditedRoomName(room.room_name);
    setIsEditRoomModalOpen(true);
  };

  const handleUpdateRoomName = async () => {
    if (!editedRoomName.trim()) {
      showToast("Discipline name cannot be empty.", "warning");
      return;
    }

    const isDuplicate = rooms.some(
        (room) => room.room_id !== editingRoomId && room.room_name.trim().toLowerCase() === editedRoomName.trim().toLowerCase()
    );

    if (isDuplicate) {
      showToast(`A discipline named "${editedRoomName}" already exists.`, "error");
      return;
    }

    const { error } = await supabase
        .from("rooms")
        .update({ room_name: editedRoomName.trim() })
        .eq("room_id", editingRoomId);

    if (error) {
      showToast(`Update failed: ${error.message}`, "error");
    } else {
      showToast("Discipline updated successfully!");
      setIsEditRoomModalOpen(false);
      setEditingRoomId(null);
      fetchDisciplinesData();
    }
  };

  // --- ACTION: ADD SECTION TO EXISTING DISCIPLINE ---
  const handleOpenAddSectionModal = (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsSectionModalOpen(true);
  };

  const handleAddSectionToRoom = async () => {
    if (!selectedRoomId || !subSectionName || !subChairCount) {
      showToast("Please fill in the section name and chair count.", "warning");
      return;
    }

    const targetRoom = rooms.find((r) => r.room_id === selectedRoomId);
    if (targetRoom && targetRoom.sections) {
      const isSectionDuplicate = targetRoom.sections.some(
          (sec) => sec.section_name.trim().toLowerCase() === subSectionName.trim().toLowerCase()
      );

      if (isSectionDuplicate) {
        showToast(`The section "${subSectionName}" already exists under ${targetRoom.room_name}.`, "error");
        return;
      }
    }

    const { error } = await supabase
        .from("sections")
        .insert([
          {
            room_id: selectedRoomId,
            section_name: subSectionName.trim(),
            chair_count: parseInt(subChairCount as string, 10)
          }
        ]);

    if (error) {
      showToast(`Error creating section: ${error.message}`, "error");
    } else {
      showToast("Section created successfully.");
      setSubSectionName("");
      setSubChairCount("");
      setIsSectionModalOpen(false);
      setSelectedRoomId(null);
      fetchDisciplinesData();
    }
  };

  // --- ACTION: OPEN MODAL EDIT SECTION ---
  const openEditSectionModal = (sec: Section) => {
    setEditingSectionId(sec.section_id);
    setEditingSectionRoomId(sec.room_id);
    setEditedSectionName(sec.section_name);
    setEditedChairCount(sec.chair_count);
    setIsEditSectionModalOpen(true);
  };

  const handleUpdateSection = async () => {
    if (!editedSectionName.trim() || !editedChairCount) {
      showToast("Please provide valid section properties.", "warning");
      return;
    }

    const targetRoom = rooms.find((r) => r.room_id === editingSectionRoomId);
    if (targetRoom && targetRoom.sections) {
      const isDuplicate = targetRoom.sections.some(
          (s) => s.section_id !== editingSectionId && s.section_name.trim().toLowerCase() === editedSectionName.trim().toLowerCase()
      );

      if (isDuplicate) {
        showToast(`The section "${editedSectionName}" already exists in this discipline.`, "error");
        return;
      }
    }

    const { error } = await supabase
        .from("sections")
        .update({
          section_name: editedSectionName.trim(),
          chair_count: parseInt(editedChairCount as string, 10)
        })
        .eq("section_id", editingSectionId);

    if (error) {
      showToast(`Update failed: ${error.message}`, "error");
    } else {
      showToast("Section updated successfully!");
      setIsEditSectionModalOpen(false);
      setEditingSectionId(null);
      setEditingSectionRoomId(null);
      fetchDisciplinesData();
    }
  };

  // --- DELETE CONFIRMATION HANDLERS ---
  const triggerDeleteConfirm = (e: React.MouseEvent, type: "room" | "section", id: number, name: string) => {
    e.stopPropagation();
    setDeleteConfirm({ open: true, type, id, targetName: name });
  };

  const handleExecuteDelete = async () => {
    const { type, id } = deleteConfirm;
    if (!type || !id) return;

    if (type === "room") {
      const { error } = await supabase.from("rooms").delete().eq("room_id", id);
      if (error) {
        showToast(`Could not delete discipline: ${error.message}`, "error");
      } else {
        showToast("Discipline deleted successfully.");
        fetchDisciplinesData();
      }
    } else if (type === "section") {
      const { error } = await supabase.from("sections").delete().eq("section_id", id);
      if (error) {
        showToast(`Could not delete section: ${error.message}`, "error");
      } else {
        showToast("Section deleted successfully.");
        fetchDisciplinesData();
      }
    }

    setDeleteConfirm({ open: false, type: null, id: null, targetName: "" });
  };

  // --- STUDENT ACTIONS ---
  const handleAddStudentToGroup = async (studentId: string) => {
    if (!activeBatchId) return;

    const { error } = await supabase
        .from("clinician")
        .update({ group_id: parseInt(activeBatchId) })
        .eq("clinician_id", studentId);

    if (error) {
      showToast(`Error adding student: ${error.message}`, "error");
    } else {
      setUnassignedStudents(prev => prev.filter(s => s.id !== studentId));
      fetchStudentsData();
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    const { error } = await supabase
        .from("clinician")
        .update({ group_id: null })
        .eq("clinician_id", studentId);

    if (error) {
      showToast(`Error removing student: ${error.message}`, "error");
    } else {
      fetchStudentsData();
    }
  };

  const allStudents: Student[] = batches.flatMap(batch =>
      batch.students.map(s => ({ ...s, batchName: batch.name }))
  );

  const filteredAllStudents = allStudents.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress sx={{ color: "#493978" }} />
        </Box>
    );
  }

  return (
      <Box fontFamily="Inter" sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ mb: 0.5 }}>
            Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage disciplines, sections, dental chairs, and students
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              TabIndicatorProps={{ style: { backgroundColor: "#493978" } }}
              sx={{
                "& .MuiTab-root": { textTransform: "none", fontWeight: "600", fontSize: "1rem" },
                "& .Mui-selected": { color: "#493978 !important" }
              }}
          >
            <Tab label="Students" />
            <Tab label="Disciplines" />
          </Tabs>
        </Box>

        {/* ==================== TAB 0: STUDENTS ==================== */}
        {activeTab === 0 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4, width: "300px", mx: "auto" }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, value) => value && setViewMode(value)}
                    sx={{
                      bgcolor: "#fff",
                      borderRadius: "50px",
                      p: 0.5,
                      boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
                      width: "100%",
                      maxHeight: "40px"
                    }}
                >
                  <ToggleButton value="batch" sx={{ flex: 1, borderRadius: "50px !important", border: "none", textTransform: "none", fontWeight: "bold", "&.Mui-selected": { bgcolor: "#493978", color: "#fff", "&:hover": { bgcolor: "#4b40a3" } } }}>
                    By batch
                  </ToggleButton>
                  <ToggleButton value="all" sx={{ flex: 1, borderRadius: "50px !important", border: "none", textTransform: "none", fontWeight: "bold", "&.Mui-selected": { bgcolor: "#493978", color: "#fff", "&:hover": { bgcolor: "#4b40a3" } } }}>
                    All
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {viewMode === "all" && (
                  <TextField
                      fullWidth
                      placeholder="Search all students..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ mb: 2, bgcolor: "#fff", borderRadius: "12px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e0e0e0" } }}
                      InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: "#5c51b6" }} />
                            </InputAdornment>
                        ),
                      }}
                  />
              )}

              {viewMode === "batch" &&
                  batches.map((batch) => {
                    const isEditing = editBatchId === batch.id;
                    return (
                        <Accordion
                            key={batch.id}
                            disableGutters
                            elevation={0}
                            sx={{ mb: 3, borderRadius: "8px !important", overflow: "hidden", "&:before": { display: "none" } }}
                        >
                          <AccordionSummary
                              expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                              sx={{
                                bgcolor: isEditing ? "#3f3693" : "#493978",
                                color: "#fff",
                                flexDirection: "row",
                                "& .MuiAccordionSummary-content": { alignItems: "center", justifyContent: "space-between" },
                              }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <StarsIcon fontSize="small" />
                              <Typography sx={{ fontWeight: "500" }}>
                                {batch.name} ({batch.students.length})
                              </Typography>
                            </Box>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditBatchId(isEditing ? null : batch.id); }} sx={{ color: "#fff", mr: 1 }}>
                              {isEditing ? <CheckCircleOutlineIcon /> : <EditIcon fontSize="small" />}
                            </IconButton>
                          </AccordionSummary>

                          <AccordionDetails sx={{ p: 0, bgcolor: "#fff" }}>
                            <List disablePadding>
                              {isEditing && (
                                  <ListItem sx={{ borderBottom: "1px solid #eee", py: 1.5, justifyContent: "center" }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<PersonAddAltIcon />}
                                        onClick={() => { setActiveBatchId(batch.id); setIsModalOpen(true); fetchUnassignedStudents(); }}
                                        sx={{ color: "#493978", borderColor: "#493978", textTransform: "none", borderRadius: "20px", "&:hover": { borderColor: "#3f3693", bgcolor: "#f4f3f8" } }}
                                    >
                                      Add Group Member
                                    </Button>
                                  </ListItem>
                              )}

                              {batch.students.length > 0 ? (
                                  batch.students.map((student) => (
                                      <ListItem
                                          key={student.id}
                                          sx={{ borderBottom: "1px solid #f0f0f5", "&:last-child": { borderBottom: "none" } }}
                                          secondaryAction={
                                              isEditing && (
                                                  <IconButton edge="end" onClick={() => handleDeleteStudent(student.id)}>
                                                    <RemoveCircleOutlineIcon sx={{ color: "#493978" }} />
                                                  </IconButton>
                                              )
                                          }
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: "#ccc", width: 32, height: 32 }}><AccountCircleIcon /></Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={student.name}
                                            secondary={`${student.studentNumber} • Year Level ${student.yearLevel}`}
                                            primaryTypographyProps={{ color: "#493978", fontSize: "0.95rem", fontWeight: 500 }}
                                        />
                                      </ListItem>
                                  ))
                              ) : (
                                  <Typography variant="body2" sx={{ p: 2, color: "#999", textAlign: "center" }}>
                                    No students registered in this batch.
                                  </Typography>
                              )}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                    );
                  })}

              {viewMode === "all" && (
                  <Box sx={{ bgcolor: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0", overflow: "hidden" }}>
                    <List disablePadding>
                      {filteredAllStudents.map((student) => (
                          <ListItem key={student.id} sx={{ borderBottom: "1px solid #f0f0f5" }}>
                            <ListItemAvatar>
                              <Avatar
                                  src={student.pfpUrl || undefined}
                                  sx={{ width: 32, height: 32 }}
                              >
                                <AccountCircleIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={student.name}
                                secondary={`Batch: ${student.batchName} | ID: ${student.studentNumber}`}
                                primaryTypographyProps={{ color: "#5c51b6", fontWeight: "bold" }}
                            />
                          </ListItem>
                      ))}
                    </List>
                  </Box>
              )}
            </Box>
        )}

        {/* ==================== TAB 1: DISCIPLINES ==================== */}
        {activeTab === 1 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsDisciplineModalOpen(true)}
                    sx={{ bgcolor: "#493978", textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#3f3693" } }}
                >
                  Add Discipline
                </Button>
              </Box>

              {rooms.map((room) => (
                  <Accordion
                      key={room.room_id}
                      disableGutters
                      elevation={0}
                      sx={{ mb: 2, borderRadius: "8px !important", overflow: "hidden", border: "1px solid #e0e0e0", "&:before": { display: "none" } }}
                  >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                        sx={{ bgcolor: "#493978", color: "#fff", "& .MuiAccordionSummary-content": { alignItems: "center", justifyContent: "space-between" } }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <MeetingRoomIcon fontSize="small" />
                        <Typography sx={{ fontWeight: "600" }}>{room.room_name}</Typography>
                      </Box>

                      <Box>
                        <IconButton size="small" onClick={(e) => openEditRoomModal(e, room)} sx={{ color: "#fff", mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={(e) => triggerDeleteConfirm(e, "room", room.room_id, room.room_name)} sx={{ color: "#ffb3b3" }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0, bgcolor: "#fff" }}>
                      <List disablePadding>
                        <ListItem sx={{ borderBottom: "1px solid #eee", py: 1.5, justifyContent: "center" }}>
                          <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenAddSectionModal(room.room_id)}
                              sx={{ color: "#493978", borderColor: "#493978", textTransform: "none", borderRadius: "20px", "&:hover": { borderColor: "#3f3693", bgcolor: "#f4f3f8" } }}
                          >
                            Add Section
                          </Button>
                        </ListItem>

                        {room.sections && room.sections.length > 0 ? (
                            room.sections.map((sec) => (
                                <ListItem
                                    key={sec.section_id}
                                    sx={{ borderBottom: "1px solid #f0f0f5", "&:last-child": { borderBottom: "none" } }}
                                    secondaryAction={
                                      <Box>
                                        <IconButton size="small" onClick={() => openEditSectionModal(sec)} sx={{ color: "#493978", mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" onClick={(e) => triggerDeleteConfirm(e, "section", sec.section_id, sec.section_name)} sx={{ color: "#d32f2f" }}><DeleteIcon fontSize="small" /></IconButton>
                                      </Box>
                                    }
                                >
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: "#f4f3f8", color: "#493978", width: 36, height: 36 }}>
                                      <EventSeatIcon fontSize="small" />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                      primary={sec.section_name}
                                      secondary={`Dental Chairs Assigned: ${sec.chair_count}`}
                                      primaryTypographyProps={{ color: "#333", fontWeight: 500, fontSize: "0.95rem" }}
                                  />
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ p: 2, color: "#999", textAlign: "center" }}>
                              No configurations/sections defined for this room.
                            </Typography>
                        )}
                      </List>
                    </AccordionDetails>
                  </Accordion>
              ))}
            </Box>
        )}

        {/* --- POPUP DIALOG FOR UNASSIGNED STUDENTS --- */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Select Student to Add</DialogTitle>
          <Divider />
          <DialogContent sx={{ minHeight: "250px", p: 0 }}>
            {loadingUnassigned ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}><CircularProgress sx={{ color: "#493978" }} /></Box>
            ) : unassignedStudents.length > 0 ? (
                <List>
                  {unassignedStudents.map((student) => (
                      <ListItem key={student.id} divider secondaryAction={<IconButton edge="end" onClick={() => handleAddStudentToGroup(student.id)} sx={{ color: "#493978" }}><PersonAddAltIcon /></IconButton>}>
                        <ListItemAvatar><Avatar sx={{ width: 36, height: 36 }}><AccountCircleIcon /></Avatar></ListItemAvatar>
                        <ListItemText primary={student.name} secondary={`ID: ${student.studentNumber} • Yr Level: ${student.yearLevel}`} primaryTypographyProps={{ fontWeight: 500, color: "#333" }} />
                      </ListItem>
                  ))}
                </List>
            ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", p: 3 }}><Typography variant="body1" color="textSecondary" align="center">All clinicians are currently assigned to a group!</Typography></Box>
            )}
          </DialogContent>
          <Divider />
          <DialogActions><Button onClick={() => setIsModalOpen(false)} sx={{ color: "#493978", fontWeight: "bold" }}>Close</Button></DialogActions>
        </Dialog>

        {/* --- POPUP DIALOG FOR ADDING DISCIPLINE / ROOM --- */}
        <Dialog open={isDisciplineModalOpen} onClose={() => setIsDisciplineModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Add New Discipline</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField fullWidth label="Discipline Name" placeholder="e.g., Room 1" variant="outlined" size="small" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
            {!hasCustomSection ? (
                <Button size="small" variant="text" startIcon={<AddIcon />} onClick={() => setHasCustomSection(true)} sx={{ color: "#493978", alignSelf: "flex-start", textTransform: "none", fontWeight: "600" }}>
                  Add custom section under this room
                </Button>
            ) : (
                <TextField fullWidth label="Section Name" placeholder="e.g., Section 999" variant="outlined" size="small" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} />
            )}
            <TextField fullWidth label="Number of Dental Chairs" type="number" inputProps={{ min: "1" }} placeholder="e.g., 10" variant="outlined" size="small" value={newChairCount} onChange={(e) => setNewChairCount(e.target.value)} />
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => { setIsDisciplineModalOpen(false); setHasCustomSection(false); }} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
            <Button onClick={handleAddDiscipline} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Save Discipline</Button>
          </DialogActions>
        </Dialog>

        {/* --- POPUP DIALOG FOR ADDING SECTION TO EXISTING ROOM --- */}
        <Dialog open={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Add New Section</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField fullWidth label="Section Name" placeholder="e.g., Section A" variant="outlined" size="small" value={subSectionName} onChange={(e) => setSubSectionName(e.target.value)} />
            <TextField fullWidth label="Number of Dental Chairs" type="number" inputProps={{ min: "1" }} placeholder="e.g., 12" variant="outlined" size="small" value={subChairCount} onChange={(e) => setSubChairCount(e.target.value)} />
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => setIsSectionModalOpen(false)} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
            <Button onClick={handleAddSectionToRoom} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Add Section</Button>
          </DialogActions>
        </Dialog>

        {/* --- POPUP DIALOG FOR EDITING AN EXISTING DISCIPLINE / ROOM --- */}
        <Dialog open={isEditRoomModalOpen} onClose={() => setIsEditRoomModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Edit Discipline Name</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3 }}>
            <TextField fullWidth label="Discipline Name" variant="outlined" size="small" value={editedRoomName} onChange={(e) => setEditedRoomName(e.target.value)} />
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => setIsEditRoomModalOpen(false)} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
            <Button onClick={handleUpdateRoomName} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* --- POPUP DIALOG FOR EDITING AN EXISTING SECTION --- */}
        <Dialog open={isEditSectionModalOpen} onClose={() => setIsEditSectionModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Edit Section Properties</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField fullWidth label="Section Name" variant="outlined" size="small" value={editedSectionName} onChange={(e) => setEditedSectionName(e.target.value)} />
            <TextField fullWidth label="Number of Dental Chairs" type="number" inputProps={{ min: "1" }} variant="outlined" size="small" value={editedChairCount} onChange={(e) => setEditedChairCount(e.target.value)} />
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => setIsEditSectionModalOpen(false)} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
            <Button onClick={handleUpdateSection} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* --- REUSABLE DELETE CONFIRMATION DIALOG --- */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm(prev => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ color: "#d32f2f", fontWeight: "bold" }}>Are you sure?</DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              You are about to delete <strong>{deleteConfirm.targetName}</strong>.
            </Typography>
            <Typography variant="body2" color="error" sx={{ fontWeight: "bold" }}>
              This action cannot be undone message
            </Typography>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(prev => ({ ...prev, open: false }))} sx={{ color: "#555", textTransform: "none" }}>Cancel</Button>
            <Button onClick={handleExecuteDelete} variant="contained" color="error" sx={{ textTransform: "none" }}>Delete Permanently</Button>
          </DialogActions>
        </Dialog>

        {/* --- FEEDBACK SNACKBAR NOTIFICATION --- */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ mx: 1, my: 1 }}
        >
          <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: "100%", borderRadius: "8px", fontWeight: "500" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default Management;