import { Router } from 'express';
import { 
    updateEmployeeRole, 
    registerEmployee, 
    loginEmployee, 
    updateEmployeeProfile, 
    getEmployeeProfile,
    deleteEmployee 
} from '../controllers/employeeController.js';
import { authMiddleware, authorizeUser,authorizeEmployee } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/employee/role:
 *   put:
 *     summary: Update employee role
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee role updated successfully
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.put('/role', authMiddleware, authorizeEmployee,updateEmployeeRole);

/**
 * @swagger
 * /api/employee:
 *   delete:
 *     summary: Delete employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.delete('/', authMiddleware, authorizeEmployee,deleteEmployee);

/**
 * @swagger
 * /api/employee/register:
 *   post:
 *     summary: Register a new employee
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - position
 *               - department
 *               - salary
 *               - hireDate
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               position:
 *                 type: string
 *               department:
 *                 type: string
 *               salary:
 *                 type: number
 *               hireDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Employee registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Employee already exists
 *       500:
 *         description: Server error
 */
router.post('/register', registerEmployee);

/**
 * @swagger
 * /api/employee/login:
 *   post:
 *     summary: Login employee
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', loginEmployee);

/**
 * @swagger
 * /api/employee/profile:
 *   get:
 *     summary: Get employee profile
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employee:
 *                   $ref: '#/components/schemas/EmployeeProfile'
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authMiddleware,authorizeEmployee, getEmployeeProfile);

/**
 * @swagger
 * /api/employee/profile:
 *   put:
 *     summary: Update employee profile
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 employee:
 *                   $ref: '#/components/schemas/EmployeeProfile'
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.put('/profile', authMiddleware, authorizeEmployee,updateEmployeeProfile);

export default router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */