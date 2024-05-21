import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API-REST-FASTFEET',
      version: '1.0.0',
      description:
        'A aplicação de gerenciamento de entregas permite a administração eficiente de entregadores, encomendas e destinatários. Com dois tipos de usuários, entregador e admin, a aplicação oferece funcionalidades de autenticação e operações de CRUD, além de regras de negócio específicas para a manipulação das encomendas. A aplicação é desenvolvida com base nos conceitos de DDD, Clean Architecture, e inclui autenticação e autorização robustas, além de integração com serviços externos e testes unitários. Contato: fermercado@live.com',
      contact: {
        name: 'Fernando Mercado',
        email: 'fermercado@live.com',
      },
    },
  },
  apis: [
    './src/docs/swagger/paths/login-api.yaml',
    './src/docs/swagger/paths/user-api.yaml',
    './src/docs/swagger/paths/recipient-api.yaml',
    './src/docs/swagger/paths/order-api.yaml',
    './src/docs/swagger/paths/delivery-api.yaml',
  ],
};

const specs = swaggerJsDoc(options);

export default function (app: Application) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
