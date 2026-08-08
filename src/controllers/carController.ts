import { RequestHandler } from "express";

import * as services from "../services/carService.js";
import { parseCarsQuery } from "../utils/parseCarsQuery.js";

export const getAllCarsController: RequestHandler = async (req, res, next) => {
  try {
    const { pagination, filters } = parseCarsQuery(req.query);
    const result = await services.getAllCars({
      ...pagination,
      ...filters,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCarsStatsByMakeController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const result = await services.getCarsStatsByMake(req.query);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCarsStatsByYearController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const result = await services.getCarsStatsByYear(req.query);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCarsSummaryController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const result = await services.getCarsSummary(req.query);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCarByIdController: RequestHandler = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const result = await services.getCarById(carId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const createCarController: RequestHandler = async (req, res, next) => {
  try {
    const result = await services.createCar(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateCarController: RequestHandler = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const result = await services.updateCar(carId, req.body);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteCarController: RequestHandler = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const result = await services.deleteCar(carId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
