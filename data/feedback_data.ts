import { RatingSummary } from "@/models/feedback/feedback";

export const feedbackData: RatingSummary = {
  average: 4.9,
  totalReviews: 245,
  distribution: [
    { stars: 5, percent: 85 },
    { stars: 4, percent: 10 },
    { stars: 3, percent: 5 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 0 },
  ],
  reviews: [
    {
      id: "1",
      reviewer: {
        name: "Nguyễn Văn A",
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      rating: 5,
      comment:
        "Giảng viên rất nhiệt tình và kiên nhẫn. Giúp tôi tự tin hơn khi lái xe.",
      date: "01/01/2025",
    },
    {
      id: "2",
      reviewer: {
        name: "Trần Thị B",
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      rating: 5,
      comment: "Xe đẹp, giảng viên chuyên nghiệp. Recommend!",
      date: "12/05/2025",
    },
  ],
};
