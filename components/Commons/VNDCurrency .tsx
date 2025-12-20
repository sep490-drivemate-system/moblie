import { Text, TextStyle } from 'react-native';


export interface VNDCurrencyProps {
  amount?: number;
  showSymbol?: boolean;
  symbolPosition?: 'prefix' | 'suffix';
  style?: TextStyle;
  symbolStyle?: TextStyle;
}

export default function VNDCurrency({
  amount = 0,
  showSymbol = true,
  symbolPosition = 'suffix',
  style,
  symbolStyle,
}: VNDCurrencyProps) {
  const formatVND = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }

    const num = Math.round(Number(value));

    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formattedAmount = formatVND(amount);
  const symbol = showSymbol ? '₫' : '';

  return (
    <Text style={style}>
      {symbolPosition === 'prefix' && symbol && (
        <Text style={symbolStyle}>{symbol} </Text>
      )}
      {formattedAmount}
      {symbolPosition === 'suffix' && symbol && (
        <Text style={symbolStyle}> {symbol}</Text>
      )}
    </Text>
  );
};



