import { CarStatus } from "@/constants/enums";

export interface Car {
  id: number | string;
  name: string;
  brand: string;
  imageUrl: string;
  images?: string[];
  price: number;
  pricing?: {
    halfDay: { price: number; duration: number };
    fullDay: { price: number; duration: number };
  };
  location: string;
  rating: number;
  seats: number;
  type: string;
  fuel: string;
  totalRentalCount?: number;
  instructor?: { experience: string };
}

export enum LicenseTier {
  B = "B",
  C1 = "C1",
  C = "C",
  D1 = "D1",
  D2 = "D2",
  D = "D",
  BE = "BE",
  C1E = "C1E",
  CE = "CE",
  D1E = "D1E",
  D2E = "D2E",
  DE = "DE",
}

export interface ICarRegistrationRequest {
  InstructorId: string;
  Description?: string;
  HourlyPrice: number;
  ThumbnailImage?: File | null;
  CarFrontImage?: File | null;
  CarBackImage?: File | null;
  CarLeftImage?: File | null;
  CarRightImage?: File | null;
  InteriorImage?: File | null;
  RegistrationFront?: File | null;
  RegistrationBack?: File | null;
  LicenseTier: string;
  LicensePlate: string;
  BrandId?: string;
  Model: string;
  CarType: string;
  Year: number;
  Color: string;
  Seats: number;
  FuelType: string;
  InsuranceFront?: File | null;
  InsuranceBack?: File | null;
  InsuranceEndTime?: string;
}

export interface IBrandCar {
  id: string;
  name: string;
}

export interface ICar {
  id: string;
  brand: string;
  modelName: string;
  license_plate: string;
  seatCounts: number;
  unitPrice: number;
  status: CarStatus;
  thumbnailUrl: string;
}
