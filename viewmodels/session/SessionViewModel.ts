import { AppDispatch } from "@/lib/redux/store";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";
import { getAllSessions, cancelSession as cancelSessionThunk, ICancelSessionRequest, IRescheduleSessionRequest } from "@/features/booking/bookingThunk";
import { BaseViewModel } from "../shared/BaseViewModel";
import {
    SessionState,
    setSessions,
    setLoading as setSessionLoading,
    setError as setSessionError,
    setSuccess as setSessionSuccess,
    setSelectedStatus,
    setIsRefreshing,
    setStatusCount,
    setSessionDetail,
} from "@/features/session/sessionSlice";
import {
    Clock,
    Calendar,
    CheckCircle,
    Navigation,
    PlayCircle,
    RefreshCw,
    X,
    LucideIcon,
} from "lucide-react-native";
import { ISessionDetailDTO, ISessionRouteDetai } from "@/models/session/session.type";
import { getSessionDetail, rejectRoute, rescheduleSession } from "@/features/session/sessionThunk";
import { saveSessionRoutes } from "@/features/session/sessionThunk";
export type SessionStatusFilter = SessionStatus | "all";


const STATUS_LABELS: Record<SessionStatus, string> = {
    [SessionStatus.Planning]: "Lên lộ trình",
    [SessionStatus.Upcoming]: "Sắp diễn ra",
    [SessionStatus.InProgress]: "Đang diễn ra",
    [SessionStatus.Completed]: "Đã hoàn thành",
    [SessionStatus.Reschedule]: "Đổi lịch",
    [SessionStatus.Cancelled]: "Đã hủy",
};

export class SessionViewModel extends BaseViewModel<SessionState> {
    private initialized = false;

    constructor(dispatch: AppDispatch, getCurrentState: () => SessionState) {
        super(dispatch, getCurrentState);
    }



    private getCurrentSelectedStatus(): SessionStatus | "" {
        return this.getCurrentState().selectedStatus ?? "" as SessionStatus | "";
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        await this.getBookingSessions();
    }

    async changeStatus(status: SessionStatus | ""): Promise<void> {
        this.dispatch(setSelectedStatus(status as SessionStatus | ""));
        await this.getBookingSessions();
    }

    private parseSessionStatus(status: string | SessionStatus): SessionStatus {
        if (typeof status === 'number') {
            return status as SessionStatus;
        }

        const statusMap: Record<string, SessionStatus> = {
            'Planning': SessionStatus.Planning,
            'Upcoming': SessionStatus.Upcoming,
            'InProgress': SessionStatus.InProgress,
            'Completed': SessionStatus.Completed,
            'Reschedule': SessionStatus.Reschedule,
            'Cancelled': SessionStatus.Cancelled,
        };

        return statusMap[status] ?? SessionStatus.Planning;
    }


    async getAllSessions(status?: SessionStatus): Promise<IBookingSession[]> {
        const result = await this.dispatch(getAllSessions(status ? { status } : undefined)).unwrap();
        return result?.value ?? [];
    }
    async getSessionDetail(sessionId: string): Promise<ISessionDetailDTO> {
        const sessionDetail = await this.executeAsync<ISessionDetailDTO>(
            async () => {
                const result = await this.dispatch(getSessionDetail({ sessionId })).unwrap();
                const detail = result?.value ?? {} as ISessionDetailDTO;
                return detail;
            },
            (sessionDetail) => {
                const normalizedStatus =
                    sessionDetail.status && typeof sessionDetail.status === "string"
                        ? this.parseSessionStatus(sessionDetail.status) as any
                        : sessionDetail.status;

                // Không mutate trực tiếp object (có thể là read-only từ Redux)
                const normalizedDetail: ISessionDetailDTO = {
                    ...sessionDetail,
                    status: normalizedStatus,
                };

                this.dispatch(setSessionDetail(normalizedDetail));
            },
        );
        return sessionDetail ?? {} as ISessionDetailDTO;
    }

    async saveSessionRoutes(sessionId: string, routes: ISessionRouteDetai): Promise<boolean> {
        const result = await this.executeAsync<boolean>(
            async () => {
                const response = await this.dispatch(saveSessionRoutes({ sessionId, body: routes })).unwrap();
                return response?.value ?? false;
            },
        );
        return result ?? false;
    }



    async rejectRoute(sessionId: string): Promise<boolean> {
        const result = await this.executeAsync<boolean>(
            async () => {
                const response = await this.dispatch(rejectRoute({ sessionId })).unwrap();
                return response?.value ?? false;
            },
        );
        return result ?? false;
    }

    async refreshSessions(): Promise<void> {
        this.dispatch(setIsRefreshing(true));
        try {
            await this.getBookingSessions();
        } finally {
            this.dispatch(setIsRefreshing(false));
        }
    }

    async getBookingSessions(): Promise<IBookingSession[]> {
        const sessions = await this.executeAsync<IBookingSession[]>(
            async () => {
                const result = await this.dispatch(getAllSessions()).unwrap();
                return result?.value ?? [];
            },
            (sessions) => {
                this.dispatch(setSessions(sessions));
                this.dispatch(setStatusCount({ status: this.getCurrentSelectedStatus() as SessionStatus | "", count: sessions.length }));
            },
            undefined,
            {
                setLoading: setSessionLoading,
                setSuccess: setSessionSuccess,
                setError: setSessionError,
            }
        );

        return sessions ?? [];
    }
    async handleCancelSession(sessionId: string, note: string): Promise<boolean> {
        if (!sessionId) {
            console.warn("⚠️ Không có sessionId để hủy buổi tập");
            return false;
        }

        const payload: ICancelSessionRequest = {
            note: note,
        };

        const result = await this.executeAsync<boolean>(
            async () => {
                const response = await this.dispatch(
                    cancelSessionThunk({ sessionId, cancelData: payload })
                ).unwrap();

                if (typeof response === "boolean") {
                    return response;
                }

                return (response as any)?.value ?? false;
            },
            async () => {
                await this.getBookingSessions();
            }
        );
        return result ?? false;
    }

    getStatusLabel(status: SessionStatusFilter): string {
        if (status === "all") return "Tất cả";
        const parsedStatus = typeof status === 'string' ? this.parseSessionStatus(status) : status;
        return STATUS_LABELS[parsedStatus] ?? "Không xác định";
    }

    formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    }


    getStatusColor(status: SessionStatus | string): string {
        const parsedStatus = this.parseSessionStatus(status);
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

    getStatusText(status: SessionStatus | string): string {
        const parsedStatus = this.parseSessionStatus(status);
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

    getStatusIcon(status: SessionStatus | string): LucideIcon {
        const parsedStatus = this.parseSessionStatus(status);
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

    async rescheduleSession(sessionId: string, rescheduleData: IRescheduleSessionRequest): Promise<boolean> {
        const result = await this.executeAsync<boolean>(
            async () => {
                const response = await this.dispatch(rescheduleSession({ sessionId, rescheduleData })).unwrap();
                return response?.value ?? false;
            },
        );
        return result ?? false;
    }
}