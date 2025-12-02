import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const newsSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["updates", "news", "testimonials", "video stories"],
    },
    typeAccount: {
      type: String,
      required: true,
      enum: ["freeUser", "paidUser", "agencyUser"],
    },
    topic: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },

    files: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type News = InferSchemaType<typeof newsSchema>;
export type NewsDocument = HydratedDocument<News>;

export const NewsCollection = model<News>("news", newsSchema);
