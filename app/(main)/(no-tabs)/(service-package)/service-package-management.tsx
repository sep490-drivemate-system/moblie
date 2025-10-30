import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const green = "#70E000";
const white = "#FFFFFF";
const cardBg = "#fff";

const DUMMY_SERVICE_PACKAGES = [
  {
    id: 1,
    title: "Gói miền Tây",
    skills: ["Lùi xe", "Đỗ xe", "Quan sát"],
    roadTypes: ["Đường trơn trượt", "Đường đông dân cư"],
    duration: "1:30",
    carOption: "Có thể đi xe của khách hàng hoặc của tôi",
  },
];

function ServicePackageManagementScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState(DUMMY_SERVICE_PACKAGES);

  const handleAdd = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/(service-package)/service-package-detail",
      params: { mode: "create" },
    });
  };

  const handleDelete = (itemId: number) => {
    setPackages(packages.filter((item) => item.id !== itemId));
  };

  const handleDetail = (item: any) => {
    router.push("/(main)/(no-tabs)/(service-package)/service-package-detail");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Danh sách gói dịch vụ</Text>
        </View>
      </View>

      {packages.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Chưa có gói nào.</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <View style={styles.solidButton}>
              <Text style={styles.addButtonText}>+ Thêm gói mới</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ gap: 16 }}>
        {packages.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleSection}>
                <View style={styles.titleDot} />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.cardDuration}>{item.duration}h</Text>
              </View>
            </View>
            <View style={styles.cardInfoSection}>
              <View style={styles.infoBlock}>
                <View style={styles.infoLabelRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoLabel}>Kỹ năng</Text>
                </View>
                <Text style={styles.infoValue}>{item.skills.join(", ")}</Text>
              </View>
              <View style={styles.infoBlock}>
                <View style={styles.infoLabelRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoLabel}>Loại đường</Text>
                </View>
                <Text style={styles.infoValue}>
                  {item.roadTypes.join(", ")}
                </Text>
              </View>
              <View style={styles.infoBlockFull}>
                <View style={styles.infoLabelRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoLabel}>Xe</Text>
                </View>
                <Text style={styles.infoValue}>{item.carOption}</Text>
              </View>
            </View>
            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.detailButtonWrapper}
                onPress={() => handleDetail(item)}
              >
                <View style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>Chi tiết</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      {packages.length > 0 && (
        <View style={styles.addBottomWrap}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <View style={styles.solidButton}>
              <Text style={styles.addButtonText}>+ Thêm gói mới</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 30,
  },
  emptyText: {
    fontSize: 17,
    color: "#999",
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 2,
    alignSelf: "center",
  },
  solidButton: {
    backgroundColor: green,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: white,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: white,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  cardBorderAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: green,
    opacity: 0.6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: green,
  },
  cardTitle: {
    color: "#2F4221",
    fontWeight: "800",
    fontSize: 22,
    letterSpacing: 0.3,
  },
  durationBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: green,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDuration: {
    color: white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cardInfoSection: {
    gap: 12,
    marginBottom: 4,
  },
  infoBlock: {
    backgroundColor: "#f2f8e6",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: green,
    marginBottom: 6,
  },
  infoBlockFull: {
    backgroundColor: "#f2f8e6",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: green,
    marginBottom: 6,
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: green,
  },
  infoLabel: {
    color: green,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#2D3819",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  cardActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  detailButtonWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  detailButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: green,
  },
  detailButtonText: {
    color: white,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  deleteButton: {
    borderWidth: 1.5,
    borderColor: green,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: green,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  addBottomWrap: {
    alignItems: "center",
    marginTop: 32,
  },
});

export default ServicePackageManagementScreen;
