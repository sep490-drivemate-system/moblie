import { NotificationStatus, NotificationType } from "./notification.enum";

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  status?: NotificationStatus;
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
}
