import { gender } from "@/constants/enums";
import { ICarNew } from "../car/car";

export interface IInstructor {
  id: string;
  name: string;
  avatar: string;
  experience: string;
  experienceYears: number;
  rating: number;
  pricing: string;
  specialties: string[];
  phone: string;
  email: string;
  description: string;
  totalBookings: number;
  pricePerHour: number;
  gender: gender;
  vehicels?: ICarNew[];
}
