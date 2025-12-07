import CustomAlert from "@/components/CustomAlert";
import { AppColors } from "@/constants/Colors";
import { RootState } from "@/lib/redux/store";
import { AddCarViewModel } from "@/viewmodels/car/AddCarViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronDown, Edit2Icon, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { convertImageFile } from "@/utils/utils";

export default function FormScreen() {
  const router = useRouter();
  const carState = useSelector((state: RootState) => state.car);
  const [_, viewModel] = useViewModel<RootState["car"], AddCarViewModel>(
    AddCarViewModel,
    (state) => state.car
  );

  // Use Redux state for loading
  const isSubmittingFromRedux = carState.isLoading;

  const [tempFrontImageUri, setTempFrontImageUri] = useState<string | null>(
    null
  );
  const [tempBackImageUri, setTempBackImageUri] = useState<string | null>(null);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [showFuelTypeDropdown, setShowFuelTypeDropdown] = useState(false);
  const [showCarTypeDropdown, setShowCarTypeDropdown] = useState(false);
  const [showLicenseTierDropdown, setShowLicenseTierDropdown] = useState(false);
  const [showManufacturerDropdown, setShowManufacturerDropdown] =
    useState(false);
  const [manufacturers, setManufacturers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
  });

  // Form data
  const [formData, setFormData] = useState({
    licensePlate: "",
    carBrand: "",
    carModel: "",
    carColor: "",
    seatCount: "",
    fuelType: "",
    carType: "",
    licenseTier: "",
    year: "",
    brandId: "",
    hourlyPrice: "",
    description: "",
  });

  const fuelTypes = ["Xăng", "Dầu", "Điện", "Hybrid"];
  const carTypes = [
    "Sedan",
    "SUV",
    "Hatchback",
    "Coupe",
    "Convertible",
    "Wagon",
    "Van",
    "Pickup",
    "Khác",
  ];
  const licenseTiers = [
    "B",
    "C1",
    "C",
    "D1",
    "D2",
    "D",
    "BE",
    "C1E",
    "CE",
    "D1E",
    "D2E",
    "DE",
  ];

  // Sync form data to Redux (similar to syncFormDataToViewModel in id-card form)
  const syncFormDataToRedux = React.useCallback(
    (data: typeof formData) => {
      viewModel.updateCarRegistrationFormField(
        "LicensePlate",
        data.licensePlate
      );
      viewModel.updateCarRegistrationFormField("Model", data.carModel);
      viewModel.updateCarRegistrationFormField("CarType", data.carType);
      viewModel.updateCarRegistrationFormField("Year", data.year);
      viewModel.updateCarRegistrationFormField("Color", data.carColor);
      viewModel.updateCarRegistrationFormField("Seats", data.seatCount);
      viewModel.updateCarRegistrationFormField("FuelType", data.fuelType);
      viewModel.updateCarRegistrationFormField("LicenseTier", data.licenseTier);
      if (data.brandId) {
        viewModel.updateCarRegistrationFormField("BrandId", data.brandId);
      }
      if (data.description) {
        viewModel.updateCarRegistrationFormField(
          "Description",
          data.description
        );
      }
      if (data.hourlyPrice) {
        viewModel.updateCarRegistrationFormField(
          "HourlyPrice",
          data.hourlyPrice
        );
      }
    },
    [viewModel]
  );

  // const loadUserData = async () => {
  //   try {
  //     // Load images from AsyncStorage
  //     const tempFrontImage = await AsyncStorage.getItem(
  //       "temp_car_registration_front"
  //     );
  //     const tempBackImage = await AsyncStorage.getItem(
  //       "temp_car_registration_back"
  //     );

  //     if (tempFrontImage) {
  //       setTempFrontImageUri(tempFrontImage);
  //       viewModel.updateCarRegistrationFormField(
  //         "RegistrationFront",
  //         convertImageFile(tempFrontImage)
  //       );
  //     }
  //     if (tempBackImage) {
  //       setTempBackImageUri(tempBackImage);
  //       viewModel.updateCarRegistrationFormField(
  //         "RegistrationBack",
  //         convertImageFile(tempBackImage)
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error loading user data:", error);
  //   }
  // };

  const handleBack = () => {
    router.back();
  };

  const handleImagePress = (type: "front" | "back") => {
    if (
      (type === "front" && tempFrontImageUri) ||
      (type === "back" && tempBackImageUri)
    ) {
      setShowDeleteMode(true);
    }
  };

  const handleImageUpload = (type: "front" | "back") => {
    router.push(
      `/(onboarding)/(car)/(car-registration)/upload-guide?type=${type}`
    );
  };

  // Load form data from Redux to local state
  useEffect(() => {
    const reduxForm = carState.carRegistrationForm;
    setFormData((prev) => {
      // Check if local state has data (user is typing)
      const hasLocalData =
        prev.licensePlate.trim() !== "" ||
        prev.carModel.trim() !== "" ||
        prev.carColor.trim() !== "" ||
        prev.seatCount.trim() !== "" ||
        prev.fuelType.trim() !== "" ||
        prev.carType.trim() !== "" ||
        prev.licenseTier.trim() !== "" ||
        prev.year.trim() !== "";

      // If user is actively typing, don't overwrite with Redux data
      if (hasLocalData) {
        return prev;
      }

      // Load from Redux
      return {
        ...prev,
        licensePlate: reduxForm.LicensePlate || "",
        carModel: reduxForm.Model || "",
        carColor: reduxForm.Color || "",
        seatCount: reduxForm.Seats?.toString() || "",
        fuelType: reduxForm.FuelType || "",
        carType: reduxForm.CarType || "",
        licenseTier: reduxForm.LicenseTier || "",
        year: reduxForm.Year?.toString() || "",
        brandId: reduxForm.BrandId || "",
        description: reduxForm.Description || "",
        hourlyPrice: reduxForm.HourlyPrice?.toString() || "",
      };
    });
  }, [carState.carRegistrationForm]);

  useEffect(() => {
    const loadManufacturers = async () => {
      const manufacturersList = await viewModel.getManufacturers();
      setManufacturers(manufacturersList);
    };
    loadManufacturers();
  }, []);

  // Sync manufacturer name when manufacturers are loaded and brandId exists
  useEffect(() => {
    if (
      manufacturers.length > 0 &&
      carState.carRegistrationForm.BrandId &&
      !formData.carBrand
    ) {
      const manufacturer = manufacturers.find(
        (m) => m.id === carState.carRegistrationForm.BrandId
      );
      if (manufacturer) {
        setFormData((prev) => ({
          ...prev,
          carBrand: manufacturer.name,
          brandId: manufacturer.id,
        }));
      }
    }
  }, [manufacturers, carState.carRegistrationForm.BrandId]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     loadUserData();
  //   }, [])
  // );

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>
  ) => {
    setAlertConfig({
      title,
      message,
      buttons,
    });
    setShowAlert(true);
  };

  const formatDateInput = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");

    // Format as DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Apply date formatting for date fields
    let newFormData;
    newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Sync to Redux immediately
    syncFormDataToRedux(newFormData);
  };

  const handleFuelTypeSelect = (fuelType: string) => {
    const newFormData = {
      ...formData,
      fuelType: fuelType,
    };
    setFormData(newFormData);
    setShowFuelTypeDropdown(false);

    // Sync to Redux
    syncFormDataToRedux(newFormData);
  };

  const handleCarTypeSelect = (carType: string) => {
    const newFormData = {
      ...formData,
      carType: carType,
    };
    setFormData(newFormData);
    setShowCarTypeDropdown(false);

    // Sync to Redux
    syncFormDataToRedux(newFormData);
  };

  const handleLicenseTierSelect = (licenseTier: string) => {
    const newFormData = {
      ...formData,
      licenseTier: licenseTier,
    };
    setFormData(newFormData);
    setShowLicenseTierDropdown(false);

    // Sync to Redux
    syncFormDataToRedux(newFormData);
  };

  const handleManufacturerSelect = (manufacturer: {
    id: string;
    name: string;
  }) => {
    const newFormData = {
      ...formData,
      carBrand: manufacturer.name,
      brandId: manufacturer.id,
    };
    setFormData(newFormData);
    setShowManufacturerDropdown(false);

    // Sync to Redux
    syncFormDataToRedux(newFormData);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = async () => {
    // Validate all required fields
    const errors: string[] = [];

    // Check license plate
    if (!formData.licensePlate.trim()) {
      errors.push("Vui lòng nhập biển số xe");
    }

    // Check car brand
    if (!formData.carBrand.trim() || !formData.brandId) {
      errors.push("Vui lòng chọn hãng xe");
    }

    // Check car model
    if (!formData.carModel.trim()) {
      errors.push("Vui lòng nhập tên mẫu xe");
    }

    // Check car color
    if (!formData.carColor.trim()) {
      errors.push("Vui lòng nhập màu xe");
    }

    // Check seat count
    if (!formData.seatCount.trim()) {
      errors.push("Vui lòng nhập số chỗ ngồi");
    } else {
      const seats = parseInt(formData.seatCount);
      if (isNaN(seats) || seats <= 0) {
        errors.push("Số chỗ ngồi phải là số lớn hơn 0");
      }
    }

    // Check fuel type
    if (!formData.fuelType.trim()) {
      errors.push("Vui lòng chọn loại nhiên liệu");
    }

    // Check car type
    if (!formData.carType.trim()) {
      errors.push("Vui lòng chọn loại xe");
    }

    // Check license tier
    if (!formData.licenseTier.trim()) {
      errors.push("Vui lòng chọn hạng bằng lái");
    }

    // Check year
    if (!formData.year.trim()) {
      errors.push("Vui lòng nhập năm sản xuất");
    } else {
      const year = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        errors.push(`Năm sản xuất phải từ 1900 đến ${currentYear}`);
      }
    }

    // // Check front image
    // if (!tempFrontImageUri && !carState.carRegistrationForm.RegistrationFront) {
    //   errors.push("Vui lòng tải ảnh mặt trước giấy đăng ký xe");
    // }

    // // Check back image
    // if (!tempBackImageUri && !carState.carRegistrationForm.RegistrationBack) {
    //   errors.push("Vui lòng tải ảnh mặt sau giấy đăng ký xe");
    // }

    // If there are errors, show alert
    if (errors.length > 0) {
      showCustomAlert("Thiếu thông tin", errors.join("\n"), [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    try {
      await AsyncStorage.removeItem("temp_car_registration_front");
      await AsyncStorage.removeItem("temp_car_registration_back");
      router.push("/(onboarding)/(car)/(car-insurance)/form");
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu thông tin giấy đăng ký xe", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  // Auto exit delete mode after 3 seconds
  useEffect(() => {
    if (showDeleteMode) {
      const timer = setTimeout(() => {
        setShowDeleteMode(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteMode]);

  const handleDeleteImage = (type: "front" | "back") => {
    showCustomAlert(
      `Xóa ảnh mặt ${type === "front" ? "trước" : "sau"} giấy đăng ký xe`,
      `Bạn có chắc chắn muốn xóa ảnh mặt ${
        type === "front" ? "trước" : "sau"
      } giấy đăng ký xe?`,
      [
        {
          text: "Hủy",
          style: "cancel",
          onPress: () => {
            setShowAlert(false);
            setShowDeleteMode(false);
          },
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              if (type === "front") {
                setTempFrontImageUri(null);
                await viewModel.updateCarRegistrationFormField(
                  "RegistrationFront",
                  null
                );
              } else {
                setTempBackImageUri(null);
                await viewModel.updateCarRegistrationFormField(
                  "RegistrationBack",
                  null
                );
              }
              setShowDeleteMode(false);
              setShowAlert(false);

              showCustomAlert("Thành công", "Ảnh đã được xóa", [
                {
                  text: "OK",
                  onPress: () => setShowAlert(false),
                },
              ]);
            } catch (error) {
              showCustomAlert("Lỗi", "Không thể xóa ảnh", [
                {
                  text: "OK",
                  onPress: () => setShowAlert(false),
                },
              ]);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={
          !showManufacturerDropdown &&
          !showFuelTypeDropdown &&
          !showCarTypeDropdown &&
          !showLicenseTierDropdown
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}></View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View>
            <Image
              source={require("@/assets/images/background_1.png")}
              style={styles.background_1}
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Thông tin đăng ký xe</Text>
          </View>

          {/* Image Upload Sections */}
          {false && (
            <View style={styles.imageSection}>
              {/* Front Image */}
              <View style={styles.imageContainer}>
                <Text style={styles.imageLabel}>
                  Ảnh mặt trước <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.imageUploadArea}>
                  {tempFrontImageUri ? (
                    <TouchableOpacity
                      style={styles.imageWrapper}
                      onPress={() => handleImagePress("front")}
                    >
                      <Image
                        source={{ uri: tempFrontImageUri! }}
                        style={[
                          styles.uploadedImage,
                          showDeleteMode && styles.dimmedImage,
                        ]}
                      />
                      {showDeleteMode && (
                        <View style={styles.deleteOverlay}>
                          <TouchableOpacity
                            style={styles.trashButton}
                            onPress={() => handleDeleteImage("front")}
                          >
                            <Trash2 color="#FFFFFF" size={24} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={() => handleImageUpload("front")}
                    >
                      <Text style={styles.uploadText}>Tải ảnh lên</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleImageUpload("front")}
                  >
                    <Edit2Icon color="#70E000" size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Back Image */}
              <View style={styles.imageContainer}>
                <Text style={styles.imageLabel}>
                  Ảnh mặt sau <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.imageUploadArea}>
                  {tempBackImageUri ? (
                    <TouchableOpacity
                      style={styles.imageWrapper}
                      onPress={() => handleImagePress("back")}
                    >
                      <Image
                        source={{ uri: tempBackImageUri! }}
                        style={[
                          styles.uploadedImage,
                          showDeleteMode && styles.dimmedImage,
                        ]}
                      />
                      {showDeleteMode && (
                        <View style={styles.deleteOverlay}>
                          <TouchableOpacity
                            style={styles.trashButton}
                            onPress={() => handleDeleteImage("back")}
                          >
                            <Trash2 color="#FFFFFF" size={24} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={() => handleImageUpload("back")}
                    >
                      <Text style={styles.uploadText}>Tải ảnh lên</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleImageUpload("back")}
                  >
                    <Edit2Icon color="#70E000" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Biển số xe <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.licensePlate}
                onChangeText={(value) =>
                  handleInputChange("licensePlate", value)
                }
                placeholder="Nhập biển số xe"
                placeholderTextColor="#92929D"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên hãng xe <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.dropdownContainer}
                onPress={() =>
                  setShowManufacturerDropdown(!showManufacturerDropdown)
                }
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.carBrand && styles.placeholderText,
                  ]}
                >
                  {formData.carBrand || "Chọn hãng xe"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showManufacturerDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showManufacturerDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {manufacturers.map((manufacturer) => (
                      <TouchableOpacity
                        key={manufacturer.id}
                        style={styles.dropdownItem}
                        onPress={() => handleManufacturerSelect(manufacturer)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>
                          {manufacturer.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên mẫu xe <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.carModel}
                onChangeText={(value) => handleInputChange("carModel", value)}
                placeholder="Nhập tên mẫu xe"
                placeholderTextColor="#92929D"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Màu xe <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.carColor}
                onChangeText={(value) => handleInputChange("carColor", value)}
                placeholder="Nhập màu xe"
                placeholderTextColor="#92929D"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số chỗ ngồi <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.seatCount}
                onChangeText={(value) => handleInputChange("seatCount", value)}
                placeholder="Nhập số chỗ ngồi"
                placeholderTextColor="#92929D"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Loại nhiên liệu <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.dropdownContainer}
                onPress={() => setShowFuelTypeDropdown(!showFuelTypeDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.fuelType && styles.placeholderText,
                  ]}
                >
                  {formData.fuelType || "Chọn loại nhiên liệu"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showFuelTypeDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showFuelTypeDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {fuelTypes.map((fuelType) => (
                      <TouchableOpacity
                        key={fuelType}
                        style={styles.dropdownItem}
                        onPress={() => handleFuelTypeSelect(fuelType)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>{fuelType}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Loại xe <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.dropdownContainer}
                onPress={() => setShowCarTypeDropdown(!showCarTypeDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.carType && styles.placeholderText,
                  ]}
                >
                  {formData.carType || "Chọn loại xe"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showCarTypeDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showCarTypeDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {carTypes.map((carType) => (
                      <TouchableOpacity
                        key={carType}
                        style={styles.dropdownItem}
                        onPress={() => handleCarTypeSelect(carType)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>{carType}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Hạng bằng lái <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.dropdownContainer}
                onPress={() =>
                  setShowLicenseTierDropdown(!showLicenseTierDropdown)
                }
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.licenseTier && styles.placeholderText,
                  ]}
                >
                  {formData.licenseTier || "Chọn hạng bằng lái"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showLicenseTierDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showLicenseTierDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {licenseTiers.map((tier) => (
                      <TouchableOpacity
                        key={tier}
                        style={styles.dropdownItem}
                        onPress={() => handleLicenseTierSelect(tier)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>{tier}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Năm sản xuất <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.year}
                onChangeText={(value) => handleInputChange("year", value)}
                placeholder="Nhập năm sản xuất (VD: 2020)"
                placeholderTextColor="#92929D"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isSubmittingFromRedux && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={isSubmittingFromRedux}
            >
              <Text style={styles.nextButtonText}>
                {isSubmittingFromRedux ? "Đang xử lý..." : "Kế tiếp"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressFill: {
    width: "20%",
    height: "100%",
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#92929D",
    borderWidth: 1,
    marginRight: 10,
  },
  helpButtonText: {
    fontSize: 14,
    color: "#000",
  },
  notificationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: "#FF0000",
    borderRadius: 4,
  },
  background_1: {
    width: "100%",
    height: 250,
  },
  titleContainer: {
    alignItems: "flex-start",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  imageSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  required: {
    color: AppColors.red,
  },
  imageUploadArea: {
    position: "relative",
    borderWidth: 2,
    borderColor: "#70E000",
    borderStyle: "dashed",
    borderRadius: 8,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  dimmedImage: {
    opacity: 0.5,
  },
  deleteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  trashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    fontSize: 16,
    color: "#70E000",
    fontWeight: "600",
  },
  editButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#70E000",
    borderWidth: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    color: "#92929D",
  },
  dropdownIcon: {
    transform: [{ rotate: "0deg" }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  dropdownScrollView: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.white,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
});
