import { DataSource, DataSourceOptions } from 'typeorm';
import { MYSQL_CONFIG } from './config.js';

const dataSourceOptions: DataSourceOptions = {
  ...MYSQL_CONFIG,
  type: 'mysql',
  entities: ['src/entities/*.ts'],
  logging: true,
  synchronize: true,
};

export const myDataSource = new DataSource(dataSourceOptions);
