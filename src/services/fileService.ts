import type { FilterQuery, UpdateQuery } from "mongoose";

import { FileCollection, type File } from "../database/models/file.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export type FileQueryFilters = Partial<Pick<File, "name" | "url" | "userId">>;

export type FileQueryOptions = FileQueryFilters & {
  page?: number;
  perPage?: number;
  sort?: Record<string, 1 | -1>;
};

export const getAllFiles = async ({
  page = 1,
  perPage = 10,
  sort = { createdAt: -1 },
  ...filters
}: FileQueryOptions) => {
  const offset = (page - 1) * perPage;

  const query: FilterQuery<File> = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }
  if (filters.url) {
    query.url = { $regex: filters.url, $options: "i" };
  }
  if (filters.userId) {
    query.userId = filters.userId;
  }

  try {
    const totalFiles = await FileCollection.countDocuments(query);
    const filesList = await FileCollection.find(query)
      .sort(sort)
      .skip(offset)
      .limit(perPage);

    const paginationInfo = calculatePaginationData(totalFiles, page, perPage);

    return {
      ...paginationInfo,
      files: filesList,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching files: " + message);
  }
};

export const getFileById = async (fileId: string) => {
  try {
    return await FileCollection.findById(fileId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching file: " + message);
  }
};

export const createFile = async (fileData: File) => {
  try {
    return await FileCollection.create(fileData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error creating file: " + message);
  }
};

export const updateFile = async (
  fileId: string,
  fileData: UpdateQuery<File>,
) => {
  try {
    return await FileCollection.findByIdAndUpdate(fileId, fileData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error updating file: " + message);
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    return await FileCollection.findByIdAndDelete(fileId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error deleting file: " + message);
  }
};
