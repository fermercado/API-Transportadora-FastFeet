import 'reflect-metadata';
import { container } from 'tsyringe';
import { DataSource } from 'typeorm';
import AppDataSource from './ormconfig';
import './dependencyContainer';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('DataSource inicializado com sucesso.');
    container.registerInstance<DataSource>('DataSource', AppDataSource);
    console.log('Importando e criando a aplicação Express...');

    import('./app').then(({ createApp }) => {
      const app = createApp();
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
    process.exit(1);
  });
