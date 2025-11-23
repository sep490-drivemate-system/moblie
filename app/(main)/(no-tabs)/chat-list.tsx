import React, { useEffect, useState } from "react";
import { IChatSession } from "@/models/chat/chat";
import { useSignalR } from "@/lib/signalr/useSignalR";
import { useAppSelector } from "@/lib/redux/hooks";
import { UserRole } from "@/models/enum/UserRole.enum";
import { SignalRHubPaths, SignalRHubUrls } from "@/lib/signalr/signalRConfig";
import { View, Text } from "react-native";


export default function ChatList() {
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const { connectionId, isConnected, invoke } = useSignalR({
    hubPath: SignalRHubUrls.CHAT,
    enabled: true,
  });

  useEffect(() => {
    console.log("connectionId", connectionId);
    try {
      const testInvoke = async () => {
        try {
          const result = await invoke(
            "test",
            "b2c8c0c1-9e3e-4a70-9f9f-8b4b6f0134e7",
            userRole as UserRole
          );
          console.log("result", result);
        } catch (error) {
          console.log("Error invoking test method:", error);
        }
      };
      testInvoke();
    } catch (error) {
      console.log("Error invoking test method:", error);
    }
  },
    [connectionId],
  );

  // useEffect(() => {
  //   if (isConnected && userId && userRole !== undefined) {
  //     loadConversations();
  //   }
  // }, [isConnected, userId, userRole]);

  // const loadConversations = async () => {
  //   setIsLoading(true);
  //   try {
  //     const result = await invoke("GetChatSessions", userRole as UserRole);

  //     if (result && Array.isArray(result)) {
  //       const mappedConversations: IChatSession[] = result.map((item: any) => ({
  //         id: item.id || item.conversationId || "",
  //         toUserId: item.toUserId || item.userId || "",
  //         toUserFullName: item.toUserFullName || item.userName || "",
  //         toUserAvatarUrl: item.toUserAvatarUrl || item.avatarUrl || "",
  //         lastMessage: item.lastMessage || "",
  //         lastModifiedAt: item.lastModifiedAt
  //           ? new Date(item.lastModifiedAt)
  //           : new Date(),
  //       }));
  //       setConversations(mappedConversations);
  //     } else {
  //       setConversations([]);
  //     }
  //   } catch (error) {
  //     console.log("Error loading conversations from SignalR:", error);
  //     setConversations([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleRefresh = async () => {
  //   await loadConversations();
  // };

  return (
    <View>
      <Text>connectionId: {connectionId || "Không có connectionId"}</Text>
      <Text>isConnected: {isConnected ? "Đã kết nối" : "Chưa kết nối"}</Text>
    </View>
  );
}

