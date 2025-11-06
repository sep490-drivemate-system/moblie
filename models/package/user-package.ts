// Model for user's purchased packages and driving sessions

export interface IDrivingSession {
    id: string;
    packageId: string;
    instructorId: string;
    instructorName: string;
    date: string; // Format: "YYYY-MM-DD"
    startTime: string; // Format: "HH:MM"
    endTime: string; // Format: "HH:MM"
    duration: number; // in hours
    location: string;
    vehicleId?: string;
    vehicleName?: string;
    status: "planing" | "upcoming" | "in_progress" | "completed" | "reschedule" | "cancelled";
    createdAt: string;
}

export interface IUserPackage {
    id: string;
    packageId: string;
    packageName: string;
    price?: number; // total price in VND
    instructorId: string;
    instructorName: string;
    instructorAvatar: string;
    totalHours: number;
    usedHours: number;
    remainingHours: number;
    purchaseDate: string;
    expiryDate?: string;
    status: "paid" | "in_progress" | "completed" | "refunded" | "not_refund";
    sessions: IDrivingSession[];
}

export interface IInstructorBusyTime {
    instructorId: string;
    date: string; // Format: "YYYY-MM-DD"
    busySlots: {
        startTime: string; // Format: "HH:MM"
        endTime: string; // Format: "HH:MM"
    }[];
}

