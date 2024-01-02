import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { myDataSource } from './datasource.js';
import tagsRoutes from './routes/tagsRoutes.js';
import imagesRoutes from './routes/imagesRoutes.js';
import locationsRoutes from './routes/locationsRoutes.js';

const app = express();

app.use(cors(), express.json({ limit: '10mb' }));

myDataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch(err => {
    console.error('Error during Data Source initialization:', err);
  });

app.use('/tags', tagsRoutes);
app.use('/images', imagesRoutes);
app.use('/locations', locationsRoutes);

app.get('/', (_, res) => {
  res.send({ message: 'Server is running.' }).end();
});

app.all('*', (_, res) => {
  res.status(404).send({ error: 'Page not found.' }).end();
});

app.listen(PORT, () => console.log(`Server is running on: ${PORT}`));
