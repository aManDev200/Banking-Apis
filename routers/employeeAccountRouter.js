import express from 'express';
import { deposit, withdraw, balanceInquiry, getPayroll, getTransactionHistory } from '../controllers/employeeAccountController.js';
import { authMiddleware, authorizeUser,authorizeEmployee } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/employee-account/deposit:
 *   post:
 *     summary: Deposit money into employee account
 *     tags: [Employee Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to deposit
 *     responses:
 *       200:
 *         description: Successful deposit
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/deposit', authMiddleware,authorizeEmployee, deposit);

/**
 * @swagger
 * /api/employee-account/withdraw:
 *   post:
 *     summary: Withdraw money from employee account
 *     tags: [Employee Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *     responses:
 *       200:
 *         description: Successful withdrawal
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/withdraw', authMiddleware, authorizeEmployee , withdraw);

/**
 * @swagger
 * /api/employee-account/balance:
 *   get:
 *     summary: Get employee account balance and all all the information of cards
 *     tags: [Employee Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful balance inquiry
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/balance', authMiddleware, authorizeEmployee,balanceInquiry);

/**
 * @swagger
 * /api/employee-account/payroll:
 *   get:
 *     summary: Get employee payroll information
 *     tags: [Employee Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful payroll retrieval
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/payroll', authMiddleware, authorizeEmployee , getPayroll);

/**
 * @swagger
 * /api/employee-account/transactions:
 *   get:
 *     summary: Get employee transaction history
 *     tags: [Employee Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful transaction history retrieval
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/transactions', authMiddleware, authorizeEmployee ,getTransactionHistory);

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