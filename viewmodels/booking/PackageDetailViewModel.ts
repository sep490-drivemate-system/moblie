import { useMemo } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { AppDispatch } from "@/lib/redux/store";
import { IUserInfo } from "@/models/user/user.type";
import { getUserById } from "@/features/user/userThunk";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";

export type PackageDetailData = {
    id: string;
    instructorId?: string;
    instructorAvatar?: string;
    packageName: string;
    totalHours: number;
    usedHours: number;
    remainingHours: number;
    purchaseDate: string;
    price?: number;
    status: string;
    carId?: string;
    carPrice?: number;
    roadTypes?: string[];
    drivingSkills?: string[];
};

export type PurchaseDateInfo = {
    date: string;
    time: string;
};

export type RefundEvaluation = {
    eligible: boolean;
    amount: number;
    reason: string;
};

export class PackageDetailViewModel {
    constructor(private dispatch: AppDispatch) { }

    parsePackageData(rawPackageData?: string | null): PackageDetailData | null {
        if (!rawPackageData) return null;
        try {
            const packageDataFromParams = JSON.parse(rawPackageData);
            return {
                id: packageDataFromParams.id,
                instructorId: packageDataFromParams.instructorId,
                instructorAvatar:
                    packageDataFromParams.avatarInstructor ||
                    "https://via.placeholder.com/60",
                packageName:
                    packageDataFromParams.namePackake ||
                    packageDataFromParams.namePackage ||
                    "Gói học lái xe",
                totalHours: packageDataFromParams.duration || 0,
                usedHours: packageDataFromParams.durationInUse || 0,
                remainingHours: packageDataFromParams.remainingTime || 0,
                purchaseDate:
                    packageDataFromParams.buyDate || new Date().toISOString(),
                price: packageDataFromParams.price || 0,
                status:
                    packageDataFromParams.bookingStatus === 1 ? "paid" : "in_progress",
                carId: packageDataFromParams.carId,
                carPrice: packageDataFromParams.carPrice,
                roadTypes: packageDataFromParams.roadTypes || [],
                drivingSkills: packageDataFromParams.drivingSkills || [],
            };
        } catch (error) {
            console.error("Failed to parse package data", error);
            return null;
        }
    }

    getPurchaseDateInfo(purchaseDate?: string): PurchaseDateInfo {
        if (!purchaseDate) {
            return { date: "", time: "" };
        }

        const date = new Date(purchaseDate);
        return {
            date: date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }),
            time: date.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    }

    async fetchInstructorInfo(
        instructorId: string
    ): Promise<IUserInfo | null> {
        const result = await this.dispatch(getUserById({ id: instructorId })).unwrap();
        return result.value as IUserInfo;
    }

    buildBookingParams(options: {
        instructorId?: string;
        packageId?: string;
        vehicleId?: string;
        carPrice?: number;
        remainingHours?: number;
        userPackageId?: string;
    }): Record<string, string> {
        return {
            instructorId: options.instructorId || "",
            packageId: options.packageId || "",
            vehicleId: options.vehicleId || "",
            carPrice: (options.carPrice ?? 0).toString(),
            fromUserPackage: "true",
            userPackageId: options.userPackageId || options.packageId || "",
            remainingHours: (options.remainingHours ?? 0).toString(),
        };
    }

    getVehicleId(
        packageData: PackageDetailData,
        carIdFromParams?: string
    ): string {
        return carIdFromParams || packageData.carId || "";
    }

    getBookingNavigationConfig(
        packageData: PackageDetailData,
        options: { carIdFromParams?: string; carPriceFromParams?: number }
    ): { pathname: typeof ROUTES.BOOKING; params: Record<string, string> } {
        const vehicleId = this.getVehicleId(packageData, options.carIdFromParams);
        const bookingParams = this.buildBookingParams({
            instructorId: packageData.instructorId,
            packageId: packageData.id,
            vehicleId,
            carPrice: options.carPriceFromParams ?? packageData.carPrice,
            remainingHours: packageData.remainingHours,
            userPackageId: packageData.id,
        });

        return {
            pathname: ROUTES.BOOKING,
            params: bookingParams,
        };
    }

    daysSince(dateStr: string): number {
        const start = new Date(dateStr).getTime();
        const now = Date.now();
        return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    }

    computeRefund(pkg: {
        status: string;
        purchaseDate: string;
        price?: number;
        totalHours: number;
        usedHours: number;
    }): RefundEvaluation {
        if (pkg.status !== "paid" && pkg.status !== "in_progress") {
            return {
                eligible: false,
                amount: 0,
                reason: "Gói không ở trạng thái đã thanh toán",
            };
        }

        const days = this.daysSince(pkg.purchaseDate);
        const price = typeof pkg.price === "number" ? pkg.price : 0;

        if (days >= 30) {
            return {
                eligible: false,
                amount: 0,
                reason: "Đã quá 30 ngày kể từ ngày mua",
            };
        }

        if (pkg.usedHours === 0) {
            return {
                eligible: true,
                amount: price,
                reason: "Hoàn 100% vì chưa sử dụng giờ nào",
            };
        }

        const unusedHours = Math.max(pkg.totalHours - pkg.usedHours, 0);
        const perHour = pkg.totalHours > 0 ? price / pkg.totalHours : 0;
        const refund = Math.max(Math.floor(perHour * unusedHours), 0);
        return {
            eligible: refund > 0,
            amount: refund,
            reason: "Hoàn theo số giờ chưa sử dụng (< 30 ngày)",
        };
    }

    getStatusText(status: string): string {
        switch (status) {
            case "planing":
                return "Lên lộ trình";
            case "upcoming":
                return "Sắp diễn ra";
            case "in_progress":
                return "Đang diễn ra";
            case "completed":
                return "Đã hoàn thành";
            case "reschedule":
                return "Đổi lịch";
            case "cancelled":
                return "Đã hủy";
            case "paid":
                return "Đã thanh toán";
            case "refunded":
                return "Đã hoàn tiền";
            case "not_refund":
                return "Không hoàn tiền";
            default:
                return status;
        }
    }

    renderRefundInfo(refundInfo: RefundEvaluation) {
        if (!refundInfo.eligible) {
            return {
                text: `Không đủ điều kiện hoàn tiền (${refundInfo.reason})`,
                color: "#ef4444",
                isEligible: false,
            };
        }

        return {
            text: `Số tiền dự kiến hoàn: ${refundInfo.amount.toLocaleString(
                "vi-VN"
            )}₫`,
            color: AppColors.primary,
            reason: refundInfo.reason,
            isEligible: true,
        };
    }
}

export const usePackageDetailViewModel = (): PackageDetailViewModel => {
    const dispatch = useAppDispatch();
    return useMemo(() => new PackageDetailViewModel(dispatch), [dispatch]);
};

