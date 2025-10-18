import { Stack } from "expo-router";

export default function PersonalIdentificationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="(avatar)" />
      <Stack.Screen name="(national-id)" />
    </Stack>
  );
}
