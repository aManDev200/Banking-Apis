import { DataTypes } from 'sequelize';
import UserAccount from './userAccount.js';
import EmployeeAccount from './employeeAccount.js';
import config from '../config.js';

const { sequelize } = config;

const Loan = sequelize.define('Loan', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
  linkedAccountType: {
    type: DataTypes.ENUM('user', 'employee'),
    allowNull: false,
  },
  linkedAccountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  principalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  emiAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  interestRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  termInMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  lateCharges: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'defaulted'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  timestamps: true,
});

// Associations
Loan.belongsTo(UserAccount, { foreignKey: 'linkedAccountId', constraints: false });
Loan.belongsTo(EmployeeAccount, { foreignKey: 'linkedAccountId', constraints: false });

export default Loan;
