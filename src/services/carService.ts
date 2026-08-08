import type { FilterQuery, PipelineStage, UpdateQuery } from 'mongoose';

import { CarsCollection, type Car } from '../database/models/car.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export type CarQueryFilters = Partial<
  Pick<Car, 'userId' | 'make' | 'model' | 'year' | 'color' | 'vin'>
>;

export type CarQueryOptions = CarQueryFilters & {
  page?: number;
  perPage?: number;
  sort?: Record<string, 1 | -1>;
};

export type CarsAggregationFilters = Partial<Pick<Car, 'userId' | 'make'>>;

const buildCarsAggregationMatch = (
  filters: CarsAggregationFilters,
): PipelineStage.Match['$match'] => {
  const match: PipelineStage.Match['$match'] = {};

  if (filters.userId) {
    match.userId = filters.userId;
  }
  if (filters.make) {
    match.make = { $regex: filters.make, $options: 'i' };
  }

  return match;
};

export const getAllCars = async ({
  page = 1,
  perPage = 10,
  sort = { createdAt: -1 },
  ...filters
}: CarQueryOptions) => {
  const offset = (page - 1) * perPage;

  const query: FilterQuery<Car> = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }
  if (filters.make) {
    query.make = { $regex: filters.make, $options: 'i' };
  }
  if (filters.model) {
    query.model = { $regex: filters.model, $options: 'i' };
  }
  if (filters.year) {
    query.year = filters.year;
  }
  if (filters.color) {
    query.color = { $regex: filters.color, $options: 'i' };
  }
  if (filters.vin) {
    query.vin = filters.vin.toUpperCase();
  }

  try {
    const totalCars = await CarsCollection.countDocuments(query);
    const carsList = await CarsCollection.find(query)
      .sort(sort)
      .skip(offset)
      .limit(perPage);

    const paginationInfo = calculatePaginationData(totalCars, page, perPage);

    return {
      ...paginationInfo,
      cars: carsList,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars: ' + message);
  }
};

export const getCarsStatsByMake = async (
  filters: CarsAggregationFilters = {},
) => {
  const match = buildCarsAggregationMatch(filters);

  try {
    return await CarsCollection.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$make',
          totalCars: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          averageMileage: { $avg: '$mileage' },
          minYear: { $min: '$year' },
          maxYear: { $max: '$year' },
        },
      },
      {
        $project: {
          _id: 0,
          make: '$_id',
          totalCars: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          averageMileage: { $round: ['$averageMileage', 2] },
          minYear: 1,
          maxYear: 1,
        },
      },
      { $sort: { totalCars: -1, make: 1 } },
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars stats by make: ' + message);
  }
};

export const getCarsStatsByYear = async (
  filters: CarsAggregationFilters = {},
) => {
  const match = buildCarsAggregationMatch(filters);

  try {
    return await CarsCollection.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$year',
          totalCars: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          makes: { $addToSet: '$make' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          totalCars: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          makes: 1,
        },
      },
      { $sort: { year: -1 } },
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars stats by year: ' + message);
  }
};

export const getCarsSummary = async (filters: CarsAggregationFilters = {}) => {
  const match = buildCarsAggregationMatch(filters);

  try {
    const [summary] = await CarsCollection.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCars: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          averageMileage: { $avg: '$mileage' },
        },
      },
      {
        $project: {
          _id: 0,
          totalCars: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          minPrice: 1,
          maxPrice: 1,
          averageMileage: { $round: ['$averageMileage', 2] },
        },
      },
    ]);

    return (
      summary || {
        totalCars: 0,
        averagePrice: null,
        minPrice: null,
        maxPrice: null,
        averageMileage: null,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars summary: ' + message);
  }
};

export const getCarById = async (carId: string) => {
  try {
    return await CarsCollection.findById(carId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching car: ' + message);
  }
};

export const createCar = async (carData: Car) => {
  try {
    return await CarsCollection.create(carData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error creating car: ' + message);
  }
};

export const updateCar = async (carId: string, carData: UpdateQuery<Car>) => {
  try {
    return await CarsCollection.findByIdAndUpdate(carId, carData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error updating car: ' + message);
  }
};

export const deleteCar = async (carId: string) => {
  try {
    return await CarsCollection.findByIdAndDelete(carId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error deleting car: ' + message);
  }
};
