import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Input, InputField } from '@/components/ui/input';
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

export default function RegisterScreen() {
    const router = useRouter();
    const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Setup navigation callback cho ViewModel (nếu cần)
        authViewModel.setNavigationCallback((route: string) => {
            router.replace(route as any);
        });
    }, [authViewModel, router]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-center p-6">
                    {/* Main Card Container */}
                    <Card className="p-8 m-4 max-w-md self-center w-full bg-card shadow-lg">
                        <View className="space-y-6">
                            {/* Header */}
                            <View className="space-y-3 items-center">
                                <Text className="text-3xl font-bold text-center text-foreground">
                                    Create Account
                                </Text>
                                <Text className="text-base text-center text-muted-foreground">
                                    Sign up to get started
                                </Text>
                            </View>

                            {/* Form */}
                            <View className="space-y-4">
                                {/* Name Input */}
                                <View className="space-y-2">
                                    <Text className="text-sm font-medium text-foreground">
                                        Full Name
                                    </Text>
                                    <Input variant="outline" size="md" className="w-full">
                                        <InputField
                                            placeholder="Enter your full name"
                                            value={authState.registerFormData?.name || ''}
                                            onChangeText={(text: string) => authViewModel.handleRegisterInputChange('name', text)}
                                            autoComplete="name"
                                            editable={!authState.isLoading}
                                        />
                                    </Input>
                                </View>

                                {/* Email Input */}
                                <View className="space-y-2">
                                    <Text className="text-sm font-medium text-foreground">
                                        Email
                                    </Text>
                                    <Input variant="outline" size="md" className="w-full">
                                        <InputField
                                            placeholder="Enter your email"
                                            value={authState.registerFormData?.email || ''}
                                            onChangeText={(text: string) => authViewModel.handleRegisterInputChange('email', text)}
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
                                            value={authState.registerFormData?.password || ''}
                                            onChangeText={(text: string) => authViewModel.handleRegisterInputChange('password', text)}
                                            secureTextEntry={!showPassword}
                                            autoComplete="password-new"
                                            editable={!authState.isLoading}
                                        />
                                        <TouchableOpacity
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                            onPress={togglePasswordVisibility}
                                        >
                                            <Text className="text-muted-foreground">
                                                {showPassword ? '🙈' : '👁️'}
                                            </Text>
                                        </TouchableOpacity>
                                    </Input>
                                </View>

                                {/* Confirm Password Input */}
                                <View className="space-y-2">
                                    <Text className="text-sm font-medium text-foreground">
                                        Confirm Password
                                    </Text>
                                    <Input variant="outline" size="md" className="w-full">
                                        <InputField
                                            placeholder="Confirm your password"
                                            value={authState.registerFormData?.confirmPassword || ''}
                                            onChangeText={(text: string) => authViewModel.handleRegisterInputChange('confirmPassword', text)}
                                            secureTextEntry={!showConfirmPassword}
                                            autoComplete="password-new"
                                            editable={!authState.isLoading}
                                        />
                                        <TouchableOpacity
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                            onPress={toggleConfirmPasswordVisibility}
                                        >
                                            <Text className="text-muted-foreground">
                                                {showConfirmPassword ? '🙈' : '👁️'}
                                            </Text>
                                        </TouchableOpacity>
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

                                {/* Register Button */}
                                <Button
                                    onPress={authViewModel.handleRegister}
                                    disabled={authState.isLoading}
                                    className="w-full"
                                >
                                    {authState.isLoading ? (
                                        <View className="flex-row items-center space-x-2">
                                            <Spinner size="small" color="#ffffff" />
                                            <Text className="text-primary-foreground font-semibold">
                                                Creating account...
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text className="text-primary-foreground font-semibold">
                                            Create Account
                                        </Text>
                                    )}
                                </Button>

                                {/* Login Link */}
                                <TouchableOpacity
                                    onPress={() => router.push('./login')}
                                    disabled={authState.isLoading}
                                    className="w-full"
                                >
                                    <Text className="text-center text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <Text className="text-primary font-medium">
                                            Sign in
                                        </Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}
