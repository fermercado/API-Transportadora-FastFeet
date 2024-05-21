# 🚀 Fast Feet

Fast Feet é uma aplicação de gerenciamento de entregas que permite a administração eficiente de entregadores, encomendas e destinatários. Com dois tipos de usuários, entregador e admin, a aplicação oferece funcionalidades robustas de autenticação e operações de CRUD, além de regras de negócio específicas para a manipulação das encomendas.

## 📋 Funcionalidades

- **Login**
  - Permite que usuários façam login usando CPF e Senha.
- **CRUD de Entregadores**
  - Admin pode criar, visualizar, atualizar e deletar entregadores.
- **CRUD de Encomendas**
  - Admin pode criar, visualizar, atualizar e deletar encomendas.
- **CRUD de Destinatários**
  - Admin pode criar, visualizar, atualizar e deletar destinatários.
- **Gerenciamento de Encomendas**
  - Marcar encomendas como aguardando, retirada, entregue ou devolvida.
  - Listar encomendas com endereços de entrega próximos ao local do entregador.
- **Notificações**
  - Notifica automaticamente o destinatário a cada alteração no status da encomenda.

## 🛠️ Tecnologias e Ferramentas Utilizadas

- **Node.js**: Ambiente de execução para JavaScript no servidor.
- **TypeScript**: Superset do JavaScript que adiciona tipos estáticos.
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional.
- **Jest** (^29.7.0): Biblioteca de testes JavaScript.
- **Nodemon** (^3.0.3): Ferramenta para reiniciar automaticamente o servidor durante o desenvolvimento.
- **Prettier** (^3.2.4): Formatador de código.
- **Tsyringe** (^4.8.0): Container de injeção de dependência para TypeScript.
- **Axios** (^1.6.7): Cliente HTTP baseado em Promises.
- **Bcryptjs** (^2.4.3): Biblioteca para hashing de senhas.
- **Cloudinary** (^1.21.0): Serviço para gerenciamento e entrega de mídias.
- **Dotenv** (^16.4.5): Biblioteca para carregar variáveis de ambiente de um arquivo `.env`.
- **ESLint** (^8.57.0): Ferramenta de linting para JavaScript e TypeScript.
- **Geolib** (^3.3.4): Biblioteca para operações geográficas.
- **Jsonwebtoken** (^9.0.2): Implementação de JSON Web Tokens.
- **Multer** (^1.4.5-lts.1): Middleware para upload de arquivos.
- **Nodemailer** (^6.9.13): Biblioteca para envio de emails.
- **Pg** (^8.11.5): Biblioteca cliente para PostgreSQL.
- **Swagger-jsdoc** (^6.2.8): Gerador de documentação Swagger a partir de JSDoc.
- **Swagger-ui-express** (^5.0.0): Middleware para servir a documentação Swagger UI.
- **TypeORM** (^0.3.20): ORM para TypeScript e JavaScript.
- **Zod** (^3.22.4): Biblioteca de validação de esquemas.

## 📂 Estrutura do Projeto

O projeto segue os conceitos de DDD e Clean Architecture, proporcionando uma estrutura organizada e escalável. A aplicação é composta por diversas camadas, incluindo domínio, aplicação, infraestrutura e interfaces de usuário.

## 🚀 Começando

### Rodando o Projeto Localmente

Para rodar o projeto localmente, siga os passos abaixo:

1. **Clone o repositório:**

   ```bash
   git clone git@github.com:fermercado/API-Transportadora-FastFeet.git
   cd API-Transportadora-FastFeet
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Renomeie o arquivo de exemplo de variáveis de ambiente:**

   Renomeie o arquivo `.env.example` para `.env`:

   ```bash
   mv .env.example .env
   ```

4. **Configure as variáveis de ambiente:**

   Edite o arquivo `.env` com suas configurações. Você precisará configurar os detalhes do banco de dados, JWT, email, Cloudinary e OpenCage. Aqui está um exemplo:

   ```env
   # Banco de dados
   DB_HOST=
   DB_PORT=
   DB_USERNAME=
   DB_PASSWORD=
   DB_DATABASE=

   # JWT
   JWT_SECRET=sua_chave_secreta

   # Script de seeding
   ADMIN_FIRST_NAME=
   ADMIN_LAST_NAME=
   ADMIN_CPF=
   ADMIN_EMAIL=
   ADMIN_PASSWORD=
   ADMIN_CONFIRM_PASSWORD=
   ADMIN_DELETE_KEY=

   # Email, @outlook, @hotmail ou @live
   EMAIL_USER=
   EMAIL_PASS=

   # Upload de imagem
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   # Geolocalização
   OPENCAGE_API_KEY=
   ```

5. **Configure o Cloudinary:**

   Crie uma conta no [Cloudinary](https://cloudinary.com) e obtenha suas credenciais (Cloud Name, API Key, e API Secret). Adicione essas credenciais ao seu arquivo `.env`.

6. **Configure o OpenCage:**

   Crie uma conta no [OpenCage](https://opencagedata.com) e obtenha sua API Key. Adicione essa API Key ao seu arquivo `.env`.

7. **Configure o banco de dados PostgreSQL:**

   Certifique-se de ter o PostgreSQL instalado e rodando. Crie um banco de dados com o nome especificado no arquivo `.env`.

### 🧪 Testando o Projeto

Para rodar os testes, use o seguinte comando:

```bash
npm run test
```

### 🚀 Iniciando o Servidor

Para iniciar o servidor, use o seguinte comando:

```bash
npm start
```

## 📃 Documentação da API com Swagger

A documentação completa da API está disponível e pode ser acessada via Swagger UI. Isso permite que você visualize e interaja com a API's endpoints diretamente através do navegador.

Para acessar a documentação Swagger e testar os endpoints:

```bash
http://localhost:3000/

```

### Usando a Aplicação Hospedada

Se preferir, você pode usar a versão hospedada da aplicação. Acesse a URL:

## 📡 Rotas da API

### 🔒 Autenticação

#### 🔑 Login

- **Endpoint:** `/api/v1/login`
- **Método:** POST
- **Descrição:** Autentica um usuário.
- **Body:**
  ```json
  {
    "cpf": "string",
    "password": "string"
  }
  ```

### 👥 Usuários

#### ➕ Criar Usuário

- **Endpoint:** `/api/v1/users`
- **Método:** POST
- **Descrição:** Cria um novo usuário.
- **Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "cpf": "string",
    "email": "user@example.com",
    "password": "string",
    "confirmPassword": "string",
    "role": "string"
  }
  ```

#### 📄 Listar Usuários

- **Endpoint:** `/api/v1/users`
- **Método:** GET
- **Descrição:** Lista todos os usuários, com a opção de filtrar por papel (admin ou entregador).
- **Parâmetros de Consulta (opcional):**
  - `role`: Filtra a lista de usuários por papel.
    ```json
    {
      "role": "admin" | "deliveryman"
    }
    ```

#### 📝 Atualizar Usuário

- **Endpoint:** `/api/v1/users/{id}`
- **Método:** PUT
- **Descrição:** Atualiza as informações de um usuário existente.
- **Parâmetros de Caminho:**
  - `id`: ID do usuário a ser atualizado.
- **Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "cpf": "string",
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```

#### 🔍 Obter Usuário por ID

- **Endpoint:** `/api/v1/users/{id}`
- **Método:** GET
- **Descrição:** Obtém os detalhes de um usuário específico pelo ID.
- **Parâmetros de Caminho:**
  - `id`: ID do usuário.

#### ❌ Deletar Usuário

- **Endpoint:** `/api/v1/users/{id}`
- **Método:** DELETE
- **Descrição:** Deleta um usuário específico pelo ID.
- **Parâmetros de Caminho:**
  - `id`: ID do usuário a ser deletado.
- **Body:** somente para deletar adm seeding
  ```json
  {
    "deleteKey": "string"
  }
  ```

### 📦 Destinatário / Recipients

#### ➕ Criar Destinatário

- **Endpoint:** `/api/v1/recipients`
- **Método:** POST
- **Descrição:** Cria um novo destinatário.
- **Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "cpf": "string",
    "email": "string",
    "zipCode": "string",
    "complement": "string",
    "number": "integer"
  }
  ```

#### 📄 Listar Destinatários

- **Endpoint:** `/api/v1/recipients`
- **Método:** GET
- **Descrição:** Lista todos os destinatários.

#### 📝 Atualizar Destinatário

- **Endpoint:** `/api/v1/recipients/{id}`
- **Método:** PUT
- **Descrição:** Atualiza as informações de um destinatário existente.
- **Parâmetros de Caminho:**
  - `id`: ID do destinatário a ser atualizado.
- **Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "cpf": "string",
    "email": "string",
    "zipCode": "string",
    "complement": "string",
    "number": "integer"
  }
  ```

#### 🔍 Obter Destinatário por ID

- **Endpoint:** `/api/v1/recipients/{id}`
- **Método:** GET
- **Descrição:** Obtém os detalhes de um destinatário específico pelo ID.
- **Parâmetros de Caminho:**
  - `id`: ID do destinatário.

#### ❌ Deletar Destinatário

- **Endpoint:** `/api/v1/recipients/{id}`
- **Método:** DELETE
- **Descrição:** Deleta um destinatário específico pelo ID.
- **Parâmetros de Caminho:**
  - `id`: ID do destinatário a ser deletado.

### 📦 Pedidos / Orders

#### ➕ Criar Pedido

- **Endpoint:** `/api/v1/orders`
- **Método:** POST
- **Descrição:** Cria um novo pedido.
- **Body:**
  ```json
  {
    "recipientId": "string",
    "deliverymanId": "string"
  }
  ```

#### 📄 Listar Pedidos

- **Endpoint:** `/api/v1/orders`
- **Método:** GET
- **Descrição:** Lista todos os pedidos, com a opção de filtrar por status.
- **Parâmetros de Consulta (opcional):**
  - `status`: Filtra a lista de pedidos por status.
    ```json
    {
      "status": "pending" | "awaiting_pickup" | "picked_up" | "delivered" | "returned"
    }
    ```

#### 📄 Listar Pedidos por Entregador

- **Endpoint:** `/api/v1/orders/deliveryman/{deliverymanId}`
- **Método:** GET
- **Descrição:** Lista todos os pedidos para um entregador específico.
- **Parâmetros de Caminho:**
  - `deliverymanId`: ID do entregador.
- **Parâmetros de Consulta (opcional):**
  - `status`: Filtra a lista de pedidos por status.
    ```json
    {
      "status": "pending" | "awaiting_pickup" | "picked_up" | "delivered" | "returned"
    }
    ```

#### 🔍 Obter Pedido por ID

- **Endpoint:** `/api/v1/orders/{id}`
- **Método:** GET
- **Descrição:** Obtém os detalhes de um pedido específico pelo ID.
- **Parâmetros de Caminho:**
  - `id`: ID do pedido.

#### 📝 Atualizar Pedido

- **Endpoint:** `/api/v1/orders/{id}`
- **Método:** PUT
- **Descrição:** Atualiza as informações de um pedido existente.
- **Parâmetros de Caminho:**
  - `id`: ID do pedido a ser atualizado.
- **Body:**
  ```json
  {
    "recipientId": "string",
    "deliverymanId": "string",
    "status": "string"
  }
  ```

#### ❌ Deletar Pedido

- **Endpoint:** `/api/v1/orders/{id}`
- **Método:** DELETE
- **Descrição:** Deleta um pedido específico pelo ID.
- **Parâmetros de Caminho:**
  - `id`: ID do pedido a ser deletado.

#### ⏳ Marcar Pedido como Aguardando Retirada

- **Endpoint:** `/api/v1/orders/{id}/waiting`
- **Método:** PUT
- **Descrição:** Marca um pedido como aguardando para retirada.
- **Parâmetros de Caminho:**
  - `id`: ID do pedido.

#### 📦 Retirar Pedido

- **Endpoint:** `/api/v1/orders/{id}/pickup`
- **Método:** PUT
- **Descrição:** Retira um pedido.
- **Parâmetros de Caminho:**
  - `id`: ID do pedido.

#### ✅ Marcar Pedido como Entregue

- **Endpoint:** `/api/v1/orders/{id}/delivered`
- **Método:** PUT
- **Descrição:** Marca um pedido como entregue.
- **Parâmetros de Caminho:**
  - `id`: ID do pedido.
- **Body:**
  ```json
  {
    "deliveryPhoto": "file"
  }
  ```

#### 🔄 Devolver Pedido

- **Endpoint:** `/api/v1/orders/{id}/returned`
- **Método:** PUT
- **Descrição:** Devolve um pedido.
- **Parâmetros de Caminho:**
  - `id`: ID do pedido.

### 📦 Entregas / Delivery

#### 📄 Listar Entregas para um Entregador

- **Endpoint:** `/api/v1/deliveries`
- **Método:** GET
- **Descrição:** Lista todas as entregas para um entregador, com a opção de filtrar por status.
- **Parâmetros de Consulta (opcional):**
  - `status`: Filtra a lista de entregas por status.
    ```json
    {
      "status": "pending" | "awaiting_pickup" | "picked_up" | "delivered" | "returned"
    }
    ```

#### 📍 Encontrar Entregas Próximas com Base no CEP

- **Endpoint:** `/api/v1/deliveries/nearby`
- **Método:** POST
- **Descrição:** Encontra entregas próximas com base no CEP fornecido.
- **Body:**
  ```json
  {
    "zipCode": "string"
  }
  ```

## 💖 Agradecimentos

## Gostaríamos de expressar nossa gratidão a todos que contribuíram para este projeto, seja por meio de código, sugestões ou feedback.
