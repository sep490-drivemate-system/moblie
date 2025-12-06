import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppColors } from "@/constants/Colors";

export type CarFilterOptionType = {
  id: string;
  label: string;
  value: any;
  type: string;
};

export interface CarFilterProps {
  filterOptions: CarFilterOptionType[];
  renderFilterOptionItem: (params: {
    item: CarFilterOptionType;
  }) => React.ReactElement;
}

const CarFilter: React.FC<CarFilterProps> = ({
  filterOptions,
  renderFilterOptionItem,
}) => {
  return (
    <View style={styles.filterContainer}>
      <FlatList
        data={filterOptions}
        renderItem={({ item }) => renderFilterOptionItem({ item })}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterOptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  filterOptions: {
    gap: 12,
    paddingRight: 4,
  },
});

export default CarFilter;

