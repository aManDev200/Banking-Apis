import { DataTypes } from 'sequelize';
import config from '../config.js';
import Employee from './employeeModel.js'; // Assuming this is the employee model we created earlier

const { sequelize } = config;

const EmployeeAccount = sequelize.define('EmployeeAccount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,  // Initial balance of 0
    allowNull: false,
  },
  payroll: {
    type: DataTypes.DECIMAL(10, 2),  // Payroll amount
    allowNull: true,  // Nullable since it may be set later
  },
}, {
  timestamps: true,
});

// Associate EmployeeAccount with Employee
EmployeeAccount.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasOne(EmployeeAccount, { foreignKey: 'employeeId', as: 'account' });

export default EmployeeAccount;
