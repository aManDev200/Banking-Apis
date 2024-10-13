# SMB Product Unification Microservice
This project is a microservice designed to handle payment processing, banking transactions, and vertical-specific processes like invoicing and payroll. The system features separate account models for users and employees, providing support for deposits, withdrawals, balance inquiries, ACH transactions, and payroll management.
Features

### User and Employee Account Management: 
Separate schemas for users and employees with linked account models.
### Transaction Support:
Deposit, withdrawal, and balance inquiries for users and employees.
### Payroll Processing: 
Calculates payroll for employees, including tax deductions, insurance benefits, tenure-based details, and more.
### Payment Methods: 
Supports debit cards, credit cards, and ACH transactions.
### Loan Mechanism: 
Users and employees can take out loans with EMI payments and late charges.

# Tech Stack

## Backend: 
Node.js, Express.js
## Database: 
PostgreSQL
## Authentication: 
JWT-based authentication
## API Documentation: 
Documented with Swagger

moment.js for date manipulation
jsonwebtoken for token-based authentication

### Prerequisites

Node.js
PostgreSQL
npm or yarn package manager

Installation

Clone the repository:
git clone <https://github.com/aManDev200/Banking-Apis.git>
cd project_directory

Install the dependencies:
npm install

Set up the PostgreSQL database:

Create a PostgreSQL database.
Configure the database connection in the .env file (give the database url from the neon postgress).



Start the server:
npm start


API Endpoints
The API is documented using Swagger. You can access the API documentation at:
http://localhost:3000/api-docs

More detailed information can be found in the Swagger documentation.
Database Structure

User Table: Stores user details.
Employee Table: Stores employee details.
Transaction Table: Stores deposit, withdrawal, payroll, and loan-related transactions.
ACHTransaction Table: Stores ACH transaction details with custom fields like amount frequency and purpose.

Controllers

achTransactionController.js: Handles ACH transaction logic
cardController.js: Manages card-related operations
employeeAccountController.js: Controls employee account operations
employeeController.js: Manages employee data and operations
loanController.js: Handles loan-related logic
userAccountController.js: Controls user account operations
userController.js: Manages user data and operations

Middleware

authMiddleware.js: Handles authentication and authorization

Routers

achRoutes.js: Routes for ACH transactions
cardRoutes.js: Routes for card operations
employeeAccountRoutes.js: Routes for employee account operations
employeeRoutes.js: Routes for employee management
loanRoutes.js: Routes for loan operations
userAccountRoutes.js: Routes for user account operations
userRoutes.js: Routes for user management

Configuration

.env: Environment variables (not visible in version control)
config.js: Configuration settings for the application

Main Application File

index.js: Entry point of the application

Future Enhancements

Add more payment types.
Implement real-time notifications.
Improve error handling and validation.
