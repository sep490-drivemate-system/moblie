import React, { useEffect, useState } from "react";
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
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { PackageViewModel } from "@/viewmodels/package/PackageViewModel";
import { RootState } from "@/lib/redux/store";
import { DrivingSkill, RoadType } from "@/models/package/package";

type ServicePackageFormState = {
  title: string;
  description: string;
  skills: string[];
  roadTypes: string[];
  duration: string;
  carOption: boolean | null;
  price: string;
};

const DEFAULT_PACKAGE: ServicePackageFormState = {
  title: "Gói miền Tây",
  description: "Gói mẫu giúp bạn thử nghiệm giao diện nhập liệu.",
  skills: ["Lùi xe", "Đỗ xe", "Quan sát"],
  roadTypes: ["Đường trơn trượt", "Đường đông dân cư"],
  duration: "01:30",
  carOption: true,
  price: "150000",
};

const EMPTY_PACKAGE: ServicePackageFormState = {
  title: "",
  description: "",
  skills: [],
  roadTypes: [],
  duration: "",
  carOption: null,
  price: "",
};

const CAR_OPTION_LABELS: Record<string, string> = {
  true: "Có thể đi xe của khách hàng hoặc của tôi",
  false: "Chỉ đi xe của tôi",
};

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

const parsePriceValue = (value: string): number => {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

const parseDurationToHours = (value: string): number | null => {
  if (!value) return null;
  if (value.includes(":")) {
    const [rawHours, rawMinutes] = value.split(":");
    const hours = Number(rawHours);
    const minutes = Number(rawMinutes);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours + minutes / 60;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return numeric;
};

export default function ServicePackageDetailScreen() {
  const [packageState, packageViewModel] = useViewModel(
    PackageViewModel,
    (state: RootState) => state.package
  );
  const [drivingSkills, setDrivingSkills] = useState<DrivingSkill[]>([]);
  const [roadTypes, setRoadTypes] = useState<RoadType[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isCreate = params?.mode === "create";

  const [form, setForm] = useState<ServicePackageFormState>(
    isCreate ? EMPTY_PACKAGE : DEFAULT_PACKAGE
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const buildCreatePayload = () => {
    const durationInHours = parseDurationToHours(form.duration);
    if (!durationInHours || durationInHours <= 0) {
      throw new Error("Thời lượng không hợp lệ");
    }

    return {
      name: form.title.trim(),
      description: form.description.trim(),
      duration: Number(durationInHours.toFixed(2)),
      roadTypes: form.roadTypes,
      drivingSkills: form.skills,
      price: parsePriceValue(form.price),
      allowNoviceCar: form.carOption === true,
      packageCars: [],
    };
  };

  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) {
      setSubmissionResult({
        type: "error",
        message: "Vui lòng kiểm tra lại các trường bắt buộc.",
      });
      return;
    }

    if (!isCreate) {
      setSubmissionResult({
        type: "error",
        message: "Tính năng chỉnh sửa sẽ được cập nhật sau.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildCreatePayload();
      console.log(payload);
      await packageViewModel.createPackage(payload);
      setSubmissionResult({
        type: "success",
        message: "Tạo gói dịch vụ thành công!",
      });
      setForm(EMPTY_PACKAGE);
      setErrors({});
      setOpenDropdown(null);
      setFocusedField(null);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      const message =
        (typeof error === "string" && error) ||
        (error instanceof Error ? error.message : "");
      setSubmissionResult({
        type: "error",
        message: message || "Không thể tạo gói, vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(isCreate ? EMPTY_PACKAGE : DEFAULT_PACKAGE);
    setErrors({});
    setSubmissionResult(null);
    setOpenDropdown(null);
    setFocusedField(null);
  };

  const getSkillLabel = (skillId: string) => {
    return (
      drivingSkills.find((skill) => skill.id === skillId)?.display_name ||
      skillId
    );
  };

  const getRoadLabel = (roadId: string) => {
    return roadTypes.find((road) => road.id === roadId)?.name || roadId;
  };

  const getSkillsDisplayText = () => {
    if (form.skills.length === 0) return "";
    if (form.skills.length === 1) return getSkillLabel(form.skills[0]);
    return `${form.skills.length} kỹ năng đã chọn`;
  };

  const getRoadTypesDisplayText = () => {
    if (form.roadTypes.length === 0) return "";
    if (form.roadTypes.length === 1) return getRoadLabel(form.roadTypes[0]);
    return `${form.roadTypes.length} loại đường đã chọn`;
  };

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const normalizeDuration = (input: string): string => {
    if (!input.includes(":")) return input;

    let [h, m] = input.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return input;

    // Convert phút dư thành giờ
    h += Math.floor(m / 60);
    m = m % 60;

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");

    return `${hh}:${mm}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Tên gói dịch vụ là bắt buộc";
    if (!form.description.trim()) newErrors.description = "Mô tả là bắt buộc";

    const priceValue = parsePriceValue(form.price);
    if (priceValue <= 0) newErrors.price = "Giá tiền phải lớn hơn 0";

    const durationValue = parseDurationToHours(form.duration);
    if (!form.duration.trim()) {
      newErrors.duration = "Thời lượng là bắt buộc";
    } else if (!durationValue || durationValue <= 0) {
      newErrors.duration = "Thời lượng phải lớn hơn 0";
    }

    if (form.skills.length === 0)
      newErrors.skills = "Phải chọn ít nhất 1 kỹ năng";
    if (form.roadTypes.length === 0)
      newErrors.roadTypes = "Phải chọn ít nhất 1 loại đường";
    if (form.carOption === null || form.carOption === undefined)
      newErrors.carOption = "Phải chọn tùy chọn xe";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const renderFieldError = (field: keyof Record<string, string>) => {
    if (!errors[field]) return null;
    return <Text style={styles.errorText}>{errors[field]}</Text>;
  };

  useEffect(() => {
    const getDrivingSkills = async () => {
      const result = await packageViewModel.getDrivingSkills();
      setDrivingSkills(result);
    };
    getDrivingSkills();
  }, [packageViewModel]);

  useEffect(() => {
    const getRoadTypes = async () => {
      const result = await packageViewModel.getRoadTypes();
      setRoadTypes(result);
    };
    getRoadTypes();
  }, [packageViewModel]);

  useEffect(() => {
    if (!submissionResult) return;
    const timeout = setTimeout(() => setSubmissionResult(null), 3000);
    return () => clearTimeout(timeout);
  }, [submissionResult]);

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
        {submissionResult && (
          <View
            style={[
              styles.feedbackBanner,
              submissionResult.type === "success"
                ? styles.feedbackSuccess
                : styles.feedbackError,
            ]}
          >
            <Ionicons
              name={
                submissionResult.type === "success"
                  ? "checkmark-circle"
                  : "warning"
              }
              color={
                submissionResult.type === "success"
                  ? AppColors.primary
                  : "#B91C1C"
              }
              size={20}
            />
            <Text
              style={[
                styles.feedbackText,
                submissionResult.type === "success"
                  ? styles.feedbackTextSuccess
                  : styles.feedbackTextError,
              ]}
            >
              {submissionResult.message}
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
                errors.title && styles.inputError,
              ]}
              placeholder="Nhập tên gói dịch vụ"
              placeholderTextColor="#A0A0A0"
              value={form.title}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("title", v)}
            />
            {renderFieldError("title")}
          </View>

          {/* Mô tả */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Mô tả gói dịch vụ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                focusedField === "description" && styles.inputFocus,
                errors.description && styles.inputError,
              ]}
              placeholder="Mô tả ngắn gọn về nội dung gói"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={form.description}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("description", v)}
            />
            {renderFieldError("description")}
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
                errors.price && styles.inputError,
              ]}
              keyboardType="numeric"
              placeholder="VD: 150.000"
              placeholderTextColor="#A0A0A0"
              value={form.price}
              onFocus={() => setFocusedField("price")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("price", formatCurrencyVND(v))}
            />
            {renderFieldError("price")}
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
                errors.duration && styles.inputError,
              ]}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              placeholder="hh:mm"
              placeholderTextColor="#A0A0A0"
              value={form.duration}
              onFocus={() => setFocusedField("duration")}
              onBlur={() => {
                setFocusedField(null);
                setForm({
                  ...form,
                  duration: normalizeDuration(form.duration),
                });
              }}
              onChangeText={(v) => handleChange("duration", formatDuration(v))}
            />
            {renderFieldError("duration")}
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
                  errors.skills && styles.inputError,
                ]}
                onPress={() => {
                  toggleDropdown("skills");
                  setFocusedField("skills");
                }}
                activeOpacity={1}
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
                    {drivingSkills.map((skill) => {
                      const selected = form.skills.includes(skill.id);
                      return (
                        <TouchableOpacity
                          key={skill.id}
                          style={styles.dropdownItem}
                          onPress={() => handleSkillToggle(skill.id)}
                          activeOpacity={1}
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
                          <Text style={styles.dropdownItemText}>
                            {skill.display_name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
              {renderFieldError("skills")}
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
                  errors.roadTypes && styles.inputError,
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
                    {roadTypes.map((road) => {
                      const selected = form.roadTypes.includes(road.id);
                      return (
                        <TouchableOpacity
                          key={road.id}
                          style={styles.dropdownItem}
                          onPress={() => handleRoadToggle(road.id)}
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
                          <Text style={styles.dropdownItemText}>
                            {road.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
              {renderFieldError("roadTypes")}
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
                  errors.carOption && styles.inputError,
                ]}
                onPress={() => {
                  toggleDropdown("carOption");
                  setFocusedField("carOption");
                }}
                activeOpacity={1}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    form.carOption === null && styles.dropdownPlaceholder,
                  ]}
                >
                  {form.carOption === null
                    ? "Chọn tùy chọn xe"
                    : CAR_OPTION_LABELS[String(form.carOption)]}
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
                  {[
                    { value: true, label: CAR_OPTION_LABELS["true"] },
                    { value: false, label: CAR_OPTION_LABELS["false"] },
                  ].map((option) => {
                    const selected = form.carOption === option.value;
                    return (
                      <TouchableOpacity
                        key={option.label}
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleChange("carOption", option.value);
                          setOpenDropdown(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[styles.radio, selected && styles.radioActive]}
                        >
                          {selected && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.dropdownItemText}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {renderFieldError("carOption")}
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>Đặt lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? "Đang lưu..." : isCreate ? "Tạo" : "Lưu"}
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
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: "#E6F4EA",
    borderColor: AppColors.primary,
  },
  feedbackError: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  feedbackText: {
    fontWeight: "600",
    flex: 1,
  },
  feedbackTextSuccess: { color: "#1B4332" },
  feedbackTextError: { color: "#B91C1C" },

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
  multilineInput: {
    minHeight: 110,
    paddingTop: 12,
  },
  inputFocus: {
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: "#F87171",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
