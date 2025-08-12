import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { AuthViewModel } from '@/viewmodels/auth/AuthViewModel';
import { useViewModel } from '@/viewmodels/shared/BaseViewModel';
import { RootState } from '@/lib/redux/store';
import '../../../global.css';

const authSelector = (state: RootState) => state.auth;

export default function ProfileScreen() {
    const router = useRouter();
    const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);

    const handleLogout = async () => {
        await authViewModel.logout();
    };

    const profileMenuItems = [
        { title: 'Edit Profile', icon: '✏️', route: '../profile' },
        { title: 'Settings', icon: '⚙️', route: '../settings' },
        { title: 'Notifications', icon: '🔔', route: '../notifications' },
        { title: 'Privacy', icon: '🔒', route: null },
        { title: 'Help & Support', icon: '❓', route: null },
        { title: 'About', icon: 'ℹ️', route: null },
    ];

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1">
                <View className="space-y-6 p-6">
                    {/* Profile Header */}
                    <Card className="p-6 bg-card">
                        <View className="items-center space-y-4">
                            {/* Avatar */}
                            <View className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center">
                                <Text className="text-primary-foreground font-bold text-2xl">
                                    {authState.user?.name?.charAt(0) || authState.user?.email?.charAt(0) || 'U'}
                                </Text>
                            </View>

                            {/* User Info */}
                            <View className="items-center space-y-1">
                                <Text className="text-xl font-bold text-foreground">
                                    {authState.user?.name || 'User'}
                                </Text>
                                <Text className="text-sm text-muted-foreground">
                                    {authState.user?.email}
                                </Text>
                                <View className="bg-green-100 px-3 py-1 rounded-full">
                                    <Text className="text-green-800 text-xs font-medium">Active</Text>
                                </View>
                            </View>

                            {/* Edit Profile Button */}
                            <Button variant="outline" className="w-full">
                                <Text className="text-foreground">Edit Profile</Text>
                            </Button>
                        </View>
                    </Card>

                    {/* Stats Cards */}
                    <View className="flex-row space-x-3">
                        <Card className="flex-1 p-4 bg-blue-50 border-blue-200">
                            <View className="items-center space-y-1">
                                <Text className="text-xl font-bold text-blue-600">
                                    142
                                </Text>
                                <Text className="text-xs text-blue-700 text-center">
                                    Activities
                                </Text>
                            </View>
                        </Card>

                        <Card className="flex-1 p-4 bg-green-50 border-green-200">
                            <View className="items-center space-y-1">
                                <Text className="text-xl font-bold text-green-600">
                                    24
                                </Text>
                                <Text className="text-xs text-green-700 text-center">
                                    Favorites
                                </Text>
                            </View>
                        </Card>

                        <Card className="flex-1 p-4 bg-purple-50 border-purple-200">
                            <View className="items-center space-y-1">
                                <Text className="text-xl font-bold text-purple-600">
                                    18
                                </Text>
                                <Text className="text-xs text-purple-700 text-center">
                                    Friends
                                </Text>
                            </View>
                        </Card>
                    </View>

                    {/* Menu Items */}
                    <Card className="bg-card">
                        <View className="divide-y divide-border">
                            {profileMenuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="p-4 flex-row items-center justify-between"
                                    onPress={() => item.route && router.push(item.route as any)}
                                >
                                    <View className="flex-row items-center space-x-3">
                                        <Text className="text-lg">{item.icon}</Text>
                                        <Text className="text-base text-foreground">{item.title}</Text>
                                    </View>
                                    <Text className="text-muted-foreground">›</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Logout Button */}
                    <Button
                        variant="outline"
                        onPress={handleLogout}
                        className="w-full border-red-200 bg-red-50"
                    >
                        <Text className="text-red-600 font-semibold">Sign Out</Text>
                    </Button>

                    {/* Bottom Spacing */}
                    <View className="h-10" />
                </View>
            </ScrollView>
        </View>
    );
}
