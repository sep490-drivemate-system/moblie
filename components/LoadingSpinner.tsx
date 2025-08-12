import React from 'react';
import { View, Text } from 'react-native';
import { Spinner } from '@/components/ui/spinner';
import '../global.css';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'large';
    color?: string;
}

export function LoadingSpinner({
    message = 'Loading...',
    size = 'large',
    color = '#007AFF'
}: LoadingSpinnerProps) {
    return (
        <View className="flex-1 justify-center items-center bg-background">
            <View className="items-center space-y-4">
                <Spinner size={size} color={color} />
                {message && (
                    <Text className="text-center text-foreground-600 text-base">
                        {message}
                    </Text>
                )}
            </View>
        </View>
    );
}
