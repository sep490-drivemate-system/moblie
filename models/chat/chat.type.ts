import { ChatMessageStatus } from "./chat.enum";

export interface IChatSession {
    id: string;
    toUserId: string;
    toUserFullName: string;
    status: ChatMessageStatus;
    toUserAvatar: string;
    lastMessage: string;
    lastModifiedAt: Date;
}