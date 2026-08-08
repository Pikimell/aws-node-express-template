import { supabase } from '../database/supabase.js';
import type {
  Car,
  CreateCarInput,
  UpdateCarInput,
} from '../database/models/car.js';
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

type CarRow = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  price: number | null;
  mileage: number | null;
  vin: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
};

const CAR_SORT_COLUMNS: Record<string, keyof CarRow> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  make: 'make',
  model: 'model',
  year: 'year',
  price: 'price',
  mileage: 'mileage',
};

const carSelect =
  'id,user_id,make,model,year,color,price,mileage,vin,images,created_at,updated_at';

const mapCar = (row: CarRow): Car => ({
  _id: row.id,
  userId: row.user_id,
  make: row.make,
  model: row.model,
  year: row.year,
  color: row.color,
  price: row.price,
  mileage: row.mileage,
  vin: row.vin,
  images: row.images,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const getSort = (sort: Record<string, 1 | -1>) => {
  const [field = 'createdAt', direction = -1] = Object.entries(sort)[0] ?? [];
  return {
    column: CAR_SORT_COLUMNS[field] ?? CAR_SORT_COLUMNS.createdAt,
    ascending: direction === 1,
  };
};

const applyCarFilters = <T>(
  request: T,
  filters: CarQueryFilters | CarsAggregationFilters,
) => {
  let filtered = request as T & {
    eq: (column: string, value: unknown) => typeof filtered;
    ilike: (column: string, pattern: string) => typeof filtered;
  };

  if (filters.userId) filtered = filtered.eq('user_id', filters.userId);
  if (filters.make) filtered = filtered.ilike('make', `%${filters.make}%`);
  if ('model' in filters && filters.model) {
    filtered = filtered.ilike('model', `%${filters.model}%`);
  }
  if ('year' in filters && filters.year) filtered = filtered.eq('year', filters.year);
  if ('color' in filters && filters.color) {
    filtered = filtered.ilike('color', `%${filters.color}%`);
  }
  if ('vin' in filters && filters.vin) {
    filtered = filtered.eq('vin', filters.vin.toUpperCase());
  }

  return filtered as T;
};

const normalizeCarInput = (carData: CreateCarInput | UpdateCarInput) => ({
  ...carData,
  vin: carData.vin ? carData.vin.toUpperCase() : carData.vin,
});

const average = (values: number[]) => {
  if (!values.length) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};

const compactNumbers = (values: Array<number | null | undefined>) =>
  values.filter((value): value is number => typeof value === 'number');

const fetchCarsForStats = async (filters: CarsAggregationFilters) => {
  const request = applyCarFilters(
    supabase.from('cars').select(carSelect),
    filters,
  );
  const { data, error } = await request.returns<CarRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapCar);
};

export const getAllCars = async ({
  page = 1,
  perPage = 10,
  sort = { createdAt: -1 },
  ...filters
}: CarQueryOptions) => {
  const offset = (page - 1) * perPage;
  const { column, ascending } = getSort(sort);

  try {
    const request = applyCarFilters(
      supabase
        .from('cars')
        .select(carSelect, { count: 'exact' })
        .order(column, { ascending })
        .range(offset, offset + perPage - 1),
      filters,
    );
    const { data, count, error } = await request.returns<CarRow[]>();

    if (error) throw error;

    const paginationInfo = calculatePaginationData(count ?? 0, page, perPage);

    return {
      ...paginationInfo,
      cars: (data ?? []).map(mapCar),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars: ' + message);
  }
};

export const getCarsStatsByMake = async (
  filters: CarsAggregationFilters = {},
) => {
  try {
    const cars = await fetchCarsForStats(filters);
    const groups = new Map<string, Car[]>();

    for (const car of cars) {
      groups.set(car.make, [...(groups.get(car.make) ?? []), car]);
    }

    return [...groups.entries()]
      .map(([make, makeCars]) => {
        const prices = compactNumbers(makeCars.map((car) => car.price));
        const mileages = compactNumbers(makeCars.map((car) => car.mileage));
        const years = makeCars.map((car) => car.year);

        return {
          make,
          totalCars: makeCars.length,
          averagePrice: average(prices),
          averageMileage: average(mileages),
          minYear: Math.min(...years),
          maxYear: Math.max(...years),
        };
      })
      .sort((a, b) => b.totalCars - a.totalCars || a.make.localeCompare(b.make));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars stats by make: ' + message);
  }
};

export const getCarsStatsByYear = async (
  filters: CarsAggregationFilters = {},
) => {
  try {
    const cars = await fetchCarsForStats(filters);
    const groups = new Map<number, Car[]>();

    for (const car of cars) {
      groups.set(car.year, [...(groups.get(car.year) ?? []), car]);
    }

    return [...groups.entries()]
      .map(([year, yearCars]) => ({
        year,
        totalCars: yearCars.length,
        averagePrice: average(compactNumbers(yearCars.map((car) => car.price))),
        makes: [...new Set(yearCars.map((car) => car.make))].sort(),
      }))
      .sort((a, b) => b.year - a.year);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars stats by year: ' + message);
  }
};

export const getCarsSummary = async (filters: CarsAggregationFilters = {}) => {
  try {
    const cars = await fetchCarsForStats(filters);
    const prices = compactNumbers(cars.map((car) => car.price));
    const mileages = compactNumbers(cars.map((car) => car.mileage));

    return {
      totalCars: cars.length,
      averagePrice: average(prices),
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      averageMileage: average(mileages),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars summary: ' + message);
  }
};

export const getCarById = async (carId: string) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select(carSelect)
      .eq('id', carId)
      .maybeSingle<CarRow>();

    if (error) throw error;
    return data ? mapCar(data) : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching car: ' + message);
  }
};

export const createCar = async (carData: CreateCarInput) => {
  try {
    const data = normalizeCarInput(carData);
    const { data: createdCar, error } = await supabase
      .from('cars')
      .insert({
        user_id: data.userId,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color ?? null,
        price: data.price ?? null,
        mileage: data.mileage ?? null,
        vin: data.vin ?? null,
        images: data.images ?? [],
      })
      .select(carSelect)
      .single<CarRow>();

    if (error) throw error;
    return mapCar(createdCar);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error creating car: ' + message);
  }
};

export const updateCar = async (carId: string, carData: UpdateCarInput) => {
  try {
    const data = normalizeCarInput(carData);
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.userId !== undefined) updates.user_id = data.userId;
    if (data.make !== undefined) updates.make = data.make;
    if (data.model !== undefined) updates.model = data.model;
    if (data.year !== undefined) updates.year = data.year;
    if (data.color !== undefined) updates.color = data.color;
    if (data.price !== undefined) updates.price = data.price;
    if (data.mileage !== undefined) updates.mileage = data.mileage;
    if (data.vin !== undefined) updates.vin = data.vin;
    if (data.images !== undefined) updates.images = data.images;

    const { data: updatedCar, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', carId)
      .select(carSelect)
      .maybeSingle<CarRow>();

    if (error) throw error;
    return updatedCar ? mapCar(updatedCar) : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error updating car: ' + message);
  }
};

export const deleteCar = async (carId: string) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId)
      .select(carSelect)
      .maybeSingle<CarRow>();

    if (error) throw error;
    return data ? mapCar(data) : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error deleting car: ' + message);
  }
};
