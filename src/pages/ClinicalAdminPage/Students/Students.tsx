import React, { useState, useEffect } from "react";
import {Typography, ToggleButtonGroup, ToggleButton, Box, Accordion, AccordionSummary, AccordionDetails, List,
  ListItem, ListItemAvatar, ListItemText, Avatar, IconButton,TextField, InputAdornment, CircularProgress} from "@mui/material";
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
  batchName?: string;
}

interface Batch {
  id: string;
  name: string;
  students: Student[];
}

const Students: React.FC = () => {
  const [viewMode, setViewMode] = useState<"batch" | "all">("batch");
  const [batches, setBatches] = useState<Batch[]>([]); // Start with empty array
  const [loading, setLoading] = useState(true); // Added loading state
  
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. FETCH DATA FROM SUPABASE ---
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_groups')
      .select(`
        group_id,
        group_name,
        clinician (
          clinician_id,
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
        students: group.clinician.map((c: any) => ({
          id: c.clinician_id,
          name: `${c.profiles.first_name} ${c.profiles.last_name}`
        }))
      }));
      setBatches(formattedBatches);
    }
    setLoading(false);
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

  // Toggle edit mode for a batch
  const handleEditToggle = (e: React.MouseEvent, batchId: string) => {
    e.stopPropagation(); // Prevents the accordion from opening/closing when hitting edit
    if (editBatchId === batchId) {
      setEditBatchId(null); // Save / Exit edit mode
    } else {
      setEditBatchId(batchId); // Enter edit mode
    }
  };

  // Add a new student to a batch
  const handleAddStudent = async (batchId: string) => {
    if (!newStudentName.trim()) return;

    // Note: Usually you'd search for a student first. 
    // This assumes you are creating a new record or updating an existing one.
    // For this example, let's refresh after update:
    alert("In a real app, you would pick an existing clinician to assign to this group.");
    setNewStudentName("");
  };
  // Delete a student from a batch
  const handleDeleteStudent = async (batchId: string, studentId: string) => {
    const { error } = await supabase
      .from('clinician')
      .update({ group_id: null }) // Unassigning them from the group
      .eq('clinician_id', studentId);

    if (!error) {
      fetchData(); // Refresh the list
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#493978' }} />
      </Box>
    );
  };

  return (
    <Box fontFamily="Inter">
      {/* Page Title */}
      <Typography variant="h4" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ my: 2, mx: 3 }}>
        Students
      </Typography>

      {/* Filter Toggle (By batch / All) */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4, width: "300px", mx: "auto"  }}>
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
          <ToggleButton
            value="batch"
            sx={{
              flex: 1,
              borderRadius: "50px !important",
              border: "none",
              textTransform: "none",
              fontWeight: "bold",
              "&.Mui-selected": { bgcolor: "#493978", color: "#fff", "&:hover": { bgcolor: "#4b40a3" } },
            }}
          >
            By batch
          </ToggleButton>
          <ToggleButton
            value="all"
            sx={{
              flex: 1,
              borderRadius: "50px !important",
              border: "none",
              textTransform: "none",
              fontWeight: "bold",
              "&.Mui-selected": { bgcolor: "#493978", color: "#fff", "&:hover": { bgcolor: "#4b40a3" } },
            }}
          >
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
          sx={{ 
            mb: 2, 
            bgcolor: "#fff", 
            borderRadius: "12px",
            "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e0e0e0" }
          }}
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
              sx={{
                mx: 3,
                mb: 3,
                borderRadius: "8px !important",
                overflow: "hidden",
                "&:before": { display: "none" }, // Removes default MUI line divider
              }}
            >
              {/* Accordion Header */}
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                sx={{
                  bgcolor: isEditing ? "#3f3693" : "#493978",
                  color: "#fff",
                  flexDirection: "row",
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    justifyContent: "space-between",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarsIcon fontSize="small" />
                  <Typography sx={{ fontWeight: "500" }}>
                    {batch.name} ({batch.students.length})
                  </Typography>
                </Box>
                
                {/* Edit Mode Control Trigger Button */}
                <IconButton
                  size="small"
                  onClick={(e) => handleEditToggle(e, batch.id)}
                  sx={{ color: "#fff", mr: 1 }}
                >
                  {isEditing ? <CheckCircleOutlineIcon /> : <EditIcon fontSize="small" />}
                </IconButton>
              </AccordionSummary>

              {/* Accordion Body Content */}
              <AccordionDetails sx={{ p: 0, bgcolor: "#fff" }}>
                <List disablePadding>
                  {/* "Add Member" Row (Only showing during Edit Mode) */}
                  {isEditing && (
                    <ListItem sx={{ borderBottom: "1px solid #eee", py: 1 }}>
                      <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Add member.."
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => handleAddStudent(batch.id)} color="primary">
                                <PersonAddAltIcon sx={{ color: "#493978" }} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ px: 1 }}
                      />
                    </ListItem>
                  )}

                  {/* Student Records List */}
                  {batch.students.length > 0 ? (
                    batch.students.map((student) => (
                      <ListItem
                        key={student.id}
                        sx={{
                          borderBottom: "1px solid #f0f0f5",
                          "&:last-child": { borderBottom: "none" },
                        }}
                        secondaryAction={
                          isEditing && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteStudent(batch.id, student.id)}
                            >
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
                          primaryTypographyProps={{ color: "#493978", fontSize: "0.95rem" }}
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
                  secondary={student.batchName}
                  primaryTypographyProps={{ color: "#5c51b6", fontWeight: 'bold' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default Students;