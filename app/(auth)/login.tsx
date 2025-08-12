import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'expo-router';
import { AuthViewModel } from '@/viewmodels/auth/AuthViewModel';
import { useViewModel } from '@/viewmodels/shared/BaseViewModel';
import { RootState } from '@/lib/redux/store';
import '../../global.css';

// Redux selector cho auth state
const authSelector = (state: RootState) => state.auth;

export default function LoginScreen() {
    const router = useRouter();
    const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Setup navigation callback cho ViewModel (nếu cần)
        authViewModel.setNavigationCallback((route: string) => {
            router.replace(route as any);
        });
    }, [authViewModel, router]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <View className="flex-1 bg-background justify-center p-6">
            {/* Main Card Container */}
            <Card className="p-8 m-4 max-w-md self-center w-full bg-card shadow-lg">
                <View className="space-y-6">
                    {/* Header */}
                    <View className="space-y-3 items-center">
                        <Text className="text-3xl font-bold text-center text-foreground">
                            Welcome Back
                        </Text>
                        <Text className="text-base text-center text-muted-foreground">
                            Sign in to your account to continue
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="space-y-4">
                        {/* Email Input */}
                        <View className="space-y-2">
                            <Text className="text-sm font-medium text-foreground">
                                Email
                            </Text>
                            <Input variant="outline" size="md" className="w-full">
                                <InputField
                                    placeholder="Enter your email"
                                    value={authState.formData.email}
                                    onChangeText={(text: string) => authViewModel.handleInputChange('email', text)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!authState.isLoading}
                                />
                            </Input>
                        </View>

                        {/* Password Input */}
                        <View className="space-y-2">
                            <Text className="text-sm font-medium text-foreground">
                                Password
                            </Text>
                            <Input variant="outline" size="md" className="w-full">
                                <InputField
                                    placeholder="Enter your password"
                                    value={authState.formData.password}
                                    onChangeText={(text: string) => authViewModel.handleInputChange('password', text)}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    editable={!authState.isLoading}
                                />
                                <InputSlot onPress={togglePasswordVisibility} className="pr-3">
                                    <Text className="text-muted-foreground">
                                        {showPassword ? '🙈' : '👁️'}
                                    </Text>
                                </InputSlot>
                            </Input>
                        </View>

                        {/* Error Display */}
                        {authState.errorMessage && (
                            <Alert className="border-destructive bg-destructive/10">
                                <Text className="text-destructive text-sm">
                                    {authState.errorMessage}
                                </Text>
                            </Alert>
                        )}

                        {/* Login Button */}
                        <Button
                            onPress={authViewModel.handleLogin}
                            disabled={authState.isLoading}
                            className="w-full"
                        >
                            {authState.isLoading ? (
                                <View className="flex-row items-center space-x-2">
                                    <Spinner size="small" color="#ffffff" />
                                    <Text className="text-primary-foreground font-semibold">
                                        Signing in...
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-primary-foreground font-semibold">
                                    Sign In
                                </Text>
                            )}
                        </Button>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            onPress={authViewModel.handleResetForm}
                            disabled={authState.isLoading}
                            className="w-full"
                        >
                            <Text className="text-foreground">Reset Form</Text>
                        </Button>
                    </View>

                    {/* Footer Links */}
                    <View className="space-y-4 items-center">
                        <TouchableOpacity
                            onPress={() => router.push('./forgot-password')}
                            disabled={authState.isLoading}
                        >
                            <Text className="text-sm text-primary text-center">
                                Forgot your password?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('./register')}
                            disabled={authState.isLoading}
                        >
                            <Text className="text-sm text-muted-foreground text-center">
                                Don't have an account?{' '}
                                <Text className="text-primary font-medium">
                                    Sign up
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </View>
    );
}
