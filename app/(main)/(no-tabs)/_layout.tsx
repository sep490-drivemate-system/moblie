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
        </Stack>
    );
}
