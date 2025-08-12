import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import '../../../global.css';

export default function DiscoverScreen() {
    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1">
                <View className="space-y-6 p-6">
                    {/* Search Header */}
                    <View className="space-y-4">
                        <Text className="text-2xl font-bold text-foreground">
                            Discover
                        </Text>
                        <Input variant="outline" size="md" className="w-full">
                            <InputField
                                placeholder="Search for anything..."
                                autoCapitalize="none"
                            />
                        </Input>
                    </View>

                    {/* Categories */}
                    <View className="space-y-3">
                        <Text className="text-lg font-semibold text-foreground">
                            Categories
                        </Text>
                        <View className="flex-row flex-wrap gap-3">
                            {['Technology', 'Health', 'Finance', 'Travel', 'Food', 'Sports'].map((category) => (
                                <Button
                                    key={category}
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    <Text className="text-foreground">{category}</Text>
                                </Button>
                            ))}
                        </View>
                    </View>

                    {/* Featured Content */}
                    <View className="space-y-3">
                        <Text className="text-lg font-semibold text-foreground">
                            Trending Now
                        </Text>
                        {[1, 2, 3, 4].map((item) => (
                            <Card key={item} className="p-4 bg-card">
                                <View className="space-y-2">
                                    <Text className="text-lg font-semibold text-foreground">
                                        Featured Item {item}
                                    </Text>
                                    <Text className="text-sm text-muted-foreground">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                        Sed do eiusmod tempor incididunt ut labore.
                                    </Text>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-xs text-muted-foreground">
                                            2 hours ago
                                        </Text>
                                        <Button size="sm">
                                            <Text className="text-primary-foreground">View</Text>
                                        </Button>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
