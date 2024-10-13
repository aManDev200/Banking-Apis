import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config.js';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import routers
import userRouter from './routers/userRouter.js';   
import employeeRouter from './routers/employeeRouter.js';
import EmployeeAccount from './routers/employeeAccountRouter.js';
import UserAccount from './routers/userAccountRouter.js';
import cardRoutes from './routers/cardRoutes.js';
import achRoutes from './routers/achRoutes.js';
import loanRouter from './routers/loanRouter.js';
dotenv.config();

const app = express();
const PORT = config.port;
const { sequelize } = config;

// Middleware
app.use(express.json());
app.use(cors());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the small and medium size buisness',
      contact: {
        name: 'Aman Singh',
        email: 'amansinghdev200@gmail.com'
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routers/*.js', './controllers/*.js'], // Adjust this path if necessary
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use routers
app.use('/api/users', userRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/user-Account', UserAccount);
app.use('/api/employee-Account', EmployeeAccount);
app.use('/api/ach', achRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/loans',loanRouter)

// Sync database and start the server
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error.message);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;