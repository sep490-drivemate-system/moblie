import { LicenseTier } from "../car/car";

export interface IUserInfo {
    userId: string;
    avatarUrl: string;
    phone: string;
    email: string;
    fullName: string;
    licenseTier: LicenseTier;
    birthDate: string;
    role: number;
    instructor: any | null;
    noviceDriver: any | null;
}