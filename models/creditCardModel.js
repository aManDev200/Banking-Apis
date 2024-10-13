import { DataTypes } from 'sequelize';
import config from '../config.js';
import UserAccount from './userAccount.js';
import EmployeeAccount from './employeeAccount.js';

const { sequelize } = config;

const CreditCard = sequelize.define('CreditCard', {
  // Extending common card fields
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiryDate: {
    type: DataTypes.STRING,  
    allowNull: false,
  },
  cvv: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  linkedAccountType: {
    type: DataTypes.ENUM('user', 'employee'),
    allowNull: false,
  },
  linkedAccountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  
  // Credit card-specific fields
  creditLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50000,  
  },
  creditUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

// Link CreditCard to UserAccount and EmployeeAccount
CreditCard.belongsTo(UserAccount, { foreignKey: 'linkedAccountId', constraints: false });
CreditCard.belongsTo(EmployeeAccount, { foreignKey: 'linkedAccountId', constraints: false });

export default CreditCard;
