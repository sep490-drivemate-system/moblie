import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseState } from '@/models/generic/baseState';
import {
    IMyPackgesResponse,
} from '@/models/package/package';
import {
    IBookingSession,
    ISessionDetailResponse,
} from '@/models/booking/booking';
import {
    ISessionRoutes,
} from '@/models/route/route';
import {
    IInstructorSchedule,
    IInstructorBookedSession,
    IPolicy,
    IUserInfo,
} from './bookingThunk';
import {
    getMyPackages,
    getBookingSessions,
    getAllSessions,
    getSessionRoutes,
    getSessionDetail,
    getPolicies,
    createSession,
    saveSessionRoutes,
    addSessionLog,

    updateSessionStatus,
    submitFeedback,
} from './bookingThunk';
import {
    getInstructorSchedule,
    getInstructorBookedSessions,
} from '../schedule/scheduleThunk';

interface BookingState extends BaseState {
    // Packages
    myPackages: IMyPackgesResponse[];

    // Sessions
    bookingSessions: IBookingSession[];
    allSessions: IBookingSession[];
    sessionDetail: ISessionDetailResponse | null;
    sessionRoutes: ISessionRoutes[];

    // Instructor
    instructorSchedule: IInstructorSchedule[];
    instructorBookedSessions: IInstructorBookedSession[];

    // Policies
    policies: IPolicy[];

    // User Info
    userInfo: IUserInfo | null;

    // Operation states
    isCreatingSession: boolean;
    isSavingRoutes: boolean;
    isAddingLog: boolean;
    isCancellingSession: boolean;
    isReschedulingSession: boolean;
    isUpdatingStatus: boolean;
    isSubmittingFeedback: boolean;
    isCancellingBooking: boolean;
}

const initialState: BookingState = {
    // Base State
    isLoading: false,
    errorMessage: null,
    isSuccess: false,

    // Data
    myPackages: [],
    bookingSessions: [],
    allSessions: [],
    sessionDetail: null,
    sessionRoutes: [],
    instructorSchedule: [],
    instructorBookedSessions: [],
    policies: [],
    userInfo: null,

    // Operation states
    isCreatingSession: false,
    isSavingRoutes: false,
    isAddingLog: false,
    isCancellingSession: false,
    isReschedulingSession: false,
    isUpdatingStatus: false,
    isSubmittingFeedback: false,
    isCancellingBooking: false,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        // Clear actions
        clearSessionDetail: (state) => {
            state.sessionDetail = null;
        },
        clearSessionRoutes: (state) => {
            state.sessionRoutes = [];
        },
        clearError: (state) => {
            state.errorMessage = null;
        },
        clearSuccess: (state) => {
            state.isSuccess = false;
        },

        // Set user info
        setUserInfo: (state, action: PayloadAction<IUserInfo | null>) => {
            state.userInfo = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Get My Packages
        builder
            .addCase(getMyPackages.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getMyPackages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct array
                const response = action.payload as any;
                state.myPackages = Array.isArray(response) ? response : (response?.value || []);
            })
            .addCase(getMyPackages.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải danh sách gói';
            });

        // Get Booking Sessions
        builder
            .addCase(getBookingSessions.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getBookingSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct array
                const response = action.payload as any;
                state.bookingSessions = Array.isArray(response) ? response : (response?.value || []);
            })
            .addCase(getBookingSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải danh sách buổi học';
            });

        // Get All Sessions
        builder
            .addCase(getAllSessions.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getAllSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct array
                const response = action.payload as any;
                state.allSessions = Array.isArray(response) ? response : (response?.value || []);
            })
            .addCase(getAllSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải danh sách buổi học';
            });

        // Get Session Routes
        builder
            .addCase(getSessionRoutes.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getSessionRoutes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct array
                const response = action.payload as any;
                state.sessionRoutes = Array.isArray(response) ? response : (response?.value || []);
            })
            .addCase(getSessionRoutes.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải lộ trình';
            });

        // Get Session Detail
        builder
            .addCase(getSessionDetail.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getSessionDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct object
                const response = action.payload as any;
                state.sessionDetail = response?.value || response;
            })
            .addCase(getSessionDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải chi tiết buổi học';
            });

        // Get Instructor Schedule
        builder
            .addCase(getInstructorSchedule.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getInstructorSchedule.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct array
                const response = action.payload as any;
                state.instructorSchedule = Array.isArray(response) ? response : (response?.value || []);
            })
            .addCase(getInstructorSchedule.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải lịch trình';
            });

        // Get Instructor Booked Sessions
        builder
            .addCase(getInstructorBookedSessions.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getInstructorBookedSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct array
                const response = action.payload as any;
                state.instructorBookedSessions = Array.isArray(response) ? response : (response?.value || []);
            })
            .addCase(getInstructorBookedSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải danh sách buổi học đã đặt';
            });

        // Get Policies
        builder
            .addCase(getPolicies.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getPolicies.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse or direct array
                const response = action.payload as any;
                state.policies = Array.isArray(response) ? response : (response?.value || []);
            })
            .addCase(getPolicies.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tải chính sách';
            });

        // Create Session
        builder
            .addCase(createSession.pending, (state) => {
                state.isCreatingSession = true;
                state.errorMessage = null;
            })
            .addCase(createSession.fulfilled, (state) => {
                state.isCreatingSession = false;
                state.isSuccess = true;
            })
            .addCase(createSession.rejected, (state, action) => {
                state.isCreatingSession = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || 'Không thể tạo buổi học';
            });

        // Save Session Routes
        builder
            .addCase(saveSessionRoutes.pending, (state) => {
                state.isSavingRoutes = true;
                state.errorMessage = null;
            })
            .addCase(saveSessionRoutes.fulfilled, (state) => {
                state.isSavingRoutes = false;
                state.isSuccess = true;
            })
            .addCase(saveSessionRoutes.rejected, (state, action) => {
                state.isSavingRoutes = false;
                state.isSuccess = false;
                state.errorMessage = action.payload || 'Không thể lưu lộ trình';
            });

        // Add Session Log
        builder
            .addCase(addSessionLog.pending, (state) => {
                state.isAddingLog = true;
                state.errorMessage = null;
            })
            .addCase(addSessionLog.fulfilled, (state) => {
                state.isAddingLog = false;
                state.isSuccess = true;
            })
            .addCase(addSessionLog.rejected, (state, action) => {
                state.isAddingLog = false;
                state.isSuccess = false;
                state.errorMessage = action.payload || 'Không thể thêm log';
            });



        // Reschedule Session


        // Update Session Status
        builder
            .addCase(updateSessionStatus.pending, (state) => {
                state.isUpdatingStatus = true;
                state.errorMessage = null;
            })
            .addCase(updateSessionStatus.fulfilled, (state) => {
                state.isUpdatingStatus = false;
                state.isSuccess = true;
            })
            .addCase(updateSessionStatus.rejected, (state, action) => {
                state.isUpdatingStatus = false;
                state.isSuccess = false;
                state.errorMessage = action.payload || 'Không thể cập nhật trạng thái buổi tập lái';
            });

        // Submit Feedback
        builder
            .addCase(submitFeedback.pending, (state) => {
                state.isSubmittingFeedback = true;
                state.errorMessage = null;
            })
            .addCase(submitFeedback.fulfilled, (state) => {
                state.isSubmittingFeedback = false;
                state.isSuccess = true;
            })
            .addCase(submitFeedback.rejected, (state, action) => {
                state.isSubmittingFeedback = false;
                state.isSuccess = false;
                state.errorMessage = action.payload || 'Không thể gửi phản hồi';
            });

    },
});

export const {
    clearSessionDetail,
    clearSessionRoutes,
    clearError,
    clearSuccess,
    setUserInfo,
} = bookingSlice.actions;

export default bookingSlice.reducer;

