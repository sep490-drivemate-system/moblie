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
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle,
  X,
  Coins,
} from "lucide-react-native";
import {
  BookingMode,
  RoadType,
  Shift,
  ShiftType,
  Skill,
} from "@/models/booking/booking";
import Step1 from "@/components/Booking/Step1";
import Step2 from "@/components/Booking/Step2";
import Step3 from "@/components/Booking/Step3";
import Step4 from "@/components/Booking/Step4";
import Step5 from "@/components/Booking/Step5";

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const instructorId = params.instructorId;
  const packageType = params.package as "instructor" | "full" | undefined;
  const vehicleId = params.vehicleId as string | undefined;

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Booking mode
  const [bookingMode, setBookingMode] = useState<BookingMode>("daily");

  // Step 2: Time selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedShiftsRecurring, setSelectedShiftsRecurring] = useState<
    ShiftType[]
  >([]);

  // Step 3: Location
  const [pickupLocation, setPickupLocation] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );

  // Step 3: Road types & Skills (combined)
  const [selectedRoadTypes, setSelectedRoadTypes] = useState<RoadType[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  // User wallet
  const [userCoins, setUserCoins] = useState(500);
  const bookingCost = 200;

  const steps = [
    { number: 1, label: "Gói thuê" },
    { number: 2, label: "Thời gian" },
    { number: 3, label: "Địa điểm" },
    { number: 4, label: "Yêu cầu" },
    { number: 5, label: "Xác nhận thanh toán" },
  ];


  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const toggleRoadType = (road: RoadType) => {
    setSelectedRoadTypes((prev) =>
      prev.find((r) => r.id === road.id)
        ? prev.filter((r) => r.id !== road.id)
        : [...prev, road]
    );
  };

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills((prev) =>
      prev.find((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill]
    );
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return true; // Mode is always selected
      case 2:
        if (bookingMode === "daily") {
          return selectedDate && selectedShift;
        } else {
          return (
            startDate &&
            endDate &&
            selectedDays.length > 0 &&
            selectedShiftsRecurring.length > 0
          );
        }
      case 3:
        return selectedLocationId !== null;
      case 4:
        return selectedRoadTypes.length > 0 && selectedSkills.length > 0;
      case 5:
        return userCoins >= bookingCost;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 5) {
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

  const handleConfirmBooking = () => {
    if (userCoins >= bookingCost) {
      setUserCoins(userCoins - bookingCost);
      console.log("Booking confirmed:", {
        instructorId,
        packageType,
        vehicleId,
        bookingMode,
        selectedDate,
        selectedShift,
        pickupLocation,
        selectedRoadTypes,
        selectedSkills,
        paidAmount: bookingCost,
        remainingCoins: userCoins - bookingCost,
      });
      // Navigate to payment success page
      setTimeout(() => {
        router.replace('/(main)/(no-tabs)/payment-success');
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header with Integrated Progress */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#8b5fbf"]}
        style={styles.modernHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.modernHeaderTitle}>Đặt lịch thuê</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Steps Navigation */}
        <View style={styles.modernStepsContainer}>
          <View style={styles.stepsRow}>
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
      </LinearGradient>

      {/* Tracking Card */}
      <View style={styles.trackingCard}>
        <View style={styles.trackingHeader}>
          <View style={styles.trackingTitleContainer}>
            <Text style={styles.trackingTitle}>Thông tin đặt lịch</Text>
          </View>
          <View style={styles.coinBadge}>
            <Coins size={16} color="#92400e" strokeWidth={2} />
            <Text style={styles.coinText}>{userCoins} xu</Text>
          </View>
        </View>

        <View style={styles.trackingContent}>
          {packageType && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Gói thuê</Text>
              <Text style={styles.trackingValue}>
                {packageType === "instructor"
                  ? "Thuê người hướng dẫn"
                  : packageType === "full"
                  ? "Thuê trọn gói"
                  : "Chưa chọn gói"}
              </Text>
            </View>
          )}

          {bookingMode && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Phương thức</Text>
              <Text style={styles.trackingValue}>
                {bookingMode === "daily" ? "Theo ca" : "Theo chu kỳ"}
              </Text>
            </View>
          )}

          {(selectedDate && selectedShift) || (startDate && endDate) ? (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Thời gian:</Text>
              <Text style={styles.trackingValue}>
                {bookingMode === "daily" 
                  ? `${selectedDate} - ${selectedShift?.label || ""}`
                  : `${startDate} → ${endDate}`}
              </Text>
            </View>
          ) : null}

          {pickupLocation && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Địa điểm:</Text>
              <Text style={styles.trackingValue} numberOfLines={1}>
                {pickupLocation}
              </Text>
            </View>
          )}

          {selectedRoadTypes.length > 0 && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Loại đường:</Text>
              <Text style={styles.trackingValue}>
                {selectedRoadTypes.length} loại
              </Text>
            </View>
          )}

          {selectedSkills.length > 0 && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Kỹ năng:</Text>
              <Text style={styles.trackingValue}>
                {selectedSkills.length} kỹ năng
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Booking Mode */}
        {currentStep === 1 && (
          <Step1
            bookingMode={bookingMode}
            onModeChange={setBookingMode}
          />
        )}

        {/* Step 2: Time Selection */}
        {currentStep === 2 && (
          <Step2
            bookingMode={bookingMode}
            selectedDate={selectedDate}
            selectedShift={selectedShift}
            onDateSelect={setSelectedDate}
            onShiftSelect={setSelectedShift}
            startDate={startDate}
            endDate={endDate}
            selectedDays={selectedDays}
            selectedShiftsRecurring={selectedShiftsRecurring}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onDayToggle={toggleDay}
            onRecurringShiftToggle={(shiftId: ShiftType) => {
              setSelectedShiftsRecurring((prev) =>
                prev.includes(shiftId)
                  ? prev.filter((s) => s !== shiftId)
                  : [...prev, shiftId]
              );
            }}
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

        {/* Step 4: Road Types & Skills Combined */}
        {currentStep === 4 && (
          <Step4
            selectedRoadTypes={selectedRoadTypes}
            selectedSkills={selectedSkills}
            onRoadTypeToggle={toggleRoadType}
            onSkillToggle={toggleSkill}
          />
        )}

        {/* Step 5: Payment & Confirmation */}
        {currentStep === 5 && (
          <Step5
            packageType={packageType}
            bookingMode={bookingMode}
            selectedDate={selectedDate}
            selectedShift={selectedShift}
            startDate={startDate}
            endDate={endDate}
            pickupLocation={pickupLocation}
            selectedRoadTypes={selectedRoadTypes}
            selectedSkills={selectedSkills}
            bookingCost={bookingCost}
            userCoins={userCoins}
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

        <TouchableOpacity
          style={[
            styles.continueButton,
            !canProceedToNextStep() && styles.continueButtonDisabled,
          ]}
          onPress={currentStep === 5 ? handleConfirmBooking : handleNext}
          disabled={!canProceedToNextStep()}
        >
          <LinearGradient
            colors={
              canProceedToNextStep()
                ? ["#667eea", "#764ba2"]
                : ["#cbd5e1", "#cbd5e1"]
            }
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              {currentStep === 5 ? "Thanh toán & Đặt lịch" : "Tiếp tục"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
    alignItems: "center",
    flex: 1,
  },
  modernHeaderTitle: {
    fontSize: 22,
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
    width: 44,
  },

  // Modern Steps Styles
  modernStepsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modernStepWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  modernStepItem: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    maxWidth: 70,
  },
  modernStepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
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
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 14,
    flexWrap: "wrap",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 21,
    paddingHorizontal: 4,
    maxWidth: 40,
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
    gap: 8,
  },
  trackingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackingLabel: {
    fontSize: 13,
    color: "#6366f1",
    fontWeight: "600",
  },
  trackingValue: {
    fontSize: 13,
    color: "#4338ca",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
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
});
