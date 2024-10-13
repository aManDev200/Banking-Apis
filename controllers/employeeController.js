import Employee from '../models/employeeModel.js';
import EmployeeAccount from '../models/employeeAccount.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import config from '../config.js';
dotenv.config();


// Register Employee
export const registerEmployee = async (req, res) => {
    const { name, email, password, position, department, salary, hireDate } = req.body;

    try {
        const existingEmployee = await Employee.findOne({ where: { email } });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Employee already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = await Employee.create({ name, email, password: hashedPassword, position, department, salary, hireDate });

        // Create an associated EmployeeAccount
        await EmployeeAccount.create({ employeeId: newEmployee.id, balance: 0.00, payroll: salary });

        const token = jwt.sign(
            { 
              id: newEmployee.id, 
              role: newEmployee.role, 
              accountType: "employee" 
            }, config.jwtSecret, { expiresIn: '10h' });
        res.status(201).json({ token, employee: newEmployee });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

  
// Login Employee
export const loginEmployee = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const employee = await Employee.findOne({ where: { email } });  // Rename this variable to 'employee'
      
      if (!employee || !(await bcrypt.compare(password, employee.password))) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Create a JWT token with employee ID and role
      const token = jwt.sign(
        { 
          id: employee.id, 
          role: employee.role, 
          accountType: "employee" 
        }, config.jwtSecret, { expiresIn: '10h' });
      
      // Send both the token and the employee's role in the response
      res.status(200).json({ token, role: employee.role });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  

// Update Employee profile
export const updateEmployeeProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
        const Employee = await Employee.findByPk(req.Employee.id); // Get logged-in Employee's ID from the JWT token
        if (!Employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update Employee details
        Employee.name = name || Employee.name;
        Employee.email = email || Employee.email;

        await Employee.save();

        res.status(200).json({ message: 'Profile updated successfully', Employee });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Get the logged-in Employee's profile
export const getEmployeeProfile = async (req, res) => {
    try {
        const Employee = await Employee.findByPk(req.Employee.id, {
            attributes: ['id', 'name', 'email', 'position', 'department','hireDate','isActive']
        });
        if (!Employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ Employee });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};




// Update Employee role
export const updateEmployeeRole = async (req, res) => {
    try {
        const { id } = req.user.id;
        const { role } = req.body;

        const Employee = await Employee.findByPk(id);
        if (!Employee) return res.status(404).json({ message: 'Employee not found' });

        Employee.position = role;
        await Employee.save();
        res.json({ message: 'Employee role updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete Employee
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.user.id;

        const Employee = await Employee.findByPk(id);
        if (!Employee) return res.status(404).json({ message: 'Employee not found' });

        await Employee.destroy();
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
