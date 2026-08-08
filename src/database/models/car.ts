import { HydratedDocument, InferSchemaType, model, Schema } from 'mongoose';

const carSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1886,
    },
    color: {
      type: String,
    },
    price: {
      type: Number,
      min: 0,
    },
    mileage: {
      type: Number,
      min: 0,
    },
    vin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export type Car = InferSchemaType<typeof carSchema>;
export type CarDocument = HydratedDocument<Car>;

export const CarsCollection = model<Car>('cars', carSchema);
