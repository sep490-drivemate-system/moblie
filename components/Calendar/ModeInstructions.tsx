import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarMode } from './ModeSelector';

interface ModeInstructionsProps {
    mode: CalendarMode;
}

const ModeInstructions: React.FC<ModeInstructionsProps> = ({ mode }) => {
    const getInstructions = () => {
        switch (mode) {
            case 'session':
                return {
                    title: 'Chế độ theo buổi',
                    steps: [
                        '1. Chọn ngày trên lịch',
                        '2. Chọn buổi sáng hoặc chiều',
                        '3. Thời gian sẽ được đặt tự động'
                    ],
                    color: '#4ecdc4'
                };
            case 'day':
                return {
                    title: 'Chế độ theo ngày',
                    steps: [
                        '1. Nhấn vào ngày để chọn',
                        '2. Nhấn lại để bỏ chọn',
                        '3. Có thể chọn nhiều ngày'
                    ],
                    color: '#ff6b6b'
                };
            case 'week':
                return {
                    title: 'Chế độ theo tuần',
                    steps: [
                        '1. Chọn một ngày trong tuần',
                        '2. Chọn các ngày cụ thể trong tuần đó',
                        '3. Có thể chọn nhiều tuần khác nhau'
                    ],
                    color: '#ffa726'
                };
            case 'cycle':
                return {
                    title: 'Chế độ theo chu kỳ',
                    steps: [
                        '1. Chọn 1 ngày (ví dụ: thứ 2)',
                        '2. Tất cả ngày cùng thứ trong tháng sẽ được chọn',
                        '3. Chọn lại để bỏ chọn tất cả ngày cùng thứ'
                    ],
                    color: '#ab47bc'
                };
            default:
                return {
                    title: 'Chọn chế độ',
                    steps: ['Chọn một chế độ ở trên để bắt đầu'],
                    color: '#6c757d'
                };
        }
    };

    const instructions = getInstructions();

    return (
        <View style={[styles.container, { borderLeftColor: instructions.color }]}>
            <Text style={[styles.title, { color: instructions.color }]}>
                {instructions.title}
            </Text>
            {instructions.steps.map((step, index) => (
                <Text key={index} style={styles.step}>
                    {step}
                </Text>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    step: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 2,
        lineHeight: 16,
    },
});

export default ModeInstructions;
