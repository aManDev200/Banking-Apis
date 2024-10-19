import express from 'express';
import { authMiddleware, authorizeUser,authorizeEmployee } from '../middleware/authMiddleware.js';
import { deposit, withdraw, balanceInquiry, getTransactionHistory } from '../controllers/userAccountController.js';

const router = express.Router();

/**
 * @swagger
 * /api/user-Account/deposit:
 *   post:
 *     summary: Deposit money into user account
 *     tags: [User Account]
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
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 balance:
 *                   type: number
 *       400:
 *         description: Invalid deposit amount
 *       404:
 *         description: User account not found
 *       500:
 *         description: Server error
 */
router.post('/deposit', authMiddleware, authorizeUser,deposit);

/**
 * @swagger
 * /api/user-Account/withdraw:
 *   post:
 *     summary: Withdraw money from user account
 *     tags: [User Account]
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
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 balance:
 *                   type: number
 *       400:
 *         description: Invalid withdrawal amount or insufficient balance
 *       404:
 *         description: User account not found
 *       500:
 *         description: Server error
 */
router.post('/withdraw', authMiddleware, authorizeUser,withdraw);

/**
 * @swagger
 * /api/user-Account/balance:
 *   get:
 *     summary: Get user account balance and card details
 *     tags: [User Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance inquiry successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                 cards:
 *                   type: object
 *                   properties:
 *                     creditCards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cardNumber:
 *                             type: string
 *                           creditLimit:
 *                             type: number
 *                           usedCredit:
 *                             type: number
 *                     debitCards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cardNumber:
 *                             type: string
 *                           linkedAccountBalance:
 *                             type: number
 *       404:
 *         description: User account not found
 *       500:
 *         description: Server error
 */
router.get('/balance', authMiddleware, authorizeUser , balanceInquiry);

/**
 * @swagger
 * /api/user-Account/transactions:
 *   get:
 *     summary: Get user transaction history
 *     tags: [User Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   accountType:
 *                     type: string
 *                   accountId:
 *                     type: number
 *                   transactionType:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: No transactions found
 *       500:
 *         description: Server error
 */
router.get('/transactions', authMiddleware, authorizeUser ,getTransactionHistory);

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
