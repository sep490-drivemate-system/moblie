import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Navigation,
  List,
  PlayCircle,
  RefreshCw,
} from "lucide-react-native";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";
import { AppColors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  getAllSessions,
} from "@/features/booking/bookingThunk";
import { ROUTES } from "@/constants/routes";
import HeaderList from "@/components/Commons/HeaderList";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { SessionViewModel } from "@/viewmodels/session/SessionViewModel";
import { RootState } from "@/lib/redux/store";

export default function RentalScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedTab, setSelectedTab] = useState<
    | "all"
    | SessionStatus
  >("all");

  const [sessions, setSessions] = useState<IBookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, sessionViewModel] = useViewModel<RootState["session"], SessionViewModel>(SessionViewModel, (state) => state.session);

  // Helper function to parse status from string to enum
  const parseSessionStatus = (status: string | SessionStatus | undefined): SessionStatus | undefined => {
    if (!status) return undefined;
    if (typeof status === 'number') return status as SessionStatus;

    const statusMap: Record<string, SessionStatus> = {
      'Planning': SessionStatus.Planning,
      'Upcoming': SessionStatus.Upcoming,
      'InProgress': SessionStatus.InProgress,
      'Completed': SessionStatus.Completed,
      'Reschedule': SessionStatus.Reschedule,
      'Cancelled': SessionStatus.Cancelled,
    };

    return statusMap[status] ?? undefined;
  };

  // Refresh sessions
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await sessionViewModel.getAllSessions();
    setIsRefreshing(false);
  }, [sessionViewModel]);

  // Fetch sessions only when tab is focused (lazy loading)
  useFocusEffect(
    useCallback(() => {
      sessionViewModel.getAllSessions().then((sessions) => setSessions(sessions));
    }, [sessionViewModel])
  );

  // const handleRescheduleSession = async () => {
  //   if (!selectedSession?.id) {
  //     Alert.alert("Lỗi", "Không tìm thấy thông tin buổi tập lái");
  //     return;
  //   }

  //   if (!rescheduleNote.trim()) {
  //     Alert.alert("Lỗi", "Vui lòng nhập lý do đổi lịch thuê xe");
  //     return;
  //   }

  //   try {
  //     setIsRescheduling(true);

  //     const rescheduleData: IRescheduleSessionRequest = {
  //       note: rescheduleNote.trim()

  //     };

  //     await dispatch(rescheduleSession({ sessionId: selectedSession.id, rescheduleData })).unwrap();

  //     setShowRescheduleModal(false);
  //     setRescheduleNote("");
  //     setSelectedRescheduleReasons([]);
  //     setSelectedSession(null);

  //     Alert.alert(
  //       "Thành công",
  //       "Đã gửi yêu cầu đổi lịch thành công. Vui lòng chờ xác nhận từ giảng viên.",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => fetchSessions() // Refresh data
  //         }
  //       ]
  //     );
  //   } catch (error) {
  //     console.error("Error rescheduling session:", error);
  //     Alert.alert("Lỗi", error as string || "Không thể đổi lịch buổi tập lái");
  //   } finally {
  //     setIsRescheduling(false);
  //   }
  // };

  // Filter sessions based on enum status
  const getFilteredSessions = () => {
    if (!Array.isArray(sessions)) {
      return [];
    }
    if (selectedTab === "all") {
      return sessions;
    }
    return sessions.filter((session) => {
      const sessionStatus = parseSessionStatus(session.status);
      return sessionStatus === selectedTab;
    });
  };

  const getStatusColor = (status: SessionStatus | string) => {
    const parsedStatus = parseSessionStatus(status);
    switch (parsedStatus) {
      case SessionStatus.Planning:
        return "#3b82f6";
      case SessionStatus.Upcoming:
        return "#10b981";
      case SessionStatus.InProgress:
        return "#10b981";
      case SessionStatus.Completed:
        return "#6b7280";
      case SessionStatus.Reschedule:
        return "#f59e0b";
      case SessionStatus.Cancelled:
        return "#9ca3af";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: SessionStatus | string) => {
    const parsedStatus = parseSessionStatus(status);
    switch (parsedStatus) {
      case SessionStatus.Planning:
        return "Lên lộ trình";
      case SessionStatus.Upcoming:
        return "Sắp diễn ra";
      case SessionStatus.InProgress:
        return "Đang diễn ra";
      case SessionStatus.Completed:
        return "Hoàn thành";
      case SessionStatus.Reschedule:
        return "Đổi lịch";
      case SessionStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status: SessionStatus | string) => {
    const parsedStatus = parseSessionStatus(status);
    switch (parsedStatus) {
      case SessionStatus.Planning:
        return Navigation;
      case SessionStatus.Upcoming:
        return Calendar;
      case SessionStatus.InProgress:
        return PlayCircle;
      case SessionStatus.Completed:
        return CheckCircle;
      case SessionStatus.Reschedule:
        return RefreshCw;
      case SessionStatus.Cancelled:
        return X;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const filteredSessions = getFilteredSessions();

  return (
    <View style={styles.container}>
      <HeaderList
        title="Danh sách buổi huấn luyện"
      />
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, selectedTab === "all" && styles.activeTab]}
            onPress={() => setSelectedTab("all")}
          >
            <View style={styles.tabContent}>
              <List
                size={16}
                color={selectedTab === "all" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "all" && styles.activeTabText,
                ]}
              >
                Tất cả
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === SessionStatus.Planning && styles.activeTab]}
            onPress={() => setSelectedTab(SessionStatus.Planning)}
          >
            <View style={styles.tabContent}>
              <Navigation
                size={16}
                color={selectedTab === SessionStatus.Planning ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === SessionStatus.Planning && styles.activeTabText,
                ]}
              >
                Lên lộ trình (
                {Array.isArray(sessions)
                  ? sessions.filter(
                    (session) =>
                      parseSessionStatus(session.status) === SessionStatus.Planning
                  ).length
                  : 0}
                )
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === SessionStatus.Upcoming && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(SessionStatus.Upcoming)}
          >
            <View style={styles.tabContent}>
              <Calendar
                size={16}
                color={selectedTab === SessionStatus.Upcoming ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === SessionStatus.Upcoming && styles.activeTabText,
                ]}
              >
                Sắp diễn ra (
                {Array.isArray(sessions)
                  ? sessions.filter(
                    (session) =>
                      parseSessionStatus(session.status) === SessionStatus.Upcoming
                  ).length
                  : 0}
                )
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === SessionStatus.InProgress && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(SessionStatus.InProgress)}
          >
            <View style={styles.tabContent}>
              <PlayCircle
                size={16}
                color={selectedTab === SessionStatus.InProgress ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === SessionStatus.InProgress && styles.activeTabText,
                ]}
              >
                Đang diễn ra (
                {Array.isArray(sessions)
                  ? sessions.filter(
                    (session) =>
                      parseSessionStatus(session.status) === SessionStatus.InProgress
                  ).length
                  : 0}
                )
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === SessionStatus.Completed && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(SessionStatus.Completed)}
          >
            <View style={styles.tabContent}>
              <CheckCircle
                size={16}
                color={selectedTab === SessionStatus.Completed ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === SessionStatus.Completed && styles.activeTabText,
                ]}
              >
                Hoàn thành (
                {Array.isArray(sessions)
                  ? sessions.filter(
                    (session) =>
                      parseSessionStatus(session.status) === SessionStatus.Completed
                  ).length
                  : 0}
                )
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === SessionStatus.Reschedule && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(SessionStatus.Reschedule)}
          >
            <View style={styles.tabContent}>
              <RefreshCw
                size={16}
                color={selectedTab === SessionStatus.Reschedule ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === SessionStatus.Reschedule && styles.activeTabText,
                ]}
              >
                Đổi lịch (
                {Array.isArray(sessions)
                  ? sessions.filter(
                    (session) =>
                      parseSessionStatus(session.status) === SessionStatus.Reschedule
                  ).length
                  : 0}
                )
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === SessionStatus.Cancelled && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(SessionStatus.Cancelled)}
          >
            <View style={styles.tabContent}>
              <X
                size={16}
                color={selectedTab === SessionStatus.Cancelled ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === SessionStatus.Cancelled && styles.activeTabText,
                ]}
              >
                Đã hủy (
                {Array.isArray(sessions)
                  ? sessions.filter(
                    (session) =>
                      parseSessionStatus(session.status) === SessionStatus.Cancelled
                  ).length
                  : 0}
                )
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
      >
        {isLoading && sessions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : filteredSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color={AppColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedTab === "all"
                ? "Chưa có buổi huấn luyện nào"
                : selectedTab === SessionStatus.Planning
                  ? "Chưa có buổi huấn luyện cần lên lộ trình"
                  : selectedTab === SessionStatus.Upcoming
                    ? "Chưa có buổi huấn luyện sắp diễn ra"
                    : selectedTab === SessionStatus.InProgress
                      ? "Chưa có buổi huấn luyện đang diễn ra"
                      : selectedTab === SessionStatus.Completed
                        ? "Chưa có buổi huấn luyện hoàn thành"
                        : selectedTab === SessionStatus.Reschedule
                          ? "Chưa có buổi huấn luyện cần đổi lịch"
                          : selectedTab === SessionStatus.Cancelled
                            ? "Chưa có buổi huấn luyện đã hủy"
                            : "Chưa có buổi huấn luyện nào"}
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => {
            const StatusIcon = getStatusIcon(session.status);
            return (
              <View key={session.id} style={styles.bookingCard}>
                <LinearGradient
                  colors={["#ffffff", "#f8fafc"]}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.packageInfoContainer}>
                      {session.packageName && (
                        <View style={styles.packageNameContainer}>
                          <Text style={styles.packageNameText}>
                            {session.packageName}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(session.status) + "15",
                        },
                      ]}
                    >
                      <StatusIcon
                        size={16}
                        color={getStatusColor(session.status)}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(session.status) },
                        ]}
                      >
                        {getStatusText(session.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>
                        {formatDate(session.date)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>
                        {session.startTime} - {session.endTime} (
                        {session.duration} giờ)
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#6b7280" strokeWidth={2} />
                      <View style={styles.locationContainer}>
                        <Text style={styles.detailText} numberOfLines={2}>
                          Điểm đón: {session.displayStartLocationName}
                        </Text>
                      </View>
                    </View>
                    {session.displayEndLocationName && (
                      <View style={styles.detailRow}>
                        <MapPin size={16} color="#6b7280" strokeWidth={2} />
                        <View style={styles.locationContainer}>
                          <Text style={styles.detailText} numberOfLines={2}>
                            Điểm thả: {session.displayEndLocationName}
                          </Text>
                        </View>
                      </View>
                    )}
                    {session.vehicleName && (
                      <View style={styles.detailRow}>
                        <FileText size={16} color="#6b7280" strokeWidth={2} />
                        <Text style={styles.detailText}>
                          Xe: {session.vehicleName}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.routeButton]}
                      onPress={() => router.push({
                        pathname: ROUTES.DRIVING_SESSION_DETAIL,
                        params: {
                          sessionId: session.id,

                        },
                      })}
                    >
                      <Text style={styles.routeButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>

                    {/* {(session.status === SessionStatus.Pending || session.status === SessionStatus.Confirmed) && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rescheduleButton]}
                          onPress={() => {
                            setSelectedSession(session);
                            setRescheduleNote("");
                            setSelectedRescheduleReasons([]);
                            setShowRescheduleModal(true);
                          }}
                        >
                          <Text style={styles.rescheduleButtonText}>Đổi lịch</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.cancelButton]}
                          onPress={() => {
                            setSelectedSession(session);
                            setCancelNote("");
                            setSelectedReasons([]);
                            setShowCancelModal(true);
                          }}
                        >
                          <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                      </>
                    )} */}
                  </View>
                </LinearGradient>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cancel Modal */}
      {/* <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowCancelModal(false);
          setCancelNote("");
          setSelectedReasons([]);
          setSelectedSession(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
        }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Xác nhận hủy thuê xe</Text>

                {selectedSession && (
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionInfoTitle}>Thông tin buổi thuê:</Text>
                    <Text style={styles.sessionInfoText}>
                      Học viên: {selectedSession.noviceDriverName}
                    </Text>
                    <Text style={styles.sessionInfoText}>
                      Ngày: {new Date(selectedSession.date).toLocaleDateString("vi-VN")}
                    </Text>
                    <Text style={styles.sessionInfoText}>
                      Thời gian: {selectedSession.startTime} - {selectedSession.endTime}
                    </Text>
                  </View>
                )}

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Thời điểm hủy</Text>
                  <Text style={styles.modalValue}>
                    {new Date().toLocaleString("vi-VN")}
                  </Text>
                </View>

                <Text style={styles.modalSectionTitle}>Lý do hủy thuê xe</Text>

                <View style={styles.reasonList}>
                  {cancellationReasons.map((reason) => {
                    const selected = selectedReasons.includes(reason);
                    return (
                      <TouchableOpacity
                        key={reason}
                        style={styles.reasonRow}
                        onPress={() => toggleReason(reason)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selected && styles.checkboxSelected,
                          ]}
                        >
                          {selected ? (
                            <Text style={styles.checkboxTick}>✓</Text>
                          ) : null}
                        </View>
                        <Text style={styles.reasonText}>{reason}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.modalSectionTitle}>Ghi chú chi tiết</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Nhập lý do chi tiết để hủy thuê xe..."
                  placeholderTextColor="#9ca3af"
                  value={cancelNote}
                  onChangeText={setCancelNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => {
                      setShowCancelModal(false);
                      setCancelNote("");
                      setSelectedReasons([]);
                      setSelectedSession(null);
                    }}
                  >
                    <Text style={styles.modalCancelBtnText}>Đóng</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalConfirmBtn,
                      (!cancelNote.trim() || isCancelling) && { opacity: 0.5 },
                    ]}
                    disabled={!cancelNote.trim() || isCancelling}
                    onPress={handleCancelSession}
                  >
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalConfirmBtnText}>Xác nhận hủy thuê</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}

      {/* Reschedule Modal */}
      {/* <Modal
        visible={showRescheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowRescheduleModal(false);
          setRescheduleNote("");
          setSelectedRescheduleReasons([]);
          setSelectedSession(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
        }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Xác nhận dời lịch</Text>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Thời điểm yêu cầu</Text>
                  <Text style={styles.modalValue}>
                    {new Date().toLocaleString("vi-VN")}
                  </Text>
                </View>

                <Text style={styles.modalSectionTitle}>Lý do dời lịch</Text>

                <View style={styles.reasonList}>
                  {cancellationReasons.map((reason) => {
                    const selected = selectedRescheduleReasons.includes(reason);
                    return (
                      <TouchableOpacity
                        key={reason}
                        style={styles.reasonRow}
                        onPress={() => toggleRescheduleReason(reason)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selected && styles.checkboxSelected,
                          ]}
                        >
                          {selected ? (
                            <Text style={styles.checkboxTick}>✓</Text>
                          ) : null}
                        </View>
                        <Text style={styles.reasonText}>{reason}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.modalSectionTitle}>Ghi chú chi tiết</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Nhập lý do chi tiết để đổi lịch buổi tập lái..."
                  placeholderTextColor="#9ca3af"
                  value={rescheduleNote}
                  onChangeText={setRescheduleNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => {
                      setShowRescheduleModal(false);
                      setRescheduleNote("");
                      setSelectedRescheduleReasons([]);
                      setSelectedSession(null);
                    }}
                  >
                    <Text style={styles.modalCancelBtnText}>Đóng</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rescheduleConfirmBtn,
                      (!rescheduleNote.trim() || isRescheduling) && { opacity: 0.5 },
                    ]}
                    disabled={!rescheduleNote.trim() || isRescheduling}
                    onPress={handleRescheduleSession}
                  >
                    {isRescheduling ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalConfirmBtnText}>Xác nhận đổi lịch</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingTop: 50,
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
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
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
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -25,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 1,
  },
  tabsScrollContent: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  bookingCard: {
    borderRadius: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  instructorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  instructorAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  packageInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  packageNameContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  packageNameText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
    textAlign: "center",
  },
  routeButton: {
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  routeButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fbbf24",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    marginBottom: 2,
  },
  routeSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  routeText: {
    fontSize: 13,
    color: "#15803d",
    lineHeight: 18,
    marginBottom: 8,
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  notesText: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 40,
  },
  acceptButton: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rejectButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  viewButton: {
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  rescheduleButton: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rescheduleButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    marginTop: 8,
  },
  reasonList: {
    marginBottom: 16,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  checkboxTick: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  reasonText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#fff",
    minHeight: 80,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#6b7280",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalConfirmBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  rescheduleConfirmBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  // Session info styles
  sessionInfo: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  sessionInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  sessionInfoText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
});
