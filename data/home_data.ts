import { ICar } from "@/models/car/car";
import { LicenseType } from "@/models/license/license";
import { IInstructorOption } from "@/models/package/package";
import { Bell, MessageSquareMore, Wallet } from "lucide-react-native";

export const headerItems = [
  {
    id: "1",
    label: "Ví DriveMate",
    value: 100000,
    icon: Wallet,
  },
  {
    id: "2",
    label: "Thông báo",
    value: 100,
    icon: Bell,
  },
  {
    id: "3",
    label: "Tin nhắn",
    value: 100,
    icon: MessageSquareMore,
  },
];

export const carousels = [
  {
    id: 1,
    image:
      "https://media.istockphoto.com/id/1182697204/photo/elegant-and-handsome-driver-giving-thumbs-up.jpg?s=612x612&w=0&k=20&c=Xd8xOAp-NQObQFIdlVW93q34Oh5L2-qX1a2bFLKHXgA=",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1615563164538-89e1da13fcc4?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const drivingLicenses: LicenseType[] = [
  {
    id: "1",
    name: "B1",
  },
  {
    id: "2",
    name: "B",
  },
  {
    id: "3",
    name: "C1",
  },
  {
    id: "4",
    name: "C",
  },
  {
    id: "5",
    name: "D1",
  },
  {
    id: "6",
    name: "D2",
  },
  {
    id: "7",
    name: "D",
  },
  {
    id: "8",
    name: "BE",
  },
  {
    id: "9",
    name: "C1E",
  },
  {
    id: "10",
    name: "CE",
  },
  {
    id: "11",
    name: "D1E",
  },
  {
    id: "12",
    name: "D2E",
  },
  {
    id: "13",
    name: "DE",
  },
];

export const listCar: ICar[] = [
  {
    id: "1",
    name: "KIA Carnival 2024",
    brand: "Kia",
    imageUrl:
      "https://www.bisonic.vn/wp-content/uploads/2024/03/kia-carnival-2022.jpg",
    price: 300000,
    rating: 5,
    seats: 7,
    type: "Số tự động",
    fuel: "Dầu",
    totalRentalCount: 1000,
  },
  {
    id: "2",
    name: "Toyota Vios 2023",
    brand: "Toyota",
    imageUrl:
      "https://thailon-oto.com/files/toyota-vios-smart-2023-1-4ca0_1-Geb8dN2HLE.jpg",
    price: 350000,
    rating: 4.8,
    seats: 5,
    type: "Số sàn",
    fuel: "Xăng",
    totalRentalCount: 1280,
  },
  {
    id: "3",
    name: "Mazda CX-5 2024",
    brand: "Mazda",
    imageUrl:
      "https://hips.hearstapps.com/hmg-prod/images/2022-mazda-cx-5-2p5-turbo-signature-123-1657559083.jpg?crop=0.805xw:0.680xh;0.0977xw,0.252xh&resize=2048:*",
    price: 320000,
    rating: 4.9,
    seats: 5,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 1321,
  },
  {
    id: "4",
    name: "Hyundai Accent 2023",
    brand: "Hyundai",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaeslus73sARGnLf-MWwCQtKkD32DVipRlEg&s",
    price: 1000000,
    rating: 4.6,
    seats: 5,
    type: "Số sàn",
    fuel: "Xăng",
    totalRentalCount: 700,
  },
  {
    id: "5",
    name: "Honda CR-V 2024",
    brand: "Honda",
    imageUrl: "https://hondalongbien.vn/wp-content/uploads/2020/07/ab3.jpg",
    price: 1600000,
    rating: 4.7,
    seats: 7,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 950,
  },
  {
    id: "6",
    name: "Ford Ranger 2024",
    brand: "Ford",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWXRGWjxGteJVFXxXbHO9QvA3M5VZOGz_ejQ&s",
    price: 1800000,
    rating: 4.8,
    seats: 5,
    type: "Số sàn",
    fuel: "Dầu",
    totalRentalCount: 880,
  },
  {
    id: "7",
    name: "Mitsubishi Xpander 2024",
    brand: "Mitsubishi",
    imageUrl:
      "https://mitsubishinamdinh.vn/wp-content/uploads/Xpander-2024.webp",
    price: 1400000,
    rating: 4.5,
    seats: 7,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 650,
  },
  {
    id: "8",
    name: "VinFast Lux A2.0",
    brand: "VinFast",
    imageUrl:
      "https://vinfastotohaiphong.com.vn/images/news/978z24812906670422f678d7da3c35a1ed93b32fb546c2644.jpg",
    price: 1500000,
    rating: 4.4,
    seats: 5,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 500,
  },
  {
    id: "9",
    name: "Mercedes-Benz C200",
    brand: "Mercedes",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8lkFloNSxVTbYbfgqbYfRxVqxIxTKbuRjSQ&s",
    price: 2800000,
    rating: 5.0,
    seats: 5,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 1200,
  },
  {
    id: "10",
    name: "BMW X5",
    brand: "BMW",
    imageUrl:
      "https://bmwvietnam.com.vn/wp-content/uploads/2022/05/BMW-X5-MSP-LCI-2024-400x300.jpg",
    price: 3200000,
    rating: 4.9,
    seats: 7,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 1100,
  },
  {
    id: "11",
    name: "Audi Q7",
    brand: "Audi",
    imageUrl:
      "https://giaxeaudi.com.vn/wp-content/uploads/Audi-Q7-2-e1722932278302.jpg",
    price: 3600000,
    rating: 5.0,
    seats: 7,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 1500,
  },
  {
    id: "12",
    name: "Porsche Cayenne",
    brand: "Porsche",
    imageUrl:
      "https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/Cayenne-2024/9903/Porsche-Cayenne-2024-/1681882894783/front-left-side-47.jpg",
    price: 4200000,
    rating: 5.0,
    seats: 5,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 1800,
  },
  {
    id: "13",
    name: "Lexus RX350",
    brand: "Lexus",
    imageUrl:
      "https://files01.danhgiaxe.com/liL7gMAPnir2hdrNrzWPFvFZCrU=/fit-in/1280x0/20221109/1-173206.jpg",
    price: 4000000,
    rating: 4.8,
    seats: 5,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 950,
  },
  {
    id: "14",
    name: "Peugeot 3008",
    brand: "Peugeot",
    imageUrl:
      "https://img.tinxe.vn/resize/1000x-/2021/06/28/8EVDUW1z/gia-xe-peugeot-3008-2021-9-1df0.jpg",
    price: 1600000,
    rating: 4.7,
    seats: 5,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 870,
  },
  {
    id: "15",
    name: "Suzuki Ertiga",
    brand: "Suzuki",
    imageUrl:
      "https://files01.danhgiaxe.com/PUtur4J6qcLWnIK3QskMKlAUlJg=/fit-in/1280x0/20210708/dgx_suzuki-ertiga-20-003149-222847.jpeg",
    price: 1200000,
    rating: 4.3,
    seats: 7,
    type: "Số sàn",
    fuel: "Xăng",
    totalRentalCount: 400,
  },
  {
    id: "16",
    name: "Isuzu Mu-X",
    brand: "Isuzu",
    imageUrl:
      "https://www.winauto.vn/wp-content/uploads/2024/09/isuzu-mu-x-640x427.jpg",
    price: 1700000,
    rating: 4.6,
    seats: 7,
    type: "Số sàn",
    fuel: "Dầu",
    totalRentalCount: 620,
  },
  {
    id: "17",
    name: "Chevrolet Colorado",
    brand: "Chevrolet",
    imageUrl:
      "https://cdn.motor1.com/images/mgl/GNAQ8/s1/2018-chevrolet-colorado-zr2.webp",
    price: 1800000,
    rating: 4.5,
    seats: 5,
    type: "Số sàn",
    fuel: "Dầu",
    totalRentalCount: 580,
  },
  {
    id: "18",
    name: "Volkswagen Tiguan",
    brand: "Volkswagen",
    imageUrl:
      "https://www.carmudi.vn/_next/image/?url=https://static.carmudi.vn/wp-content/uploads/2024-11/GRuNMos7fg.jpg&w=1200&q=75",
    price: 3200000,
    rating: 4.9,
    seats: 7,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 1300,
  },
  {
    id: "19",
    name: "Range Rover Evoque",
    brand: "Land Rover",
    imageUrl:
      "https://www.thecarexpert.co.uk/wp-content/uploads/2020/04/range-rover-evoque-2019.jpg",
    price: 4000000,
    rating: 5.0,
    seats: 5,
    type: "Số tự động",
    fuel: "Xăng",
    totalRentalCount: 2000,
  },
  {
    id: "20",
    name: "Tesla Model 3",
    brand: "Tesla",
    imageUrl:
      "https://vcdn1-vnexpress.vnecdn.net/2021/04/07/tesla-model-3-vne-2-jpg-161777-7519-6031-1617781887.jpg?w=460&h=0&q=100&dpr=2&fit=crop&s=hNT1mbsOyc8nZJi5QUnnEA",
    price: 4500000,
    rating: 5.0,
    seats: 5,
    type: "Số tự động",
    fuel: "Điện",
    totalRentalCount: 1700,
  },
];

export const listInstructorOptions: IInstructorOption[] = [
  {
    id: 1,
    imageUrl: require("@/assets/images/5-years-experience.png"),
    title: "Người hướng dẫn trên 5 năm kinh nghiệm",
    description: "200+ người hướng dẫn",
  },
  {
    id: 2,
    imageUrl: require("@/assets/images/7-years-experience.png"),
    title: "Người hướng dẫn trên 7 năm kinh nghiệm",
    description: "200+ người hướng dẫn",
  },
];

export const popularPackages = [
  {
    id: "pkg_1_1",
    instructorId: "1",
    instructorName: "Nguyễn Văn An",
    name: "Gói Thành Phố Cơ Bản",
    duration: 2,
    basePrice: 450000,
    roadTypes: ["Đường phố", "Đường hẹp"],
    skills: ["Đỗ xe ngang", "Quay đầu", "Lùi xe"],
    hasVehicle: false,
    rating: 4.9,
    bookingCount: 250,
  },
  {
    id: "pkg_2_2",
    instructorId: "2",
    instructorName: "Trần Thị Bình",
    name: "Gói Cao Tốc + Xe",
    duration: 3,
    basePrice: 1200000,
    roadTypes: ["Cao tốc", "Đường lớn"],
    skills: ["Chuyển làn", "Vượt xe", "Xử lý tốc độ cao"],
    hasVehicle: true,
    rating: 5.0,
    bookingCount: 320,
  },
  {
    id: "pkg_1_2",
    instructorId: "1",
    instructorName: "Nguyễn Văn An",
    name: "Gói Thành Phố + Xe",
    duration: 2,
    basePrice: 850000,
    roadTypes: ["Đường phố", "Nội đô"],
    skills: ["Đỗ xe", "Lùi xe", "Xử lý giao thông"],
    hasVehicle: true,
    rating: 4.8,
    bookingCount: 180,
  },
  {
    id: "pkg_3_1",
    instructorId: "3",
    instructorName: "Lê Văn Cường",
    name: "Gói Đường Núi Chuyên Sâu",
    duration: 4,
    basePrice: 950000,
    roadTypes: ["Đường núi", "Đèo cao"],
    skills: ["Điều khiển dốc", "Phanh đường xuống", "Vào cua gấp"],
    hasVehicle: false,
    rating: 4.9,
    bookingCount: 145,
  },
  {
    id: "pkg_4_1",
    instructorId: "4",
    instructorName: "Phạm Thị Dung",
    name: "Gói Tổng Hợp + Xe",
    duration: 3,
    basePrice: 1100000,
    roadTypes: ["Thành phố", "Cao tốc", "Ngoại thành"],
    skills: ["Đỗ xe", "Vượt xe", "Xử lý khẩn cấp", "Chuyển làn"],
    hasVehicle: true,
    rating: 5.0,
    bookingCount: 290,
  },
  {
    id: "pkg_5_1",
    instructorId: "5",
    instructorName: "Hoàng Minh Tuấn",
    name: "Gói Lái Xe Ban Đêm",
    duration: 2.5,
    basePrice: 700000,
    roadTypes: ["Đường phố", "Nội đô"],
    skills: ["Lái ban đêm", "Sử dụng đèn", "Quan sát"],
    hasVehicle: false,
    rating: 4.7,
    bookingCount: 165,
  },
];

