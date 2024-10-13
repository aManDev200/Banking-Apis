import { DataTypes } from 'sequelize';
import config from '../config.js';
import UserAccount from './userAccount.js';
import EmployeeAccount from './employeeAccount.js';

const { sequelize } = config;

const Card = sequelize.define('DebitCards', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cardType: {
    type: DataTypes.ENUM('debit', 'credit'),
    allowNull: false,
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiryDate: {
    type: DataTypes.STRING, // Format: MM/YYYY
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
  }
}, {
  timestamps: true,
});

// Link Cards to UserAccount and EmployeeAccount
Card.belongsTo(UserAccount, { foreignKey: 'linkedAccountId', constraints: false });
Card.belongsTo(EmployeeAccount, { foreignKey: 'linkedAccountId', constraints: false });

export default Card;
