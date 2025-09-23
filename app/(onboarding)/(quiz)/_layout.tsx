import { Stack } from "expo-router";

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="quiz-1" />
      <Stack.Screen name="quiz-2" />
      <Stack.Screen name="quiz-3" />
      <Stack.Screen name="quiz-4" />
    </Stack>
  );
}
