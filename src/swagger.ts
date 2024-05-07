import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API-REST-Entregas',
      version: '1.0.0',
      description:
        'Uma aplicação de gestão de entregas com autenticação segura por CPF e senha. Admins têm controle total sobre CRUD de encomendas, entregadores e destinatários. Implementa RBAC para autorização de operações. Oferece notificações em tempo real para destinatários e integração com serviços externos para uma gestão eficiente de entregas. Contato: fermercado@live.com',
      contact: {
        name: 'Fernando Mercado',
        email: 'fermercado@live.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
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
