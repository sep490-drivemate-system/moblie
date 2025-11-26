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
  rating: number
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
