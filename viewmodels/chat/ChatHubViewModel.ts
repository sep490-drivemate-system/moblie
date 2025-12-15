import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { UseSignalRReturn } from "@/lib/signalr/signaIR.type";
import { setSessions, setUnreadMessageCount } from "@/features/chat/chatSlice";
import { IChatSession } from "@/models/chat/chat.type";

export class ChatHubViewModel extends BaseViewModel<RootState["chat"]> {
    private signalRConnection: UseSignalRReturn | null = null;

    setSignalRConnection(connection: UseSignalRReturn) {
        this.signalRConnection = connection;
    }
    async sendMessage(conversationId: string | null, content: string, recipientId: string) {
        if (!this.signalRConnection?.isConnected) {
            throw new Error("Chat Hub is not connected");
        }
        try {
            await this.signalRConnection.invoke("SendMessage", {
                conversationId: conversationId,
                content: content,
                recipientId: recipientId,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }

    async getUnreadMessageCount(): Promise<number> {
        if (!this.signalRConnection?.isConnected) {
            return 0;
        }

        try {
            const unreadMessageCount = await this.signalRConnection.invoke("GetNumberUnReadMessage");
            const count = typeof unreadMessageCount === 'number' ? unreadMessageCount : Number(unreadMessageCount) || 0;
            this.dispatch(setUnreadMessageCount(count));
            return count;
        } catch (error) {
            console.log("Error getting unread message count:", error);
            return 0;
        }
    }

    async getChatSessions(): Promise<IChatSession[]> {
        if (!this.signalRConnection?.isConnected) {
            return [];
        }
        const sessions = await this.signalRConnection.invoke("GetChatSessions");
        this.dispatch(setSessions(sessions as IChatSession[]));
        return sessions as IChatSession[];
    }

    async markAsRead(sessionId: string) {
        if (!this.signalRConnection?.isConnected) {
            return;
        }

        try {
            await this.signalRConnection.invoke("MarkMessagesAsRead", sessionId);
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    }

    async getMessages(conversationId: string, pageNumber: number = 1, pageSize: number = 10): Promise<any[]> {
        if (!this.signalRConnection?.isConnected) {
            throw new Error("Chat Hub is not connected");
        }

        try {
            const messages = await this.signalRConnection.invoke("GetMessages", conversationId, pageNumber, pageSize);
            return messages || [];
        } catch (error) {
            console.error("Error getting messages:", error);
            throw error;
        }
    }

    get isConnected(): boolean {
        return this.signalRConnection?.isConnected || false;
    }

    get connectionId(): string | null {
        return this.signalRConnection?.connectionId || null;
    }
}

