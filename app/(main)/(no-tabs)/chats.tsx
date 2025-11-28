import React, { useEffect } from "react";
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
  return (
    <View>
      <Text>connectionId: {connectionId || "Không có connectionId"}</Text>
      <Text>isConnected: {isConnected ? "Đã kết nối" : "Chưa kết nối"}</Text>
    </View>
  );
}

