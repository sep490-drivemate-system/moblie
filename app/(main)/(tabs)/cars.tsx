import FilterModal from "@/components/FilterModal";
import CarItem from "@/components/ui/car-item";
import { FilterType } from "@/constants/FilterOptions";
import { RootState } from "@/lib/redux/store";
import { ListCarViewModel } from "@/viewmodels/listCar/listCarViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const filters = [
  {
    id: 1,
    name: "Tất cả",
    type: null,
  },
  {
    id: 2,
    name: "Số chỗ",
    type: "seats" as FilterType,
  },
  {
    id: 3,
    name: "Hãng xe",
    type: "brand" as FilterType,
  },
  {
    id: 4,
    name: "Loại xe",
    type: "type" as FilterType,
  },
  {
    id: 5,
    name: "Nhiên liệu",
    type: "fuel" as FilterType,
  },
];

export default function CarsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [listCarState, viewModel] = useViewModel(
    ListCarViewModel,
    (state: RootState) => state.listCar
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilterType, setSelectedFilterType] =
    useState<FilterType | null>(null);
  const [selectedFilterTitle, setSelectedFilterTitle] = useState("");

  const handleFilterPress = (filter: (typeof filters)[0]) => {
    if (filter.type === null) {
      viewModel.cleanFilter();
    } else {
      setSelectedFilterType(filter.type);
      setSelectedFilterTitle(filter.name);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedFilterType(null);
    setSelectedFilterTitle("");
  };

  const getFilterDisplayText = (filter: (typeof filters)[0]) => {
    if (filter.type === null) {
      return filter.name;
    }
    return viewModel.getFilterDisplayText(filter.type, filter.name);
  };

  const renderItem = ({ item }: { item: (typeof filters)[0] }) => {
    const isSelected = item.type
      ? viewModel.getFilterCount(item.type) > 0
      : !viewModel.hasActiveFilters;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isSelected ? styles.filterButtonActive : null,
        ]}
        onPress={() => handleFilterPress(item)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isSelected ? styles.filterButtonTextActive : null,
          ]}
        >
          {item.type
            ? viewModel.getFilterDisplayText(item.type, item.name)
            : item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FlatList
          data={filters}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={renderItem}
        />
      </View>

      <View style={styles.carListContainer}>
        <FlatList
          data={viewModel.filteredCars}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.carList,
            { paddingBottom: tabBarHeight + 16 },
          ]}
          renderItem={({ item }) => <CarItem car={item} variant="full" />}
        />
      </View>

      {modalVisible && selectedFilterType && (
        <FilterModal
          visible={modalVisible}
          onClose={handleCloseModal}
          filterType={selectedFilterType}
          title={selectedFilterTitle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 10,
  },
  filterContainer: {
    paddingVertical: 10,
  },
  filterList: {
    gap: 10,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  filterButtonActive: {
    borderColor: "#026AA7",
    backgroundColor: "#026AA7",
  },
  filterButtonText: {
    fontSize: 16,
    color: "#333333",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  carListContainer: {
    flex: 1,
    marginBottom: 10,
  },
  carList: {
    gap: 20,
  },
});
