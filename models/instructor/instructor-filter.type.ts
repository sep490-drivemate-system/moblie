export enum ExperienceLevel {
  All = 'ALL',
  OneToThree = '1-3',
  ThreeToFive = '3-5',
  FiveToTen = '5-10',
  TenPlus = '10+',
}

export enum MinimumRating {
  All = 'ALL',
  ThreePlus = '3+',
  FourPlus = '4+',
  FourPointFivePlus = '4.5+',
  Five = '5',
}

export enum FilterType {
  All = 'all',
  Available = 'available',
  Busy = 'busy',
}

export enum DistanceFilter {
  All = 'all',
  OneToThree = '1-3',
  ThreeToFive = '3-5',
  FiveToTen = '5-10',
  TenPlus = '10+',
}

export enum SortType {
  Rating = 'rating',
  Bookings = 'bookings',
  Price = 'price',
  Experience = 'experience',
}

export interface FilterState {
  availability: FilterType;
  distance: DistanceFilter;
  experience: ExperienceLevel;
  minRating: MinimumRating;
  priceRange: [number, number];
}
