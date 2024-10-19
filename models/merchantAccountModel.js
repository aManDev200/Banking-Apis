// models/merchantAccountModel.js
import { DataTypes } from 'sequelize';
import config from '../config.js';

const { sequelize } = config;

const MerchantAccount = sequelize.define('MerchantAccount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  merchantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
    allowNull: false,
  },
  transactionHistory: {
    type: DataTypes.JSONB, // To store all transaction details in JSON format
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default MerchantAccount;
