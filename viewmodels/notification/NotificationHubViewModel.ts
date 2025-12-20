import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { UseSignalRReturn } from "@/lib/signalr/signaIR.type";
import {
    updateNotification,
    calculateUnreadCount,
    setUnreadCount,
    setNotifications,
} from "@/features/notification/notificationSlice";
import { INotification } from "@/models/notification/notification.type";

export class NotificationHubViewModel extends BaseViewModel<RootState["notification"]> {
    private signalRConnection: UseSignalRReturn | null = null;
    setSignalRConnection(connection: UseSignalRReturn) {
        this.signalRConnection = connection;
    }
    async getUnreadNotificationCount(): Promise<number> {
        if (!this.signalRConnection?.isConnected) {
            return 0;
        }

        try {
            const unreadNotificationCount = await this.signalRConnection.invoke("GetUnreadNotificationCountAsync");
            const count = typeof unreadNotificationCount === 'number' ? unreadNotificationCount : Number(unreadNotificationCount) || 0;
            this.dispatch(setUnreadCount(count));
            return count;
        } catch (error) {
            console.log("Error getting unread notification count:", error);
            return 0;
        }
    }
    async getLatestNotifications(take: number = 20): Promise<INotification[]> {
        if (!this.signalRConnection?.isConnected) {
            return [];
        }

        try {
            const notifications = await this.signalRConnection.invoke("GetLatestNotifications", take);
            const notificationsArray = notifications as INotification[];
            this.dispatch(setNotifications(notificationsArray));
            return notificationsArray;
        } catch (error) {
            console.error("Error getting latest notifications:", error);
            return [];
        }
    }

    async getUserNotifications(pageNumber: number = 1, pageSize: number = 50): Promise<INotification[]> {
        if (!this.signalRConnection?.isConnected) {
            return [];
        }

        const notifications = await this.signalRConnection.invoke("GetUserNotificationsAsync", pageNumber, pageSize);
        const notificationsArray = notifications as INotification[];
        this.dispatch(setNotifications(notificationsArray));
        return notificationsArray;

    }

    async markAsRead(notificationId: string): Promise<boolean> {
        if (!this.signalRConnection?.isConnected) {
            throw new Error("Notification Hub is not connected");
        }

        try {
            const result = await this.signalRConnection.invoke("MarkNotificationAsReadAsync", notificationId);
            // Update local state
            const state = this.getCurrentState();
            const notification = state.notifications.find((n) => n.id === notificationId);
            if (notification && !notification.isRead) {
                this.dispatch(
                    updateNotification({
                        ...notification,
                        isRead: true,
                    })
                );
            }
            return result as boolean;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }

    async markAllAsRead(): Promise<boolean> {
        if (!this.signalRConnection?.isConnected) {
            throw new Error("Notification Hub is not connected");
        }

        try {
            const result = await this.signalRConnection.invoke("MarkAllNotificationsAsReadAsync");
            // Update local state
            const state = this.getCurrentState();
            state.notifications.forEach((notification: INotification) => {
                if (!notification.isRead) {
                    this.dispatch(
                        updateNotification({
                            ...notification,
                            isRead: true,
                        })
                    );
                }
            });
            this.dispatch(calculateUnreadCount());
            return result as boolean;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    }
    formatTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;

        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    }
    get isConnected(): boolean {
        return this.signalRConnection?.isConnected || false;
    }
    get connectionId(): string | null {
        return this.signalRConnection?.connectionId || null;
    }
}

