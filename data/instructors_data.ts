export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  latitude: number;
  longitude: number;
  experience: string;
  experienceYears: number; // Years of experience for filtering
  rating: number;
  pricing: string;
  availability: 'available' | 'busy' | 'offline';
  specialties: string[];
  phone: string;
  email: string;
  description: string;
  distance?: number; // Distance in km from user location
  totalBookings: number; // Total number of bookings
  pricePerHour: number; // Price in VND per hour for sorting
}

export const instructorsData: Instructor[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7769,
    longitude: 106.7009,
    experience: '8 năm kinh nghiệm',
    experienceYears: 8,
    rating: 4.9,
    pricing: '300.000đ/buổi',
    availability: 'available',
    specialties: ['Lái xe số tự động', 'Lái xe trong thành phố', 'Đỗ xe song song'],
    phone: '0901234567',
    email: 'nguyenvanan@email.com',
    description: 'Giảng viên giàu kinh nghiệm, chuyên dạy lái xe an toàn trong thành phố.',
    totalBookings: 245,
    pricePerHour: 300000
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7756,
    longitude: 106.6917,
    experience: '5 năm kinh nghiệm',
    experienceYears: 5,
    rating: 4.7,
    pricing: '280.000đ/buổi',
    availability: 'available',
    specialties: ['Lái xe số sàn', 'Lái xe đường dài', 'Kỹ thuật lái xe'],
    phone: '0912345678',
    email: 'tranthibinh@email.com',
    description: 'Chuyên gia dạy lái xe số sàn và kỹ thuật lái xe nâng cao.',
    totalBookings: 189,
    pricePerHour: 280000
  },
  {
    id: '3',
    name: 'Lê Minh Cường',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7639,
    longitude: 106.7147,
    experience: '10 năm kinh nghiệm',
    experienceYears: 10,
    rating: 4.8,
    pricing: '350.000đ/buổi',
    availability: 'busy',
    specialties: ['Lái xe tải', 'Lái xe container', 'Bằng lái hạng C'],
    phone: '0923456789',
    email: 'leminhcuong@email.com',
    description: 'Chuyên gia dạy lái xe tải và container, có bằng lái hạng C.',
    totalBookings: 156,
    pricePerHour: 350000
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7378,
    longitude: 106.7197,
    experience: '6 năm kinh nghiệm',
    experienceYears: 6,
    rating: 4.6,
    pricing: '290.000đ/buổi',
    availability: 'available',
    specialties: ['Lái xe cho phụ nữ', 'Lái xe an toàn', 'Đỗ xe trong hẻm'],
    phone: '0934567890',
    email: 'phamthidung@email.com',
    description: 'Chuyên dạy lái xe cho phụ nữ với phương pháp nhẹ nhàng, kiên trì.',
    totalBookings: 203,
    pricePerHour: 290000
  },
  {
    id: '5',
    name: 'Hoàng Văn Em',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    latitude: 10.8012,
    longitude: 106.7102,
    experience: '7 năm kinh nghiệm',
    experienceYears: 7,
    rating: 4.5,
    pricing: '320.000đ/buổi',
    availability: 'available',
    specialties: ['Lái xe cao tốc', 'Lái xe đường xa', 'Kỹ thuật vượt xe'],
    phone: '0945678901',
    email: 'hoangvanem@email.com',
    description: 'Giảng viên chuyên dạy lái xe cao tốc và đường xa an toàn.',
    totalBookings: 178,
    pricePerHour: 320000
  },
  {
    id: '6',
    name: 'Vũ Thị Phượng',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7626,
    longitude: 106.6727,
    experience: '4 năm kinh nghiệm',
    experienceYears: 4,
    rating: 4.4,
    pricing: '270.000đ/buổi',
    availability: 'offline',
    specialties: ['Lái xe ban đêm', 'Lái xe trong mưa', 'Xử lý tình huống'],
    phone: '0956789012',
    email: 'vuthiphuong@email.com',
    description: 'Chuyên gia dạy lái xe trong điều kiện thời tiết khó khăn.',
    totalBookings: 134,
    pricePerHour: 270000
  },
  {
    id: '7',
    name: 'Đỗ Minh Giang',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7543,
    longitude: 106.7320,
    experience: '9 năm kinh nghiệm',
    experienceYears: 9,
    rating: 4.9,
    pricing: '340.000đ/buổi',
    availability: 'available',
    specialties: ['Lái xe thể thao', 'Kỹ thuật drift', 'Lái xe hiệu suất cao'],
    phone: '0967890123',
    email: 'dominhhgiang@email.com',
    description: 'Chuyên gia dạy lái xe thể thao và kỹ thuật lái xe nâng cao.',
    totalBookings: 298,
    pricePerHour: 340000
  },
  {
    id: '8',
    name: 'Ngô Thị Hạnh',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    latitude: 10.8376,
    longitude: 106.6676,
    experience: '3 năm kinh nghiệm',
    experienceYears: 3,
    rating: 4.3,
    pricing: '250.000đ/buổi',
    availability: 'busy',
    specialties: ['Lái xe cho người mới', 'Cơ bản về giao thông', 'Lý thuyết lái xe'],
    phone: '0978901234',
    email: 'ngothihanh@email.com',
    description: 'Giảng viên trẻ, nhiệt tình, chuyên dạy cho người mới bắt đầu.',
    totalBookings: 87,
    pricePerHour: 250000
  },
  {
    id: '9',
    name: 'Bùi Văn Ích',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7450,
    longitude: 106.6950,
    experience: '12 năm kinh nghiệm',
    experienceYears: 12,
    rating: 5.0,
    pricing: '400.000đ/buổi',
    availability: 'available',
    specialties: ['Lái xe chuyên nghiệp', 'Đào tạo giảng viên', 'Thi bằng lái'],
    phone: '0989012345',
    email: 'buivanich@email.com',
    description: 'Giảng viên cao cấp, chuyên đào tạo giảng viên và chuẩn bị thi bằng lái.',
    totalBookings: 412,
    pricePerHour: 400000
  },
  {
    id: '10',
    name: 'Lý Thị Kim',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    latitude: 10.7280,
    longitude: 106.7180,
    experience: '6 năm kinh nghiệm',
    experienceYears: 6,
    rating: 4.7,
    pricing: '310.000đ/buổi',
    availability: 'available',
    specialties: ['Lái xe ô tô điện', 'Công nghệ mới', 'Lái xe thông minh'],
    phone: '0990123456',
    email: 'lythikim@email.com',
    description: 'Chuyên gia về công nghệ ô tô mới và lái xe thông minh.',
    totalBookings: 167,
    pricePerHour: 310000
  }
];

// Helper functions
export const getInstructorsByAvailability = (availability: 'available' | 'busy' | 'offline') => {
  return instructorsData.filter(instructor => instructor.availability === availability);
};

export const getAvailableInstructors = () => {
  return instructorsData.filter(instructor => instructor.availability === 'available');
};

export const getInstructorById = (id: string) => {
  return instructorsData.find(instructor => instructor.id === id);
};

export const getInstructorsNearby = (latitude: number, longitude: number, radiusKm: number = 5) => {
  return instructorsData.filter(instructor => {
    const distance = calculateDistance(latitude, longitude, instructor.latitude, instructor.longitude);
    return distance <= radiusKm; // Distance already in kilometers
  });
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};

// Add distance to instructors based on user location
export const addDistanceToInstructors = (userLat: number, userLon: number): Instructor[] => {
  return instructorsData.map(instructor => ({
    ...instructor,
    distance: calculateDistance(userLat, userLon, instructor.latitude, instructor.longitude)
  }));
};

// Filter by distance ranges
export const getInstructorsByDistanceRange = (instructors: Instructor[], minKm: number, maxKm: number): Instructor[] => {
  return instructors.filter(instructor =>
    instructor.distance !== undefined &&
    instructor.distance >= minKm &&
    instructor.distance <= maxKm
  );
};

// Sort functions
export const sortInstructorsByRating = (instructors: Instructor[], ascending: boolean = false): Instructor[] => {
  return [...instructors].sort((a, b) => ascending ? a.rating - b.rating : b.rating - a.rating);
};

export const sortInstructorsByBookings = (instructors: Instructor[], ascending: boolean = false): Instructor[] => {
  return [...instructors].sort((a, b) => ascending ? a.totalBookings - b.totalBookings : b.totalBookings - a.totalBookings);
};

export const sortInstructorsByPrice = (instructors: Instructor[], ascending: boolean = true): Instructor[] => {
  return [...instructors].sort((a, b) => ascending ? a.pricePerHour - b.pricePerHour : b.pricePerHour - a.pricePerHour);
};

export const sortInstructorsByDistance = (instructors: Instructor[], ascending: boolean = true): Instructor[] => {
  return [...instructors].sort((a, b) => {
    if (a.distance === undefined && b.distance === undefined) return 0;
    if (a.distance === undefined) return 1;
    if (b.distance === undefined) return -1;
    return ascending ? a.distance - b.distance : b.distance - a.distance;
  });
};

// Filter by experience years
export const getInstructorsByExperienceRange = (instructors: Instructor[], minYears: number, maxYears: number): Instructor[] => {
  return instructors.filter(instructor =>
    instructor.experienceYears >= minYears && instructor.experienceYears <= maxYears
  );
};

export const sortInstructorsByExperience = (instructors: Instructor[], ascending: boolean = false): Instructor[] => {
  return [...instructors].sort((a, b) => ascending ? a.experienceYears - b.experienceYears : b.experienceYears - a.experienceYears);
};
