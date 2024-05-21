import 'reflect-metadata';
import { container } from 'tsyringe';
import { DataSource } from 'typeorm';
import AppDataSource from './infrastructure/orm/ormconfig';
import './infrastructure/dependencyInjection/userDependencies';
import './infrastructure/dependencyInjection/recipientDependencies';
import './infrastructure/dependencyInjection/servicesDependencies';
import './infrastructure/dependencyInjection/orderDependencias';
import './infrastructure/dependencyInjection/trackingCodeDependencies';
import './infrastructure/dependencyInjection/notificationDependencies';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    container.registerInstance<DataSource>('DataSource', AppDataSource);

    import('./app').then(({ createApp }) => {
      const app = createApp();

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  })
  .catch((error: any) => {
    console.error('Error during Data Source initialization', error);
    process.exit(1);
  });
