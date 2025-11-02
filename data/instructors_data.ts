import { gender } from "@/constants/enums";
import { IInstructor, IInstructors } from "@/models/instructor/instructor.type";

export const instructorsData: IInstructor[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    experience: "8 năm kinh nghiệm",
    experienceYears: 8,
    rating: 4.9,
    description: "Giảng viên giàu kinh nghiệm, chuyên dạy lái xe an toàn trong thành phố.",
    totalBookings: 245,
    gender: gender.male,
    packages: [
      {
        id: "pkg_1_1",
        name: "Gói Cơ Bản Thành Phố",
        duration: 2,
        roadTypes: ["Khu dân cư", "Đô thị"],
        skills: ["Điều khiển cơ bản", "Đỗ xe", "Qua ngã tư"],
        hasVehicle: false,
        basePrice: 200000,
      },
      {
        id: "pkg_1_2", 
        name: "Gói Thành Phố + Xe",
        duration: 2,
        roadTypes: ["Khu dân cư", "Đô thị"],
        skills: ["Điều khiển cơ bản", "Đỗ xe", "Qua ngã tư"],
        hasVehicle: true,
        basePrice: 200000,
        vehiclePrice: 100000,
        vehicle: {
          id: "car_1",
          name: "Toyota Vios",
          brand: "Toyota",
          imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
          price: 100000,
          location: "TP.HCM",
          rating: 4.8,
          seats: 5,
          type: "Sedan",
          fuel: "Xăng",
          totalRentalCount: 150
        },
      },
      {
        id: "pkg_1_3",
        name: "Gói Nâng Cao",
        duration: 3,
        roadTypes: ["Khu dân cư", "Đô thị", "Quốc lộ"],
        skills: ["Điều khiển cơ bản", "Đỗ xe", "Chuyển làn", "Vượt xe", "Qua ngã tư"],
        hasVehicle: true,
        basePrice: 280000,
        vehiclePrice: 120000,
        vehicle: {
          id: "car_2",
          name: "Honda City",
          brand: "Honda", 
          imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop",
          price: 120000,
          location: "TP.HCM",
          rating: 4.9,
          seats: 5,
          type: "Sedan",
          fuel: "Xăng",
          totalRentalCount: 120
        },
      }
    ]
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    experience: "5 năm kinh nghiệm",
    experienceYears: 5,
    rating: 4.7,
    description: "Chuyên gia dạy lái xe số sàn và kỹ thuật lái xe nâng cao.",
    totalBookings: 189,
    gender: gender.female,
    packages: [
      {
        id: "pkg_2_1",
        name: "Gói Số Sàn Cơ Bản",
        duration: 2,
        roadTypes: ["Khu dân cư", "Đô thị"],  
        skills: ["Điều khiển cơ bản", "Số sàn", "Đỗ xe"],
        hasVehicle: false,
        basePrice: 180000,
      },
      {
        id: "pkg_2_2",
        name: "Gói Đường Dài",
        duration: 4,
        roadTypes: ["Đô thị", "Quốc lộ", "Cao tốc"],
        skills: ["Điều khiển cơ bản", "Chuyển làn", "Vượt xe", "Lái đường dài"],
        hasVehicle: true,
        basePrice: 320000,
        vehiclePrice: 150000,
        vehicle: {
          id: "car_3",
          name: "Mazda 3",
          brand: "Mazda",
          imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=200&fit=crop",
          price: 150000,
          location: "TP.HCM",
          rating: 4.7,
          seats: 5,
          type: "Sedan",
          fuel: "Xăng",
          totalRentalCount: 95
        },
      }
    ]
  },
  {
    id: "3",
    name: "Lê Minh Cường",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    experience: "10 năm kinh nghiệm",
    experienceYears: 10,
    rating: 4.8,
    description: "Chuyên gia dạy lái xe tải và container, có bằng lái hạng C.",
    totalBookings: 156,
    gender: gender.male,
    price: 250000,
    vehicels: [],
  },
  {
    id: "4",
    name: "Phạm Thị Dung",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    experience: "6 năm kinh nghiệm",
    experienceYears: 6,
    rating: 4.6,
    description: "Chuyên dạy lái xe cho phụ nữ với phương pháp nhẹ nhàng, kiên trì.",
    totalBookings: 203,
    gender: gender.female,
    price: 220000,
  },
  {
    id: "5",
    name: "Hoàng Văn Em",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    experience: "7 năm kinh nghiệm",
    experienceYears: 7,
    rating: 4.5,
    description: "Giảng viên chuyên dạy lái xe cao tốc và đường xa an toàn.",
    totalBookings: 178,
    gender: gender.male,
    price: 240000,
  },
  {
    id: "6",
    name: "Vũ Thị Phượng",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    experience: "4 năm kinh nghiệm",
    experienceYears: 4,
    rating: 4.4,
    description: "Chuyên gia dạy lái xe trong điều kiện thời tiết khó khăn.",
    totalBookings: 134,
    gender: gender.female,
    price: 190000,
  },
  {
    id: "7",
    name: "Đỗ Minh Giang",
    avatar:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    experience: "9 năm kinh nghiệm",
    experienceYears: 9,
    rating: 4.9,
    description: "Chuyên gia dạy lái xe thể thao và kỹ thuật lái xe nâng cao.",
    totalBookings: 298,
    gender: gender.male,
    price: 280000,
  },
  {
    id: "8",
    name: "Ngô Thị Hạnh",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    experience: "3 năm kinh nghiệm",
    experienceYears: 3,
    rating: 4.3,
    description: "Giảng viên trẻ, nhiệt tình, chuyên dạy cho người mới bắt đầu.",
    totalBookings: 87,
    gender: gender.female,
    price: 170000,
  },
  {
    id: "9",
    name: "Bùi Văn Ích",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
    experience: "12 năm kinh nghiệm",
    experienceYears: 12,
    rating: 5.0,
    description: "Giảng viên cao cấp, chuyên đào tạo giảng viên và chuẩn bị thi bằng lái.",
    totalBookings: 412,
    gender: gender.male,
    price: 350000,
  },
  {
    id: "10",
    name: "Lý Thị Kim",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    experience: "6 năm kinh nghiệm",
    experienceYears: 6,
    rating: 4.7,
    description: "Chuyên gia về công nghệ ô tô mới và lái xe thông minh.",
    totalBookings: 167,
    gender: gender.female,
    price: 230000,
  },
];


export const instructorData: IInstructors[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    experience: "8 năm kinh nghiệm",
    totalBookings: 245,
    totalPackages: 3,
    averageRating: 4.9,
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    experience: "5 năm kinh nghiệm",
    averageRating: 4.7,
    totalBookings: 189,
    totalPackages: 3,
  },
  {
    id: "3",
    name: "Lê Minh Cường",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    experience: "10 năm kinh nghiệm",
    averageRating: 4.8,
    totalBookings: 156,
    totalPackages: 3,
  },
  {
    id: "4",
    name: "Phạm Thị Dung",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    experience: "6 năm kinh nghiệm",
    averageRating: 4.6,
    totalBookings: 203,
    totalPackages: 3,
  },
  {
    id: "5",
    name: "Hoàng Văn Em",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    experience: "7 năm kinh nghiệm",
    averageRating: 4.5,
    totalBookings: 178,
    totalPackages: 3,
  },
  {
    id: "6",
    name: "Vũ Thị Phượng",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    experience: "4 năm kinh nghiệm",
    averageRating: 4.4,
    totalBookings: 178,
    totalPackages: 3,
  },
  {
    id: "6",
    name: "Vũ Thị Phượng",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    experience: "4 năm kinh nghiệm",
    averageRating: 4.4,
    totalBookings: 134,
    totalPackages: 3,
  },
  {
    id: "7",
    name: "Đỗ Minh Giang",
    avatar:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    experience: "9 năm kinh nghiệm",
    averageRating: 4.9,
    totalBookings: 298,
    totalPackages: 3,
  },
  {
    id: "8",
    name: "Ngô Thị Hạnh",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    experience: "3 năm kinh nghiệm",
    averageRating: 4.3,
    totalBookings: 87,
    totalPackages: 3,
  },
  {
    id: "9",
    name: "Bùi Văn Ích",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
    experience: "12 năm kinh nghiệm",
    averageRating: 5.0,
    totalBookings: 412,
    totalPackages: 3,
  },
  {
    id: "10",
    name: "Lý Thị Kim",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    experience: "6 năm kinh nghiệm",
    averageRating: 4.7,
    totalBookings: 167,
    totalPackages: 3,
  },
];

export const getInstructorById = (id: string) => {
  return instructorsData.find((instructor) => instructor.id === id);
};

// Sort functions
export const sortInstructorsByRating = (
  instructors: IInstructor[],
  ascending: boolean = false
): IInstructor[] => {
  return [...instructors].sort((a, b) =>
    ascending ? a.rating - b.rating : b.rating - a.rating
  );
};


// Filter by experience years
export const getInstructorsByExperienceRange = (
  instructors: IInstructor[],
  minYears: number,
  maxYears: number
): IInstructor[] => {
  return instructors.filter(
    (instructor) =>
      instructor.experienceYears >= minYears &&
      instructor.experienceYears <= maxYears
  );
};

export const sortInstructorsByExperience = (
  instructors: IInstructor[],
  ascending: boolean = false
): IInstructor[] => {
  return [...instructors].sort((a, b) =>
    ascending
      ? a.experienceYears - b.experienceYears
      : b.experienceYears - a.experienceYears
  );
};
