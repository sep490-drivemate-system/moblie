import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INotification } from "@/models/notification/notification.type";
import { BaseState } from "@/models/generic/baseState";

interface NotificationState extends BaseState {
    notifications: INotification[];
    unreadCount: number;
    selectedNotification: INotification | null;
}

const initialState: NotificationState = {
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
    notifications: [],
    unreadCount: 0,
    selectedNotification: null,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
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
        setNotifications: (state, action: PayloadAction<INotification[]>) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        },
    },
});

export const {
    setUnreadCount,
    addNotification,
    updateNotification,
    setSelectedNotification,
    clearNotifications,
    calculateUnreadCount,
    setNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;






