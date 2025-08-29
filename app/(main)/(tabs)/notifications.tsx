import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


export default function NotificationsScreen() {
    const notifications = [
        {
            id: 1,
            title: 'Welcome to the app!',
            message: 'Thanks for joining us. Explore all the features.',
            time: '2 hours ago',
            type: 'welcome',
            read: false,
        },
        {
            id: 2,
            title: 'New update available',
            message: 'Version 1.1.0 is now available with bug fixes.',
            time: '1 day ago',
            type: 'update',
            read: true,
        },
        {
            id: 3,
            title: 'Profile completed',
            message: 'Your profile setup is now complete.',
            time: '3 days ago',
            type: 'success',
            read: true,
        },
        {
            id: 4,
            title: 'Security alert',
            message: 'New login detected from a different device.',
            time: '1 week ago',
            type: 'security',
            read: false,
        },
    ];

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'welcome': return '👋';
            case 'update': return '🔄';
            case 'success': return '✅';
            case 'security': return '🔒';
            default: return '📱';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'welcome': return 'bg-blue-50 border-blue-200';
            case 'update': return 'bg-green-50 border-green-200';
            case 'success': return 'bg-green-50 border-green-200';
            case 'security': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1">
                <View className="space-y-6 p-6">
                    {/* Header */}
                    <View className="space-y-2">
                        <Text className="text-2xl font-bold text-foreground">
                            Notifications
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            Stay updated with your activity
                        </Text>
                    </View>

                    {/* Actions */}
                    <View className="flex-row space-x-3">
                        <Button variant="outline" size="sm" className="flex-1">
                            <Text className="text-foreground">Mark All Read</Text>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                            <Text className="text-foreground">Clear All</Text>
                        </Button>
                    </View>

                    {/* Notifications List */}
                    <View className="space-y-3">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`p-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-primary' : ''
                                    }`}
                            >
                                <View className="flex-row space-x-3">
                                    <Text className="text-2xl">{getNotificationIcon(notification.type)}</Text>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-start">
                                            <Text className={`text-base font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'
                                                }`}>
                                                {notification.title}
                                            </Text>
                                            {!notification.read && (
                                                <View className="w-2 h-2 bg-primary rounded-full mt-1" />
                                            )}
                                        </View>
                                        <Text className="text-sm text-muted-foreground mt-1">
                                            {notification.message}
                                        </Text>
                                        <Text className="text-xs text-muted-foreground mt-2">
                                            {notification.time}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>

                    {/* Empty State (if no notifications) */}
                    {notifications.length === 0 && (
                        <Card className="p-8 bg-card items-center">
                            <View className="space-y-4 items-center">
                                <Text className="text-4xl">🔔</Text>
                                <Text className="text-lg font-semibold text-foreground text-center">
                                    No notifications yet
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center">
                                    You'll see notifications here when there's activity on your account.
                                </Text>
                            </View>
                        </Card>
                    )}

                    {/* Bottom Spacing */}
                    <View className="h-10" />
                </View>
            </ScrollView>
        </View>
    );
}
