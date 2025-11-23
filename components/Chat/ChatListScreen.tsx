import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageSquare } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";
import { IChatSession } from "@/models/chat/chat";

export interface Conversation {
    id: string;
    userId: string;
    userName: string;
    avatarUrl?: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount?: number;
    chatRoomId?: string;
}

interface ChatListScreenProps {
    currentUserId: string;
    currentUserName: string;
    conversations?: IChatSession[];
    onRefresh?: () => Promise<void>;
}
export default function ChatListScreen({
    currentUserId,
    currentUserName,
    conversations: initialConversations,
    onRefresh,
}: ChatListScreenProps) {
    const router = useRouter();
    const [conversations, setConversations] = useState<IChatSession[]>(
        initialConversations || [] as IChatSession[]
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!initialConversations) {
            loadConversations();
        }
    }, []);

    const loadConversations = async () => {
        setIsLoading(true);
        try {
            // TODO: Gọi API để lấy danh sách conversations
            // const response = await fetchConversations(currentUserId);
            // setConversations(response);

            // Tạm thời dùng dữ liệu mẫu
            setConversations([]);
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (onRefresh) {
                await onRefresh();
            } else {
                await loadConversations();
            }
        } catch (error) {
            console.error("Error refreshing:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleConversationPress = (session: IChatSession) => {
        router.push({
            pathname: ROUTES.CHAT,
            params: {
                userId: currentUserId,
                userName: currentUserName,
                chatRoomId: `chat-${session.toUserId}`,
                targetUserId: session.toUserId,
                targetUserName: session.toUserFullName,
            },
        });
    };

    const formatTime = (date?: Date): string => {
        if (!date) return "";
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;

        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    };

    const renderConversation = ({ item }: { item: IChatSession }) => {
        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleConversationPress(item)}
            >
                <View style={styles.avatarContainer}>
                    {item.toUserAvatarUrl ? (
                        <Image
                            source={{ uri: item.toUserAvatarUrl }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {item.toUserFullName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.conversationName} numberOfLines={1}>
                            {item.toUserFullName}
                        </Text>
                        {item.lastModifiedAt && (
                            <Text style={styles.conversationTime}>
                                {formatTime(item.lastModifiedAt)}
                            </Text>
                        )}
                    </View>
                    {item.lastMessage && (
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item.lastMessage}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MessageSquare size={64} color="#cbd5e1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
            <Text style={styles.emptySubtitle}>
                Bắt đầu trò chuyện với người khác để xem lịch sử ở đây
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tin nhắn</Text>
                <View style={styles.headerRight} />
            </View>

            {isLoading && conversations.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={AppColors.primary} />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={
                        conversations.length === 0 ? styles.emptyListContainer : undefined
                    }
                    ListEmptyComponent={renderEmptyState}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: AppColors.white,
    },
    headerRight: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyListContainer: {
        flexGrow: 1,
    },
    conversationItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: AppColors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
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
        color: AppColors.white,
    },
    unreadBadge: {
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: AppColors.white,
    },
    unreadText: {
        fontSize: 11,
        fontWeight: "700",
        color: AppColors.white,
    },
    conversationContent: {
        flex: 1,
        justifyContent: "center",
    },
    conversationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        flex: 1,
    },
    conversationTime: {
        fontSize: 12,
        color: "#94a3b8",
        marginLeft: 8,
    },
    lastMessage: {
        fontSize: 14,
        color: "#64748b",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#475569",
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: 20,
    },
});

