import { router } from "@inertiajs/react";
import { Box, Button, Card, Divider, Typography } from "@mui/material";
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

interface PageProps {
    pageNotifications: AppNotification[];
}

const NotificationsPage = ({ pageNotifications }: PageProps) => {

    const formatNotificationTime = (date: string) => {
        const now = dayjs();
        const created = dayjs(date);
        const diffInHours = now.diff(created, "hour");

        if (diffInHours < 24) {
            return created.fromNow();
        }

        return created.format("MMM D, YYYY h:mm A");
    };

    const handleMarkAllRead = () => {
        // Send POST request to backend, Inertia auto-updates the page props on success
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true
        });
    };

    const handleNotifClick = (notif: AppNotification) => {
        if (!notif.is_read) {
            router.post(`/notifications/${notif.id}/mark-read`, {}, {
                preserveScroll: true
            });
        }
    };

    return (

            <Box sx={{ maxWidth: 800, mx: 'auto', fontFamily: "Inter" ,p: { xs: 1, sm: 3 } }}>
                <Typography variant="h4" sx={{ my: 2, fontFamily: 'Poppins, sans-serif', color: "#493979", fontWeight: "700" }}>
                    Notifications
                </Typography>

                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
                        overflow: "hidden"
                    }}
                >
                    <Box sx={{
                        px: 2.5,
                        py: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: '#ffffff'
                    }}>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: "#493979" }}
                        >
                            All Notifications
                        </Typography>

                        <Button
                            size="small"
                            sx={{
                                textTransform: "none",
                                color: "#493979",
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                            onClick={handleMarkAllRead}
                        >
                            Mark all as read
                        </Button>
                    </Box>

                    <Divider />

                    <Box sx={{ maxHeight: '75vh', overflowY: 'auto' }}>
                        {pageNotifications.length > 0 ? (
                            pageNotifications.map((notif) => (
                                <Box
                                    key={notif.id}
                                    onClick={() => handleNotifClick(notif)}
                                    sx={{
                                        px: 3,
                                        py: 2.5,
                                        borderBottom: "1px solid #f0f0f0",
                                        backgroundColor: notif.is_read
                                            ? "transparent"
                                            : "rgba(73, 57, 121, 0.04)",
                                        cursor: notif.is_read ? "default" : "pointer",
                                        transition: 'background-color 0.2s',
                                        "&:hover": {
                                            backgroundColor: notif.is_read ? "rgba(0,0,0,0.01)" : "rgba(73, 57, 121, 0.08)"
                                        }
                                    }}
                                >
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 0.5
                                    }}>
                                        <Typography
                                            sx={{
                                                fontWeight: notif.is_read ? 500 : 700,
                                                color: "#493979",
                                                fontSize: '1rem'
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
                                                    bgcolor: "#493979",
                                                    flexShrink: 0,
                                                    ml: 2
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 1, fontSize: '0.9rem' }}
                                    >
                                        {notif.message}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{ color: "text.disabled", fontWeight: 500 }}
                                    >
                                        {formatNotificationTime(notif.created_at)}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <Typography color="text.secondary">
                                    You don't have any notifications yet.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Card>
            </Box>

    );
};

export default NotificationsPage;
