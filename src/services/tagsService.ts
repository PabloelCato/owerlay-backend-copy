import { myDataSource } from '../datasource.js';
import { Tag } from '../entities/Tag.js';

const getTags = async () => {
  return await myDataSource.getRepository(Tag).find();
};

export default { getTags };
