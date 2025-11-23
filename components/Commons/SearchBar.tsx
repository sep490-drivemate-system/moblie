import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { AppColors } from '@/constants/Colors';


export interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    showClearButton?: boolean;
    onClear?: () => void;
    style?: ViewStyle;
    inputStyle?: TextStyle;
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = 'Tìm kiếm...',
    showClearButton = true,
    onClear,
    style,
    inputStyle,
}: SearchBarProps) {
    const handleClear = () => {
        onChangeText('');
        onClear?.();
    };

    return (
        <View style={[styles.searchContainer, style]}>
            <View style={styles.searchInputWrapper}>
                <Search size={20} color={AppColors.primary} strokeWidth={2} />
                <TextInput
                    style={[styles.searchInput, inputStyle]}
                    placeholder={placeholder}
                    placeholderTextColor={AppColors.gray400}
                    value={value}
                    onChangeText={onChangeText}
                />
                {showClearButton && value.length > 0 && (
                    <TouchableOpacity onPress={handleClear}>
                        <X size={20} color={AppColors.gray400} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    searchContainer: {
        marginHorizontal: 16,
        marginVertical: 12,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: AppColors.gray200,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: AppColors.black,
        padding: 0,
        minHeight: 20,
    },
});