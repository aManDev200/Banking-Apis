import { DataTypes } from 'sequelize';
import config from '../config.js';
import User from './userModel.js'; // Assuming this is the user model you shared earlier

const { sequelize } = config;

const UserAccount = sequelize.define('UserAccount', {
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
}, {
  timestamps: true,
});

// Associate UserAccount with User
UserAccount.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(UserAccount, { foreignKey: 'userId', as: 'account' });

export default UserAccount;
