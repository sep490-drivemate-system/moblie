import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  DollarSign,
  Users,
  Box,
  TrendingUp,
  Calendar,
  Navigation,
  Filter,
  ChevronDown,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

const { width: screenWidth } = Dimensions.get("window");
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, idx) => CURRENT_YEAR - idx);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, idx) => idx + 1);
const WEEK_OPTIONS = [1, 2, 3, 4];

interface KPIProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string[];
  delay?: number;
  fullWidth?: boolean;
}

const KPI: React.FC<KPIProps> = ({
  title,
  value,
  sub,
  icon,
  color,
  delay = 0,
  fullWidth = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <LinearGradient
      colors={color as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.kpiCard,
        fullWidth && styles.kpiCardFullWidth,
        {
          opacity: isVisible ? 1 : 0,
          transform: [{ translateY: isVisible ? 0 : 32 }],
        },
      ]}
    >
      <View style={styles.kpiContent}>
        <View style={styles.kpiTextContainer}>
          <Text style={styles.kpiTitle}>{title}</Text>
          <Text style={styles.kpiValue}>{value}</Text>
          {sub && <Text style={styles.kpiSub}>{sub}</Text>}
        </View>
        <View style={styles.kpiIconContainer}>{icon}</View>
      </View>
    </LinearGradient>
  );
};

type DropdownOption<T> = {
  label: string;
  value: T;
};

interface DropdownFieldProps<T> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}

function DropdownField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: DropdownFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.selectorBlock}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View>
        <TouchableOpacity
          style={styles.dropdownDisplay}
          onPress={() => setOpen((prev) => !prev)}
          activeOpacity={0.85}
        >
          <Text style={styles.dropdownValueText}>
            {selectedOption ? selectedOption.label : "Chọn giá trị"}
          </Text>
          <ChevronDown
            size={16}
            color={AppColors.textPrimary}
            style={{
              transform: [{ rotate: open ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
        {open && (
          <View style={styles.dropdownList}>
            <ScrollView nestedScrollEnabled>
              {options.map((option) => (
                <TouchableOpacity
                  key={`${label}-${option.value}`}
                  style={styles.dropdownOption}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      option.value === value && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const COLORS = [
  AppColors.primary,
  AppColors.blue,
  AppColors.yellow,
  AppColors.error,
  AppColors.success,
];

const packageData = [
  { name: "Gói Đường Ban Đêm (40h)", hours: 40, buyers: 24, sessions: 72 },
  { name: "Gói Đường Cao Tốc (10h)", hours: 10, buyers: 18, sessions: 65 },
  { name: "Gói Miền Tây (7h)", hours: 7, buyers: 12, sessions: 36 },
  { name: "Gói Sơ Cấp (20h)", hours: 20, buyers: 30, sessions: 90 },
];

const activityData = {
  week: [
    {
      period: "Tuần 1 (03-09/02)",
      completed: 18,
      cancelled: 2,
      rescheduled: 3,
    },
    {
      period: "Tuần 2 (10-16/02)",
      completed: 15,
      cancelled: 1,
      rescheduled: 4,
    },
    {
      period: "Tuần 3 (17-23/02)",
      completed: 20,
      cancelled: 3,
      rescheduled: 2,
    },
    {
      period: "Tuần 4 (24-01/03)",
      completed: 16,
      cancelled: 2,
      rescheduled: 1,
    },
  ],
  month: [
    { period: "01/2025", completed: 42, cancelled: 5, rescheduled: 8 },
    { period: "02/2025", completed: 55, cancelled: 6, rescheduled: 10 },
    { period: "03/2025", completed: 60, cancelled: 7, rescheduled: 9 },
    { period: "04/2025", completed: 70, cancelled: 8, rescheduled: 12 },
  ],
  year: [
    { period: "2022", completed: 420, cancelled: 40, rescheduled: 60 },
    { period: "2023", completed: 510, cancelled: 50, rescheduled: 70 },
    { period: "2024", completed: 575, cancelled: 65, rescheduled: 82 },
    { period: "2025", completed: 610, cancelled: 55, rescheduled: 75 },
  ],
};

const chartTitleByViewMode = {
  week: "Buổi Tập Lái Theo Tuần",
  month: "Buổi Tập Lái Theo Tháng",
  year: "Buổi Tập Lái Theo Năm",
};

const VIEW_MODE_OPTIONS: DropdownOption<"year" | "month" | "week">[] = [
  { label: "Năm", value: "year" },
  { label: "Tháng", value: "month" },
  { label: "Tuần", value: "week" },
];

const YEAR_OPTION_ITEMS: DropdownOption<number>[] = YEAR_OPTIONS.map(
  (year) => ({
    label: `${year}`,
    value: year,
  })
);

const MONTH_OPTION_ITEMS: DropdownOption<number>[] = MONTH_OPTIONS.map(
  (month) => ({
    label: `Tháng ${month}`,
    value: month,
  })
);

const WEEK_OPTION_ITEMS: DropdownOption<number>[] = WEEK_OPTIONS.map(
  (week) => ({
    label: `Tuần ${week}`,
    value: week,
  })
);

const students = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    phone: "090xxxxxxx",
    package: "Gói Đường Cao Tốc",
    sessions: 8,
    completed: 6,
    rescheduled: 1,
    cancelled: 1,
  },
  {
    id: 2,
    name: "Lê Thị B",
    phone: "091xxxxxxx",
    package: "Gói Miền Tây",
    sessions: 5,
    completed: 5,
    rescheduled: 0,
    cancelled: 0,
  },
  {
    id: 3,
    name: "Phạm C",
    phone: "092xxxxxxx",
    package: "Gói Sơ Cấp",
    sessions: 10,
    completed: 9,
    rescheduled: 0,
    cancelled: 1,
  },
];

export default function OverviewScreen() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"year" | "month" | "week">("year");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const totalPackages = packageData.length;
  const totalSessions = students.reduce((s, st) => s + st.sessions, 0);
  const totalCancelled = students.reduce((s, st) => s + st.cancelled, 0);
  const totalRescheduled = students.reduce((s, st) => s + st.rescheduled, 0);

  const grossRevenue = 12000000;
  const commissionRate = 0.15;
  const commission = Math.round(grossRevenue * commissionRate);
  const netRevenue = grossRevenue - commission;
  const activeSessions = activityData[viewMode];

  const getActiveFilterLabel = () => {
    if (viewMode === "year") {
      return `Năm ${selectedYear}`;
    }
    if (viewMode === "month") {
      return `Tháng ${selectedMonth}/${selectedYear}`;
    }
    return `Tuần ${selectedWeek} · Tháng ${selectedMonth}/${selectedYear}`;
  };

  const handleViewModeChange = (mode: "year" | "month" | "week") => {
    setViewMode(mode);
    if (mode === "year") {
      setSelectedMonth(CURRENT_MONTH);
      setSelectedWeek(1);
    }
    if (mode === "month") {
      setSelectedWeek(1);
    }
  };

  const handleApplyFilter = () => {
    console.log("Applying filters", {
      viewMode,
      selectedYear,
      selectedMonth,
      selectedWeek,
    });
    setIsFilterOpen(false);
  };

  const pieData = packageData.map((p) => ({
    name: p.name.split(" ")[0] + "...",
    population: p.buyers,
    color: COLORS[packageData.indexOf(p) % COLORS.length],
    legendFontColor: AppColors.textPrimary,
    legendFontSize: 12,
  }));

  const barData = {
    labels: activeSessions.map((s) => s.period),
    datasets: [
      {
        data: activeSessions.map((s) => s.completed),
        color: (opacity = 1) => AppColors.primary,
      },
      {
        data: activeSessions.map((s) => s.rescheduled),
        color: (opacity = 1) => AppColors.primaryLight || AppColors.primary,
      },
      {
        data: activeSessions.map((s) => s.cancelled),
        color: (opacity = 1) => AppColors.primaryDark || AppColors.primary,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => AppColors.primary,
    labelColor: (opacity = 1) => AppColors.textPrimary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: AppColors.primary,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Modern Header with Gradient */}
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Tổng Quan Hoạt Động</Text>
            <Text style={styles.headerSubtitle}>
              Quản lý doanh thu, khách hàng và gói dịch vụ của bạn
            </Text>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <View style={styles.filterWrapper}>
        <View style={styles.filterSummaryRow}>
          <Text style={styles.filterSummaryLabel}>Đang xem theo:</Text>
          <Text style={styles.filterSummaryText}>{getActiveFilterLabel()}</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterOpen((prev) => !prev)}
          activeOpacity={0.85}
        >
          <Filter size={18} color={AppColors.primary} />
          <Text style={styles.filterButtonText}>
            Bộ lọc {isFilterOpen ? "(Mở)" : "(Đóng)"}
          </Text>
          <ChevronDown
            size={18}
            color={AppColors.primary}
            style={{
              transform: [{ rotate: isFilterOpen ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <KPI
          title="Tổng số gói dịch vụ"
          value={`${totalPackages}`}
          sub="Gói đang hoạt động"
          icon={<Box size={24} color={AppColors.textWhite} />}
          color={[
            AppColors.primary,
            AppColors.primaryDark || AppColors.primary,
          ]}
          delay={0}
          fullWidth
        />
        <KPI
          title="Tổng số buổi tập lái"
          value={`${totalSessions}`}
          sub={`${totalCancelled} hủy · ${totalRescheduled} dời`}
          icon={<Navigation size={24} color={AppColors.textWhite} />}
          color={[AppColors.blue, AppColors.blue]}
          delay={100}
          fullWidth
        />
        <KPI
          title="Doanh thu ròng"
          value={`${(netRevenue / 1000000).toLocaleString("vi-VN")}TR VNĐ`}
          sub={`Hoa hồng ${commissionRate * 100}%`}
          icon={<TrendingUp size={24} color={AppColors.textWhite} />}
          color={[AppColors.success, AppColors.success]}
          delay={200}
          fullWidth
        />
      </View>

      {/* Analytics Section */}
      <View style={styles.analyticsSection}>
        {/* Pie Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Calendar size={20} color={AppColors.primary} />
            <Text style={styles.chartTitle}>Gói Dịch Vụ Được Ưa Chuộng</Text>
          </View>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={pieData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
          <View style={styles.packageList}>
            {packageData.map((p, idx) => (
              <TouchableOpacity
                key={p.name}
                onPress={() =>
                  setSelectedPackage(selectedPackage === idx ? null : idx)
                }
                style={[
                  styles.packageItem,
                  selectedPackage === idx && styles.packageItemSelected,
                ]}
              >
                <View style={styles.packageItemContent}>
                  <View
                    style={[
                      styles.packageColorDot,
                      { backgroundColor: COLORS[idx % COLORS.length] },
                    ]}
                  />
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageName}>{p.name}</Text>
                    <Text style={styles.packageBuyers}>
                      {p.buyers} khách hàng
                    </Text>
                  </View>
                </View>
                <Text style={styles.packagePercentage}>
                  {Math.round(
                    (p.buyers / packageData.reduce((s, x) => s + x.buyers, 0)) *
                      100
                  )}
                  %
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bar Chart */}
        <View style={[styles.chartCard, styles.barChartCard]}>
          <View style={styles.chartHeader}>
            <TrendingUp size={20} color={AppColors.primary} />
            <Text style={styles.chartTitle}>
              {chartTitleByViewMode[viewMode]}
            </Text>
          </View>
          <View style={styles.barChartContainer}>
            <BarChart
              data={barData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
          <View style={styles.sessionStats}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: `${AppColors.success}33` },
              ]}
            >
              <Text
                style={[styles.sessionStatLabel, { color: AppColors.success }]}
              >
                Hoàn thành
              </Text>
              <Text style={[styles.statValue, { color: AppColors.success }]}>
                {activeSessions.reduce((s, r) => s + r.completed, 0)}
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: `${AppColors.yellow}33` },
              ]}
            >
              <Text
                style={[styles.sessionStatLabel, { color: AppColors.yellow }]}
              >
                Dời lịch
              </Text>
              <Text style={[styles.statValue, { color: AppColors.yellow }]}>
                {activeSessions.reduce((s, r) => s + r.rescheduled, 0)}
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: `${AppColors.error}33` },
              ]}
            >
              <Text
                style={[styles.sessionStatLabel, { color: AppColors.error }]}
              >
                Hủy
              </Text>
              <Text style={[styles.statValue, { color: AppColors.error }]}>
                {activeSessions.reduce((s, r) => s + r.cancelled, 0)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Revenue Section */}
      <View style={styles.revenueSection}>
        <LinearGradient
          colors={[
            `${AppColors.primary}33`,
            `${AppColors.primaryDark || AppColors.primary}33`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.revenueCard}
        >
          <Text style={styles.revenueTitle}>Doanh Thu</Text>
          <Text style={styles.revenueSubtitle}>
            Thực nhận sau khi trừ hoa hồng hệ thống
          </Text>
          <View style={styles.revenueGrid}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Tổng doanh thu</Text>
              <Text style={styles.revenueItemValue}>
                {grossRevenue.toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Hoa hồng (15%)</Text>
              <Text
                style={[styles.revenueItemValue, { color: AppColors.error }]}
              >
                {commission.toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Doanh thu ròng</Text>
              <Text
                style={[styles.revenueItemValue, { color: AppColors.success }]}
              >
                {netRevenue.toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Novice driver Table */}
      <View style={styles.studentTableSession}>
        <View style={styles.studentTableCard}>
          <Text style={styles.studentTableTitle}>Danh Sách Khách Hàng</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.tableScrollContainer}
          >
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View
                  style={[
                    styles.tableHeaderCell,
                    styles.tableHeaderCellStudent,
                  ]}
                >
                  <Text style={styles.tableHeaderText}>Khách hàng</Text>
                </View>
                <View
                  style={[
                    styles.tableHeaderCell,
                    styles.tableHeaderCellPackage,
                  ]}
                >
                  <Text style={styles.tableHeaderText}>Gói dịch vụ</Text>
                </View>
                <View
                  style={[
                    styles.tableHeaderCell,
                    styles.tableHeaderCellSessions,
                  ]}
                >
                  <Text
                    style={[styles.tableHeaderText, styles.tableHeaderCenter]}
                  >
                    Buổi tập lái
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableHeaderCell,
                    styles.tableHeaderCellCompleted,
                  ]}
                >
                  <Text
                    style={[styles.tableHeaderText, styles.tableHeaderCenter]}
                  >
                    Hoàn thành
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableHeaderCell,
                    styles.tableHeaderCellRescheduled,
                  ]}
                >
                  <Text
                    style={[styles.tableHeaderText, styles.tableHeaderCenter]}
                  >
                    Đã dời
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableHeaderCell,
                    styles.tableHeaderCellCancelled,
                  ]}
                >
                  <Text
                    style={[styles.tableHeaderText, styles.tableHeaderCenter]}
                  >
                    Đã hủy
                  </Text>
                </View>
              </View>
              {students.map((s) => (
                <View key={s.id} style={styles.tableRow}>
                  <View
                    style={[styles.tableRowCell, styles.tableRowCellStudent]}
                  >
                    <View style={styles.studentInfo}>
                      <View style={styles.studentAvatar}>
                        <Text style={styles.studentAvatarText}>
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.studentName}>{s.name}</Text>
                        <Text style={styles.studentPhone}>{s.phone}</Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[styles.tableRowCell, styles.tableRowCellPackage]}
                  >
                    <Text style={styles.tableCell}>{s.package}</Text>
                  </View>
                  <View
                    style={[styles.tableRowCell, styles.tableRowCellSessions]}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        styles.tableCellCenter,
                        styles.tableCellBold,
                      ]}
                    >
                      {s.sessions}
                    </Text>
                  </View>
                  <View
                    style={[styles.tableRowCell, styles.tableRowCellCompleted]}
                  >
                    <View style={styles.tableCellCenter}>
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>
                          {s.completed}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.tableRowCell,
                      styles.tableRowCellRescheduled,
                    ]}
                  >
                    <View style={styles.tableCellCenter}>
                      {s.rescheduled > 0 ? (
                        <Text style={styles.rescheduledText}>
                          {s.rescheduled}
                        </Text>
                      ) : (
                        <Text style={styles.tableCellEmpty}>-</Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[styles.tableRowCell, styles.tableRowCellCancelled]}
                  >
                    <View style={styles.tableCellCenter}>
                      {s.cancelled > 0 ? (
                        <Text style={styles.cancelledText}>{s.cancelled}</Text>
                      ) : (
                        <Text style={styles.tableCellEmpty}>-</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal
        visible={isFilterOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <View style={styles.filterModalWrapper}>
          <TouchableWithoutFeedback onPress={() => setIsFilterOpen(false)}>
            <View style={styles.filterModalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.filterModalCard}>
            <Text style={styles.filterModalTitle}>Bộ lọc dữ liệu</Text>

            <DropdownField
              label="Xem theo"
              value={viewMode}
              options={VIEW_MODE_OPTIONS}
              onChange={(mode) => handleViewModeChange(mode)}
            />

            <DropdownField
              label="Năm"
              value={selectedYear}
              options={YEAR_OPTION_ITEMS}
              onChange={(year) => setSelectedYear(year)}
            />

            {(viewMode === "month" || viewMode === "week") && (
              <DropdownField
                label="Tháng"
                value={selectedMonth}
                options={MONTH_OPTION_ITEMS}
                onChange={(month) => setSelectedMonth(month)}
              />
            )}

            {viewMode === "week" && (
              <DropdownField
                label="Tuần (Thứ 2 - Chủ nhật)"
                value={selectedWeek}
                options={WEEK_OPTION_ITEMS}
                onChange={(week) => setSelectedWeek(week)}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.closeButton]}
                onPress={() => setIsFilterOpen(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.applyButton]}
                onPress={handleApplyFilter}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  filterWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  filterSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  filterSummaryLabel: {
    fontSize: 13,
    color: AppColors.gray600,
    fontWeight: "500",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
    marginHorizontal: 8,
  },
  filterSummaryText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: "600",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  kpiCard: {
    width: (screenWidth - 48) / 2,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  kpiCardFullWidth: {
    width: "100%",
  },
  kpiContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  kpiTextContainer: {
    flex: 1,
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.textWhite,
    marginBottom: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  kpiIconContainer: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  analyticsSection: {
    gap: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  barChartCard: {
    width: "100%",
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  pieChartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  packageList: {
    marginTop: 24,
    gap: 12,
  },
  packageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: AppColors.gray50,
  },
  packageItemSelected: {
    backgroundColor: `${AppColors.primary}15`,
  },
  packageItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  packageColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textPrimary,
  },
  packageBuyers: {
    fontSize: 12,
    color: AppColors.gray500,
  },
  packagePercentage: {
    fontSize: 14,
    color: AppColors.gray600,
  },
  barChartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  sessionStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
  },
  sessionStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  revenueSection: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 32,
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  revenueCard: {
    flex: 2,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: `${AppColors.primary}33`,
  },
  revenueTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  revenueSubtitle: {
    fontSize: 14,
    color: AppColors.gray600,
    marginBottom: 24,
  },
  revenueGrid: {
    flexDirection: "column",
    gap: 12,
  },
  revenueItem: {
    width: "100%",
    backgroundColor: AppColors.gray50,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  revenueItemLabel: {
    fontSize: 12,
    color: AppColors.gray600,
    marginBottom: 8,
  },
  revenueItemValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.textPrimary,
  },
  studentTableSession: {
    paddingHorizontal: 16,
  },
  studentTableCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentTableTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  tableScrollContainer: {
    paddingBottom: 8,
  },
  table: {
    gap: 0,
    minWidth: 860,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    gap: 8,
  },
  tableHeaderCell: {
    paddingHorizontal: 8,
  },
  tableHeaderCellStudent: {
    width: 200,
  },
  tableHeaderCellPackage: {
    width: 180,
  },
  tableHeaderCellSessions: {
    width: 100,
  },
  tableHeaderCellCompleted: {
    width: 120,
  },
  tableHeaderCellRescheduled: {
    width: 80,
  },
  tableHeaderCellCancelled: {
    width: 80,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.gray600,
  },
  tableHeaderCenter: {
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
    alignItems: "center",
    gap: 8,
  },
  tableRowCell: {
    paddingHorizontal: 8,
  },
  tableRowCellStudent: {
    width: 200,
  },
  tableRowCellPackage: {
    width: 180,
  },
  tableRowCellSessions: {
    width: 100,
  },
  tableRowCellCompleted: {
    width: 120,
  },
  tableRowCellRescheduled: {
    width: 80,
  },
  tableRowCellCancelled: {
    width: 80,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  studentAvatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textWhite,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textPrimary,
  },
  studentPhone: {
    fontSize: 12,
    color: AppColors.gray600,
  },
  tableCell: {
    fontSize: 14,
    color: AppColors.gray700,
  },
  tableCellCenter: {
    textAlign: "center",
    alignItems: "center",
  },
  tableCellBold: {
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  tableCellEmpty: {
    fontSize: 14,
    color: AppColors.gray500,
    textAlign: "center",
  },
  filterModalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterModalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  filterModalCard: {
    width: "88%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  selectorBlock: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  dropdownDisplay: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValueText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: "500",
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    maxHeight: 200,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  dropdownOptionTextActive: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: "#ffffff",
  },
  applyButton: {
    backgroundColor: AppColors.primary,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  completedBadge: {
    backgroundColor: `${AppColors.success}33`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.success,
  },
  rescheduledText: {
    fontSize: 14,
    color: AppColors.yellow,
  },
  cancelledText: {
    fontSize: 14,
    color: AppColors.error,
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: AppColors.gray500,
  },
});
