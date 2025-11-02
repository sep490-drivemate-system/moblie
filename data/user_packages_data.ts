import { IUserPackage, IDrivingSession } from "@/models/package/user-package";

// Mock driving sessions
const sessions: IDrivingSession[] = [
  {
    id: "session-1",
    packageId: "user-pkg-1",
    instructorId: "1",
    instructorName: "Nguyễn Văn An",
    date: "2025-11-01",
    startTime: "08:00",
    endTime: "11:00",
    duration: 3,
    location: "123 Nguyễn Huệ, Q1, TP.HCM",
    vehicleId: "vehicle-1",
    vehicleName: "Toyota Vios 2023",
    status: "completed",
    createdAt: "2025-10-25T10:00:00Z",
  },
  {
    id: "session-2",
    packageId: "user-pkg-1",
    instructorId: "1",
    instructorName: "Nguyễn Văn An",
    date: "2025-11-05",
    startTime: "14:00",
    endTime: "16:00",
    duration: 2,
    location: "456 Lê Lợi, Q1, TP.HCM",
    status: "scheduled",
    createdAt: "2025-10-28T14:00:00Z",
  },
];

// Mock user packages
export const userPackagesData: IUserPackage[] = [
  {
    id: "user-pkg-1",
    packageId: "pkg_1_1",
    packageName: "Gói Thành Phố Cơ Bản",
    instructorId: "1",
    instructorName: "Nguyễn Văn An",
    instructorAvatar: "https://i.pravatar.cc/150?img=1",
    totalHours: 40,
    usedHours: 5,
    remainingHours: 35,
    purchaseDate: "2025-10-20",
    expiryDate: "2026-01-20",
    status: "active",
    sessions: sessions.filter(s => s.packageId === "user-pkg-1"),
  },
  {
    id: "user-pkg-2",
    packageId: "pkg_2_1",
    packageName: "Gói Cao Tốc + Xe",
    instructorId: "2",
    instructorName: "Trần Thị Bình",
    instructorAvatar: "https://i.pravatar.cc/150?img=2",
    totalHours: 20,
    usedHours: 8,
    remainingHours: 12,
    purchaseDate: "2025-10-15",
    expiryDate: "2026-01-15",
    status: "active",
    sessions: [],
  },
  {
    id: "user-pkg-3",
    packageId: "pkg_3_1",
    packageName: "Gói Đường Núi Chuyên Sâu",
    instructorId: "3",
    instructorName: "Lê Văn Cường",
    instructorAvatar: "https://i.pravatar.cc/150?img=3",
    totalHours: 15,
    usedHours: 15,
    remainingHours: 0,
    purchaseDate: "2025-09-01",
    expiryDate: "2025-11-01",
    status: "completed",
    sessions: [],
  },
];

// Mock instructor busy times
export const instructorBusyTimes = [
  {
    instructorId: "1",
    date: "2025-11-05",
    busySlots: [
      { startTime: "09:00", endTime: "11:00" },
      { startTime: "14:00", endTime: "16:00" },
    ],
  },
  {
    instructorId: "1",
    date: "2025-11-06",
    busySlots: [
      { startTime: "08:00", endTime: "10:00" },
    ],
  },
];

