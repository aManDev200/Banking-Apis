import { DataTypes } from 'sequelize';
import config from '../config.js';
import UserAccount from './userAccount.js';
import EmployeeAccount from './employeeAccount.js';

const { sequelize } = config;

const ACHTransaction = sequelize.define('ACHTransaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
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
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed','cancelled' , 'reversed'),
    defaultValue: 'pending',
  },
  frequency: {
    type: DataTypes.ENUM('one-time', 'monthly', 'quarterly', 'yearly'),
    allowNull: false,
    defaultValue: 'one-time',
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 255], // Optional, max 255 characters
    },
  },
}, {
  timestamps: true,
});


ACHTransaction.belongsTo(UserAccount, { foreignKey: 'linkedAccountId', constraints: false });
ACHTransaction.belongsTo(EmployeeAccount, { foreignKey: 'linkedAccountId', constraints: false });

export default ACHTransaction;
