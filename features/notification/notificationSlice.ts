import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INotification } from "@/models/notification/notification";
import { BaseState } from "@/models/generic/baseState";
import {
    getNotifications,
    getNotificationById,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "./notificationThunk";

interface NotificationState extends BaseState {
    notifications: INotification[];
    unreadCount: number;
    selectedNotification: INotification | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    selectedNotification: null,
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<INotification>) => {
            const existingIndex = state.notifications.findIndex(
                (n) => n.id === action.payload.id
            );
            if (existingIndex >= 0) {
                state.notifications[existingIndex] = action.payload;
            } else {
                state.notifications.unshift(action.payload);
            }
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        updateNotification: (state, action: PayloadAction<INotification>) => {
            const index = state.notifications.findIndex(
                (n) => n.id === action.payload.id
            );
            if (index >= 0) {
                const wasRead = state.notifications[index].isRead;
                state.notifications[index] = action.payload;
                if (!wasRead && action.payload.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                } else if (wasRead && !action.payload.isRead) {
                    state.unreadCount += 1;
                }
            }
        },
        setSelectedNotification: (
            state,
            action: PayloadAction<INotification | null>
        ) => {
            state.selectedNotification = action.payload;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.selectedNotification = null;
        },
        calculateUnreadCount: (state) => {
            state.unreadCount = state.notifications.filter(
                (n) => !n.isRead
            ).length;
        },
    },
    extraReducers: (builder) => {
        // getNotifications
        builder
            .addCase(getNotifications.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
                state.isSuccess = false;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                if (action.payload?.value) {
                    state.notifications = action.payload.value;
                    state.unreadCount = action.payload.value.filter(
                        (n) => !n.isRead
                    ).length;
                }
            })
            .addCase(getNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage =
                    (action.payload as string) ||
                    "Không thể tải danh sách thông báo";
            });

        // getNotificationById
        builder
            .addCase(getNotificationById.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getNotificationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                if (action.payload?.value) {
                    state.selectedNotification = action.payload.value;
                }
            })
            .addCase(getNotificationById.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage =
                    (action.payload as string) ||
                    "Không thể tải thông tin thông báo";
            });

        // markNotificationAsRead
        builder
            .addCase(markNotificationAsRead.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const notificationId = action.meta.arg.notificationId;
                const index = state.notifications.findIndex(
                    (n) => n.id === notificationId
                );
                if (index >= 0 && !state.notifications[index].isRead) {
                    state.notifications[index].isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage =
                    (action.payload as string) ||
                    "Không thể đánh dấu đã đọc";
            });

        // markAllNotificationsAsRead
        builder
            .addCase(markAllNotificationsAsRead.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.notifications = state.notifications.map((n) => ({
                    ...n,
                    isRead: true,
                }));
                state.unreadCount = 0;
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage =
                    (action.payload as string) ||
                    "Không thể đánh dấu tất cả đã đọc";
            });
    },
});

export const {
    addNotification,
    updateNotification,
    setSelectedNotification,
    clearNotifications,
    calculateUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;





