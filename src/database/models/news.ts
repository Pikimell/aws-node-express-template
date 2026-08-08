export type NewsType = "updates" | "news" | "testimonials" | "video stories";
export type NewsAccountType = "freeUser" | "paidUser" | "agencyUser";

export type News = {
  _id: string;
  userId: string;
  type: NewsType;
  typeAccount: NewsAccountType;
  topic: string;
  text: string;
  files: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateNewsInput = Omit<News, "_id" | "createdAt" | "updatedAt">;
export type NewsDocument = News;
