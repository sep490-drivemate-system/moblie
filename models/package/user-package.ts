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
    status: "scheduled" | "completed" | "cancelled";
    createdAt: string;
}

export interface IUserPackage {
    id: string;
    packageId: string;
    packageName: string;
    instructorId: string;
    instructorName: string;
    instructorAvatar: string;
    totalHours: number;
    usedHours: number;
    remainingHours: number;
    purchaseDate: string;
    expiryDate?: string;
    status: "active" | "expired" | "completed";
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

