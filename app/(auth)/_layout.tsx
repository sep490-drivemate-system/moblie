import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="signin"
                options={{
                    headerShown: false,
                    title: 'Sign In',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    headerShown: false,
                    title: 'Sign Up',
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="forgot-password"
                options={{
                    headerShown: false,
                    title: 'Reset Password',
                    animation: 'fade',
                }}
            />
        </Stack>
    );
}
