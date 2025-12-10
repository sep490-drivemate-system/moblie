import { Stack } from 'expo-router';

export default function NoTabsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="instructor-detail"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="notifications"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="car-detail"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="booking"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="payment-success"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="payment-failed"
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="wallet"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="create-route"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="instructor-notification"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="instructor-schedule"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="chat"
                options={{
                    presentation: 'card',
                    animation: 'fade',
                }}
            />
        </Stack>
    );
}
