import React from "react";
import { useLocalSearchParams } from "expo-router";
import ChatScreen from "@/components/Chat/ChatScreen";
import { SignalRHubPaths } from "@/lib/signalr/signalRConfig";

export default function ChatPage() {
  const params = useLocalSearchParams();

  const userId = params.userId as string;
  const userName = params.userName as string;
  const chatRoomId = params.chatRoomId as string | undefined;
  const hubPath = params.hubPath as keyof typeof SignalRHubPaths;

  return (
    <ChatScreen
      hubPath={hubPath}
      userId={userId}
      userName={userName}
      chatRoomId={chatRoomId}
    />
  );
}
