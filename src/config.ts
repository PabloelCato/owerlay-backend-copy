import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 8_080;

export const MYSQL_CONFIG = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
};

export const API_KEY = process.env.API_KEY;
