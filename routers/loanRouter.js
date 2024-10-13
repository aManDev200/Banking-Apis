import { Router } from 'express';
import {
  createLoan,
  repayLoan,
  calculateLoanCost,
} from '../controllers/loanController.js';import { authMiddleware, authorizeUser,authorizeEmployee } from '../middleware/authMiddleware.js';
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Loan management
 */

/**
 * @swagger
 * /api/loans/create:
 *   post:
 *     summary: Create a new loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               principalAmount:
 *                 type: number
 *                 format: float
 *               interestRate:
 *                 type: number
 *                 format: float
 *               termInMonths:
 *                 type: integer
 *             required:
 *               - principalAmount
 *               - interestRate
 *               - termInMonths
 *     responses:
 *       201:
 *         description: Loan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 loan:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     principalAmount:
 *                       type: number
 *                     emiAmount:
 *                       type: number
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/create', authMiddleware, createLoan);

/**
 * @swagger
 * /api/loans/repay:
 *   post:
 *     summary: Repay a loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loanId:
 *                 type: string
 *               paymentAmount:
 *                 type: number
 *                 format: float
 *             required:
 *               - loanId
 *               - paymentAmount
 *     responses:
 *       200:
 *         description: Loan repayment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 loan:
 *                   type: object
 *                   properties:
 *                     remainingAmount:
 *                       type: number
 *       404:
 *         description: Loan not found
 *       400:
 *         description: Loan already completed or defaulted
 *       500:
 *         description: Internal Server Error
 */
router.post('/repay', authMiddleware, repayLoan);

/**
 * @swagger
 * /api/loans/calculate:
 *   post:
 *     summary: Calculate loan cost
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               principalAmount:
 *                 type: number
 *                 format: float
 *               interestRate:
 *                 type: number
 *                 format: float
 *               termInMonths:
 *                 type: integer
 *             required:
 *               - principalAmount
 *               - interestRate
 *               - termInMonths
 *     responses:
 *       200:
 *         description: Loan cost calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 principalAmount:
 *                   type: number
 *                 totalLoanCost:
 *                   type: number
 *                 emiAmount:
 *                   type: number
 *       500:
 *         description: Internal Server Error
 */
router.post('/calculate', calculateLoanCost);

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