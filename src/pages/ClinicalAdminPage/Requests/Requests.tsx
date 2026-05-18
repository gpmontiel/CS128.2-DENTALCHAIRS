import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, IconButton, List, ListItem, Divider, ToggleButton, ToggleButtonGroup, 
    CircularProgress, Menu, MenuItem, ListItemText, ListItemIcon } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import EventIcon from '@mui/icons-material/Event';
import { supabase } from "../../../utils/supabase";

const Requests = () => {
    const [reqFilter, setReqFilter] = useState("AM");
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [sortConfig, setSortConfig] = useState({ column: 'created_at', ascending: true });

    const fetchRequests = async () => {
        setLoading(true);
        
        let query = supabase
            .from('chair_manager_assignment')
            .select(`
                *,
                profiles:student_id (first_name, last_name, pfp),
                sections:section_id (section_name)
            `);

        if (reqFilter === "Upcoming") {
            // Upcoming tab logic: Show only approved requests
            query = query.eq('status', 'Confirmed').order('date', { ascending: true });
        } else {
            // AM/PM tab logic: Show pending requests for that specific shift
            query = query.eq('shift', reqFilter).eq('status', 'Pending');
        }

        const { data, error } = await query.order(sortConfig.column, { ascending: sortConfig.ascending });

        if (!error && data) {
            setRequests(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, [reqFilter, sortConfig]);

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortSelect = (column: string, ascending: boolean) => {
        setSortConfig({ column, ascending });
        setAnchorEl(null);
    };

    const handleAction = async (assignmentId: number, status: string) => {
        const { error } = await supabase
            .from('chair_manager_assignment')
            .update({ status: status })
            .eq('assignment_id', assignmentId);
        
        if (!error) fetchRequests();
    };

    return (
        <Box sx={{fontFamily: "Inter"}}>
            <Typography variant="h4" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ my: 2, mx: 3 }}>
                CM Requests
                <IconButton onClick={handleSortClick} sx={{ ml: 1, color: '#493978' }}>
                        <FilterListIcon sx={{ fontSize: 28 }} />
                </IconButton>
            </Typography>

            {/* Sort Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    <MenuItem onClick={() => handleSortSelect('date', true)}>
                        <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Earliest Date</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleSortSelect('created_at', true)}>
                        <ListItemIcon><SortIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Time Submitted (Oldest First)</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleSortSelect('created_at', false)}>
                        <ListItemIcon><SortIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Time Submitted (Newest First)</ListItemText>
                    </MenuItem>
                </Menu>
            
            <Box sx={{ display: "flex", justifyContent: "center", width: "300px", mx: "auto"  }}>
                <ToggleButtonGroup
                    value={reqFilter}
                    exclusive
                    onChange={(_, next) => next && setReqFilter(next)}
                    sx={{ 
                        mb: 3, width: '100%', display: 'flex', 
                        '& .MuiToggleButton-root': {
                            flex: 1, borderRadius: '20px', border: 'none',
                            textTransform: 'none', fontWeight: 600, color: '#493978',
                            '&.Mui-selected': { bgcolor: '#493978', color: 'white', '&:hover': { bgcolor: '#6a52e0' } }
                        }
                    }}
                >
                    <ToggleButton value="AM">AM</ToggleButton>
                    <ToggleButton value="PM">PM</ToggleButton>
                    <ToggleButton value="Upcoming">Upcoming</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            

            <Box sx={{ bgcolor: 'white', borderRadius: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                ) : (
                    <List sx={{ width: '100%', p: 0 }}>
                        {requests.map((req, index) => (
                            <React.Fragment key={req.assignment_id}>
                                <ListItem sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={req.profiles?.pfp} sx={{ width: 56, height: 56 }} />
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                                {`${req.profiles?.first_name} ${req.profiles?.last_name}`}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {req.sections?.section_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    {/* Conditional Rendering: Show actions for pending, or shift label for upcoming */}
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        {reqFilter === "Upcoming" ? (
                                            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#000', mr: 2 }}>
                                                {req.shift}
                                            </Typography>
                                        ) : (
                                            <>
                                                <IconButton onClick={() => handleAction(req.assignment_id, 'Confirmed')}>
                                                    <CheckCircleIcon sx={{ fontSize: 42, color: '#4CAF50' }} />
                                                </IconButton>
                                                <IconButton onClick={() => handleAction(req.assignment_id, 'Rejected')}>
                                                    <CancelIcon sx={{ fontSize: 42, color: '#F44336' }} />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </ListItem>
                                {index < requests.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default Requests;