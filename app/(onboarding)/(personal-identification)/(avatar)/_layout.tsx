import { Stack } from "expo-router";

export default function AvatarLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="avatar" />
      <Stack.Screen name="upload-guide" />
    </Stack>
  );
}
