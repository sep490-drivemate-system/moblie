import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
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

        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
                flexGrow: 1,
                backgroundColor: '#f8fafc',
                paddingVertical: 20
            }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
                {/* Main Card Container */}
                <Card
                    size="lg"
                    variant="elevated"
                    style={{
                        marginHorizontal: 'auto',
                        width: '100%',
                        maxWidth: 400,
                        backgroundColor: 'white',
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    {/* Header Section */}
                    <View style={{ padding: 32, paddingBottom: 24 }}>
                        <View style={{ alignItems: 'center', marginBottom: 32 }}>

                            <Text style={{
                                fontSize: 28,
                                fontWeight: 'bold',
                                color: '#1f2937',
                                textAlign: 'center',
                                marginBottom: 8
                            }}>
                                Welcome Back
                            </Text>


                        </View>

                        {/* Form Section */}
                        <View style={{ gap: 20 }}>
                            {/* Email Input */}
                            <View>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: 8,
                                    marginLeft: 4
                                }}>
                                    Email Address
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    style={{
                                        borderColor: '#d1d5db',
                                        borderRadius: 12,
                                        backgroundColor: '#f9fafb'
                                    }}
                                >
                                    <InputField
                                        placeholder="Enter your email"
                                        value={authState.formData.email}
                                        onChangeText={(text: string) => authViewModel.handleInputChange('email', text)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        editable={!authState.isLoading}
                                        style={{
                                            color: '#1f2937',
                                            paddingLeft: 16,
                                            fontSize: 16
                                        }}
                                    />
                                </Input>
                            </View>

                            {/* Password Input */}
                            <View>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: 8,
                                    marginLeft: 4
                                }}>
                                    Password
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    style={{
                                        borderColor: '#d1d5db',
                                        borderRadius: 12,
                                        backgroundColor: '#f9fafb'
                                    }}
                                >
                                    <InputField
                                        placeholder="Enter your password"
                                        value={authState.formData.password}
                                        onChangeText={(text: string) => authViewModel.handleInputChange('password', text)}
                                        secureTextEntry={!showPassword}
                                        autoComplete="password"
                                        editable={!authState.isLoading}
                                        style={{
                                            color: '#1f2937',
                                            paddingLeft: 16,
                                            paddingRight: 50,
                                            fontSize: 16
                                        }}
                                    />
                                    <InputSlot onPress={togglePasswordVisibility} style={{
                                        position: 'absolute',
                                        right: 16,
                                        top: 0,
                                        bottom: 0,
                                        justifyContent: 'center'
                                    }}>
                                        <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Text>
                                    </InputSlot>
                                </Input>
                            </View>

                            {/* Error Display */}
                            {authState.errorMessage && (
                                <Alert style={{
                                    backgroundColor: '#fef2f2',
                                    borderColor: '#fecaca',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    padding: 16
                                }}>
                                    <Text style={{
                                        color: '#dc2626',
                                        fontWeight: '500',
                                        textAlign: 'center'
                                    }}>
                                        {authState.errorMessage}
                                    </Text>
                                </Alert>
                            )}

                            {/* Login Button */}
                            <Button
                                size="lg"
                                action="primary"
                                variant="solid"
                                onPress={authViewModel.handleLogin}
                                disabled={authState.isLoading}
                                style={{
                                    marginTop: 8,
                                    borderRadius: 12,
                                    backgroundColor: '#3b82f6',
                                    shadowColor: '#3b82f6',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 8,
                                }}
                            >
                                {authState.isLoading && (
                                    <ButtonSpinner style={{ marginRight: 8 }} />
                                )}
                                <ButtonText style={{
                                    fontWeight: '600',
                                    fontSize: 16,
                                    color: 'white'
                                }}>
                                    {authState.isLoading ? 'Signing in...' : 'Sign In'}
                                </ButtonText>
                            </Button>

                            {/* Forgot Password Link */}
                            <TouchableOpacity
                                onPress={() => router.push('./forgot-password')}
                                disabled={authState.isLoading}
                                style={{ alignSelf: 'center', marginTop: 8 }}
                            >
                                <Text style={{
                                    color: '#3b82f6',
                                    fontWeight: '500',
                                    fontSize: 14
                                }}>
                                    Forgot your password?
                                </Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginVertical: 16
                            }}>
                                <View style={{
                                    flex: 1,
                                    height: 1,
                                    backgroundColor: '#e5e7eb'
                                }} />
                                <Text style={{
                                    marginHorizontal: 16,
                                    color: '#9ca3af',
                                    fontSize: 14
                                }}>
                                    or
                                </Text>
                                <View style={{
                                    flex: 1,
                                    height: 1,
                                    backgroundColor: '#e5e7eb'
                                }} />
                            </View>

                            {/* Register Link */}
                            <TouchableOpacity
                                onPress={() => router.push('./register')}
                                disabled={authState.isLoading}
                                style={{ alignSelf: 'center' }}
                            >
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4
                                }}>
                                    <Text style={{
                                        color: '#6b7280',
                                        fontSize: 14
                                    }}>
                                        Don't have an account?
                                    </Text>
                                    <Text style={{
                                        color: '#3b82f6',
                                        fontWeight: '600',
                                        fontSize: 14
                                    }}>
                                        Sign up
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Reset Form Button - Only show in development */}
                            {__DEV__ && (
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    size="sm"
                                    onPress={authViewModel.handleResetForm}
                                    disabled={authState.isLoading}
                                    style={{
                                        marginTop: 16,
                                        borderRadius: 8,
                                        borderColor: '#d1d5db'
                                    }}
                                >
                                    <ButtonText style={{
                                        color: '#6b7280',
                                        fontSize: 14
                                    }}>
                                        Reset Form
                                    </ButtonText>
                                </Button>
                            )}
                        </View>
                    </View>
                </Card>
            </View>
        </ScrollView>

    );
}
