import React from 'react';
import { View, Text, StyleSheet, ViewStyle, ColorValue, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { AppColors } from '@/constants/Colors';
import { RelativePathString, router } from 'expo-router';
import { ROUTES } from '@/constants/routes';

export interface HeaderListProps {
    actionReturnScreen?: string;
    title: string;
    colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
    showCurve?: boolean;
    gradientStart?: { x: number; y: number };
    gradientEnd?: { x: number; y: number };
    style?: ViewStyle;
}

export default function HeaderList({
    actionReturnScreen,
    title,
    colors = [AppColors.primary, AppColors.gradientStart, AppColors.gradientEnd],
    showCurve = true,
    gradientStart = { x: 0, y: 0 },
    gradientEnd = { x: 1, y: 1 },
    style,
}: HeaderListProps) {
    return (
        <LinearGradient
            colors={colors}
            style={[styles.header, style]}
            start={gradientStart}
            end={gradientEnd}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (actionReturnScreen === ROUTES.BACK || !actionReturnScreen || actionReturnScreen === '') {
                        router.back();
                    } else {
                        router.push({ pathname: actionReturnScreen as any });
                    }
                }}
            >
                <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>
            </View>
            {showCurve && <View style={styles.headerCurve} />}
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerStats: {
        flexDirection: 'row',
        gap: 20,
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 60,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 2,
    },
    headerCurve: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 30,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
});