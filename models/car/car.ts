export interface Car {
  id: number;
  name: string;
  brand: string;
  seats: number;
  type: string;
  fuel: string;
  imageUrl: string;
  images?: string[];
  pricing: {
    halfDay: {
      price: number;
      duration: number;
    };
    fullDay: {
      price: number;
      duration: number;
    };
  };
  instructor: {
    experience: string;
  };
  location: string;
  rating: {
    score: number;
    totalStudents: number;
  };
}
