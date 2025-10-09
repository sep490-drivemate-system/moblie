import { Stack } from 'expo-router';

export default function NoTabsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="detail"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="instructor-detail"
                options={{
                    headerShown: false,
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            /> <Stack.Screen
                name="payment-success"
                options={{
                    headerShown: false,
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="booking"
                options={{
                    headerShown: false,
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="deposit"
                options={{
                    headerShown: false,
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            />
        </Stack>
    );
}
