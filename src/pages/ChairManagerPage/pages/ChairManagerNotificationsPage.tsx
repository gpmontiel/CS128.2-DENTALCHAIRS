import {
    Box,
    Button, Card, Divider,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useNavigate} from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../../../utils/supabase.ts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as React from "react";
dayjs.extend(relativeTime);

interface AppNotification {
    id: string | number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const ChairManagerNotificationsPage = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error(error);
                return;
            }

            setNotifications(data || []);
        };

        fetchNotifications();
    }, []);

    const formatNotificationTime = (date: string) => {
        const now = dayjs();
        const created = dayjs(date);

        const diffInHours = now.diff(created, "hour");

        if (diffInHours < 24) {
            return created.fromNow();
        }

        return created.format("MMM D, YYYY h:mm A");
    };

    const handleMarkAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (!error) {
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
        }
    };

    const handleNotifClick = async (notif: AppNotification) => {
        // 1. update database
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notif.id);

        if (error) {
            console.error(error);
            return;
        }

        // 2. update UI immediately (no refresh needed)
        setNotifications(prev =>
            prev.map(n =>
                n.id === notif.id ? { ...n, is_read: true } : n
            )
        );
    };

    return (
        <Box fontFamily="Inter" sx={{ p: 3 }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1,}}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/chair-manager-home")}
                    sx={{
                        textTransform: 'none',
                        color: '#493979',
                        minWidth: 'auto',
                        p: 0,
                        mr: 1
                    }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Typography variant="h4" color="#493979" fontWeight="700" fontFamily="Poppins" sx={{ my: 2 }}>
                Notifications
            </Typography>

            {/* NOTIFICATION LIST CARD */}
            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
                    overflow: "hidden"
                }}
            >

                {/* HEADER */}
                <Box sx={{
                    px: 2.5,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: "#493979" }}
                    >

                    </Typography>

                    <Button
                        size="small"
                        sx={{
                            textTransform: "none",
                            color: "#493979",
                            fontSize: 12
                        }}
                        onClick={handleMarkAllRead}
                    >
                        Mark all as read
                    </Button>
                </Box>

                <Divider />

                {/* LIST */}
                <Box>
                    {notifications.map((notif) => (
                        <Box
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            sx={{
                                px: 2.5,
                                py: 2,
                                borderBottom: "1px solid #f0f0f0",
                                backgroundColor: notif.is_read
                                    ? "transparent"
                                    : "rgba(73, 57, 121, 0.05)"
                            }}
                        >
                            {/* TITLE + DOT */}
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                                <Typography
                                    sx={{
                                        fontWeight: notif.is_read ? 500 : 700,
                                        color: "#493979"
                                    }}
                                >
                                    {notif.title}
                                </Typography>

                                {!notif.is_read && (
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            bgcolor: "#493979"
                                        }}
                                    />
                                )}
                            </Box>

                            {/* MESSAGE */}
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {notif.message}
                            </Typography>

                            {/* TIME */}
                            <Typography
                                variant="caption"
                                sx={{ color: "text.disabled" }}
                            >
                                {formatNotificationTime(notif.created_at)}
                            </Typography>
                        </Box>
                    ))}
                </Box>

            </Card>

        </Box>
    );
};

export default ChairManagerNotificationsPage;