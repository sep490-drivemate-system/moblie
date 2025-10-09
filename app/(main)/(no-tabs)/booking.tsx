import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { MapPin, Clock, Car, Target, CheckCircle, X, CalendarDays, Users, Navigation, Route, Award, CreditCard, Home, Mountain, Construction, Moon, Repeat, Settings, Coins } from 'lucide-react-native';

type BookingMode = 'daily' | 'recurring';
type Shift = 'morning' | 'afternoon' | 'evening';

interface RoadType {
  id: string;
  label: string;
  icon: string;
}

interface Skill {
  id: string;
  label: string;
  icon: string;
}

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const instructorId = params.instructorId;
  const packageType = params.package as 'instructor' | 'full' | undefined;
  const vehicleId = params.vehicleId as string | undefined;

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Booking mode
  const [bookingMode, setBookingMode] = useState<BookingMode>('daily');

  // Step 2: Time selection
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedShiftsRecurring, setSelectedShiftsRecurring] = useState<Shift[]>([]);

  // Step 3: Location
  const [pickupLocation, setPickupLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Step 3: Road types & Skills (combined)
  const [selectedRoadTypes, setSelectedRoadTypes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // User wallet
  const [userCoins, setUserCoins] = useState(500);
  const bookingCost = 200;

  const steps = [
    { number: 1, label: 'Gói thuê' },
    { number: 2, label: 'Thời gian' },
    { number: 3, label: 'Địa điểm' },
    { number: 4, label: 'Yêu cầu' },
    { number: 5, label: 'Xác nhận thanh toán' },
  ];

  const roadTypes: RoadType[] = [
    { id: 'residential', label: 'Đường khu dân cư vắng', icon: 'Home' },
    { id: 'urban', label: 'Đường đô thị (trong thành phố)', icon: 'Users' },
    { id: 'national', label: 'Quốc lộ (lưu lượng xe trung bình – cao)', icon: 'Route' },
    { id: 'highway', label: 'Đường cao tốc (tốc độ cao, giữ làn, vượt xe)', icon: 'Car' },
    { id: 'mountain', label: 'Đường đèo / đường núi (nhiều dốc, cua gấp)', icon: 'Mountain' },
    { id: 'long_distance', label: 'Đường dài / đường trường (liên tỉnh, đi xa)', icon: 'Navigation' },
    { id: 'crowded', label: 'Đường qua khu đông dân cư / chợ / trường học', icon: 'Users' },
    { id: 'construction', label: 'Đường đang thi công / mặt đường xấu', icon: 'Construction' },
    { id: 'slippery', label: 'Đường trơn trượt (mưa, sình lầy)', icon: 'Clock' },
    { id: 'night', label: 'Đường ban đêm', icon: 'Moon' },
  ];

  const skills: Skill[] = [
    { id: 'basic_control', label: 'Điều khiển cơ bản (ga, phanh, vô lăng)', icon: 'Settings' },
    { id: 'parking', label: 'Đỗ xe (song song, dọc, ngang)', icon: 'Car' },
    { id: 'lane_change', label: 'Chuyển làn đường an toàn', icon: 'Navigation' },
    { id: 'overtaking', label: 'Vượt xe đúng cách', icon: 'Target' },
    { id: 'intersection', label: 'Qua ngã tư, đèn đỏ', icon: 'Route' },
    { id: 'roundabout', label: 'Đi vòng xuyến', icon: 'Repeat' },
    { id: 'reverse', label: 'Lùi xe an toàn', icon: 'Navigation' },
    { id: 'uphill_downhill', label: 'Lên dốc, xuống dốc', icon: 'Mountain' },
    { id: 'night_driving', label: 'Lái xe ban đêm', icon: 'Moon' },
    { id: 'rain_driving', label: 'Lái xe trong mưa', icon: 'Clock' },
    { id: 'highway_driving', label: 'Lái xe cao tốc', icon: 'Car' },
    { id: 'defensive_driving', label: 'Lái xe phòng thủ', icon: 'Award' },
  ];

  const shifts = [
    { id: 'morning' as Shift, label: 'Ca sáng', time: '6:00 - 10:00' },
    { id: 'afternoon' as Shift, label: 'Ca chiều', time: '14:00 - 18:00' },
    { id: 'evening' as Shift, label: 'Ca tối', time: '18:00 - 22:00' },
  ];

  const weekDays = [
    { id: 'mon', label: 'T2' },
    { id: 'tue', label: 'T3' },
    { id: 'wed', label: 'T4' },
    { id: 'thu', label: 'T5' },
    { id: 'fri', label: 'T6' },
    { id: 'sat', label: 'T7' },
    { id: 'sun', label: 'CN' },
  ];

  const pickupLocations = [
    { id: 'fpt_hcm', name: 'FPT University Hồ Chí Minh', address: 'Khu Công nghệ cao, Quận 9, TP.HCM' },
    { id: 'fpt_hanoi', name: 'FPT University Hà Nội', address: 'Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội' },
    { id: 'fpt_danang', name: 'FPT University Đà Nẵng', address: 'Khu Công nghệ cao, Quận Liên Chiểu, Đà Nẵng' },
    { id: 'fpt_cantho', name: 'FPT University Cần Thơ', address: 'Khu Công nghệ cao, Quận Ninh Kiều, Cần Thơ' },
    { id: 'fpt_quynhon', name: 'FPT University Quy Nhơn', address: 'Khu Công nghệ cao, Quận Bình Định, Quy Nhơn' },
    { id: 'fpt_hoian', name: 'FPT University Hội An', address: 'Khu Công nghệ cao, Quận Hội An, Quảng Nam' },
  ];

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const toggleRoadType = (roadId: string) => {
    setSelectedRoadTypes(prev =>
      prev.includes(roadId) ? prev.filter(r => r !== roadId) : [...prev, roadId]
    );
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return true; // Mode is always selected
      case 2:
        if (bookingMode === 'daily') {
          return selectedDate && selectedShift;
        } else {
          return startDate && endDate && selectedDays.length > 0 && selectedShiftsRecurring.length > 0;
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
      console.log('Booking confirmed:', {
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
      // Show success and navigate back
      setTimeout(() => {
        router.back();
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header with Integrated Progress */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#8b5fbf']}
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
                  <View style={[
                    styles.modernStepCircle,
                    step.number < currentStep && styles.modernStepCircleCompleted,
                    step.number === currentStep && styles.modernStepCircleActive,
                  ]}>
                    {step.number < currentStep ? (
                      <CheckCircle size={18} color="#ffffff" strokeWidth={2.5} />
                    ) : (
                      <Text style={[
                        styles.modernStepNumber,
                        (step.number <= currentStep) && styles.modernStepNumberActive
                      ]}>
                        {step.number}
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.modernStepLabel,
                    step.number === currentStep && styles.modernStepLabelActive,
                    step.number < currentStep && styles.modernStepLabelCompleted,
                  ]}>
                    {step.label}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={styles.modernStepLineContainer}>
                    <View style={[
                      styles.modernStepLine,
                      step.number < currentStep && styles.modernStepLineCompleted,
                    ]} />
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
                {packageType === 'instructor' ? 'Thuê người hướng dẫn' :
                  packageType === 'full' ? 'Thuê trọn gói' : 'Chưa chọn gói'}
              </Text>
            </View>
          )}

          {bookingMode && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Phương thức</Text>
              <Text style={styles.trackingValue}>
                {bookingMode === 'daily' ? 'Theo ca' : 'Theo chu kỳ'}
              </Text>
            </View>
          )}

          {selectedDate && selectedShift && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Thời gian:</Text>
              <Text style={styles.trackingValue}>
                {selectedDate} - {shifts.find(s => s.id === selectedShift)?.label}
              </Text>
            </View>
          )}

          {pickupLocation && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Địa điểm:</Text>
              <Text style={styles.trackingValue} numberOfLines={1}>{pickupLocation}</Text>
            </View>
          )}

          {selectedRoadTypes.length > 0 && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Loại đường:</Text>
              <Text style={styles.trackingValue}>{selectedRoadTypes.length} loại</Text>
            </View>
          )}

          {selectedSkills.length > 0 && (
            <View style={styles.trackingRow}>
              <Text style={styles.trackingLabel}>Kỹ năng:</Text>
              <Text style={styles.trackingValue}>{selectedSkills.length} kỹ năng</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Booking Mode */}
        {currentStep === 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chọn phương thức đặt lịch</Text>
            </View>
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[styles.modeCard, bookingMode === 'daily' && styles.modeCardActive]}
                onPress={() => setBookingMode('daily')}
              >
                <View style={styles.modeIconContainer}>
                  <CalendarDays size={32} color={bookingMode === 'daily' ? '#667eea' : '#64748b'} strokeWidth={2} />
                </View>
                <Text style={[styles.modeText, bookingMode === 'daily' && styles.modeTextActive]}>
                  Theo ca trong ngày
                </Text>
                <Text style={styles.modeDesc}>Đặt lịch theo từng ngày cụ thể</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeCard, bookingMode === 'recurring' && styles.modeCardActive]}
                onPress={() => setBookingMode('recurring')}
              >
                <View style={styles.modeIconContainer}>
                  <Repeat size={32} color={bookingMode === 'recurring' ? '#667eea' : '#64748b'} strokeWidth={2} />
                </View>
                <Text style={[styles.modeText, bookingMode === 'recurring' && styles.modeTextActive]}>
                  Theo chu kỳ
                </Text>
                <Text style={styles.modeDesc}>Đặt lịch lặp lại theo tuần</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: Time Selection */}
        {currentStep === 2 && (
          <>
            {bookingMode === 'daily' ? (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <CalendarDays size={24} color="#667eea" strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Chọn ngày</Text>
                  </View>
                  <Calendar
                    current={new Date().toISOString().split('T')[0]}
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={{
                      [selectedDate]: { selected: true, selectedColor: '#667eea' },
                    }}
                    theme={{
                      todayTextColor: '#667eea',
                      selectedDayBackgroundColor: '#667eea',
                      selectedDayTextColor: '#ffffff',
                      arrowColor: '#667eea',
                    }}
                    style={styles.calendar}
                  />
                </View>

                {selectedDate && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chọn ca thuê</Text>
                    {shifts.map((shift) => (
                      <TouchableOpacity
                        key={shift.id}
                        style={[styles.shiftCard, selectedShift === shift.id && styles.shiftCardActive]}
                        onPress={() => setSelectedShift(shift.id)}
                      >

                        <View style={styles.shiftInfo}>
                          <Text style={styles.shiftLabel}>{shift.label}</Text>
                          <Text style={styles.shiftTime}>{shift.time}</Text>
                        </View>
                        {selectedShift === shift.id && (
                          <CheckCircle size={24} color="#667eea" strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📅 Chọn khoảng thời gian</Text>
                  <View style={styles.dateRangeContainer}>
                    <View style={styles.dateInputWrapper}>
                      <Text style={styles.dateInputLabel}>Từ ngày:</Text>
                      <TextInput
                        style={styles.dateInput}
                        placeholder="DD/MM/YYYY"
                        value={startDate}
                        onChangeText={setStartDate}
                      />
                    </View>
                    <View style={styles.dateInputWrapper}>
                      <Text style={styles.dateInputLabel}>Đến ngày:</Text>
                      <TextInput
                        style={styles.dateInput}
                        placeholder="DD/MM/YYYY"
                        value={endDate}
                        onChangeText={setEndDate}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📆 Chọn các thứ trong tuần</Text>
                  <View style={styles.weekDaysContainer}>
                    {weekDays.map((day) => (
                      <TouchableOpacity
                        key={day.id}
                        style={[styles.dayButton, selectedDays.includes(day.id) && styles.dayButtonActive]}
                        onPress={() => toggleDay(day.id)}
                      >
                        <Text style={[styles.dayButtonText, selectedDays.includes(day.id) && styles.dayButtonTextActive]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {selectedDays.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏰ Chọn ca học</Text>
                    {shifts.map((shift) => (
                      <TouchableOpacity
                        key={shift.id}
                        style={[
                          styles.shiftCard,
                          selectedShiftsRecurring.includes(shift.id) && styles.shiftCardActive
                        ]}
                        onPress={() => {
                          setSelectedShiftsRecurring(prev =>
                            prev.includes(shift.id) ? prev.filter(s => s !== shift.id) : [...prev, shift.id]
                          );
                        }}
                      >
                        <View style={styles.shiftInfo}>
                          <Text style={styles.shiftLabel}>{shift.label}</Text>
                          <Text style={styles.shiftTime}>{shift.time}</Text>
                        </View>
                        {selectedShiftsRecurring.includes(shift.id) && (
                          <CheckCircle size={24} color="#667eea" strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Chọn địa điểm đón</Text>
            <Text style={styles.sectionDesc}>
              Địa điểm đón và trả sẽ là cùng một vị trí. Vui lòng chọn một địa điểm từ danh sách bên dưới.
            </Text>

            <View style={styles.locationNote}>
              <Text style={styles.locationNoteText}>
                💡 Lưu ý: Điểm đón cũng chính là điểm thả. Bạn sẽ được đón và trả tại cùng một địa điểm đã chọn.
              </Text>
            </View>

            <View style={styles.locationList}>
              {pickupLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationCard,
                    selectedLocationId === location.id && styles.locationCardSelected
                  ]}
                  onPress={() => {
                    setSelectedLocationId(location.id);
                    setPickupLocation(location.name);
                  }}
                >
                  <View style={styles.locationCardContent}>
                    <View style={styles.locationIconContainer}>
                      <MapPin size={20} color={selectedLocationId === location.id ? '#667eea' : '#64748b'} strokeWidth={2} />
                    </View>
                    <View style={styles.locationInfo}>
                      <Text style={[
                        styles.locationName,
                        selectedLocationId === location.id && styles.locationNameSelected
                      ]}>
                        {location.name}
                      </Text>
                      <Text style={styles.locationAddress}>{location.address}</Text>
                    </View>
                    {selectedLocationId === location.id && (
                      <CheckCircle size={20} color="#667eea" strokeWidth={2} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {pickupLocation && (
              <View style={styles.locationPreview}>
                <MapPin size={16} color="#10b981" strokeWidth={2} />
                <Text style={styles.locationPreviewText}>Đã chọn: {pickupLocation}</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Road Types & Skills Combined */}
        {currentStep === 4 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛣️ Chọn loại đường muốn di chuyển</Text>
              <Text style={styles.sectionDesc}>Chọn một hoặc nhiều loại đường để luyện tập</Text>

              {roadTypes.map((road) => {
                const IconComponent = {
                  Home, Users, Route, Car, Mountain, Navigation, Construction, Clock, Moon
                }[road.icon];

                return (
                  <TouchableOpacity
                    key={road.id}
                    style={[
                      styles.optionCard,
                      selectedRoadTypes.includes(road.id) && styles.optionCardActive
                    ]}
                    onPress={() => toggleRoadType(road.id)}
                  >
                    <View style={styles.optionIconContainer}>
                      {IconComponent && (
                        <IconComponent
                          size={24}
                          color={selectedRoadTypes.includes(road.id) ? '#667eea' : '#64748b'}
                          strokeWidth={2}
                        />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      selectedRoadTypes.includes(road.id) && styles.optionTextActive
                    ]}>
                      {road.label}
                    </Text>
                    {selectedRoadTypes.includes(road.id) && (
                      <CheckCircle size={20} color="#667eea" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Chọn kỹ năng muốn được huấn luyện</Text>
              <Text style={styles.sectionDesc}>Chọn các kỹ năng bạn muốn cải thiện</Text>

              {skills.map((skill) => {
                const IconComponent = {
                  Settings, Car, Navigation, Target, Route, Repeat, Mountain, Moon, Clock, Award
                }[skill.icon];

                return (
                  <TouchableOpacity
                    key={skill.id}
                    style={[
                      styles.optionCard,
                      selectedSkills.includes(skill.id) && styles.optionCardActive
                    ]}
                    onPress={() => toggleSkill(skill.id)}
                  >
                    <View style={styles.optionIconContainer}>
                      {IconComponent && (
                        <IconComponent
                          size={24}
                          color={selectedSkills.includes(skill.id) ? '#667eea' : '#64748b'}
                          strokeWidth={2}
                        />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      selectedSkills.includes(skill.id) && styles.optionTextActive
                    ]}>
                      {skill.label}
                    </Text>
                    {selectedSkills.includes(skill.id) && (
                      <CheckCircle size={20} color="#667eea" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Step 5: Payment & Confirmation */}
        {currentStep === 5 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Xác nhận thông tin đặt lịch</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>📦 Gói thuê:</Text>
                <Text style={styles.summaryValue}>
                  {packageType === 'instructor' ? 'Thuê người hướng dẫn' :
                    packageType === 'full' ? 'Thuê trọn gói' : 'Chưa chọn gói'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>📅 Phương thức:</Text>
                <Text style={styles.summaryValue}>
                  {bookingMode === 'daily' ? 'Theo ca trong ngày' : 'Theo chu kỳ'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>⏰ Thời gian:</Text>
                <Text style={styles.summaryValue}>
                  {bookingMode === 'daily'
                    ? `${selectedDate} - ${shifts.find(s => s.id === selectedShift)?.label}`
                    : `${startDate} → ${endDate}`
                  }
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>📍 Địa điểm:</Text>
                <Text style={styles.summaryValue}>{pickupLocation}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>🛣️ Loại đường:</Text>
                <Text style={styles.summaryValue}>
                  {selectedRoadTypes.map(id => roadTypes.find(r => r.id === id)?.label).join(', ')}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>🎯 Kỹ năng:</Text>
                <Text style={styles.summaryValue}>
                  {selectedSkills.map(id => skills.find(s => s.id === id)?.label).join(', ')}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>💰 Chi phí:</Text>
                <Text style={styles.summaryPrice}>{bookingCost} xu</Text>
              </View>
            </View>

            {/* Payment Section */}
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <CreditCard size={24} color="#667eea" strokeWidth={2} />
                <Text style={styles.paymentTitle}>Thanh toán</Text>
              </View>

              <View style={styles.walletInfo}>
                <View style={styles.walletRow}>
                  <Text style={styles.walletLabel}>Số dư hiện tại:</Text>
                  <Text style={styles.walletAmount}>{userCoins} xu</Text>
                </View>
                <View style={styles.walletRow}>
                  <Text style={styles.walletLabel}>Chi phí đặt lịch:</Text>
                  <Text style={styles.walletCost}>-{bookingCost} xu</Text>
                </View>
                <View style={styles.walletDivider} />
                <View style={styles.walletRow}>
                  <Text style={styles.walletLabelBold}>Số dư sau thanh toán:</Text>
                  <Text style={[
                    styles.walletRemaining,
                    userCoins >= bookingCost ? styles.walletRemainingSuccess : styles.walletRemainingError
                  ]}>
                    {userCoins - bookingCost} xu
                  </Text>
                </View>
              </View>

              {userCoins < bookingCost && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>
                    ❌ Số dư không đủ! Vui lòng nạp thêm {bookingCost - userCoins} xu
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nhập địa chỉ đón</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <X size={24} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập địa chỉ..."
              value={pickupLocation}
              onChangeText={setPickupLocation}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.modalButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.backBottomButton} onPress={handleBack}>
          <Text style={styles.backBottomButtonText}>
            {currentStep === 1 ? 'Hủy' : 'Quay lại'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !canProceedToNextStep() && styles.continueButtonDisabled
          ]}
          onPress={currentStep === 5 ? handleConfirmBooking : handleNext}
          disabled={!canProceedToNextStep()}
        >
          <LinearGradient
            colors={canProceedToNextStep() ? ['#667eea', '#764ba2'] : ['#cbd5e1', '#cbd5e1']}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              {currentStep === 5 ? 'Thanh toán & Đặt lịch' : 'Tiếp tục'}
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
    backgroundColor: '#f8f9fa',
  },
  // Modern Header Styles
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 30,
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  modernHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modernStepWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  modernStepItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    maxWidth: 70,
  },
  modernStepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernStepCircleActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  modernStepCircleCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modernStepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modernStepNumberActive: {
    color: '#667eea',
    fontSize: 16,
  },
  modernStepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 14,
    flexWrap: 'wrap',
  },
  modernStepLabelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  modernStepLabelCompleted: {
    color: '#ffffff',
    fontWeight: '700',
  },
  modernStepLineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 21,
    paddingHorizontal: 4,
    maxWidth: 40,
  },
  modernStepLine: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  modernStepLineCompleted: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },

  curvedHeaderBottom: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  trackingCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    zIndex: 1,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4338ca',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
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
    fontWeight: '800',
    color: '#92400e',
  },
  trackingContent: {
    gap: 8,
  },
  trackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  trackingValue: {
    fontSize: 13,
    color: '#4338ca',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  modeContainer: {
    gap: 12,
  },
  modeCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  modeCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  modeIconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  modeTextActive: {
    color: '#667eea',
  },
  modeDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 12,
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  shiftCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  shiftIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  dateRangeContainer: {
    gap: 12,
  },
  dateInputWrapper: {
    gap: 8,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  dateInput: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  dayButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  dayButtonTextActive: {
    color: '#ffffff',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  locationInputText: {
    flex: 1,
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
  },
  locationInputTextFilled: {
    color: '#1e293b',
    fontWeight: '600',
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    marginTop: 12,
    gap: 8,
  },
  locationPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#15803d',
    fontWeight: '600',
  },
  locationNote: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  locationNoteText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
    lineHeight: 18,
  },
  locationList: {
    gap: 12,
  },
  locationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  locationCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  locationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationNameSelected: {
    color: '#667eea',
  },
  locationAddress: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 18,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  optionCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  optionIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 20,
  },
  optionTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  optionCheck: {
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#667eea',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  backBottomButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBottomButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  continueButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  checkIcon: {
    fontSize: 24,
    color: '#667eea',
    fontWeight: '800',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  walletInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  walletLabelBold: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '800',
  },
  walletAmount: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '800',
  },
  walletCost: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '800',
  },
  walletDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  walletRemaining: {
    fontSize: 16,
    fontWeight: '800',
  },
  walletRemainingSuccess: {
    color: '#10b981',
  },
  walletRemainingError: {
    color: '#ef4444',
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
    lineHeight: 18,
  },
});
