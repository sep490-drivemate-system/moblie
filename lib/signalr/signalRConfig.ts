export const SignalRHubPaths = {
    CHAT: "/chatHub",
    NOTIFICATION: "/notificationHub",
} as const;

export function getSignalRHubUrl(hubPath: string): string {
    const endpointHub = process.env.EXPO_PUBLIC_URL_HUB;
    return `${endpointHub}${hubPath}`;
}

export const SignalRHubUrls = {
    get CHAT() {
        return getSignalRHubUrl(SignalRHubPaths.CHAT);
    },
    get NOTIFICATION() {
        return getSignalRHubUrl(SignalRHubPaths.NOTIFICATION);
    },
} as const;

