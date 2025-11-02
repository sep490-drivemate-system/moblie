import { gender } from "@/constants/enums";
import { Car } from "@/models/car/car";
import { IInstructor } from "@/models/instructor/instructor.type";

export const instructorInfor: IInstructor = {
  id: "1",
  name: "Nguyễn Văn An",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  experience: "8 năm kinh nghiệm",
  experienceYears: 8,
  rating: 4.9,
  description:
    "Giảng viên giàu kinh nghiệm, chuyên dạy lái xe an toàn trong thành phố.",
  totalBookings: 245,
  gender: gender.male,
  vehicels: [
    {
      id: "1",
      name: "Toyota Vios 2023",
      imageUrl:
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
      seats: 5,
      type: "Số tự động",
      price: 1000000,
      brand: "Toyota",
      fuel: "Xăng",
      location: "TP.HCM",
      rating: 4.8,
      totalRentalCount: 1000,
    },
    {
      id: "2",
      name: "Honda City 2024",
      imageUrl:
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop",
      seats: 5,
      type: "Số sàn",
      price: 1200000,
      brand: "Honda",
      fuel: "Dầu",
      location: "TP.HCM",
      rating: 4.9,
      totalRentalCount: 1200,
    },
    {
      id: "3",
      name: "Mazda CX-5 2023",
      imageUrl:
        "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop",
      seats: 7,
      type: "Số tự động",
      price: 1500000,
      brand: "Mazda",
      fuel: "Xăng",
      location: "TP.HCM",
      rating: 4.8,
      totalRentalCount: 1000,
    },
  ],
};

export const instructorVehicles: Car[] = [
  {
    id: "1",
    name: "Toyota Vios 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
    seats: 5,
    type: "Số tự động",
    location: "TP.HCM",
    rating: 4.8,
    totalRentalCount: 1000,
    price: 1000000,
    brand: "Toyota",
    fuel: "Xăng",
  },
  {
    id: "2",
    name: "Honda City 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop",
    seats: 5,
    type: "Số sàn",
    location: "TP.HCM",
    rating: 4.9,
    totalRentalCount: 1200,
    price: 1200000,
    brand: "Honda",
    fuel: "Dầu",
  },
  {
    id: "3",
    name: "Mazda CX-5 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop",
    seats: 7,
    type: "Số tự động",
    location: "TP.HCM",
    rating: 4.8,
    totalRentalCount: 1000,
    price: 1500000,
    brand: "Mazda",
    fuel: "Xăng",
  },
];
