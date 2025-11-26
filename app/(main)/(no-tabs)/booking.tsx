import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle } from "lucide-react-native";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  getPolicies,
  PolicyType,
  INoviceDriverAddress,
  IPolicy,
  createSession,
} from "@/features/booking/bookingThunk";
import Step1 from "@/components/Booking/Step1";
import Step2 from "@/components/Booking/Step2";
import Step3 from "@/components/Booking/Step3";
import BookingSummaryCard from "@/components/Booking/BookingSummaryCard";
import { instructorsData } from "@/data/instructors_data";
import { instructorVehicles } from "@/data/instructor_detail";
import { instructorBusyTimes } from "@/data/user_packages_data";
import { InstructorPackage } from "@/models/instructor/instructor.type";
import { getNoviceDriverAddresses } from "@/features/user/userThunk";

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();

  const instructorId = params.instructorId as string;
  const packageId = params.packageId as string | undefined;
  const userPackageId = params.userPackageId as string | undefined; // This is the actual bookingId
  const vehicleId = params.vehicleId as string | undefined;
  const carPrice = params.carPrice ? parseFloat(params.carPrice as string) : undefined;
  const remainingHours = params.remainingHours ? parseFloat(params.remainingHours as string) : undefined;


  const [currentStep, setCurrentStep] = useState(1);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(2); // default 2 hours

  const [pickupLocation, setPickupLocation] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [selectedDropoffId, setSelectedDropoffId] = useState<string | null>(null);
  const [isSameDropoff, setIsSameDropoff] = useState(true);
  const [addresses, setAddresses] = useState<INoviceDriverAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [policies, setPolicies] = useState<IPolicy[]>([]);
  const [acceptedPolicies, setAcceptedPolicies] = useState<Record<string, boolean>>({});
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const [userCoins, setUserCoins] = useState(500);


  const [isTrackingExpanded, setIsTrackingExpanded] = useState(false);

  const steps = [
    { number: 1, label: "Thời gian" },
    { number: 2, label: "Địa điểm" },
    { number: 3, label: "Xác nhận" },
  ];

  const instructor = instructorsData.find((i) => i.id === instructorId);
  const selectedPackage = instructor?.packages?.find((p: InstructorPackage) => p.id === packageId);

  const maxDuration = remainingHours !== undefined ? remainingHours : (selectedPackage?.duration || 40);

  const selectedVehicle =
    vehicleId && vehicleId !== ""
      ? instructorVehicles.find((v) => v.id === vehicleId)
      : null;

  const bookingCost = (() => {
    const baseCost = selectedPackage?.basePrice || 0;
    let vehicleCost = 0;

    if (carPrice && vehicleId && selectedDuration > 0) {
      vehicleCost = carPrice * selectedDuration;
    } else if (selectedVehicle && selectedVehicle.price && selectedDuration > 0) {
      vehicleCost = selectedVehicle.price * selectedDuration;
    }

    return baseCost + vehicleCost;
  })();


  // Handle map selection result
  useFocusEffect(
    React.useCallback(() => {
      const checkMapSelection = async () => {
        try {
          const selectionData = await AsyncStorage.getItem("map_selection_result");
          if (selectionData) {
            const selection = JSON.parse(selectionData);
            const { type, latitude, longitude, address } = selection;

            // Create a new address object
            const newAddress: INoviceDriverAddress = {
              id: `map_${Date.now()}`,
              addressString: address,
              latitude,
              longitude,
            };

            if (type === "pickup") {
              setPickupLocation(address);
              setSelectedLocationId(newAddress.id);
              // Add to addresses list if not exists
              setAddresses((prev) => {
                if (!prev.find(a => a.id === newAddress.id)) {
                  return [...prev, newAddress];
                }
                return prev;
              });
              if (isSameDropoff) {
                setDropoffLocation(address);
                setSelectedDropoffId(newAddress.id);
              }
            } else {
              setDropoffLocation(address);
              setSelectedDropoffId(newAddress.id);
              // Add to addresses list if not exists
              setAddresses((prev) => {
                if (!prev.find(a => a.id === newAddress.id)) {
                  return [...prev, newAddress];
                }
                return prev;
              });
            }

            // Clear selection data
            await AsyncStorage.removeItem("map_selection_result");
          }
        } catch (error) {
          console.error("Error reading map selection:", error);
        }
      };

      checkMapSelection();
    }, [isSameDropoff])
  );

  // Fetch addresses when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && addresses.length === 0) {
      fetchNoviceDriverAddresses();
    }
  }, [currentStep]);

  // Fetch policies when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && policies.length === 0) {
      fetchPolicies();
    }
  }, [currentStep]);

  const fetchNoviceDriverAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const result = await dispatch(getNoviceDriverAddresses()).unwrap();
      const addressesData: INoviceDriverAddress[] =
        ((result as any)?.value ?? result ?? []) as INoviceDriverAddress[];

      const normalizedAddresses = addressesData.map((address) => ({
        id: address.id ?? address.addressString,
        addressString: address.addressString,
        latitude: address.latitude,
        longitude: address.longitude,
      }));

      setAddresses(normalizedAddresses);
      console.log("Addresses loaded:", normalizedAddresses.length);
    } catch (error) {
      console.log("Failed to fetch addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      setIsLoadingPolicies(true);
      const result = await dispatch(getPolicies({ policyType: PolicyType.Booking })).unwrap();
      const policiesData: IPolicy[] = ((result as any)?.value ?? result ?? []) as IPolicy[];
      setPolicies(policiesData);
    } catch (error) {
      console.log("Failed to fetch policies:", error);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedDate !== null && selectedStartTime !== "" && selectedEndTime !== "" && selectedDuration > 0;
      case 2:
        if (!selectedLocationId) return false;
        if (!isSameDropoff && !selectedDropoffId) return false;
        return true;
      case 3:
        // Check if all policies are accepted
        const allAccepted = Object.values(acceptedPolicies).every((v) => v === true);
        return allAccepted && userCoins >= bookingCost;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return "00:00";
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleConfirmBooking = async () => {

    const bookingId = userPackageId || packageId;

    if (!bookingId || !selectedDate || !selectedStartTime || !selectedLocationId) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Get selected address for coordinates
    const pickupAddress = addresses.find(
      (addr) => addr.id === selectedLocationId
    );
    if (!pickupAddress) {
      Alert.alert("Lỗi", "Không tìm thấy địa chỉ đón");
      return;
    }

    let dropoffAddress = pickupAddress;
    if (!isSameDropoff) {
      dropoffAddress = addresses.find(
        (addr) => addr.id === selectedDropoffId
      ) as INoviceDriverAddress;
      if (!dropoffAddress) {
        Alert.alert("Lỗi", "Vui lòng chọn địa điểm trả");
        return;
      }
    }

    console.log(
      "📍 Selected pickup address:",
      JSON.stringify(pickupAddress, null, 2)
    );
    console.log(
      "📍 Selected dropoff address:",
      JSON.stringify(dropoffAddress, null, 2)
    );

    try {
      setIsCreatingSession(true);

      // Combine date and time to create ISO datetime string (keep local timezone)
      const startDateTime = new Date(`${selectedDate}T${selectedStartTime}:00`);

      // Format to ISO string but keep local timezone offset instead of converting to UTC
      const year = startDateTime.getFullYear();
      const month = String(startDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(startDateTime.getDate()).padStart(2, '0');
      const hours = String(startDateTime.getHours()).padStart(2, '0');
      const minutes = String(startDateTime.getMinutes()).padStart(2, '0');
      const seconds = String(startDateTime.getSeconds()).padStart(2, '0');

      // Create ISO string with local timezone (+07:00 for Vietnam)
      const isoStartTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;


      // Calculate vehicle cost
      const vehicleCost = vehicleId && carPrice && selectedDuration > 0
        ? carPrice * selectedDuration
        : 0;

      // Create session request
      const sessionRequest = {
        bookingId: bookingId, // Use userPackageId if available, otherwise packageId
        startTime: isoStartTime,
        startingLatitude: pickupAddress.latitude,
        startingLongtitude: pickupAddress.longitude, // Note: API typo
        displayName: pickupAddress.addressString || "",
        displayStartLocationName: pickupAddress.addressString || "",
        priceForCar: vehicleCost,
        duration: selectedDuration,
        sessionNote: sessionNote || "",
        displayEndLocationName: dropoffAddress.addressString || "",
        endingLatitude: dropoffAddress.latitude,
        endingLongtitude: dropoffAddress.longitude,
      };

      console.log("🚀 Creating session with request:", JSON.stringify(sessionRequest, null, 2));



      const response = await dispatch(createSession(sessionRequest)).unwrap();

      console.log("Session created, response:", response);

      // Extract boolean from GenericResponse wrapper
      const success = (response as any)?.data?.value ?? (response as any)?.value ?? response;

      console.log("Extracted success value:", success);

      // API returns boolean: true = success, false = failed
      if (success === true) {
        Alert.alert(
          "Thành công",
          "Đặt lịch thành công!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(main)/(no-tabs)/my-packages"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể tạo lịch học. Vui lòng thử lại."
        );
      }
    } catch (error: any) {
      console.error("Failed to create session:", error);
      Alert.alert(
        "Lỗi",
        error?.message || "Không thể tạo lịch học. Vui lòng thử lại."
      );
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.modernHeader, { backgroundColor: "#1AD562" }]}>
        <View style={styles.headerSection}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.modernHeaderTitle}>Đặt lịch thuê</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.modernStepsContainer}>
          <View style={styles.stepsRowCentered}>
            {steps.map((step, index) => (
              <View key={step.number} style={styles.modernStepWrapper}>
                <View style={styles.modernStepItem}>
                  <View
                    style={[
                      styles.modernStepCircle,
                      step.number < currentStep &&
                      styles.modernStepCircleCompleted,
                      step.number === currentStep &&
                      styles.modernStepCircleActive,
                    ]}
                  >
                    {step.number < currentStep ? (
                      <CheckCircle
                        size={18}
                        color="#ffffff"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.modernStepNumber,
                          step.number <= currentStep &&
                          styles.modernStepNumberActive,
                        ]}
                      >
                        {step.number}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.modernStepLabel,
                      step.number === currentStep &&
                      styles.modernStepLabelActive,
                      step.number < currentStep &&
                      styles.modernStepLabelCompleted,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={styles.modernStepLineContainer}>
                    <View
                      style={[
                        styles.modernStepLine,
                        step.number < currentStep &&
                        styles.modernStepLineCompleted,
                      ]}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Curved Bottom */}
        <View style={styles.curvedHeaderBottom} />
      </View>

      <BookingSummaryCard
        isExpanded={isTrackingExpanded}
        onToggle={() => setIsTrackingExpanded((prev) => !prev)}
        instructorName={instructor?.name}
        packageName={selectedPackage?.name}
        packageDuration={selectedPackage?.duration}
        vehicleName={selectedVehicle?.name ?? null}
        selectedDate={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        selectedDuration={selectedDuration}
        pickupLocation={pickupLocation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && (
          <Step1
            instructorId={instructorId}
            remainTime={remainingHours}
            selectedDate={selectedDate}
            selectedStartTime={selectedStartTime}
            selectedEndTime={selectedEndTime}
            selectedDuration={selectedDuration}
            onDateSelect={setSelectedDate}
            onStartTimeSelect={setSelectedStartTime}
            onEndTimeSelect={setSelectedEndTime}
            onDurationChange={setSelectedDuration}
            maxDuration={maxDuration}
            instructorBusyTimes={instructorBusyTimes.filter(
              (bt) => bt.instructorId === instructorId
            )}
          />
        )}

        {currentStep === 2 && (
          <Step2
            selectedPickupId={selectedLocationId}
            selectedDropoffId={selectedDropoffId}
            pickupLocation={pickupLocation}
            dropoffLocation={isSameDropoff ? pickupLocation : dropoffLocation}
            onPickupSelect={(location) => {
              setPickupLocation(location.name);
              setSelectedLocationId(location.id);
              setAddresses((prev) => {
                if (prev.find((addr) => addr.id === location.id)) {
                  return prev;
                }
                return [
                  ...prev,
                  {
                    id: location.id,
                    addressString: location.address || location.name,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  },
                ];
              });
              if (isSameDropoff) {
                setDropoffLocation(location.name);
                setSelectedDropoffId(location.id);
              }
            }}
            onDropoffSelect={(location) => {
              setDropoffLocation(location.name);
              setSelectedDropoffId(location.id);
              setAddresses((prev) => {
                if (prev.find((addr) => addr.id === location.id)) {
                  return prev;
                }
                return [
                  ...prev,
                  {
                    id: location.id,
                    addressString: location.address || location.name,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  },
                ];
              });
            }}
            isSameDropoff={isSameDropoff}
            onToggleSameDropoff={(value) => {
              setIsSameDropoff(value);
              if (value) {
                setSelectedDropoffId(selectedLocationId);
                setDropoffLocation(pickupLocation);
              } else {
                setSelectedDropoffId(null);
                setDropoffLocation("");
              }
            }}
            addresses={addresses}
            isLoading={isLoadingAddresses}
          />
        )}

        {currentStep === 3 && (
          <Step3
            policies={policies}
            acceptedPolicies={acceptedPolicies}
            onPolicyAccept={(policyId: string, accepted: boolean) => {
              setAcceptedPolicies((prev) => ({
                ...prev,
                [policyId]: accepted,
              }));
            }}
            bookingCost={bookingCost}
            isLoading={isLoadingPolicies}
            vehicleId={vehicleId}
            carPrice={carPrice}
            selectedDuration={selectedDuration}
            sessionNote={sessionNote}
            onSessionNoteChange={setSessionNote}
          />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.backBottomButton} onPress={handleBack}>
          <Text style={styles.backBottomButtonText}>
            {currentStep === 1 ? "Hủy" : "Quay lại"}
          </Text>
        </TouchableOpacity>

        {currentStep !== 3 && (
          <TouchableOpacity activeOpacity={1}
            style={[
              styles.continueButton,
              !canProceedToNextStep() && styles.continueButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceedToNextStep()}
          >
            <View
              style={[
                styles.continueButtonGradient,
                {
                  backgroundColor: canProceedToNextStep()
                    ? "#1AD562"
                    : "#cbd5e1",
                },
              ]}
            >
              <Text style={styles.continueButtonText}>Tiếp tục</Text>
            </View>
          </TouchableOpacity>
        )}

        {currentStep === 3 && (
          <TouchableOpacity
            style={[
              styles.paymentButton,
              (!canProceedToNextStep() || isCreatingSession) && styles.paymentButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={!canProceedToNextStep() || isCreatingSession}
          >
            <View
              style={[
                styles.paymentButtonGradient,
                {
                  backgroundColor: (canProceedToNextStep() && !isCreatingSession)
                    ? "#1AD562"
                    : "#cbd5e1",
                },
              ]}
            >
              {isCreatingSession ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.paymentButtonText}>Đang xử lý...</Text>
                </View>
              ) : (
                <Text style={styles.paymentButtonText}>Xác nhận đặt lịch</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 30,
    position: "relative",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  modernHeaderTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },

  // Modern Steps Styles
  modernStepsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  stepsRowCentered: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 2,
  },
  modernStepWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modernStepItem: {
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 60,
    maxWidth: 75,
  },
  modernStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernStepCircleActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  modernStepCircleCompleted: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modernStepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
  },
  modernStepNumberActive: {
    color: "#667eea",
    fontSize: 16,
  },
  modernStepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 12,
    flexWrap: "wrap",
    marginTop: 2,
  },
  modernStepLabelActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  modernStepLabelCompleted: {
    color: "#ffffff",
    fontWeight: "700",
  },
  modernStepLineContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 2,
    width: 30,
  },
  modernStepLine: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 2,
  },
  modernStepLineCompleted: {
    backgroundColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },

  curvedHeaderBottom: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  bottomContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  backBottomButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  backBottomButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#475569",
  },
  continueButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  paymentButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  paymentButtonDisabled: {
  },
  paymentButtonGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});
