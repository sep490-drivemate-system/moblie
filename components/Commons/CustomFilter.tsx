import React from "react";
import { Filter, X } from "lucide-react-native";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AppColors } from "@/constants/Colors";
import SearchBar from "@/components/Commons/SearchBar";

export type FilterOptionType = { id: string; label?: string;[key: string]: any };

export interface CustomFilterProps {
    searchQuery: string;
    onChangeSearch: (text: string) => void;
    filterHasVehicle: boolean | null;
    showFilter: boolean;
    onToggleFilter: () => void;
    filterOptions: FilterOptionType[];
    renderFilterOptionItem: (params: {
        item: FilterOptionType;
    }) => React.ReactElement;
    showRoadTypeModal: boolean;
    onCloseRoadTypeModal: () => void;
    roadTypes: string[];
    renderRoadTypeItem: (params: { item: string }) => React.ReactElement;
    onClearRoadTypeFilters: () => void;
    // new customizations
    modalTitle?: string;
    clearLabel?: string;
    applyLabel?: string;
}

const CustomFilter: React.FC<CustomFilterProps> = ({
    searchQuery,
    onChangeSearch,
    filterHasVehicle,
    showFilter,
    onToggleFilter,
    filterOptions,
    renderFilterOptionItem,
    showRoadTypeModal,
    onCloseRoadTypeModal,
    roadTypes,
    renderRoadTypeItem,
    onClearRoadTypeFilters,
    modalTitle = "Chọn loại đường",
    clearLabel = "Xóa tất cả",
    applyLabel = "Áp dụng",
}) => {
    return (
        <>
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={onChangeSearch}
                    placeholder="Tìm kiếm..."
                    style={styles.searchBarWrapper}
                />
                <TouchableOpacity
                    activeOpacity={1}
                    style={[
                        styles.filterButton,
                        filterHasVehicle !== null && styles.filterButtonActive,
                    ]}
                    onPress={onToggleFilter}
                >
                    <Filter
                        size={18}
                        color={filterHasVehicle !== null ? "#ffffff" : AppColors.primary}
                        strokeWidth={2}
                    />
                </TouchableOpacity>
            </View>

            {showFilter && (
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Lọc theo:</Text>
                    <FlatList
                        data={filterOptions}
                        renderItem={({ item }) => renderFilterOptionItem({ item })}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterOptions}
                    />
                </View>
            )}

            <Modal
                visible={showRoadTypeModal}
                transparent
                animationType="slide"
                onRequestClose={onCloseRoadTypeModal}
            >
                <Pressable style={styles.modalOverlay} onPress={onCloseRoadTypeModal}>
                    <Pressable
                        style={styles.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalTitle}</Text>
                            <TouchableOpacity
                                onPress={onCloseRoadTypeModal}
                                style={styles.modalCloseButton}
                            >
                                <X size={24} color="#64748b" strokeWidth={2} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.roadTypesCard}>
                            <FlatList
                                data={roadTypes}
                                renderItem={({ item }) => renderRoadTypeItem({ item })}
                                keyExtractor={(item) => item}
                                style={styles.modalScrollView}
                                contentContainerStyle={styles.roadTypesList}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={onClearRoadTypeFilters}
                            >
                                <Text style={styles.clearButtonText}>{clearLabel}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={onCloseRoadTypeModal}
                            >
                                <Text style={styles.applyButtonText}>{applyLabel}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchBarWrapper: {
        flex: 1,
        marginHorizontal: 0,
        marginVertical: 0,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: AppColors.primary,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
    },
    filterButtonActive: {
        backgroundColor: AppColors.primary,
    },
    filterContainer: {
        paddingHorizontal: 14,
        paddingBottom: 7,
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
    },
    filterOptions: {
        gap: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalContent: {
        width: "100%",
        maxHeight: "80%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0f172a",
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#cbd5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    roadTypesCard: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 12,
    },
    modalScrollView: {
        maxHeight: 320,
    },
    roadTypesList: {
        paddingBottom: 8,
        rowGap: 10,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        gap: 12,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        justifyContent: "center",
        alignItems: "center",
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#64748b",
    },
    applyButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: AppColors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
});

export default CustomFilter;