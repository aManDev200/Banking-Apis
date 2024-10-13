import { Router } from 'express';
import { 
  initiateACHWithFee, 
  reverseACHTransaction, 
  cancelRecurringACH 
} from '../controllers/achTransactionController.js';
import { authMiddleware, authorizeUser,authorizeEmployee } from '../middleware/authMiddleware.js';

const router = Router();
/**
 * @swagger
 * /api/ach/initiate-fee:
 *   post:
 *     summary: Initiate an ACH transaction with a fee
 *     tags: [ACH]
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
 *                 description: The amount to transfer
 *               frequency:
 *                 type: string
 *                 enum: [one-time, weekly, monthly]
 *                 default: one-time
 *                 description: The frequency of the ACH transaction
 *               purpose:
 *                 type: string
 *                 description: The purpose of the ACH transaction
 *     responses:
 *       200:
 *         description: ACH transaction with fee initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newACHTransaction:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                     linkedAccountType:
 *                       type: string
 *                     linkedAccountId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     purpose:
 *                       type: string
 *                     transactionFee:
 *                       type: number
 *       400:
 *         description: Insufficient balance including transaction fee
 *       404:
 *         description: Linked account not found
 *       500:
 *         description: Server error
 */
router.post('/initiate-fee', authMiddleware, initiateACHWithFee);


/**
 * @swagger
 * /api/ach/reverse:
 *   post:
 *     summary: Reverse an ACH transaction
 *     tags: [ACH]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: The ID of the ACH transaction to reverse
 *     responses:
 *       200:
 *         description: ACH transaction reversed successfully
 *       400:
 *         description: Only pending transactions can be reversed
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.post('/reverse', authMiddleware, reverseACHTransaction);

/**
 * @swagger
 * /api/ach/cancel:
 *   post:
 *     summary: Cancel a recurring ACH transaction
 *     tags: [ACH]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: The ID of the recurring ACH transaction to cancel
 *     responses:
 *       200:
 *         description: Recurring ACH transaction cancelled successfully
 *       400:
 *         description: Cannot cancel one-time transactions
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.post('/cancel', authMiddleware, cancelRecurringACH);

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
