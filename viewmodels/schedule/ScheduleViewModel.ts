import { getInstructorSchedule, IInstructorSchedule } from "@/features/booking/bookingThunk";
import { useAppDispatch } from "@/lib/redux/hooks";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useMemo } from "react";

export interface DateRange {
    start: Date;
    end: Date;
}

export class ScheduleViewModel {
    private dispatch: AppDispatch;
    private schedule: IInstructorSchedule[] = [];

    constructor(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }


    getSchedule = async (instructorId: string): Promise<IInstructorSchedule[]> => {
        try {
            const response = await this.dispatch(
                getInstructorSchedule({ instructorId })
            ).unwrap();
            const schedule: IInstructorSchedule[] = (response as any).value || response;
            this.schedule = schedule;
            return schedule;
        } catch (error) {
            console.log("Failed to get instructor schedule:", error);
            throw error;
        }
    }

    getAvailableDateRanges = (schedule?: IInstructorSchedule[]): DateRange[] => {
        const scheduleToUse = schedule || this.schedule;
        if (!scheduleToUse || scheduleToUse.length === 0) return [];

        return scheduleToUse.map(slot => {
            const startDate = new Date(slot.startTime + 'T00:00:00');
            const endDate = new Date(slot.endTime + 'T00:00:00');

            return {
                start: startDate,
                end: endDate
            };
        });
    }

    /**
     * Kiểm tra một date có nằm trong các available ranges không
     */
    isDateInAvailableRange = (date: Date, availableRanges?: DateRange[]): boolean => {
        const ranges = availableRanges || this.getAvailableDateRanges();
        if (ranges.length === 0) return true; // Nếu không có schedule, tất cả dates đều available

        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return ranges.some(range => {
            const rangeStart = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate());
            const rangeEnd = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate());
            return dateOnly >= rangeStart && dateOnly <= rangeEnd;
        });
    }

    /**
     * Format date thành string YYYY-MM-DD (sử dụng local date components để tránh timezone conversion)
     */
    formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Lấy schedule hiện tại đã được load
     */
    getCurrentSchedule = (): IInstructorSchedule[] => {
        return this.schedule;
    }

    /**
     * Set schedule (dùng khi đã load từ nơi khác)
     */
    setSchedule = (schedule: IInstructorSchedule[]): void => {
        this.schedule = schedule;
    }
}

export const useScheduleViewModel = (): ScheduleViewModel => {
    const dispatch = useAppDispatch();
    return useMemo(() => {
        const viewModel = new ScheduleViewModel(dispatch);
        return viewModel;
    }, [dispatch]);
};
