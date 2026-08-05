import { router } from "@inertiajs/react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
    Typography, Box, Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, TextField, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Tabs, Tab, Snackbar, Alert,
    MenuItem
} from "@mui/material";
import React, { useState, useEffect } from "react";

const STUDENT_ROLE_ID = 3;

// --- Types & Interfaces ---
interface Role {
    id: number;
    role_name: string;
}

interface StudentGroupOption {
    id: number;
    name: string;
}

interface ClinicianInfo {
    student_group_id: number | null;
    group_name: string;
    student_number: string;
    year_level: string;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    pfpUrl?: string | null;
    role_id: number;
    role_name: string;
    clinician: ClinicianInfo | null;
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

interface ManagementProps {
    users: UserRow[];
    roles: Role[];
    studentGroups: StudentGroupOption[];
    rooms: Room[];
    flash?: { success?: string; error?: string };
    errors?: any;
}

export default function Management({ users, roles, studentGroups, rooms, flash, errors }: ManagementProps) {
    // Navigation States
    const [activeTab, setActiveTab] = useState<number>(0);

    // Snackbar States
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" }>({
        open: false,
        message: "",
        severity: "success"
    });

    // Global Delete Confirmation States
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: "room" | "section" | "user" | null; id: number | null; targetName: string }>({
        open: false, type: null, id: null, targetName: ""
    });

    // --- USERS TAB STATES ---
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<number | "all">("all");
    const [groupFilter, setGroupFilter] = useState<number | "all">("all");

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRoleId, setNewUserRoleId] = useState<number | "">("");
    const [newUserGroupId, setNewUserGroupId] = useState<number | "">("");
    const [newUserStudentNumber, setNewUserStudentNumber] = useState("");
    const [newUserYearLevel, setNewUserYearLevel] = useState("");

    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [editUserGroupId, setEditUserGroupId] = useState<number | "">("");
    const [editUserStudentNumber, setEditUserStudentNumber] = useState("");
    const [editUserYearLevel, setEditUserYearLevel] = useState("");

    // Discipline States
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

    // Dedicated Modal Editing States
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
    const [editedRoomName, setEditedRoomName] = useState("");

    const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
    const [editedSectionName, setEditedSectionName] = useState("");
    const [editedChairCount, setEditedChairCount] = useState<number | string>("");

    // --- SNACKBAR LISTENER ---
    useEffect(() => {
        if (flash?.success) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSnackbar({ open: true, message: flash.success, severity: "success" });
        }

        if (flash?.error) {
            setSnackbar({ open: true, message: flash.error, severity: "error" });
        }

        if (errors && Object.keys(errors).length > 0) {
            setSnackbar({ open: true, message: Object.values(errors)[0] as string, severity: "error" });
        }
    }, [flash, errors]);

    // --- ACTION: ADD USER ---
    const handleAddUser = () => {
        if (!newUserName || !newUserEmail || !newUserRoleId) {
            setSnackbar({ open: true, message: "Please fill in the required user details.", severity: "warning" });

            return;
        }

        if (newUserRoleId === STUDENT_ROLE_ID && (!newUserGroupId || !newUserStudentNumber || !newUserYearLevel)) {
            setSnackbar({ open: true, message: "Please fill in the student details.", severity: "warning" });

            return;
        }

        router.post('admin/management/users', {
            name: newUserName,
            email: newUserEmail,
            role_id: newUserRoleId,
            student_group_id: newUserRoleId === STUDENT_ROLE_ID ? newUserGroupId : null,
            student_number: newUserRoleId === STUDENT_ROLE_ID ? newUserStudentNumber : null,
            year_level: newUserRoleId === STUDENT_ROLE_ID ? newUserYearLevel : null,
        }, {
            onSuccess: () => {
                setNewUserName("");
                setNewUserEmail("");
                setNewUserRoleId("");
                setNewUserGroupId("");
                setNewUserStudentNumber("");
                setNewUserYearLevel("");
                setIsAddUserModalOpen(false);
            }
        });
    };

    // --- ACTION: OPEN EDIT USER (STUDENT INFO ONLY) ---
    const openEditUserModal = (user: UserRow) => {
        setEditingUserId(user.id);
        setEditUserGroupId(user.clinician?.student_group_id ?? "");
        setEditUserStudentNumber(user.clinician?.student_number ?? "");
        setEditUserYearLevel(user.clinician?.year_level ?? "");
        setIsEditUserModalOpen(true);
    };

    const handleUpdateUserStudentInfo = () => {
        if (!editingUserId || !editUserStudentNumber || !editUserYearLevel) {
            return;
        }

        router.put(`admin/management/users/${editingUserId}/student-info`, {
            student_group_id: editUserGroupId || null,
            student_number: editUserStudentNumber,
            year_level: editUserYearLevel,
        }, {
            onSuccess: () => {
                setIsEditUserModalOpen(false);
                setEditingUserId(null);
            }
        });
    };

    // --- ACTION: ADD DISCIPLINE ---
    const handleAddDiscipline = () => {
        if (!newRoomName || !newChairCount) {
            setSnackbar({ open: true, message: "Please fill in the discipline details.", severity: "warning" });

            return;
        }

        router.post('admin/management/rooms', {
            room_name: newRoomName,
            has_custom_section: hasCustomSection,
            section_name: newSectionName,
            chair_count: newChairCount
        }, {
            onSuccess: () => {
                setNewRoomName("");
                setNewChairCount("");
                setNewSectionName("");
                setHasCustomSection(false);
                setIsDisciplineModalOpen(false);
            }
        });
    };

    // --- ACTION: OPEN MODAL EDIT DISCIPLINE ---
    const openEditRoomModal = (e: React.MouseEvent, room: Room) => {
        e.stopPropagation();
        setEditingRoomId(room.room_id);
        setEditedRoomName(room.room_name);
        setIsEditRoomModalOpen(true);
    };

    const handleUpdateRoomName = () => {
        if (!editedRoomName.trim() || !editingRoomId) {
            return;
        }

        router.put(
            `admin/management/rooms/${editingRoomId}`,
            {
                room_name: editedRoomName,
            },
            {
                onSuccess: () => {
                    setIsEditRoomModalOpen(false);
                    setEditingRoomId(null);
                },
            }
        );
    };

    // --- ACTION: ADD SECTION TO EXISTING DISCIPLINE ---
    const handleOpenAddSectionModal = (roomId: number) => {
        setSelectedRoomId(roomId);
        setIsSectionModalOpen(true);
    };

    const handleAddSectionToRoom = () => {
        if (!selectedRoomId || !subSectionName || !subChairCount) {
            return;
        }

        router.post(
            `admin/management/rooms/${selectedRoomId}/sections`,
            {
                section_name: subSectionName,
                chair_count: subChairCount,
            },
            {
                onSuccess: () => {
                    setSubSectionName("");
                    setSubChairCount("");
                    setIsSectionModalOpen(false);
                    setSelectedRoomId(null);
                },
            }
        );
    };

    // --- ACTION: OPEN MODAL EDIT SECTION ---
    const openEditSectionModal = (sec: Section) => {
        setEditingSectionId(sec.section_id);
        setEditedSectionName(sec.section_name);
        setEditedChairCount(sec.chair_count);
        setIsEditSectionModalOpen(true);
    };

    const handleUpdateSection = () => {
        if (!editedSectionName.trim() || !editedChairCount || !editingSectionId) {
            return;
        }

        router.put(`admin/management/sections/${editingSectionId}`, {
            section_name: editedSectionName,
            chair_count: editedChairCount
        }, {
            onSuccess: () => {
                setIsEditSectionModalOpen(false);
                setEditingSectionId(null);
            }
        });
    };

    // --- DELETE CONFIRMATION HANDLERS ---
    const triggerDeleteConfirm = (e: React.MouseEvent, type: "room" | "section" | "user", id: number, name: string) => {
        e.stopPropagation();
        setDeleteConfirm({ open: true, type, id, targetName: name });
    };

    const handleExecuteDelete = () => {
        const { type, id } = deleteConfirm;

        if (!type || !id) {
            return;
        }

        const url = type === "room"
            ? `admin/management/rooms/${id}`
            : type === "section"
                ? `admin/management/sections/${id}`
                : `admin/management/users/${id}`;

        router.delete(url, {
            onSuccess: () => setDeleteConfirm({ open: false, type: null, id: null, targetName: "" })
        });
    };

    // --- FILTERED / SORTED USERS ---
    const filteredUsers = users
        .filter(u => roleFilter === "all" || u.role_id === roleFilter)
        .filter(u => {
            if (roleFilter !== STUDENT_ROLE_ID || groupFilter === "all") {
                return true;
            }

            return u.clinician?.student_group_id === groupFilter;
        })
        .filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const toTitleCase = (text: string) =>
        text.replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <Box sx={{ p: 2, fontFamily: "Inter" }}>
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ color:"#493979", fontWeight:"700", fontFamily:"Poppins", mb: 0.5 }}>
                    Management
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Manage users, disciplines, sections, and dental chairs
                </Typography>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    slotProps={{
                        indicator: {
                            sx: {
                                backgroundColor: "#493978",
                            },
                        },
                    }}
                    sx={{
                        "& .MuiTab-root": { textTransform: "none", fontWeight: "600", fontSize: "1rem" },
                        "& .Mui-selected": { color: "#493978 !important" }
                    }}
                >
                    <Tab label="Users" />
                    <Tab label="Disciplines" />
                </Tabs>
            </Box>

            {/* ==================== TAB 0: USERS ==================== */}
            {activeTab === 0 && (
                <Box>
                    {/* Search */}
                    <TextField
                        fullWidth placeholder="Search users..." variant="outlined" size="small"
                        value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)}
                        sx={{ mb: 2, bgcolor: "#fff", borderRadius: "12px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e0e0e0" } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "#5c51b6" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {/* Filters + Add User */}
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1.5,
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <TextField
                            select
                            label="Role"
                            size="small"
                            value={roleFilter}
                            onChange={(e) => {
                                const value = e.target.value === "all" ? "all" : Number(e.target.value);
                                setRoleFilter(value);
                                setGroupFilter("all");
                            }}
                            sx={{
                                flex: 1,
                                minWidth: { xs: 140, sm: 180 },
                                bgcolor: "#fff",
                            }}
                        >
                            <MenuItem value="all">All Roles</MenuItem>
                            {roles.map((r) => (
                                <MenuItem key={r.id} value={r.id}>
                                    {toTitleCase(r.role_name)}
                                </MenuItem>
                            ))}
                        </TextField>

                        {roleFilter === STUDENT_ROLE_ID && (
                            <TextField
                                select
                                label="Student Group"
                                size="small"
                                value={groupFilter}
                                onChange={(e) =>
                                    setGroupFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                                }
                                sx={{
                                    flex: 1,
                                    minWidth: { xs: 140, sm: 180 },
                                    bgcolor: "#fff",
                                }}
                            >
                                <MenuItem value="all">All Groups</MenuItem>
                                {studentGroups.map((g) => (
                                    <MenuItem key={g.id} value={g.id}>
                                        {g.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <Button
                            variant="contained"
                            startIcon={<PersonAddAltIcon />}
                            onClick={() => setIsAddUserModalOpen(true)}
                            sx={{
                                bgcolor: "#493978",
                                textTransform: "none",
                                borderRadius: "8px",
                                "&:hover": {
                                    bgcolor: "#3f3693",
                                },
                                ml: { xs: 0, sm: "auto" },
                                width: { xs: "100%", sm: "auto" },
                            }}
                        >
                            Add User
                        </Button>
                    </Box>

                    {/* User List */}
                    <Box sx={{ bgcolor: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0", overflow: "hidden" }}>
                        <List disablePadding>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <ListItem
                                        key={user.id}
                                        sx={{ borderBottom: "1px solid #f0f0f5", "&:last-child": { borderBottom: "none" }, alignItems: "flex-start", py: 1.5 }}
                                        secondaryAction={
                                            <Box>
                                                {user.role_id === STUDENT_ROLE_ID && (
                                                    <IconButton size="small" onClick={() => openEditUserModal(user)} sx={{ color: "#493978", mr: 0.5 }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <IconButton size="small" onClick={(e) => triggerDeleteConfirm(e, "user", user.id, user.name)} sx={{ color: "#d32f2f" }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={user.pfpUrl || undefined} sx={{ bgcolor: "#ccc", width: 36, height: 36, mt: 1 }}>
                                                <AccountCircleIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ color: "#493978", fontSize: "0.95rem", fontWeight: 700 }}>
                                                    {user.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ display: "flex", flexDirection: "column", mt: 0.3 }}>
                                                    <Typography variant="caption" color="black">{user.email}</Typography>
                                                    <Typography variant="caption" color="textSecondary">Role: {toTitleCase(user.role_name)}</Typography>
                                                    {user.clinician && (
                                                        <>
                                                            <Typography variant="caption" color="textSecondary">Student Group: {user.clinician.group_name}</Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ p: 3, color: "#999", textAlign: "center" }}>
                                    No users found.
                                </Typography>
                            )}
                        </List>
                    </Box>
                </Box>
            )}

            {/* ==================== TAB 1: DISCIPLINES ==================== */}
            {activeTab === 1 && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                        <Button
                            variant="contained" startIcon={<AddIcon />}
                            onClick={() => setIsDisciplineModalOpen(true)}
                            sx={{ bgcolor: "#493978", textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#3f3693" } }}
                        >
                            Add Discipline
                        </Button>
                    </Box>

                    {rooms.map((room) => (
                        <Accordion key={room.room_id} disableGutters elevation={0} sx={{ mb: 2, borderRadius: "8px !important", overflow: "hidden", border: "1px solid #e0e0e0", "&:before": { display: "none" } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />} sx={{ bgcolor: "#493978", color: "#fff", "& .MuiAccordionSummary-content": { alignItems: "center", justifyContent: "space-between" } }}>
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
                                            variant="outlined" startIcon={<AddIcon />}
                                            onClick={() => handleOpenAddSectionModal(room.room_id)}
                                            sx={{ color: "#493978", borderColor: "#493978", textTransform: "none", borderRadius: "20px", "&:hover": { borderColor: "#3f3693", bgcolor: "#f4f3f8" } }}
                                        >
                                            Add Section
                                        </Button>
                                    </ListItem>
                                    {room.sections && room.sections.length > 0 ? (
                                        room.sections.map((sec) => (
                                            <ListItem
                                                key={sec.section_id} sx={{ borderBottom: "1px solid #f0f0f5", "&:last-child": { borderBottom: "none" } }}
                                                secondaryAction={
                                                    <Box>
                                                        <IconButton size="small" onClick={() => openEditSectionModal(sec)} sx={{ color: "#493978", mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton size="small" onClick={(e) => triggerDeleteConfirm(e, "section", sec.section_id, sec.section_name)} sx={{ color: "#d32f2f" }}><DeleteIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: "#f4f3f8", color: "#493978", width: 36, height: 36 }}><EventSeatIcon fontSize="small" /></Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography sx={{ color:"#333", fontWeight: 500, fontSize: "0.95rem" }}>
                                                            {sec.section_name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                                            Dental Chairs: {sec.chair_count}
                                                        </Typography>
                                                    }
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

            {/* --- ALL MODALS --- */}

            {/* Add User */}
            <Dialog open={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} fullWidth maxWidth="xs" sx={{ borderRadius: "12px" }}>
                <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Add New User</DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField fullWidth label="Name" variant="outlined" size="small" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                    <TextField fullWidth label="Email" type="email" variant="outlined" size="small" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                    <TextField
                        fullWidth select label="Role" variant="outlined" size="small" value={newUserRoleId}
                        onChange={(e) => {
                            const value = Number(e.target.value);

                            setNewUserRoleId(value);

                            if (value !== STUDENT_ROLE_ID) {
                                setNewUserGroupId("");
                                setNewUserStudentNumber("");
                                setNewUserYearLevel("");
                            }
                        }}
                    >
                        {roles.map((r) => (
                            <MenuItem key={r.id} value={r.id}>{toTitleCase(r.role_name)}</MenuItem>
                        ))}
                    </TextField>

                    {newUserRoleId === STUDENT_ROLE_ID && (
                        <>
                            <TextField fullWidth select label="Student Group" variant="outlined" size="small" value={newUserGroupId} onChange={(e) => setNewUserGroupId(Number(e.target.value))}>
                                {studentGroups.map((g) => (
                                    <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                                ))}
                            </TextField>
                        </>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => setIsAddUserModalOpen(false)} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
                    <Button onClick={handleAddUser} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Save User</Button>
                </DialogActions>
            </Dialog>

            {/* Edit User (student info only) */}
            <Dialog open={isEditUserModalOpen} onClose={() => setIsEditUserModalOpen(false)} fullWidth maxWidth="xs" sx={{ borderRadius: "12px" }}>
                <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Edit Student Information</DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField fullWidth select label="Student Group" variant="outlined" size="small" value={editUserGroupId} onChange={(e) => setEditUserGroupId(Number(e.target.value))}>
                        {studentGroups.map((g) => (
                            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => setIsEditUserModalOpen(false)} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
                    <Button onClick={handleUpdateUserStudentInfo} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDisciplineModalOpen} onClose={() => setIsDisciplineModalOpen(false)} fullWidth maxWidth="xs" sx={{ borderRadius: "12px" }}>
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
                    <TextField fullWidth label="Number of Dental Chairs" type="number" slotProps={{htmlInput: {min: 1}}} placeholder="e.g., 10" variant="outlined" size="small" value={newChairCount} onChange={(e) => setNewChairCount(e.target.value)} />
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => {
                        setIsDisciplineModalOpen(false); setHasCustomSection(false);
                    }} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
                    <Button onClick={handleAddDiscipline} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Save Discipline</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} fullWidth maxWidth="xs" sx={{borderRadius: "12px"}}>
                <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Add New Section</DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField fullWidth label="Section Name" placeholder="e.g., Section A" variant="outlined" size="small" value={subSectionName} onChange={(e) => setSubSectionName(e.target.value)} />
                    <TextField fullWidth label="Number of Dental Chairs" type="number" slotProps={{htmlInput: {min: 1}}}  placeholder="e.g., 12" variant="outlined" size="small" value={subChairCount} onChange={(e) => setSubChairCount(e.target.value)} />
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => setIsSectionModalOpen(false)} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
                    <Button onClick={handleAddSectionToRoom} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Add Section</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isEditRoomModalOpen} onClose={() => setIsEditRoomModalOpen(false)} fullWidth maxWidth="xs" sx={{ borderRadius: "12px" }}>
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

            <Dialog open={isEditSectionModalOpen} onClose={() => setIsEditSectionModalOpen(false)} fullWidth maxWidth="xs" sx={{ borderRadius: "12px" }}>
                <DialogTitle sx={{ color: "#493978", fontWeight: "bold" }}>Edit Section Properties</DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField fullWidth label="Section Name" variant="outlined" size="small" value={editedSectionName} onChange={(e) => setEditedSectionName(e.target.value)} />
                    <TextField fullWidth label="Number of Dental Chairs" type="number" slotProps={{htmlInput: {min: 1}}}  variant="outlined" size="small" value={editedChairCount} onChange={(e) => setEditedChairCount(e.target.value)} />
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => setIsEditSectionModalOpen(false)} sx={{ color: "#777", textTransform: "none" }}>Cancel</Button>
                    <Button onClick={handleUpdateSection} variant="contained" sx={{ bgcolor: "#493978", textTransform: "none", "&:hover": { bgcolor: "#3f3693" } }}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm(prev => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: "#d32f2f", fontWeight: "bold" }}>Are you sure?</DialogTitle>
                <Divider />
                <DialogContent sx={{ py: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                        You are about to delete <strong>{deleteConfirm.targetName}</strong>.
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ fontWeight: "bold" }}>
                        This action cannot be undone.
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
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                sx={{ mx: 1, my: 1 }}
            >
                <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: "100%", borderRadius: "8px", fontWeight: "500" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
