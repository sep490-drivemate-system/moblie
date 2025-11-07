import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  X,
  Coins,
  ArrowLeft,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Users,
  Package,
  Calendar,
  MapPin,
  Clock,
  Car,
} from "lucide-react-native";
// Booking models (if needed later)
// import { BookingMode, Shift, ShiftType } from "@/models/booking/booking";
import Step1 from "@/components/Booking/Step1";
import Step2 from "@/components/Booking/Step2";
import Step3 from "@/components/Booking/Step3";
import Step4 from "@/components/Booking/Step4";
import { instructorsData } from "@/data/instructors_data";
import { instructorVehicles } from "@/data/instructor_detail";
import { instructorBusyTimes } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const instructorId = params.instructorId;
  const packageId = params.packageId as string | undefined;
  const vehicleId = params.vehicleId as string | undefined;

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Date and time selection
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Step 2: Duration selection (time already selected in Step1)
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(2); // default 2 hours

  // Step 3: Location
  const [pickupLocation, setPickupLocation] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );

  // User wallet
  const [userCoins, setUserCoins] = useState(500);

  // Policy acceptance state
  const [allPoliciesAccepted, setAllPoliciesAccepted] = useState(false);

  // Tracking card expand/collapse state
  const [isTrackingExpanded, setIsTrackingExpanded] = useState(false);

  const steps = [
    { number: 1, label: "Ngày & giờ" },
    { number: 2, label: "Thời lượng" },
    { number: 3, label: "Địa điểm" },
    { number: 4, label: "Xác nhận" },
  ];

  // Get instructor and package info
  const instructor = instructorsData.find((i) => i.id === instructorId);
  const selectedPackage = instructor?.packages?.find((p) => p.id === packageId);
  const maxDuration = selectedPackage?.duration || 40;

  // Get vehicle info if vehicleId is provided (from instructorVehicles)
  const selectedVehicle =
    vehicleId && vehicleId !== ""
      ? instructorVehicles.find((v) => v.id === vehicleId)
      : null;

  // Calculate booking cost: base package price + vehicle cost (if selected)
  const bookingCost = (() => {
    const baseCost = selectedPackage?.basePrice || 0;
    let vehicleCost = 0;

    if (selectedVehicle && selectedVehicle.price && selectedDuration > 0) {
      vehicleCost = selectedVehicle.price * selectedDuration;
    }

    return baseCost + vehicleCost;
  })();

  // Update selectedStartTime when time is selected in Step1
  useEffect(() => {
    if (selectedTime) {
      setSelectedStartTime(selectedTime);
    }
  }, [selectedTime]);

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedDate !== null && selectedTime !== null;
      case 2:
        return selectedStartTime !== "" && selectedDuration > 0;
      case 3:
        return selectedLocationId !== null;
      case 4:
        return userCoins >= bookingCost;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      // Reset policies acceptance when moving to step 4
      if (currentStep === 3) {
        setAllPoliciesAccepted(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Reset policies acceptance when leaving step 4
      if (currentStep === 4) {
        setAllPoliciesAccepted(false);
      }
    } else {
      // Step 1: Navigate to home
      router.push("/(main)/(no-tabs)/my-packages");
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

  const handleConfirmBooking = () => {
    setTimeout(() => {
      router.replace("/(main)/(no-tabs)/my-packages");
    }, 500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header with Integrated Progress */}
      <View style={[styles.modernHeader, { backgroundColor: "#1AD562" }]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.modernHeaderTitle}>Đặt lịch thuê</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Steps Navigation */}
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

      {/* Tracking Card */}
      <View style={styles.trackingCard}>
        <TouchableOpacity
          style={styles.trackingHeader}
          onPress={() => setIsTrackingExpanded(!isTrackingExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.trackingTitleContainer}>
            <Text style={styles.trackingTitle}>Thông tin đặt lịch</Text>
          </View>
          {isTrackingExpanded ? (
            <ChevronUp size={20} color="#4338ca" />
          ) : (
            <ChevronDown size={20} color="#4338ca" />
          )}
        </TouchableOpacity>

        {isTrackingExpanded && (
          <ScrollView
            style={styles.trackingContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Instructor & Package Info */}
            <View style={styles.trackingGroup}>
              {instructor && (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <Users size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Người hướng dẫn</Text>
                    <Text style={styles.trackingValue} numberOfLines={1}>
                      {instructor.name}
                    </Text>
                  </View>
                </View>
              )}

              {selectedPackage && (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <Package size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Gói thuê</Text>
                    <Text style={styles.trackingValue} numberOfLines={1}>
                      {selectedPackage.name}
                    </Text>
                  </View>
                </View>
              )}

              {selectedPackage && (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <Clock size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Thời lượng</Text>
                    <Text style={styles.trackingValue}>
                      {selectedPackage.duration} giờ
                    </Text>
                  </View>
                </View>
              )}

              {selectedVehicle && (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <Car size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Xe</Text>
                    <Text style={styles.trackingValue} numberOfLines={1}>
                      {selectedVehicle.name}
                    </Text>
                  </View>
                </View>
              )}

              {!selectedVehicle && vehicleId === "" && (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <Car size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Xe</Text>
                    <Text style={styles.trackingValue}>🚙 Xe riêng</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Schedule Info */}
            <View style={styles.trackingGroup}>
              {selectedDate && (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <Calendar size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Ngày</Text>
                    <Text style={styles.trackingValue}>
                      {new Date(selectedDate).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                </View>
              )}

              {selectedTime && selectedDuration > 0 ? (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <Clock size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Thời gian</Text>
                    <Text style={styles.trackingValue}>
                      {selectedTime} -{" "}
                      {calculateEndTime(selectedTime, selectedDuration)} (
                      {selectedDuration}h)
                    </Text>
                  </View>
                </View>
              ) : null}

              {pickupLocation && (
                <View style={styles.trackingRow}>
                  <View style={styles.trackingIconContainer}>
                    <MapPin size={16} color="#667eea" />
                  </View>
                  <View style={styles.trackingInfoContainer}>
                    <Text style={styles.trackingLabel}>Địa điểm</Text>
                    <Text style={styles.trackingValue} numberOfLines={2}>
                      {pickupLocation}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {!isTrackingExpanded && (
          <View style={styles.trackingContentCollapsed}>
            {instructor && (
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Người hướng dẫn:</Text>
                <Text style={styles.trackingValue} numberOfLines={1}>
                  {instructor.name}
                </Text>
              </View>
            )}
            {selectedPackage && (
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Gói thuê:</Text>
                <Text style={styles.trackingValue} numberOfLines={1}>
                  {selectedPackage.name}
                </Text>
              </View>
            )}
            {selectedDate && (
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Ngày:</Text>
                <Text style={styles.trackingValue}>
                  {new Date(selectedDate).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Date & Time Selection */}
        {currentStep === 1 && (
          <Step1
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            instructorBusyTimes={instructorBusyTimes.filter(
              (bt) => bt.instructorId === instructorId
            )}
          />
        )}

        {/* Step 2: Time & Duration Selection */}
        {currentStep === 2 && (
          <Step2
            selectedStartTime={selectedStartTime}
            selectedDuration={selectedDuration}
            onStartTimeSelect={setSelectedStartTime}
            onDurationChange={setSelectedDuration}
            maxDuration={maxDuration}
            busyTimes={
              instructorBusyTimes.find(
                (bt) =>
                  bt.instructorId === instructorId && bt.date === selectedDate
              )?.busySlots || []
            }
          />
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <Step3
            selectedLocationId={selectedLocationId}
            pickupLocation={pickupLocation}
            onLocationSelect={(locationId: string, locationName: string) => {
              setSelectedLocationId(locationId);
              setPickupLocation(locationName);
            }}
          />
        )}

        {/* Step 4: Payment & Confirmation */}
        {currentStep === 4 && (
          <Step4
            packageId={packageId}
            selectedDate={selectedDate}
            selectedStartTime={selectedStartTime}
            selectedDuration={selectedDuration}
            pickupLocation={pickupLocation}
            bookingCost={bookingCost}
            userCoins={userCoins}
            instructorName={instructor?.name}
            packageName={selectedPackage?.name}
            selectedVehicle={selectedVehicle}
            vehicleId={vehicleId}
            packageBasePrice={selectedPackage?.basePrice || 0}
            onConfirmBooking={handleConfirmBooking}
            onPoliciesAcceptedChange={setAllPoliciesAccepted}
          />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.backBottomButton} onPress={handleBack}>
          <Text style={styles.backBottomButtonText}>
            {currentStep === 1 ? "Hủy" : "Quay lại"}
          </Text>
        </TouchableOpacity>

        {/* Continue button for steps 1-3 */}
        {currentStep !== 4 && (
          <TouchableOpacity
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

        {/* Payment button for step 4 */}
        {currentStep === 4 && (
          <TouchableOpacity
            style={[
              styles.paymentButton,
              (!allPoliciesAccepted) &&
              styles.paymentButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            //disabled={!allPoliciesAccepted}
          >
            <View
              style={[
                styles.paymentButtonGradient,
                {
                  backgroundColor:
                    !allPoliciesAccepted
                      ? "#cbd5e1"
                      : "#1AD562",
                },
              ]}
            >
              <Text style={styles.paymentButtonText}>
                Đặt lịch
              </Text>
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
  // Modern Header Styles
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
  trackingCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    zIndex: 1,
  },
  trackingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  trackingTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trackingBackButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4338ca",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  coinIcon: {
    fontSize: 16,
  },
  coinText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#92400e",
  },
  trackingContent: {
    maxHeight: 200,
  },
  trackingContentCollapsed: {
    gap: 8,
  },
  trackingGroup: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  trackingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  trackingInfoContainer: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },
  trackingValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    lineHeight: 20,
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
