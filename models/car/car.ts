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

