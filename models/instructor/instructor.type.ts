import { gender } from "@/constants/enums";
import { Car } from "../car/car";

export interface IInstructors {
  id: string;
  name: string;
  avatar: string;
  experience: string;
  averageRating: number;
  totalBookings: number;
  pricePerHour: number;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  experience: string;
  experienceYears: number;
  rating: number;
  price: number;
  specialties: string[];
  phone: string;
  email: string;
  description: string;
  totalBookings: number;
  gender: gender;
  vehicels?: Car[];
}
