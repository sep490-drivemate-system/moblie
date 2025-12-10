import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import { useAppSelector } from "@/lib/redux/hooks";
import { UserRole } from "@/models/enum/UserRole.enum";
import { IChatSession } from "@/models/chat/chat.type";
import { ChatMessageStatus } from "@/models/chat/chat.enum";
import { MessageCircle, Clock } from "lucide-react-native";
import { ROUTES } from "@/constants/routes";
import { useSignalRContext } from "@/lib/signalr/SignalRContext";
import { ChatHubViewModel } from "@/viewmodels/chat/ChatHubViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useAppDispatch } from "@/lib/redux/hooks";
import { updateSession, addSession } from "@/features/chat/chatSlice";
import HeaderList from "@/components/Commons/HeaderList";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";


export default function ChatsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { sessions, isLoading } = useAppSelector((state) => state.chat);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserIdFromToken();
      setCurrentUserId(userId);
    };
    fetchUserId();
  }, []);
  const [, chatHubViewModel] = useViewModel(
    ChatHubViewModel,
    (state) => state.chat
  );
  const { chatHub } = useSignalRContext();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (chatHub) {
      chatHubViewModel.setSignalRConnection(chatHub);
    }
  }, [chatHub, chatHubViewModel]);

  const loadChatSessions = useCallback(async () => {
    if (!chatHubViewModel.isConnected) {
      console.log("Chat hub not connected, skipping loadChatSessions");
      return;
    }
    await chatHubViewModel.getChatSessions();
  }, [chatHubViewModel]);

  useEffect(() => {
    if (chatHubViewModel.isConnected) {
      loadChatSessions();
    }
  }, [chatHubViewModel.isConnected, loadChatSessions]);

  useEffect(() => {
    if (!chatHub.isConnected) return;

    const handleReceiveMessage = (data: any) => {
      const { sessionId, content, timestamp } = data;

      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        const updatedSession: IChatSession = {
          ...session,
          lastMessage: content || data.message || "",
          lastModifiedAt: new Date(timestamp || Date.now()),
        };
        dispatch(updateSession(updatedSession));
      } else {
        loadChatSessions();
      }
    };

    const handleNewSession = (session: IChatSession) => {
      dispatch(addSession(session));
    };

    const handleSessionUpdated = (session: IChatSession) => {
      dispatch(updateSession(session));
    };

    chatHub.on("ReceiveMessage", handleReceiveMessage);
    chatHub.on("NewSession", handleNewSession);
    chatHub.on("SessionUpdated", handleSessionUpdated);

    return () => {
      chatHub.off("ReceiveMessage", handleReceiveMessage);
      chatHub.off("NewSession", handleNewSession);
      chatHub.off("SessionUpdated", handleSessionUpdated);
    };
  }, [chatHub.isConnected, chatHub, sessions, dispatch, loadChatSessions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChatSessions();
    setRefreshing(false);
  }, [loadChatSessions]);

  const formatTime = useCallback((date: Date | string): string => {
    if (!date) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return messageDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year:
        messageDate.getFullYear() !== now.getFullYear()
          ? "numeric"
          : undefined,
    });
  }, []);

  const handleChatPress = useCallback(
    (session: IChatSession) => {
      router.push({
        pathname: ROUTES.MAIN_NO_TABS_CHAT,
        params: {
          sessionId: session.id,
          toUserFullName: session.toUserFullName,
          toUserAvatar: session.toUserAvatar,
        },
      } as any);
    },
    [router]
  );

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const timeA = new Date(a.lastModifiedAt).getTime();
      const timeB = new Date(b.lastModifiedAt).getTime();
      return timeB - timeA;
    });
  }, [sessions]);

  return (
    <View style={styles.container}>
      <HeaderList actionReturnScreen={ROUTES.HOME} title="Tin nhắn" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={AppColors.primary}
          />
        }
      >
        {isLoading && sessions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : sortedSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MessageCircle
                size={48}
                color={AppColors.primary}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
            <Text style={styles.emptySubtitle}>
              Bắt đầu trò chuyện với{" "}
              {userRole === UserRole.Instructor ? "người lái mới" : "người hướng dẫn"} để
              xem lịch sử ở đây
            </Text>
          </View>
        ) : (
          sortedSessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => handleChatPress(session)}
              style={({ pressed }) => [
                styles.chatCard,
                pressed && styles.chatCardPressed,
              ]}
            >
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.chatContent}>
                  <View style={styles.avatarContainer}>
                    {session.toUserAvatar ? (
                      <Image
                        source={{ uri: session.toUserAvatar }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {session.toUserFullName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.chatName} numberOfLines={1}>
                        {session.toUserFullName}
                      </Text>
                      {session.lastModifiedAt && (
                        <View style={styles.timeContainer}>
                          <Clock size={12} color="#9ca3af" strokeWidth={2} />
                          <Text style={styles.chatTime}>
                            {formatTime(session.lastModifiedAt)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {session.lastMessage && (
                      <Text
                        style={[
                          styles.lastMessage,
                          session.status === ChatMessageStatus.Sent && session.toUserId !== currentUserId && styles.lastMessageUnread,
                        ]}
                        numberOfLines={2}
                      >
                        {session.lastMessage}
                      </Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  connectionContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: -25,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  connectionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  chatCard: {
    borderRadius: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  chatCardPressed: {
    opacity: 0.8,
  },
  cardGradient: {
    padding: 20,
  },
  chatContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  chatTime: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontWeight: "800",
    color: "#1e293b",
  },
});
