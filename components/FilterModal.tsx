import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { updateFilter } from "@/features/listCar/listCarSlice";
import {
  SEAT_OPTIONS,
  BRAND_OPTIONS,
  TYPE_OPTIONS,
  FUEL_OPTIONS,
  FilterType,
} from "@/constants/FilterOptions";
import { X } from "lucide-react-native";

interface FilterOption {
  id: number;
  value: any;
  label: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterType: FilterType;
  title: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filterType,
  title,
}) => {
  const dispatch = useDispatch();
  const currentFilters = useSelector(
    (state: RootState) => state.listCar.filters
  );

  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const getOptions = (): FilterOption[] => {
    switch (filterType) {
      case "seats":
        return SEAT_OPTIONS;
      case "brand":
        return BRAND_OPTIONS;
      case "type":
        return TYPE_OPTIONS;
      case "fuel":
        return FUEL_OPTIONS;
      default:
        return [];
    }
  };

  const options = getOptions();

  useEffect(() => {
    if (visible) {
      const currentFilterValues = currentFilters[filterType] || [];
      setSelectedValues(currentFilterValues);
      setSelectAll(currentFilterValues.length === options.length);
    }
  }, [visible, filterType, currentFilters, options.length]);

  const handleToggleOption = (value: any) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    setSelectedValues(newSelectedValues);
    setSelectAll(newSelectedValues.length === options.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedValues([]);
      setSelectAll(false);
    } else {
      const allValues = options.map((option) => option.value);
      setSelectedValues(allValues);
      setSelectAll(true);
    }
  };

  const handleApply = () => {
    const currentFilterValues = currentFilters[filterType] || [];

    currentFilterValues.forEach((value) => {
      dispatch(
        updateFilter({
          key: filterType,
          value,
          checked: false,
        })
      );
    });

    selectedValues.forEach((value) => {
      dispatch(
        updateFilter({
          key: filterType,
          value,
          checked: true,
        })
      );
    });

    onClose();
  };

  const renderOption = ({ item }: { item: FilterOption }) => {
    const isSelected = selectedValues.includes(item.value);

    return (
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => handleToggleOption(item.value)}
      >
        <View style={styles.optionContent}>
          <View
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}
          >
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.optionLabel}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderOption}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={() => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleSelectAll}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.checkbox,
                        selectAll && styles.checkboxSelected,
                      ]}
                    >
                      {selectAll && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.optionLabel}>Tất cả</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: "50%",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 3,
  },
  content: {
    maxHeight: "77%",
    paddingHorizontal: 20,
  },
  optionItem: {
    borderRadius: 8,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#026AA7",
    borderColor: "#026AA7",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 500,
    color: "#333333",
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  applyButton: {
    backgroundColor: "#026AA7",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FilterModal;
