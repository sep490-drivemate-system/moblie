import React from 'react';
import { Text, TextProps, StyleSheet, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/Colors';

export interface DisplayAmountProps {
  amount: number;
  showUnit?: boolean;
  unit?: string;
  containerStyle?: ViewStyle;
  amountStyle?: TextProps['style'];
  unitStyle?: TextProps['style'];
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
  fontWeight?: 'normal' | '500' | '600' | '700' | '800' | '900';
  showPlusSign?: boolean;
  showMinusSign?: boolean;
  formatter?: (amount: number) => string;
}

export default function DisplayAmount({
  amount,
  showUnit = true,
  unit = 'VNĐ',
  containerStyle,
  amountStyle,
  unitStyle,
  size = 'medium',
  color,
  fontWeight,
  showPlusSign = false,
  showMinusSign = true,
  formatter,
}: DisplayAmountProps) {
  const formatAmount = (value: number): string => {
    if (formatter) {
      return formatter(value);
    }

    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const sign = amount > 0 && showPlusSign ? '+' : amount < 0 && showMinusSign ? '-' : '';
  const displayAmount = Math.abs(amount);

  const sizeStyles = {
    small: { fontSize: 12, unitFontSize: 10 },
    medium: { fontSize: 16, unitFontSize: 14 },
    large: { fontSize: 20, unitFontSize: 16 },
    xlarge: { fontSize: 24, unitFontSize: 18 },
  };

  const currentSize = sizeStyles[size];

  const defaultColor = color || AppColors.textPrimary;

  const defaultFontWeight = fontWeight || (size === 'large' || size === 'xlarge' ? '700' : '600');

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.amount,
          {
            fontSize: currentSize.fontSize,
            color: defaultColor,
            fontWeight: defaultFontWeight,
          },
          amountStyle,
        ]}
      >
        {sign}
        {formatAmount(displayAmount)}
      </Text>
      {showUnit && (
        <Text
          style={[
            styles.unit,
            {
              fontSize: currentSize.unitFontSize,
              color: defaultColor,
            },
            unitStyle,
          ]}
        >
          {' '}
          {unit}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {
    lineHeight: undefined,
  },
  unit: {
    marginLeft: 4,
    fontWeight: '500',
  },
});

