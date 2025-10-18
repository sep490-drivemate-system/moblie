export const SEAT_OPTIONS = [
  { id: 1, value: 4, label: "4 chỗ" },
  { id: 2, value: 5, label: "5 chỗ" },
  { id: 3, value: 7, label: "7 chỗ" },
  { id: 4, value: 9, label: "9 chỗ" },
];

export const BRAND_OPTIONS = [
  { id: 1, value: "Kia", label: "Kia" },
  { id: 2, value: "Toyota", label: "Toyota" },
  { id: 3, value: "Mazda", label: "Mazda" },
  { id: 4, value: "Hyundai", label: "Hyundai" },
  { id: 5, value: "Honda", label: "Honda" },
  { id: 6, value: "Ford", label: "Ford" },
  { id: 7, value: "Mitsubishi", label: "Mitsubishi" },
  { id: 8, value: "VinFast", label: "VinFast" },
  { id: 9, value: "Mercedes", label: "Mercedes" },
  { id: 10, value: "BMW", label: "BMW" },
  { id: 11, value: "Audi", label: "Audi" },
  { id: 12, value: "Porsche", label: "Porsche" },
  { id: 13, value: "Lexus", label: "Lexus" },
  { id: 14, value: "Peugeot", label: "Peugeot" },
  { id: 15, value: "Suzuki", label: "Suzuki" },
  { id: 16, value: "Isuzu", label: "Isuzu" },
  { id: 17, value: "Chevrolet", label: "Chevrolet" },
  { id: 18, value: "Volkswagen", label: "Volkswagen" },
  { id: 19, value: "Land Rover", label: "Land Rover" },
  { id: 20, value: "Tesla", label: "Tesla" },
];

export const TYPE_OPTIONS = [
  { id: 1, value: "Số tự động", label: "Số tự động" },
  { id: 2, value: "Số sàn", label: "Số sàn" },
];

export const FUEL_OPTIONS = [
  { id: 1, value: "Xăng", label: "Xăng" },
  { id: 2, value: "Dầu", label: "Dầu" },
  { id: 3, value: "Điện", label: "Điện" },
];

export const FILTER_TYPES = {
  SEATS: "seats",
  BRAND: "brand", 
  TYPE: "type",
  FUEL: "fuel",
} as const;

export type FilterType = typeof FILTER_TYPES[keyof typeof FILTER_TYPES];
