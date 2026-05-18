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
  Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarsIcon from "@mui/icons-material/Stars";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { supabase } from "../../../utils/supabase";

// --- Types & Interfaces ---
interface Student {
  id: string;
  name: string;
  studentNumber: string;
  yearLevel: string;
  batchName?: string;
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

const Students: React.FC = () => {
  const [viewMode, setViewMode] = useState<"batch" | "all">("batch");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal / Popup States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  // --- 1. FETCH BATCHES & ASSIGNED STUDENTS ---
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_groups')
      .select(`
        group_id,
        group_name,
        clinician (
          clinician_id,
          student_number,
          year_level,
          profiles (
            first_name,
            last_name
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
          name: c.profiles ? `${c.profiles.first_name} ${c.profiles.last_name}` : "Unknown Student"
        }))
      }));
      setBatches(formattedBatches);
    }
    setLoading(false);
  };

  // --- 2. FETCH UNASSIGNED STUDENTS FOR POPUP ---
  const fetchUnassignedStudents = async () => {
    setLoadingUnassigned(true);
    const { data, error } = await supabase
      .from('clinician')
      .select(`
        clinician_id,
        student_number,
        year_level,
        profiles (
          first_name,
          last_name
        )
      `)
      .is('group_id', null); // Targets students not in any group

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
    fetchData();
  }, []);

  const allStudents: Student[] = batches.flatMap(batch => 
    batch.students.map(s => ({ ...s, batchName: batch.name }))
  );

  const filteredAllStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditToggle = (e: React.MouseEvent, batchId: string) => {
    e.stopPropagation();
    if (editBatchId === batchId) {
      setEditBatchId(null);
    } else {
      setEditBatchId(batchId);
    }
  };

  // Open popup and set context for which batch we are editing
  const handleOpenAddModal = (batchId: string) => {
    setActiveBatchId(batchId);
    setIsModalOpen(true);
    fetchUnassignedStudents();
  };

  // --- 3. ADD STUDENT TO GROUP FUNCTION ---
  const handleAddStudentToGroup = async (studentId: string) => {
    if (!activeBatchId) return;

    const { error } = await supabase
      .from('clinician')
      .update({ group_id: parseInt(activeBatchId) }) // Match integer database type
      .eq('clinician_id', studentId);

    if (error) {
      console.error("Error adding student to group:", error);
      alert(`Error adding student: ${error.message}`);
    } else {
      // Instantly update local list of available students without closing popup yet
      setUnassignedStudents(prev => prev.filter(s => s.id !== studentId));
      // Refresh background grid
      fetchData();
    }
  };

  // --- 4. REMOVE STUDENT FROM GROUP FUNCTION ---
  const handleDeleteStudent = async (batchId: string, studentId: string) => {
    const { error } = await supabase
      .from('clinician')
      .update({ group_id: null })
      .eq('clinician_id', studentId);

    if (error) {
      console.error("Error removing student:", error);
      alert(`Error removing student: ${error.message}`);
    } else {
      fetchData();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#493978' }} />
      </Box>
    );
  }

  return (
    <Box fontFamily="Inter" sx={{ p: 3 }}>
      {/* Page Title */}
      <Typography variant="h4" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ mb: 2 }}>
        Students
      </Typography>

      {/* Filter Toggle (By batch / All) */}
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

      {/* Accordion Batch List */}
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
              {/* Accordion Header */}
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
                
                <IconButton size="small" onClick={(e) => handleEditToggle(e, batch.id)} sx={{ color: "#fff", mr: 1 }}>
                  {isEditing ? <CheckCircleOutlineIcon /> : <EditIcon fontSize="small" />}
                </IconButton>
              </AccordionSummary>

              {/* Accordion Body Content */}
              <AccordionDetails sx={{ p: 0, bgcolor: "#fff" }}>
                <List disablePadding>
                  {/* Action Row replaced with explicit "Add Member Button" */}
                  {isEditing && (
                    <ListItem sx={{ borderBottom: "1px solid #eee", py: 1.5, justifyContent: "center" }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<PersonAddAltIcon />}
                        onClick={() => handleOpenAddModal(batch.id)}
                        sx={{ color: "#493978", borderColor: "#493978", textTransform: 'none', borderRadius: '20px', '&:hover': { borderColor: '#3f3693', bgcolor: '#f4f3f8' } }}
                      >
                        Add Group Member
                      </Button>
                    </ListItem>
                  )}

                  {/* Student Records List */}
                  {batch.students.length > 0 ? (
                    batch.students.map((student) => (
                      <ListItem
                        key={student.id}
                        sx={{ borderBottom: "1px solid #f0f0f5", "&:last-child": { borderBottom: "none" } }}
                        secondaryAction={
                          isEditing && (
                            <IconButton edge="end" onClick={() => handleDeleteStudent(batch.id, student.id)}>
                              <RemoveCircleOutlineIcon sx={{ color: "#493978" }} />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#ccc", width: 32, height: 32 }}>
                            <AccountCircleIcon />
                          </Avatar>
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
        <Box sx={{ bgcolor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <List disablePadding>
            {filteredAllStudents.map((student) => (
              <ListItem key={student.id} sx={{ borderBottom: "1px solid #f0f0f5" }}>
                <ListItemAvatar><Avatar sx={{ width: 32, height: 32 }}><AccountCircleIcon /></Avatar></ListItemAvatar>
                <ListItemText 
                  primary={student.name} 
                  secondary={`Batch: ${student.batchName} | ID: ${student.studentNumber}`}
                  primaryTypographyProps={{ color: "#5c51b6", fontWeight: 'bold' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* --- POPUP DIALOG FOR UNASSIGNED STUDENTS --- */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ color: '#493978', fontWeight: 'bold' }}>
          Select Student to Add
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ minHeight: '250px', p: 0 }}>
          {loadingUnassigned ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress sx={{ color: '#493978' }} />
            </Box>
          ) : unassignedStudents.length > 0 ? (
            <List>
              {unassignedStudents.map((student) => (
                <ListItem 
                  key={student.id}
                  divider
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => handleAddStudentToGroup(student.id)}
                      sx={{ color: '#493978' }}
                    >
                      <PersonAddAltIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36 }}><AccountCircleIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={student.name} 
                    secondary={`ID: ${student.studentNumber} • Yr Level: ${student.yearLevel}`}
                    primaryTypographyProps={{ fontWeight: 500, color: '#333' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', p: 3 }}>
              <Typography variant="body1" color="textSecondary" align="center">
                All clinicians are currently assigned to a group!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} sx={{ color: '#493978', fontWeight: 'bold' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;