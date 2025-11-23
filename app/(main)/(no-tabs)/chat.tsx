import React from "react";
import { useLocalSearchParams } from "expo-router";
import ChatScreen from "@/components/Chat/ChatScreen";
import { DEFAULT_CHAT_HUB_URL } from "@/lib/signalr/signalRConfig";

export default function ChatPage() {
  const params = useLocalSearchParams();

  const userId = params.userId as string;
  const userName = params.userName as string;
  const chatRoomId = params.chatRoomId as string | undefined;
  const hubUrl = (params.hubUrl as string) || DEFAULT_CHAT_HUB_URL;

  return (
    <ChatScreen
      hubUrl={hubUrl}
      userId={userId || "unknown"}
      userName={userName || "Unknown User"}
      chatRoomId={chatRoomId}
    />
  );
}

