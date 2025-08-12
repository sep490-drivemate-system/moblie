import { Stack } from 'expo-router';

export default function MainLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="profile"
                options={{
                    headerShown: true,
                    title: 'Profile',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="map"
                options={{
                    headerShown: true,
                    title: 'Map',
                    headerBackTitle: 'Back'
                }}
            />
            <Stack.Screen
                name="notifications"
                options={{
                    headerShown: true,
                    title: 'Notifications',
                    headerBackTitle: 'Back'
                }}
            />
        </Stack>
    );
}
