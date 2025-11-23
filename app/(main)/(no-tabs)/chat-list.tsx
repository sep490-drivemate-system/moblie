import React, { useEffect, useState } from "react";
import ChatListScreen from "@/components/Chat/ChatListScreen";
import { getUserIdFromToken, decodeToken } from "@/lib/jwt/tokenUtils";
import { IChatSession } from "@/models/chat/chat";
import { useSignalR } from "@/lib/signalr/useSignalR";
import { DEFAULT_CHAT_HUB_URL } from "@/lib/signalr/signalRConfig";
import { useAppSelector } from "@/lib/redux/hooks";
import { UserRole } from "@/models/enum/UserRole.enum";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Màn hình danh sách lịch sử chat
 * Gọi GetChatSessions từ SignalR Hub
 */
export default function ChatListPage() {
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [conversations, setConversations] = useState<IChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy userRole từ Redux
  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Kết nối SignalR
  const { isConnected, invoke } = useSignalR({
    hubUrl: DEFAULT_CHAT_HUB_URL,
    enabled: true,
  });

  // Lấy thông tin user từ token
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const id = await getUserIdFromToken();
        setUserId(id);

        // Lấy username từ token
        const token = await AsyncStorage.getItem(
          process.env.EXPO_PUBLIC_STORAGE_TOKEN || "@token"
        );
        if (token) {
          const decoded = decodeToken(token);
          if (decoded) {
            setUserName(decoded.username || "User");
          }
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };

    loadUserInfo();
  }, []);

  // Load conversations từ SignalR Hub khi đã kết nối
  useEffect(() => {
    if (isConnected && userId && userRole !== undefined) {
      loadConversations();
    }
  }, [isConnected, userId, userRole]);

  const loadConversations = async () => {
    if (!userId || userRole === undefined) {
      return;
    }

    setIsLoading(true);
    try {
      // Gọi method GetChatSessions từ SignalR Hub
      // Backend method: public async Task<List<ChatSessionsDTO>> GetChatSessions(Guid userId, UserRole userRole)
      // UserRole được truyền dưới dạng số (0-4) để match với enum C#
      const result = await invoke("GetChatSessions", userId, userRole ?? UserRole.NoviceDriver);

      // Map dữ liệu từ backend về IChatSession
      if (result && Array.isArray(result)) {
        const mappedConversations: IChatSession[] = result.map((item: any) => ({
          id: item.id || item.conversationId || "",
          toUserId: item.toUserId || item.userId || "",
          toUserFullName: item.toUserFullName || item.userName || "",
          toUserAvatarUrl: item.toUserAvatarUrl || item.avatarUrl || "",
          lastMessage: item.lastMessage || "",
          lastModifiedAt: item.lastModifiedAt
            ? new Date(item.lastModifiedAt)
            : new Date(),
        }));

        setConversations(mappedConversations);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error loading conversations from SignalR:", error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadConversations();
  };

  return (
    <ChatListScreen
      currentUserId={userId || "unknown"}
      currentUserName={userName || "User"}
      conversations={conversations}
      onRefresh={handleRefresh}
    />
  );
}

