import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// Removed vector icon to avoid runtime error; using text arrow instead

const green = "#70E000";
const bgCard = "#ffffff";
const borderDark = "#E0E0E0";

const DEFAULT_PACKAGE = {
  title: "Gói miền Tây",
  skills: ["Lùi xe", "Đỗ xe", "Quan sát"],
  roadTypes: ["Đường trơn trượt", "Đường đông dân cư"],
  duration: "01:30",
  carOption: "Có thể đi xe của khách hàng hoặc của tôi",
};
const EMPTY_PACKAGE = {
  title: "",
  skills: [] as string[],
  roadTypes: [] as string[],
  duration: "",
  carOption: "",
};
const SKILL_OPTIONS = [
  "Lùi xe",
  "Đỗ xe",
  "Vượt làn",
  "Quay đầu",
  "Chạy tốc độ cao",
  "Quan sát",
];
const ROAD_OPTIONS = [
  "Đường trơn trượt",
  "Đường đông dân cư",
  "Đường cao tốc",
  "Đường đèo/đường núi",
  "Đường đang thi công",
  "Đường vắng",
];
const CAR_OPTIONS = [
  "Chỉ đi xe của tôi",
  "Có thể đi xe của khách hàng hoặc của tôi",
];

const formatDuration = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
};

export default function ServicePackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isCreate = params?.mode === "create";

  const [form, setForm] = useState(isCreate ? EMPTY_PACKAGE : DEFAULT_PACKAGE);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleDurationChange = (value: string) => {
    const formatted = formatDuration(value);
    handleChange("duration", formatted);
  };

  const handleSkillToggle = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  };
  const handleRoadToggle = (road: string) => {
    setForm((f) => ({
      ...f,
      roadTypes: f.roadTypes.includes(road)
        ? f.roadTypes.filter((r) => r !== road)
        : [...f.roadTypes, road],
    }));
  };
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Thật tế: update về API hoặc store
  };
  const handleReset = () => {
    setForm(isCreate ? EMPTY_PACKAGE : DEFAULT_PACKAGE);
  };
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isCreate ? "Tạo gói dịch vụ" : "Chi tiết gói dịch vụ"}
          </Text>
        </View>
      </View>
      {/* Success message */}
      {saved && (
        <View style={styles.savedMsgWrap}>
          <View style={styles.savedDot} />
          <Text style={styles.savedMsgText}>Đã lưu chỉnh sửa thành công!</Text>
        </View>
      )}
      {/* Form card */}
      <View style={styles.card}>
        {/* Tên gói thuê */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Tên gói thuê <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={form.title}
            placeholder="Nhập tên gói dịch vụ"
            onChangeText={(v) => handleChange("title", v)}
            placeholderTextColor="#AAB391"
          />
        </View>
        {/* Thời lượng */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Thời lượng <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.inputMono]}
            value={form.duration}
            maxLength={5}
            onChangeText={handleDurationChange}
            placeholder="hh:mm"
            placeholderTextColor="#AAB391"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        {/* Kỹ năng học được */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Kỹ năng học được <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.checkGrid}>
            {SKILL_OPTIONS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.checkItem,
                  form.skills.includes(skill) && styles.checkItemActive,
                ]}
                onPress={() => handleSkillToggle(skill)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    form.skills.includes(skill) && styles.checkboxActive,
                  ]}
                >
                  {form.skills.includes(skill) && (
                    <View style={styles.checkboxCheckedMark} />
                  )}
                </View>
                <Text style={styles.checkLabel}>{skill}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Loại đường */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Loại đường <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.checkGrid}>
            {ROAD_OPTIONS.map((road) => (
              <TouchableOpacity
                key={road}
                style={[
                  styles.checkItem,
                  form.roadTypes.includes(road) && styles.checkItemActive,
                ]}
                onPress={() => handleRoadToggle(road)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    form.roadTypes.includes(road) && styles.checkboxActive,
                  ]}
                >
                  {form.roadTypes.includes(road) && (
                    <View style={styles.checkboxCheckedMark} />
                  )}
                </View>
                <Text style={styles.checkLabel}>{road}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Tùy chọn xe */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Tùy chọn xe <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.radioCol}>
            {CAR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.radioRow}
                onPress={() => handleChange("carOption", option)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radio,
                    form.carOption === option && styles.radioActive,
                  ]}
                >
                  {form.carOption === option && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Đặt lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isCreate ? "Tạo" : "Lưu"}</Text>
        </TouchableOpacity>
      </View>
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
  backButton: { paddingVertical: 8, paddingLeft: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  savedMsgWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eaffdb",
    borderColor: green,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  savedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: green,
    marginRight: 6,
  },
  savedMsgText: { color: green, fontWeight: "700", fontSize: 15 },
  card: {
    backgroundColor: bgCard,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 28,
  },
  formGroup: { marginBottom: 18 },
  label: {
    fontWeight: "700",
    fontSize: 16,
    color: "#264a13",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  required: { color: "#FF0000" },
  input: {
    borderWidth: 1,
    borderColor: green,
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    color: "#111",
    minHeight: 44,
    fontWeight: "500",
  },
  inputMono: { fontFamily: "monospace", letterSpacing: 1.4, fontSize: 17 },
  subText: { color: "#666", fontSize: 13, marginTop: 2 },
  checkGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: borderDark,
    marginBottom: 8,
    minWidth: 118,
    minHeight: 41,
  },
  checkItemActive: { backgroundColor: "#eafacf", borderColor: green },
  checkLabel: {
    color: "#264a13",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: borderDark,
    backgroundColor: "#fff",
    marginRight: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { backgroundColor: green, borderColor: green },
  checkboxCheckedMark: {
    width: 10,
    height: 10,
    backgroundColor: "#fff",
    borderRadius: 2.5,
  },
  radioCol: { flexDirection: "column", gap: 7 },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    gap: 5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: borderDark,
    backgroundColor: "#fff",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: { borderColor: green },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: green },
  radioLabel: { fontSize: 15, color: "#142903", fontWeight: "500", flex: 1 },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  saveButton: {
    backgroundColor: green,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  resetButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#70E000",
  },
  resetButtonText: { color: "#70E000", fontWeight: "700", fontSize: 17 },
});
