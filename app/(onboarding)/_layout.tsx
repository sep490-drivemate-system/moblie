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
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="intro" options={{ animation: 'fade' }} />
      <Stack.Screen name="otp" options={{ animation: 'fade' }} />
      <Stack.Screen name="role-selection" options={{ animation: 'fade' }} />
    </Stack>
  );
}
