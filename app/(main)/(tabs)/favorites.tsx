import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import '../../../global.css';

export default function FavoritesScreen() {
    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1">
                <View className="space-y-6 p-6">
                    {/* Header */}
                    <View className="space-y-2">
                        <Text className="text-2xl font-bold text-foreground">
                            Your Favorites
                        </Text>
                        <Text className="text-base text-muted-foreground">
                            Items you've saved for later
                        </Text>
                    </View>

                    {/* Stats Cards */}
                    <View className="flex-row space-x-3">
                        <Card className="flex-1 p-4 bg-blue-50 border-blue-200">
                            <View className="items-center space-y-1">
                                <Text className="text-2xl font-bold text-blue-600">
                                    24
                                </Text>
                                <Text className="text-sm text-blue-700 text-center">
                                    Total Favorites
                                </Text>
                            </View>
                        </Card>

                        <Card className="flex-1 p-4 bg-green-50 border-green-200">
                            <View className="items-center space-y-1">
                                <Text className="text-2xl font-bold text-green-600">
                                    5
                                </Text>
                                <Text className="text-sm text-green-700 text-center">
                                    This Week
                                </Text>
                            </View>
                        </Card>
                    </View>

                    {/* Favorites List */}
                    <View className="space-y-3">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-semibold text-foreground">
                                Recent Favorites
                            </Text>
                            <Button variant="outline" size="sm">
                                <Text className="text-foreground">View All</Text>
                            </Button>
                        </View>

                        {[1, 2, 3, 4, 5].map((item) => (
                            <Card key={item} className="p-4 bg-card">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 space-y-2">
                                        <Text className="text-lg font-semibold text-foreground">
                                            Favorite Item {item}
                                        </Text>
                                        <Text className="text-sm text-muted-foreground">
                                            Added to favorites on January {item + 10}, 2024
                                        </Text>
                                        <View className="flex-row space-x-2">
                                            <View className="bg-blue-100 px-2 py-1 rounded">
                                                <Text className="text-blue-800 text-xs">Category</Text>
                                            </View>
                                            <View className="bg-green-100 px-2 py-1 rounded">
                                                <Text className="text-green-800 text-xs">Popular</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-2xl">❤️</Text>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>

                    {/* Empty State (if no favorites) */}
                    {false && (
                        <Card className="p-8 bg-card items-center">
                            <View className="space-y-4 items-center">
                                <Text className="text-4xl">💖</Text>
                                <Text className="text-lg font-semibold text-foreground text-center">
                                    No favorites yet
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center">
                                    Start exploring and save items you love!
                                </Text>
                                <Button>
                                    <Text className="text-primary-foreground">Discover Now</Text>
                                </Button>
                            </View>
                        </Card>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
