import express from 'express';
import { registerDebitCard, registerCreditCard, makeCardPayment, repayCreditCard } from '../controllers/cardController.js';

const router = express.Router();

/**
 * @swagger
 * /api/cards/registerdebitcards:
 *   post:
 *     summary: Register a new debit card
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardNumber
 *               - expiryDate
 *               - cvv
 *               - linkedAccountType
 *               - linkedAccountId
 *             properties:
 *               cardNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *               cvv:
 *                 type: string
 *               linkedAccountType:
 *                 type: string
 *                 enum: [user, employee]
 *               linkedAccountId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Debit card registered successfully
 *       400:
 *         description: Card number already exists
 *       500:
 *         description: Server error
 */
router.post('/registerdebitcards', registerDebitCard);

/**
 * @swagger
 * /api/cards/registercreditcards:
 *   post:
 *     summary: Register a new credit card
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardNumber
 *               - expiryDate
 *               - cvv
 *               - linkedAccountType
 *               - linkedAccountId
 *               - creditLimit
 *             properties:
 *               cardNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *               cvv:
 *                 type: string
 *               linkedAccountType:
 *                 type: string
 *                 enum: [user, employee]
 *               linkedAccountId:
 *                 type: string
 *               creditLimit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Credit card registered successfully
 *       400:
 *         description: Card number already exists or invalid credit limit
 *       500:
 *         description: Server error
 */
router.post('/registercreditcards', registerCreditCard);

/**
 * @swagger
 * /api/cards/payments:
 *   post:
 *     summary: Make a payment using a card
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *               - amount
 *               - cardType
 *             properties:
 *               cardId:
 *                 type: string
 *               amount:
 *                 type: number
 *               cardType:
 *                 type: string
 *                 enum: [debit, credit]
 *     responses:
 *       200:
 *         description: Payment successful
 *       400:
 *         description: Insufficient balance or credit limit exceeded
 *       404:
 *         description: Card or linked account not found
 *       500:
 *         description: Server error
 */
router.post('/payments', makeCardPayment);

/**
 * @swagger
 * /api/cards/repay:
 *   post:
 *     summary: Repay a credit card
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *               - paymentAmount    
 *             properties:
 *               cardId:
 *                 type: string
 *               paymentAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Credit card repayment successful
 *       400:
 *         description: Payment amount exceeds credit used or insufficient balance
 *       404:
 *         description: Credit card or linked account not found
 *       500:
 *         description: Server error
 */
router.post('/repay', repayCreditCard);

export default router;