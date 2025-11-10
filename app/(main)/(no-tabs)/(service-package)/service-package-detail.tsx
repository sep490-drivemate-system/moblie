import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";

const DEFAULT_PACKAGE = {
  title: "Gói miền Tây",
  skills: ["Lùi xe", "Đỗ xe", "Quan sát"],
  roadTypes: ["Đường trơn trượt", "Đường đông dân cư"],
  duration: "01:30",
  carOption: "Có thể đi xe của khách hàng hoặc của tôi",
  price: "150000",
};

const EMPTY_PACKAGE = {
  title: "",
  skills: [] as string[],
  roadTypes: [] as string[],
  duration: "",
  carOption: "",
  price: "",
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

const formatCurrencyVND = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function ServicePackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isCreate = params?.mode === "create";

  const [form, setForm] = useState(isCreate ? EMPTY_PACKAGE : DEFAULT_PACKAGE);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
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
  };

  const handleReset = () => {
    setForm(isCreate ? EMPTY_PACKAGE : DEFAULT_PACKAGE);
  };

  const getSkillsDisplayText = () => {
    if (form.skills.length === 0) return "";
    if (form.skills.length === 1) return form.skills[0];
    return `${form.skills.length} kỹ năng đã chọn`;
  };

  const getRoadTypesDisplayText = () => {
    if (form.roadTypes.length === 0) return "";
    if (form.roadTypes.length === 1) return form.roadTypes[0];
    return `${form.roadTypes.length} loại đường đã chọn`;
  };

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[
          AppColors.primary,
          AppColors.gradientStart,
          AppColors.gradientEnd,
        ]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              {isCreate ? "Tạo gói dịch vụ" : "Chi tiết gói dịch vụ"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isCreate
                ? "Tạo gói dịch vụ mới cho khách hàng"
                : "Xem và chỉnh sửa thông tin gói dịch vụ"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Form */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {saved && (
          <View style={styles.savedMsg}>
            <Ionicons
              name="checkmark-circle"
              color={AppColors.primary}
              size={20}
            />
            <Text style={styles.savedMsgText}>
              Đã lưu chỉnh sửa thành công!
            </Text>
          </View>
        )}

        <View style={styles.card}>
          {/* Tên gói */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Tên gói dịch vụ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedField === "title" && styles.inputFocus,
              ]}
              placeholder="Nhập tên gói dịch vụ"
              placeholderTextColor="#A0A0A0"
              value={form.title}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("title", v)}
            />
          </View>

          {/* Giá tiền */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Giá tiền (VNĐ) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedField === "price" && styles.inputFocus,
              ]}
              keyboardType="numeric"
              placeholder="VD: 150.000"
              placeholderTextColor="#A0A0A0"
              value={form.price}
              onFocus={() => setFocusedField("price")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("price", formatCurrencyVND(v))}
            />
          </View>

          {/* Thời lượng */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Thời lượng <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedField === "duration" && styles.inputFocus,
              ]}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              placeholder="hh:mm"
              placeholderTextColor="#A0A0A0"
              value={form.duration}
              onFocus={() => setFocusedField("duration")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("duration", formatDuration(v))}
            />
          </View>

          {/* Kỹ năng */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Kỹ năng học được <Text style={styles.required}>*</Text>
            </Text>
            <View>
              <TouchableOpacity
                style={[
                  styles.dropdownInput,
                  focusedField === "skills" && styles.inputFocus,
                  openDropdown === "skills" && styles.inputFocus,
                ]}
                onPress={() => {
                  toggleDropdown("skills");
                  setFocusedField("skills");
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !getSkillsDisplayText() && styles.dropdownPlaceholder,
                  ]}
                >
                  {getSkillsDisplayText() || "Chọn kỹ năng học được"}
                </Text>
                <Ionicons
                  name={
                    openDropdown === "skills" ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
              {openDropdown === "skills" && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                    style={{ maxHeight: 200 }}
                  >
                    {SKILL_OPTIONS.map((skill) => {
                      const selected = form.skills.includes(skill);
                      return (
                        <TouchableOpacity
                          key={skill}
                          style={styles.dropdownItem}
                          onPress={() => handleSkillToggle(skill)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              selected && styles.checkboxActive,
                            ]}
                          >
                            {selected && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#fff"
                              />
                            )}
                          </View>
                          <Text style={styles.dropdownItemText}>{skill}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Loại đường */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Loại đường <Text style={styles.required}>*</Text>
            </Text>
            <View>
              <TouchableOpacity
                style={[
                  styles.dropdownInput,
                  focusedField === "roadTypes" && styles.inputFocus,
                  openDropdown === "roadTypes" && styles.inputFocus,
                ]}
                onPress={() => {
                  toggleDropdown("roadTypes");
                  setFocusedField("roadTypes");
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !getRoadTypesDisplayText() && styles.dropdownPlaceholder,
                  ]}
                >
                  {getRoadTypesDisplayText() || "Chọn loại đường"}
                </Text>
                <Ionicons
                  name={
                    openDropdown === "roadTypes" ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
              {openDropdown === "roadTypes" && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                    style={{ maxHeight: 200 }}
                  >
                    {ROAD_OPTIONS.map((road) => {
                      const selected = form.roadTypes.includes(road);
                      return (
                        <TouchableOpacity
                          key={road}
                          style={styles.dropdownItem}
                          onPress={() => handleRoadToggle(road)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              selected && styles.checkboxActive,
                            ]}
                          >
                            {selected && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#fff"
                              />
                            )}
                          </View>
                          <Text style={styles.dropdownItemText}>{road}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Tùy chọn xe */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Tùy chọn xe <Text style={styles.required}>*</Text>
            </Text>
            <View>
              <TouchableOpacity
                style={[
                  styles.dropdownInput,
                  focusedField === "carOption" && styles.inputFocus,
                  openDropdown === "carOption" && styles.inputFocus,
                ]}
                onPress={() => {
                  toggleDropdown("carOption");
                  setFocusedField("carOption");
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !form.carOption && styles.dropdownPlaceholder,
                  ]}
                >
                  {form.carOption || "Chọn tùy chọn xe"}
                </Text>
                <Ionicons
                  name={
                    openDropdown === "carOption" ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
              {openDropdown === "carOption" && (
                <View style={styles.dropdownList}>
                  {CAR_OPTIONS.map((option) => {
                    const selected = form.carOption === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleChange("carOption", option);
                          setOpenDropdown(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[styles.radio, selected && styles.radioActive]}
                        >
                          {selected && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.dropdownItemText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Đặt lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isCreate ? "Tạo" : "Lưu"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// 🌿 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAF5" },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  backButton: { padding: 8, marginRight: 10 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)" },

  scroll: { flex: 1 },
  savedMsg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E6F4EA",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 20,
    borderColor: AppColors.primary,
    borderWidth: 1,
  },
  savedMsgText: { color: "#1B4332", fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  formGroup: { marginBottom: 20 },
  label: { fontWeight: "700", fontSize: 16, color: "#1B4332", marginBottom: 8 },
  required: { color: "#FF0000" },
  input: {
    borderWidth: 1.5,
    borderColor: "#DDE5B6",
    borderRadius: 12,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAF5",
    color: "#111",
  },
  inputFocus: {
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  dropdownInput: {
    borderWidth: 1.5,
    borderColor: "#DDE5B6",
    borderRadius: 12,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAF5",
    color: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: "#111",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#A0A0A0",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDE5B6",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#1B4332",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#C8D6A3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C8D6A3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioActive: {
    borderColor: AppColors.primary,
    backgroundColor: "#E6F4EA",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: AppColors.primary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  resetButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  resetButtonText: {
    color: AppColors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
