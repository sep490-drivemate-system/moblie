import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


export default function SettingsScreen() {
    const settingsItems = [
        { title: 'Account Settings', icon: '👤', description: 'Manage your account preferences' },
        { title: 'Privacy & Security', icon: '🔒', description: 'Control your privacy settings' },
        { title: 'Notifications', icon: '🔔', description: 'Manage notification preferences' },
        { title: 'Language & Region', icon: '🌍', description: 'Set language and location' },
        { title: 'Data & Storage', icon: '💾', description: 'Manage app data and storage' },
        { title: 'Accessibility', icon: '♿', description: 'Accessibility options' },
        { title: 'Help & Support', icon: '❓', description: 'Get help and contact support' },
        { title: 'About', icon: 'ℹ️', description: 'App information and legal' },
    ];

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1">
                <View className="space-y-6 p-6">
                    {/* Header */}
                    <View className="space-y-2">
                        <Text className="text-2xl font-bold text-foreground">
                            Settings
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            Manage your app preferences
                        </Text>
                    </View>

                    {/* Settings List */}
                    <Card className="bg-card">
                        <View className="divide-y divide-border">
                            {settingsItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="p-4 flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center space-x-3 flex-1">
                                        <Text className="text-xl">{item.icon}</Text>
                                        <View className="flex-1">
                                            <Text className="text-base font-medium text-foreground">{item.title}</Text>
                                            <Text className="text-sm text-muted-foreground">{item.description}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-muted-foreground">›</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* App Info */}
                    <Card className="p-4 bg-card">
                        <View className="items-center space-y-2">
                            <Text className="text-lg font-semibold text-foreground">App Version</Text>
                            <Text className="text-sm text-muted-foreground">1.0.0 (Build 1)</Text>
                            <Button variant="outline" size="sm">
                                <Text className="text-foreground">Check for Updates</Text>
                            </Button>
                        </View>
                    </Card>

                    {/* Bottom Spacing */}
                    <View className="h-10" />
                </View>
            </ScrollView>
        </View>
    );
}
