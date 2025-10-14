import { gender } from "@/constants/enums";
import { ICarNew } from "@/models/car/car";
import { IInstructor } from "@/models/instructor/instructor";

export const instructorInfor: IInstructor = {
  id: "1",
  name: "Nguyễn Văn An",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  experience: "8 năm kinh nghiệm",
  experienceYears: 8,
  rating: 4.9,
  pricing: "300 xu/buổi",
  specialties: [
    "Lái xe số tự động",
    "Lái xe trong thành phố",
    "Đỗ xe song song",
  ],
  phone: "0901234567",
  email: "nguyenvanan@email.com",
  description:
    "Giảng viên giàu kinh nghiệm, chuyên dạy lái xe an toàn trong thành phố.",
  totalBookings: 245,
  pricePerHour: 300000,
  gender: gender.male,
  vehicels: [
    {
      id: "1",
      name: "Toyota Vios 2023",
      image:
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
      seats: 5,
      transmission: "Số tự động",
      year: 2023,
      price: 100,
      brand: "Toyota",
      fuel: "Xăng",
    },
    {
      id: "2",
      name: "Honda City 2024",
      image:
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop",
      seats: 5,
      transmission: "Số sàn",
      year: 2024,
      price: 80,
      brand: "Honda",
      fuel: "Dầu",
    },
    {
      id: "3",
      name: "Mazda CX-5 2023",
      image:
        "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop",
      seats: 7,
      transmission: "Số tự động",
      year: 2023,
      price: 120,
      brand: "Mazda",
      fuel: "Xăng",
    },
  ],
};

export const instructorVehicles: ICarNew[] = [
  {
    id: "1",
    name: "Toyota Vios 2023",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
    seats: 5,
    transmission: "Số tự động",
    year: 2023,
    price: 100,
    brand: "Toyota",
    fuel: "Xăng",
  },
  {
    id: "2",
    name: "Honda City 2024",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop",
    seats: 5,
    transmission: "Số sàn",
    year: 2024,
    price: 80,
    brand: "Honda",
    fuel: "Dầu",
  },
  {
    id: "3",
    name: "Mazda CX-5 2023",
    image:
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop",
    seats: 7,
    transmission: "Số tự động",
    year: 2023,
    price: 120,
    brand: "Mazda",
    fuel: "Xăng",
  },
];
