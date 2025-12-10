import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { useSignalRContext } from "@/lib/signalr/SignalRContext";
import { ChatHubViewModel } from "@/viewmodels/chat/ChatHubViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import HeaderList from "@/components/Commons/HeaderList";
import { ROUTES } from "@/constants/routes";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import * as Notifications from "expo-notifications";


interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date | string;
  isOwn: boolean;
  senderAvatar?: string;
}

export default function ChatPage() {
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string || "";
  const toUserIdParam = params.toUserId as string || "";
  const toUserFullName = params.toUserFullName as string;
  const toUserAvatarParam = params.toUserAvatar as string;
  const [chatState, chatHubViewModel] = useViewModel(ChatHubViewModel, (state) => state.chat);
  const { chatHub } = useSignalRContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isUserReady, setIsUserReady] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserIdFromToken();
      setCurrentUserId(userId);
      setIsUserReady(true);
    };
    fetchUserId();
  }, []);


  useEffect(() => {
    if (chatHub) {
      chatHubViewModel.setSignalRConnection(chatHub);
    }
  }, [chatHub, chatHubViewModel]);

  useEffect(() => {
    if (chatHubViewModel.isConnected && sessionId) {
      chatHubViewModel.markAsRead(sessionId).catch(console.error);
    }

    return () => {
      if (chatHubViewModel.isConnected && sessionId) {
      }
    };
  }, [chatHubViewModel.isConnected, sessionId, chatHubViewModel]);

  useEffect(() => {
    if (!chatHub.isConnected || !sessionId || !isUserReady || !currentUserId) return;

    const processMessage = (data: any) => {
      const senderId = String(data.senderId || data.SenderId || "");
      const isOwn = String(senderId).toLowerCase() === String(currentUserId).toLowerCase();

      const newMessage: Message = {
        id: String(data.id || data.Id || `${Date.now()}-${Math.random()}`),
        userId: senderId,
        userName: data.senderName || data.SenderName || "Người dùng",
        content: data.content || data.Content || "",
        timestamp: data.createdAt ? new Date(data.createdAt) : (data.CreatedAt ? new Date(data.CreatedAt) : new Date()),
        senderAvatar: data.senderAvatar || data.SenderAvatar || (isOwn ? "" : toUserAvatarParam),
        isOwn: isOwn,
      };

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      if (!isOwn) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: newMessage.userName || "Tin nhắn mới",
            body: newMessage.content || "",
          },
          trigger: null,
        }).catch((err: unknown) => console.log("Local notification error", err));
      }

    };

    const handleReceiveMessage = (data: any) => {
      processMessage(data);
    };
    const handleMessageSent = (data: any) => {
      processMessage(data);
    };

    chatHub.on("ReceiveMessage", handleReceiveMessage);
    chatHub.on("MessageSent", handleMessageSent);

    return () => {
      chatHub.off("ReceiveMessage", handleReceiveMessage);
      chatHub.off("MessageSent", handleMessageSent);
    };
  }, [chatHub.isConnected, chatHub, sessionId, currentUserId, isUserReady]);

  const loadMessages = useCallback(async () => {
    if (!sessionId || !chatHubViewModel.isConnected || !isUserReady || !currentUserId) return;

    setIsLoading(true);
    const messagesData = await chatHubViewModel.getMessages(sessionId, 1, 50);
    const mappedMessages: Message[] = messagesData.map((msg: any) => {
      const senderId = String(msg.senderId || msg.SenderId || "");
      const isOwn = String(senderId).toLowerCase() === String(currentUserId).toLowerCase();

      return {
        id: String(msg.id || msg.Id || `${Date.now()}-${Math.random()}`),
        userId: senderId,
        userName: msg.senderName || msg.SenderName,
        content: msg.content || msg.Content || "",
        timestamp: msg.createdAt ? new Date(msg.createdAt) : (msg.CreatedAt ? new Date(msg.CreatedAt) : new Date()),
        senderAvatar: msg.senderAvatar || msg.SenderAvatar || (isOwn ? "" : toUserAvatarParam),
        isOwn: isOwn,
      };
    });

    mappedMessages.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    setMessages(mappedMessages);

    setIsLoading(false);
  }, [sessionId, chatHubViewModel, currentUserId, isUserReady]);

  useEffect(() => {
    if (chatHubViewModel.isConnected && sessionId && isUserReady && currentUserId) {
      loadMessages();
    }
  }, [chatHubViewModel.isConnected, sessionId, loadMessages, isUserReady, currentUserId]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !chatHubViewModel.isConnected) {
      return;
    }

    const messageContent = inputMessage.trim();
    setInputMessage("");
    const session = chatState.sessions.find((s) => s.id === sessionId);
    const toUserId = session?.toUserId || toUserIdParam;

    if (!toUserId) {
      console.error("Cannot find toUserId for session:", sessionId);
      setInputMessage(messageContent);
      return;
    }

    try {
      await chatHubViewModel.sendMessage(sessionId || null, messageContent, toUserId);
    } catch (error) {
      setInputMessage(messageContent);
    }
  }, [inputMessage, chatHubViewModel, sessionId, chatState.sessions, toUserIdParam]);

  const formatTime = useCallback((date: Date | string): string => {
    if (!date) return "";
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const avatarUrl = item.senderAvatar || (item.isOwn ? "" : toUserAvatarParam);
      const fallbackInitial = item.userName?.charAt(0)?.toUpperCase() || "U";

      return (
        <View
          style={[
            styles.messageRow,
            item.isOwn ? styles.rowOwn : styles.rowOther,
          ]}
        >
          {!item.isOwn ? (
            avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.messageAvatar} />
            ) : (
              <View style={styles.messageAvatarPlaceholder}>
                <Text style={styles.messageAvatarText}>{fallbackInitial}</Text>
              </View>
            )
          ) : null}

          <View
            style={[
              styles.messageContainer,
              item.isOwn ? styles.ownMessage : styles.otherMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                item.isOwn ? styles.ownMessageBubble : styles.otherMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.isOwn ? styles.ownMessageText : styles.otherMessageText,
                ]}
              >
                {item.content}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [formatTime, toUserAvatarParam]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <HeaderList
        actionReturnScreen={ROUTES.MAIN_NO_TABS_CHATS}
        title={toUserFullName}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()} 
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {chatHub.isConnected
                  ? "Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!"
                  : "Đang kết nối đến server..."}
              </Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9ca3af"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={1000}
            editable={chatHub.isConnected}
            onFocus={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!chatHub.isConnected || !inputMessage.trim()) &&
              styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!chatHub.isConnected || !inputMessage.trim()}
          >
            <Send
              size={20}
              color={
                chatHub.isConnected && inputMessage.trim()
                  ? AppColors.white
                  : "#9ca3af"
              }
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  connectionContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  partnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  partnerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerAvatarText: {
    color: "#fff",
    fontWeight: "700",
  },
  partnerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  connectionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 5,
    maxWidth: "80%",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center", // avatar và bubble cùng đường ngang
    gap: 8,
    marginBottom: 10,
  },
  rowOwn: {
    justifyContent: "flex-end",
    alignItems: "flex-end", // vẫn căn đáy cho tin của mình
  },
  rowOther: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
  },
  messageAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  ownMessage: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  ownMessageBubble: {
    backgroundColor: AppColors.primary,
  },
  otherMessageBubble: {
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: AppColors.white,
  },
  otherMessageText: {
    color: "#1e293b",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    fontSize: 15,
    color: "#1e293b",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },
});
