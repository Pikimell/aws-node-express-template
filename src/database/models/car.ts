export type Car = {
  _id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  color?: string | null;
  price?: number | null;
  mileage?: number | null;
  vin?: string | null;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCarInput = Omit<Car, "_id" | "createdAt" | "updatedAt">;
export type UpdateCarInput = Partial<CreateCarInput>;
export type CarDocument = Car;
