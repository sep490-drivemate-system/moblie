export interface Reviewer {
  name: string;
  avatarUrl: string;
}

export interface Review {
  id: string;
  reviewer: Reviewer;
  rating: number;
  comment: string;
  date: string;
}

export interface RatingDistribution {
  stars: number;
  percent: number;
}

export interface RatingSummary {
  average: number;
  totalReviews: number;
  reviews: Review[];
  distribution: RatingDistribution[];
}
