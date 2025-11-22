
export function getSignalRHubUrl(hubPath: string = "/chatHub"): string {
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!apiBaseUrl) {
        throw new Error(
            "EXPO_PUBLIC_API_URL chưa được cấu hình. Vui lòng thêm vào file .env"
        );
    }

    // Đảm bảo hubPath bắt đầu bằng "/"
    const normalizedPath = hubPath.startsWith("/") ? hubPath : `/${hubPath}`;

    // Loại bỏ "/" ở cuối apiBaseUrl nếu có
    const normalizedBaseUrl = apiBaseUrl.endsWith("/")
        ? apiBaseUrl.slice(0, -1)
        : apiBaseUrl;

    return `${normalizedBaseUrl}${normalizedPath}`;
}

/**
 * Các hub paths phổ biến (tùy chỉnh theo backend của bạn)
 */
export const SignalRHubPaths = {
    CHAT: "/chatHub",
    NOTIFICATION: "/notificationHub",
    // Thêm các hub khác nếu có
} as const;

/**
 * Helper để lấy URL của các hub phổ biến
 */
export const SignalRHubUrls = {
    CHAT: getSignalRHubUrl(SignalRHubPaths.CHAT),
    NOTIFICATION: getSignalRHubUrl(SignalRHubPaths.NOTIFICATION),
} as const;

export const DEFAULT_CHAT_HUB_URL = "http://192.168.11.100:5500/chat";

