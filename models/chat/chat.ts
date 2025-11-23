export interface IChatSession {
    id: string;
    toUserId: string;
    toUserFullName: string;
    toUserAvatarUrl: string;
    lastMessage: string;
    lastModifiedAt: Date;
}