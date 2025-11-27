import { AppDispatch } from "@/lib/redux/store";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";
import { getAllSessions } from "@/features/booking/bookingThunk";
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

export type SessionStatusFilter = SessionStatus | "all";

export type NormalizedSession = IBookingSession;

const STATUS_LABELS: Record<SessionStatus, string> = {
    [SessionStatus.Planning]: "Lên lộ trình",
    [SessionStatus.Upcoming]: "Sắp diễn ra",
    [SessionStatus.InProgress]: "Đang diễn ra",
    [SessionStatus.Completed]: "Đã hoàn thành",
    [SessionStatus.Reschedule]: "Đổi lịch",
    [SessionStatus.Cancelled]: "Đã hủy",
};

const STATUS_COLORS: Record<SessionStatus, string> = {
    [SessionStatus.Planning]: "#facc15",
    [SessionStatus.Upcoming]: "#facc15",
    [SessionStatus.InProgress]: "#22c55e",
    [SessionStatus.Completed]: "#94a3b8",
    [SessionStatus.Reschedule]: "#3b82f6",
    [SessionStatus.Cancelled]: "#ef4444",
};

export class SessionViewModel extends BaseViewModel<SessionState> {
    private cache: NormalizedSession[] = [];
    private initialized = false;

    constructor(dispatch: AppDispatch, getCurrentState: () => SessionState) {
        super(dispatch, getCurrentState);
    }

    private normalizeStatus(status?: SessionStatus | "all"): SessionStatus | undefined {
        if (!status || status === "all") {
            return undefined;
        }
        return status;
    }

    private getCurrentSelectedStatus(): SessionStatus | "all" {
        return this.getCurrentState().selectedStatus ?? "all";
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        await this.loadSessions(this.getCurrentSelectedStatus());
    }

    async changeStatus(status: SessionStatus | "all"): Promise<void> {
        this.dispatch(setSelectedStatus(status));
        await this.loadSessions(status);
    }

    async refreshSessions(): Promise<void> {
        this.dispatch(setIsRefreshing(true));
        try {
            await this.loadSessions(this.getCurrentSelectedStatus());
        } finally {
            this.dispatch(setIsRefreshing(false));
        }
    }

    async loadSessions(status?: SessionStatus | "all"): Promise<IBookingSession[]> {
        const effectiveStatus = status ?? this.getCurrentSelectedStatus();
        const apiStatus = this.normalizeStatus(effectiveStatus);

        const sessions = await this.executeAsync<IBookingSession[]>(
            async () => {
                const result = await this.dispatch(getAllSessions(apiStatus ? { status: apiStatus } : undefined)).unwrap();
                return result?.value ?? [];
            },
            (sessions) => {
                this.cache = sessions;
                this.dispatch(setSessions(sessions));
                this.dispatch(setStatusCount({ status: effectiveStatus, count: sessions.length }));
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

    getStatusLabel(status: SessionStatusFilter): string {
        if (status === "all") return "Tất cả";
        return STATUS_LABELS[status] ?? "Không xác định";
    }

    getStatusIcon(status: SessionStatus): LucideIcon {
        switch (status) {
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
    }

    getStatusColor(status: SessionStatusFilter): string {
        if (status === "all") return "#64748b";
        return STATUS_COLORS[status] ?? "#94a3b8";
    }

    formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };
}