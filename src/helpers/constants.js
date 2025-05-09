import { env } from '../utils/env.js';

export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 31;

export const USER_POOL_ID = env('COGNITO_USER_POOL_ID');
export const CLIENT_ID = env('COGNITO_CLIENT_ID');

console.log(USER_POOL_ID, CLIENT_ID);
