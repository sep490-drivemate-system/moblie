import { useMemo } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getMyPackages } from "@/features/booking/bookingThunk";
import { buyPackage } from "@/features/instructor/instructorThunk";
import { BookingStatus } from "@/models/package/user-package";
import { IBuyPackageRequest, IMyPackgesResponse } from "@/models/package/package";
import { AppColors } from "@/constants/Colors";
import { AppDispatch } from "@/lib/redux/store";
import { router } from "expo-router";
import { IInstructorPackages } from "@/models/instructor/instructor.type";
import { ROUTES } from "@/constants/routes";

type StatusOption = {
    key: BookingStatus;
    label: string;
};

export class BookingViewModel {
    private dispatch: AppDispatch;

    constructor(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }



    async fetchMyPackages(): Promise<IMyPackgesResponse[]> {
        const result = await this.dispatch(getMyPackages(undefined)).unwrap();
        const packages: IMyPackgesResponse[] = (result as any)?.value || result || [];
        return packages;
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
        packages: IMyPackgesResponse[],
        status: BookingStatus
    ): IMyPackgesResponse[] {
        if (status === BookingStatus.All) {
            return packages;
        }
        return packages.filter((pkg) => pkg.bookingStatus === status);
    }

    calculateStatusCounts(packages: IMyPackgesResponse[]): Record<number, number> {
        const counts: Record<number, number> = {
            [BookingStatus.All]: packages.length,
            [BookingStatus.Purchased]: 0,
            [BookingStatus.InUse]: 0,
            [BookingStatus.Used]: 0,
            [BookingStatus.CancellationWithRefund]: 0,
            [BookingStatus.CancellationWithoutRefund]: 0,
        };

        packages.forEach((pkg) => {
            if (counts[pkg.bookingStatus] !== undefined) {
                counts[pkg.bookingStatus] += 1;
            }
        });

        return counts;
    }

    getStatusColor(status: BookingStatus): string {
        switch (status) {
            case BookingStatus.Purchased:
                return AppColors.yellow;
            case BookingStatus.InUse:
                return AppColors.primary;
            case BookingStatus.Used:
                return AppColors.gray;
            case BookingStatus.CancellationWithRefund:
                return AppColors.blue;
            case BookingStatus.CancellationWithoutRefund:
                return AppColors.red;
            default:
                return AppColors.gray;
        }
    }

    getStatusText(status: BookingStatus): string {
        switch (status) {
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
}
