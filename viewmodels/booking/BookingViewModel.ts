import { cancelPackageBooking, getMyPackages } from "@/features/booking/bookingThunk";
import { buyPackage } from "@/features/booking/bookingThunk";
import { BookingStatus, IGetUserPackages } from "@/models/package/user-package";
import { IBuyPackageRequest, IMyPackges } from "@/models/package/package";
import { AppColors } from "@/constants/Colors";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { router } from "expo-router";
import { IInstructorPackages } from "@/models/instructor/instructor.type";
import { ROUTES } from "@/constants/routes";
import { BaseViewModel } from "../shared/BaseViewModel";
import { PaginatedGeneric } from "@/models/generic/genericResponse";
import { IEmergencyContact } from "@/models/address/emergency-contact";
import { getEmergencyContact } from "@/features/emergency-contact/emergency-contactThunk";

type RefundComputationInput = {
    status: string | BookingStatus;
    purchaseDate: string;
    price?: number;
    totalHours: number;
    usedHours: number;
};

type RefundDisplay = {
    text: string;
    color: string;
    reason: string;
    isEligible: boolean;
    amount: number;
};

type StatusOption = {
    key: BookingStatus;
    label: string;
};

export class BookingViewModel extends BaseViewModel<RootState["booking"]> {
    constructor(dispatch: AppDispatch, getCurrentState: () => RootState["booking"]) {
        super(dispatch, getCurrentState);
    }

    async fetchMyPackages(payload: IGetUserPackages): Promise<PaginatedGeneric<IMyPackges> | null> {
        const result = await this.executeAsync(async () => {
            const response = await this.dispatch(getMyPackages(payload)).unwrap();
            return (response as any).value || response;
        });
        const paged: PaginatedGeneric<IMyPackges> | null = (result as any)?.value || result || null;
        return paged;
    }

    async fetchEmergencyContact(payload: { id: string }): Promise<IEmergencyContact[] | null> {
        const result = await this.executeAsync(async () => {
            const response = await this.dispatch(getEmergencyContact(payload)).unwrap();
            return (response as any).value || response;
        });
        const emergencyContact: IEmergencyContact[] | null = (result as any)?.value || result || null;
        return emergencyContact;
    }

    getStatusOptions(): StatusOption[] {
        return [
            { key: BookingStatus.All, label: "Tất cả" },
            { key: BookingStatus.Purchased, label: "Đã mua" },
            { key: BookingStatus.InUse, label: "Đang sử dụng" },
            { key: BookingStatus.Used, label: "Đã sử dụng" },
            { key: BookingStatus.CancellationWithRefund, label: "Hủy có hoàn trả" },
            {
                key: BookingStatus.CancellationWithoutRefund,
                label: "Hủy không hoàn trả",
            },
        ];
    }

    filterPackages(
        packages: IMyPackges[],
        status: BookingStatus
    ): IMyPackges[] {
        if (status === BookingStatus.All) {
            return packages;
        }
        return packages.filter((pkg) => {
            const pkgStatus = this.parseBookingStatus(pkg.bookingStatus as any);
            return pkgStatus === status;
        });
    }

    calculateStatusCounts(packages: IMyPackges[]): Record<number, number> {
        const counts: Record<number, number> = {
            [BookingStatus.All]: packages.length,
            [BookingStatus.Purchased]: 0,
            [BookingStatus.InUse]: 0,
            [BookingStatus.Used]: 0,
            [BookingStatus.CancellationWithRefund]: 0,
            [BookingStatus.CancellationWithoutRefund]: 0,
        };

        packages.forEach((pkg) => {
            const pkgStatus = this.parseBookingStatus(pkg.bookingStatus as any);
            if (counts[pkgStatus] !== undefined) {
                counts[pkgStatus] += 1;
            }
        });

        return counts;
    }

    getStatusColor(status: BookingStatus | string): string {
        const parsedStatus = this.parseBookingStatus(status);
        switch (parsedStatus) {
            case BookingStatus.Purchased:
                return AppColors.yellow;
            case BookingStatus.InUse:
                return AppColors.primary;
            case BookingStatus.Used:
                return AppColors.gradientMiddle;
            case BookingStatus.CancellationWithRefund:
                return AppColors.blue;
            case BookingStatus.CancellationWithoutRefund:
                return AppColors.red;
            default:
                return AppColors.gray;
        }
    }

    private parseBookingStatus(status: string | BookingStatus): BookingStatus {
        if (typeof status === 'number') {
            return status as BookingStatus;
        }

        const statusMap: Record<string, BookingStatus> = {
            'Purchased': BookingStatus.Purchased,
            'InUse': BookingStatus.InUse,
            'Used': BookingStatus.Used,
            'CancellationWithRefund': BookingStatus.CancellationWithRefund,
            'CancellationWithoutRefund': BookingStatus.CancellationWithoutRefund,
        };

        return statusMap[status] ?? BookingStatus.Purchased;
    }

    getStatusText(status: BookingStatus | string): string {
        const parsedStatus = this.parseBookingStatus(status);
        switch (parsedStatus) {
            case BookingStatus.Purchased:
                return "Đã mua";
            case BookingStatus.InUse:
                return "Đang sử dụng";
            case BookingStatus.Used:
                return "Đã sử dụng";
            case BookingStatus.CancellationWithRefund:
                return "Hủy có hoàn trả";
            case BookingStatus.CancellationWithoutRefund:
                return "Hủy không hoàn trả";
            default:
                return "Không xác định";
        }
    }

    getProgressPercentage(percentInUse: number): number {
        return Math.min(percentInUse, 100);
    }

    formatPurchaseDate(dateString: string): string {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return `Mua ngày: ${formattedDate} lúc ${formattedTime}`;
    }

    handleBookNewSession(packageId: string) {
        router.push({
            pathname: "/(main)/(no-tabs)/booking",
            params: {
                packageId: packageId,
            },
        });
    }

    async handleConfirmPurchase(options: {
        instructorId: string;
        selectedPackage: IInstructorPackages;
        selectedVehicleId?: string | null;
    }): Promise<void> {
        const { instructorId, selectedPackage, selectedVehicleId } = options;

        const payload: IBuyPackageRequest = {
            durationWhenBought: selectedPackage.duration,
            priceAtBuyingTime: selectedPackage.price,
            carId: selectedVehicleId ? selectedVehicleId : null,
            packageId: selectedPackage.id,
            instructorId,
        };

        await this.dispatch(buyPackage(payload)).unwrap();

        router.push({
            pathname: ROUTES.TRANSACTION_SUCCESS,
            params: {
                instructorId,
                packageId: selectedPackage.id,
                vehicleId: selectedVehicleId || "",
            },
        });
    }

    private daysSince(dateStr: string): number {
        const timestamp = new Date(dateStr).getTime();
        if (Number.isNaN(timestamp)) {
            return 0;
        }
        const diff = Date.now() - timestamp;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    private computeRefundAmount(info: RefundComputationInput): {
        eligible: boolean;
        amount: number;
        reason: string;
    } {
        const days = this.daysSince(info.purchaseDate);
        const price = typeof info.price === "number" ? info.price : 0;

        if (days >= 30) {
            return {
                eligible: false,
                amount: 0,
                reason: "Đã quá 30 ngày kể từ ngày mua gói",
            };
        }

        if (info.usedHours <= 0) {
            return {
                eligible: true,
                amount: price,
                reason: "Hoàn 100% vì chưa sử dụng giờ nào",
            };
        }

        if (info.totalHours <= 0) {
            return {
                eligible: false,
                amount: 0,
                reason: "Không xác định được tổng số giờ của gói",
            };
        }

        const unusedHours = Math.max(info.totalHours - info.usedHours, 0);
        const perHour = price / info.totalHours;
        const refundAmount = Math.max(Math.floor(perHour * unusedHours), 0);

        if (refundAmount <= 0) {
            return {
                eligible: false,
                amount: 0,
                reason: "Không còn giờ chưa sử dụng để hoàn tiền",
            };
        }

        return {
            eligible: true,
            amount: refundAmount,
            reason: "Hoàn theo số giờ chưa sử dụng (< 30 ngày)",
        };
    }

    renderRefundInfo(info: RefundComputationInput): RefundDisplay {
        const evaluation = this.computeRefundAmount(info);

        if (!evaluation.eligible) {
            return {
                text: `Không đủ điều kiện hoàn tiền (${evaluation.reason})`,
                color: AppColors.error,
                reason: evaluation.reason,
                isEligible: false,
                amount: 0,
            };
        }

        return {
            text: `Số tiền dự kiến hoàn: ${evaluation.amount.toLocaleString("vi-VN")}₫`,
            color: AppColors.primary,
            reason: evaluation.reason,
            isEligible: true,
            amount: evaluation.amount,
        };
    }

    async cancelPackageBooking(bookingId: string): Promise<boolean> {

        const result = await this.executeAsync(async () => {
            const response = await this.dispatch(cancelPackageBooking({ bookingId })).unwrap();
            return (response as any).value || response;
        });
        return result ?? false;
    }
}
