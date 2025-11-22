import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { useSignalR } from "@/lib/signalr/useSignalR";
import { getSignalRHubUrl, SignalRHubUrls } from "@/lib/signalr/signalRConfig";
import { ArrowLeft, Send } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppColors } from "@/constants/Colors";

interface Message {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
    isOwn: boolean;
}

interface ChatScreenProps {
    hubUrl?: string; // URL của SignalR hub (optional, sẽ tự động lấy từ config nếu không có)
    hubPath?: string; // Đường dẫn hub (ví dụ: "/chatHub") - dùng nếu không có hubUrl
    userId: string; // ID của user hiện tại
    userName: string; // Tên của user hiện tại
    chatRoomId?: string; // ID của phòng chat (nếu có)
}

/**
 * Component Chat Screen sử dụng SignalR
 * 
 * @example
 * ```tsx
 * // Cách 1: Dùng hubUrl trực tiếp
 * <ChatScreen
 *   hubUrl="https://api.example.com/chatHub"
 *   userId="user123"
 *   userName="Nguyễn Văn A"
 * />
 * 
 * // Cách 2: Dùng hubPath (tự động lấy từ EXPO_PUBLIC_API_URL)
 * <ChatScreen
 *   hubPath="/chatHub"
 *   userId="user123"
 *   userName="Nguyễn Văn A"
 * />
 * 
 * // Cách 3: Dùng helper có sẵn
 * <ChatScreen
 *   hubUrl={SignalRHubUrls.CHAT}
 *   userId="user123"
 *   userName="Nguyễn Văn A"
 * />
 * ```
 */
export default function ChatScreen({
    hubUrl,
    hubPath,
    userId,
    userName,
    chatRoomId,
}: ChatScreenProps) {
    // Tự động lấy hubUrl nếu không được cung cấp
    const finalHubUrl = hubUrl || (hubPath ? getSignalRHubUrl(hubPath) : SignalRHubUrls.CHAT);
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // Kết nối SignalR
    const {
        isConnected,
        isConnecting,
        connectionState,
        connect,
        disconnect,
        on,
        off,
        invoke,
    } = useSignalR({
        hubUrl: finalHubUrl,
        enabled: true,
        onConnected: () => {
            console.log("✅ Đã kết nối đến chat hub");
            // Tham gia phòng chat nếu có
            if (chatRoomId) {
                invoke("JoinRoom", chatRoomId).catch((error) => {
                    console.error("Lỗi khi tham gia phòng chat:", error);
                });
            }
        },
        onDisconnected: (error) => {
            console.log("🔌 Đã ngắt kết nối chat hub", error);
        },
    });

    // Đăng ký listener để nhận tin nhắn
    useEffect(() => {
        if (isConnected) {
            // Lắng nghe tin nhắn mới từ server
            // Tên method này phải khớp với method trên backend
            // Ví dụ: backend có method "ReceiveMessage" thì dùng "ReceiveMessage"
            const handleReceiveMessage = (
                senderId: string,
                senderName: string,
                content: string,
                timestamp: string
            ) => {
                const newMessage: Message = {
                    id: `${Date.now()}-${Math.random()}`,
                    userId: senderId,
                    userName: senderName,
                    content,
                    timestamp: new Date(timestamp),
                    isOwn: senderId === userId,
                };

                setMessages((prev) => [...prev, newMessage]);

                // Scroll xuống tin nhắn mới nhất
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            };

            // Đăng ký listener
            // Lưu ý: Tên method "ReceiveMessage" phải khớp với tên method trên backend
            on("ReceiveMessage", handleReceiveMessage);

            // Cleanup: gỡ listener khi unmount
            return () => {
                off("ReceiveMessage", handleReceiveMessage);
            };
        }
    }, [isConnected, userId, on, off]);

    // Ngắt kết nối khi unmount
    useEffect(() => {
        return () => {
            if (chatRoomId) {
                invoke("LeaveRoom", chatRoomId).catch(console.error);
            }
            disconnect();
        };
    }, []);

    // Gửi tin nhắn
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !isConnected) {
            return;
        }

        const messageContent = inputMessage.trim();
        setInputMessage("");

        try {
            // Gọi method trên server để gửi tin nhắn
            // Tên method "SendMessage" phải khớp với tên method trên backend
            // Các tham số phải khớp với signature của method trên backend
            // Ví dụ: SendMessage(userId, userName, message, chatRoomId?)
            if (chatRoomId) {
                await invoke("SendMessage", userId, userName, messageContent, chatRoomId);
            } else {
                await invoke("SendMessage", userId, userName, messageContent);
            }

            // Tin nhắn sẽ được thêm vào danh sách thông qua listener "ReceiveMessage"
            // Nếu muốn hiển thị ngay lập tức (optimistic update), có thể thêm vào đây
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            // Có thể hiển thị thông báo lỗi cho user
            setInputMessage(messageContent); // Khôi phục tin nhắn nếu gửi thất bại
        }
    };

    // Render tin nhắn
    const renderMessage = ({ item }: { item: Message }) => {
        return (
            <View
                style={[
                    styles.messageContainer,
                    item.isOwn ? styles.ownMessage : styles.otherMessage,
                ]}
            >
                {!item.isOwn && (
                    <Text style={styles.messageSender}>{item.userName}</Text>
                )}
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
                <Text style={styles.messageTime}>
                    {item.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Chat</Text>
                    <View style={styles.connectionStatus}>
                        <View
                            style={[
                                styles.statusDot,
                                isConnected ? styles.statusConnected : styles.statusDisconnected,
                            ]}
                        />
                        <Text style={styles.statusText}>
                            {isConnected
                                ? "Đã kết nối"
                                : isConnecting
                                    ? "Đang kết nối..."
                                    : "Chưa kết nối"}
                        </Text>
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            {isConnected
                                ? "Chưa có tin nhắn nào"
                                : "Đang kết nối đến server..."}
                        </Text>
                    </View>
                }
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tin nhắn..."
                    placeholderTextColor="#9ca3af"
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    multiline
                    maxLength={1000}
                    editable={isConnected}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!isConnected || !inputMessage.trim()) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSendMessage}
                    disabled={!isConnected || !inputMessage.trim()}
                >
                    <Send
                        size={20}
                        color={isConnected && inputMessage.trim() ? AppColors.white : "#9ca3af"}
                        strokeWidth={2}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: AppColors.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerInfo: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: AppColors.white,
        marginBottom: 4,
    },
    connectionStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusConnected: {
        backgroundColor: "#22c55e",
    },
    statusDisconnected: {
        backgroundColor: "#ef4444",
    },
    statusText: {
        fontSize: 12,
        color: AppColors.white,
        opacity: 0.9,
    },
    headerRight: {
        width: 40,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: "80%",
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
    messageTime: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 4,
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

