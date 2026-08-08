import { query } from '../database/postgres.js';
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

const CAR_SORT_COLUMNS: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  make: 'make',
  model: 'model',
  year: 'year',
  price: 'price',
  mileage: 'mileage',
};

const carSelect = `
  id as "_id",
  user_id as "userId",
  make,
  model,
  year,
  color,
  price::float as price,
  mileage::float as mileage,
  vin,
  images,
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

const getSortClause = (sort: Record<string, 1 | -1>) => {
  const [field = 'createdAt', direction = -1] = Object.entries(sort)[0] ?? [];
  const column = CAR_SORT_COLUMNS[field] ?? CAR_SORT_COLUMNS.createdAt;
  return `${column} ${direction === 1 ? 'asc' : 'desc'}`;
};

const buildCarsWhereClause = (filters: CarQueryFilters | CarsAggregationFilters) => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.userId) {
    values.push(filters.userId);
    conditions.push(`user_id = $${values.length}`);
  }
  if (filters.make) {
    values.push(`%${filters.make}%`);
    conditions.push(`make ilike $${values.length}`);
  }
  if ('model' in filters && filters.model) {
    values.push(`%${filters.model}%`);
    conditions.push(`model ilike $${values.length}`);
  }
  if ('year' in filters && filters.year) {
    values.push(filters.year);
    conditions.push(`year = $${values.length}`);
  }
  if ('color' in filters && filters.color) {
    values.push(`%${filters.color}%`);
    conditions.push(`color ilike $${values.length}`);
  }
  if ('vin' in filters && filters.vin) {
    values.push(filters.vin.toUpperCase());
    conditions.push(`vin = $${values.length}`);
  }

  return {
    values,
    where: conditions.length ? `where ${conditions.join(' and ')}` : '',
  };
};

const normalizeCarInput = (carData: CreateCarInput | UpdateCarInput) => {
  return {
    ...carData,
    vin: carData.vin ? carData.vin.toUpperCase() : carData.vin,
  };
};

export const getAllCars = async ({
  page = 1,
  perPage = 10,
  sort = { createdAt: -1 },
  ...filters
}: CarQueryOptions) => {
  const offset = (page - 1) * perPage;

  const { values, where } = buildCarsWhereClause(filters);
  const orderBy = getSortClause(sort);

  try {
    const totalResult = await query<{ count: string }>(
      `select count(*) from cars ${where}`,
      values,
    );
    const carsResult = await query<Car>(
      `
        select ${carSelect}
        from cars
        ${where}
        order by ${orderBy}
        limit $${values.length + 1}
        offset $${values.length + 2}
      `,
      [...values, perPage, offset],
    );
    const totalCars = Number(totalResult.rows[0]?.count ?? 0);

    const paginationInfo = calculatePaginationData(totalCars, page, perPage);

    return {
      ...paginationInfo,
      cars: carsResult.rows,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars: ' + message);
  }
};

export const getCarsStatsByMake = async (
  filters: CarsAggregationFilters = {},
) => {
  const { values, where } = buildCarsWhereClause(filters);

  try {
    const result = await query(
      `
        select
          make,
          count(*)::int as "totalCars",
          round(avg(price)::numeric, 2)::float as "averagePrice",
          round(avg(mileage)::numeric, 2)::float as "averageMileage",
          min(year)::int as "minYear",
          max(year)::int as "maxYear"
        from cars
        ${where}
        group by make
        order by "totalCars" desc, make asc
      `,
      values,
    );

    return result.rows;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars stats by make: ' + message);
  }
};

export const getCarsStatsByYear = async (
  filters: CarsAggregationFilters = {},
) => {
  const { values, where } = buildCarsWhereClause(filters);

  try {
    const result = await query(
      `
        select
          year,
          count(*)::int as "totalCars",
          round(avg(price)::numeric, 2)::float as "averagePrice",
          array_agg(distinct make order by make) as makes
        from cars
        ${where}
        group by year
        order by year desc
      `,
      values,
    );

    return result.rows;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching cars stats by year: ' + message);
  }
};

export const getCarsSummary = async (filters: CarsAggregationFilters = {}) => {
  const { values, where } = buildCarsWhereClause(filters);

  try {
    const result = await query(
      `
        select
          count(*)::int as "totalCars",
          round(avg(price)::numeric, 2)::float as "averagePrice",
          min(price)::float as "minPrice",
          max(price)::float as "maxPrice",
          round(avg(mileage)::numeric, 2)::float as "averageMileage"
        from cars
        ${where}
      `,
      values,
    );
    const summary = result.rows[0];

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
    const result = await query<Car>(
      `
        select ${carSelect}
        from cars
        where id = $1
        limit 1
      `,
      [carId],
    );

    return result.rows[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error fetching car: ' + message);
  }
};

export const createCar = async (carData: CreateCarInput) => {
  try {
    const data = normalizeCarInput(carData);
    const result = await query<Car>(
      `
        insert into cars (
          user_id, make, model, year, color, price, mileage, vin, images
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning ${carSelect}
      `,
      [
        data.userId,
        data.make,
        data.model,
        data.year,
        data.color ?? null,
        data.price ?? null,
        data.mileage ?? null,
        data.vin ?? null,
        data.images ?? [],
      ],
    );

    return result.rows[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error creating car: ' + message);
  }
};

export const updateCar = async (carId: string, carData: UpdateCarInput) => {
  try {
    const data = normalizeCarInput(carData);
    const result = await query<Car>(
      `
        update cars
        set
          user_id = coalesce($2, user_id),
          make = coalesce($3, make),
          model = coalesce($4, model),
          year = coalesce($5, year),
          color = coalesce($6, color),
          price = coalesce($7, price),
          mileage = coalesce($8, mileage),
          vin = coalesce($9, vin),
          images = coalesce($10, images),
          updated_at = now()
        where id = $1
        returning ${carSelect}
      `,
      [
        carId,
        data.userId ?? null,
        data.make ?? null,
        data.model ?? null,
        data.year ?? null,
        data.color ?? null,
        data.price ?? null,
        data.mileage ?? null,
        data.vin ?? null,
        data.images ?? null,
      ],
    );

    return result.rows[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error updating car: ' + message);
  }
};

export const deleteCar = async (carId: string) => {
  try {
    const result = await query<Car>(
      `
        delete from cars
        where id = $1
        returning ${carSelect}
      `,
      [carId],
    );

    return result.rows[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Error deleting car: ' + message);
  }
};
