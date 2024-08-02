import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from '../ormconfig';
import identifyRouter from './routes/identify';
import dataRouter from './routes/get_data';



const app = express();
const PORT = process.env.PORT || 3090;

AppDataSource.initialize().then(() => {
  app.use(express.json());
  app.use('/identify', identifyRouter);
  app.use('/data', dataRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => console.log(error));
