// Model for user's purchased packages and driving sessions

export interface IDrivingSession {
    id: string;
    packageId: string;
    instructorId: string;
    instructorName: string;
    displayName?: string | null; // Tên hiển thị của địa điểm
    date: string; // Format: "YYYY-MM-DD"
    startTime: string; // Format: "HH:MM"
    endTime: string; // Format: "HH:MM"
    duration: number; // in hours
    location: string;
    vehicleId?: string;
    startingLatitude?: number; // Latitude của điểm đón
    startingLongtitude?: number; // Longitude của điểm đón
    vehicleName?: string;
    status: "planing" | "upcoming" | "in_progress" | "completed" | "reschedule" | "cancelled";
    createdAt: string;
}

export interface IUserPackage {
    id: string;
    packageId: string;
    packageName: string;
    price?: number; 
    instructorId: string;
    instructorName: string;
    instructorAvatar: string;
    totalHours: number;
    usedHours: number;
    remainingHours: number;
    purchaseDate: string;
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

// API Response Types
export enum BookingStatus {
    All = 0,
    Purchased = 1,
    InUse = 2,
    Used = 3,
    CancellationWithRefund = 4,
    CancellationWithoutRefund = 5,
}

export interface IUserPackageAPI {
    id: string;
    nameInstructor: string;
    instructorId:string;
    namePackake: string;
    carId:string;
    carPrice:number;
    bookingStatus: BookingStatus;
    avatarInstructor: string;
    buyDate: string; // ISO format
    duration: number; // in hours
    durationInUse: number; // hours used
    precentInUse: number; // percentage 0-100
    remainingTime: number; // hours remaining
}

export interface IGetUserPackagesParams {
    bookingStatus?: BookingStatus;
}
