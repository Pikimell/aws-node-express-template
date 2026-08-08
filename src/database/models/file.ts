import { HydratedDocument, InferSchemaType, model, Schema } from 'mongoose';

const fileSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export type File = InferSchemaType<typeof fileSchema>;
export type FileDocument = HydratedDocument<File>;

export const FileCollection = model<File>('files', fileSchema);
