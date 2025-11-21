import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="role-selection" />
    </Stack>
  );
}
