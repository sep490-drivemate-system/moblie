import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input, InputField } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'expo-router';
import '../../global.css';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setMessage(`Password reset instructions have been sent to ${email}`);
        } catch (error) {
            setError('Failed to send reset instructions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background justify-center p-6">
            {/* Main Card Container */}
            <Card className="p-8 m-4 max-w-md self-center w-full bg-card shadow-lg">
                <View className="space-y-6">
                    {/* Header */}
                    <View className="space-y-3 items-center">
                        <Text className="text-3xl font-bold text-center text-foreground">
                            Reset Password
                        </Text>
                        <Text className="text-base text-center text-muted-foreground">
                            Enter your email to receive reset instructions
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="space-y-4">
                        {/* Email Input */}
                        <View className="space-y-2">
                            <Text className="text-sm font-medium text-foreground">
                                Email Address
                            </Text>
                            <Input variant="outline" size="md" className="w-full">
                                <InputField
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={(text: string) => {
                                        setEmail(text);
                                        if (error) setError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!isLoading}
                                />
                            </Input>
                        </View>

                        {/* Success Message */}
                        {message && (
                            <Alert className="border-green-200 bg-green-50">
                                <Text className="text-green-800 text-sm">
                                    {message}
                                </Text>
                            </Alert>
                        )}

                        {/* Error Display */}
                        {error && (
                            <Alert className="border-destructive bg-destructive/10">
                                <Text className="text-destructive text-sm">
                                    {error}
                                </Text>
                            </Alert>
                        )}

                        {/* Reset Button */}
                        <Button
                            onPress={handleResetPassword}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <View className="flex-row items-center space-x-2">
                                    <Spinner size="small" color="#ffffff" />
                                    <Text className="text-primary-foreground font-semibold">
                                        Sending instructions...
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-primary-foreground font-semibold">
                                    Send Reset Instructions
                                </Text>
                            )}
                        </Button>

                        {/* Back to Login */}
                        <TouchableOpacity
                            onPress={() => router.push('./login')}
                            disabled={isLoading}
                            className="w-full"
                        >
                            <Text className="text-center text-sm text-muted-foreground">
                                Remember your password?{' '}
                                <Text className="text-primary font-medium">
                                    Sign in
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </View>
    );
}
