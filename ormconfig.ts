import { DataSource } from 'typeorm';
import { Contact } from './src/entity/contact';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  synchronize: false,
  logging: false,
  entities: [Contact],
});

AppDataSource.initialize()
  .then(async() => {
    
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Drop the table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS contact`);
    
    // Re-synchronize the database schema
    await AppDataSource.synchronize();
    console.log('Data Source has been initialized!');
  })
  .catch((err) => console.error('Error during Data Source initialization', err));
