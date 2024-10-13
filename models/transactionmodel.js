import { DataTypes } from 'sequelize';
import config from '../config.js';
import UserAccount from './userAccount.js';
import EmployeeAccount from './employeeAccount.js';

const { sequelize } = config;

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  accountType: {
    type: DataTypes.ENUM('user', 'employee'),
    allowNull: false,
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  transactionType: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'payroll', 'balance_inquiry', 'ach','debit_card_payment', 'credit_card_payment', 'credit_card_repayment'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
});

Transaction.belongsTo(UserAccount, { foreignKey: 'accountId', constraints: false });
Transaction.belongsTo(EmployeeAccount, { foreignKey: 'accountId', constraints: false });

export default Transaction;
