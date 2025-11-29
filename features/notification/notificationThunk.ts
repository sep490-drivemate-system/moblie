import { INotification } from "@/models/notification/notification";
import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";

export const NOTIFICATION_PATH = "notifications";

export const getNotifications = createThunk<INotification[], void>(
    HttpMethod.GET,
    "getNotifications",
    `/${NOTIFICATION_PATH}`
);

export const getNotificationById = createThunk<
    INotification,
    { notificationId: string }
>(
    HttpMethod.GET,
    "getNotificationById",
    `/${NOTIFICATION_PATH}`,
    {
        buildUrl: (payload) => {
            return `${NOTIFICATION_PATH}/${payload.notificationId}`;
        }
    }
);

export const markNotificationAsRead = createThunk<
    boolean,
    { notificationId: string }
>(
    HttpMethod.PATCH,
    "markNotificationAsRead",
    `/${NOTIFICATION_PATH}/read`,
    {
        buildUrl: (payload) => {
            return `${NOTIFICATION_PATH}/${payload.notificationId}/read`;
        }
    }
);

export const markAllNotificationsAsRead = createThunk<boolean, void>(
    HttpMethod.PATCH,
    "markAllNotificationsAsRead",
    `/${NOTIFICATION_PATH}/read-all`
);







