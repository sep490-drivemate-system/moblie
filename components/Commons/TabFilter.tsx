import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { AppColors } from '@/constants/Colors';


export interface TabOption<T = string> {
    value: T;
    label: string;
    icon?: LucideIcon;
    count?: number;
    badge?: string | number;
}

export interface TabFilterProps<T = string> {
    options: TabOption<T>[];
    activeValue: T;
    onSelect: (value: T) => void;
    showCount?: boolean;
    iconSize?: number;
    style?: ViewStyle;
    containerStyle?: ViewStyle;
    tabStyle?: ViewStyle;
    activeTabStyle?: ViewStyle | ((value: T) => ViewStyle);
    textStyle?: TextStyle;
    activeTextStyle?: TextStyle | ((value: T) => TextStyle);
    iconActiveColor?: string;
    iconInactiveColor?: string;
}


export default function TabFilter<T = string>({
    options,
    activeValue,
    onSelect,
    showCount = true,
    iconSize = 16,
    style,
    containerStyle,
    tabStyle,
    activeTabStyle,
    textStyle,
    activeTextStyle,
    iconActiveColor = '#ffffff',
    iconInactiveColor = '#6b7280',
}: TabFilterProps<T>) {
    return (
        <View style={[styles.tabsContainer, containerStyle]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.tabsScrollContent, style]}
            >
                {options.map((option) => {
                    const isActive = activeValue === option.value;
                    const Icon = option.icon;
                    const computedActiveTabStyle = isActive && activeTabStyle
                        ? typeof activeTabStyle === 'function'
                            ? activeTabStyle(option.value)
                            : activeTabStyle
                        : undefined;
                    const computedActiveTextStyle = isActive && activeTextStyle
                        ? typeof activeTextStyle === 'function'
                            ? activeTextStyle(option.value)
                            : activeTextStyle
                        : undefined;

                    return (
                        <TouchableOpacity activeOpacity={1}
                            key={String(option.value)}
                            style={[
                                styles.tab,
                                tabStyle,
                                isActive && styles.activeTab,
                                computedActiveTabStyle,
                            ]}
                            onPress={() => onSelect(option.value)}
                        >
                            <View style={styles.tabContent}>
                                {Icon && (
                                    <Icon
                                        size={iconSize}
                                        color={isActive ? iconActiveColor : iconInactiveColor}
                                        strokeWidth={2}
                                    />
                                )}
                                <Text
                                    style={[
                                        styles.tabText,
                                        textStyle,
                                        isActive && styles.activeTabText,
                                        computedActiveTextStyle,
                                    ]}
                                >
                                    {option.label}
                                    {showCount && option.count !== undefined && ` (${option.count})`}
                                    {option.badge !== undefined && ` ${option.badge}`}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    tabsContainer: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        borderRadius: 24,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        zIndex: 1,
    },
    tabsScrollContent: {
        paddingHorizontal: 4,
        paddingRight: 12,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
        minWidth: 80,
    },
    activeTab: {
        backgroundColor: AppColors.primary,
        borderColor: AppColors.primary,
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#ffffff',
        fontWeight: '700',
    },
});