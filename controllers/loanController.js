import Loan from '../models/loanModel.js';
import UserAccount from '../models/userAccount.js';
import EmployeeAccount from '../models/employeeAccount.js';
import cron from 'node-cron';
import { body, validationResult } from 'express-validator';
import Decimal from 'decimal.js';

// Function to calculate EMI using Decimal.js for precision
const calculateEMI = (principal, interestRate, termInMonths) => {
  const p = new Decimal(principal);
  const r = new Decimal(interestRate).div(12 * 100); // Monthly interest rate
  const n = new Decimal(termInMonths);

  // EMI calculation
  const emi = p.times(r).times(Decimal.pow(1 + r, n)).div(Decimal.pow(1 + r, n).minus(1));
  
  console.log(`Principal: ${p.toString()}, Monthly Interest Rate: ${r.toString()}, Term in Months: ${n.toString()}`);
  console.log(`Calculated EMI: ${emi.toString()}`);

  return emi.toDecimalPlaces(2).toNumber(); // Round to 2 decimal places
};
// Function to calculate due date based on current date and term in months
const calculateDueDate = (termInMonths) => {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + termInMonths);
  return currentDate;
};

// Loan ownership verification function
const verifyLoanOwnership = (loan, userId, accountType) => {
  return loan.linkedAccountId === userId && loan.linkedAccountType === accountType;
};

// Input validation middleware
export const createLoanValidation = [
  body('principalAmount').isFloat({ min: 0 }).withMessage('Principal amount must be a positive number'),
  body('interestRate').isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('termInMonths').isInt({ min: 1 }).withMessage('Term must be a positive integer')
];

// Create a new loan
export const createLoan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { principalAmount, interestRate, termInMonths } = req.body;
    const linkedAccountId = req.user.id;
    const linkedAccountType = req.user.accountType;

    let account;
    if (linkedAccountType === 'user') {
      account = await UserAccount.findByPk(linkedAccountId);
    } else if (linkedAccountType === 'employee') {
      account = await EmployeeAccount.findByPk(linkedAccountId);
    }

    if (!account) return res.status(404).json({ error: 'Account not found' });
    const ext = principalAmount/termInMonths
    const emiAmount = calculateEMI(principalAmount, interestRate, termInMonths)+ext;
    const dueDate = calculateDueDate(termInMonths);
    console.log(dueDate);

    const newLoan = await Loan.create({
      principalAmount,
      interestRate,
      emiAmount,
      termInMonths,
      dueDate,
      linkedAccountType,
      linkedAccountId,
      remainingAmount: principalAmount,
    });

    // Schedule late charge application
    const cronExpression = `0 0 ${dueDate.getDate()} ${dueDate.getMonth() + 1} *`;
    cron.schedule(cronExpression, async () => {
      const updatedLoan = await Loan.findByPk(newLoan.id);
      if (updatedLoan.status === 'active' && updatedLoan.remainingAmount > 0) {
        updatedLoan.lateCharges += 100; // Example late fee
        await updatedLoan.save();
      }
    });

    res.status(201).json({ message: 'Loan created successfully', loan: newLoan });
  } catch (error) {
    console.error('Error creating loan:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
};

// Repay a loan (with ownership verification)
export const repayLoan = async (req, res) => {
  try {
    const { loanId, paymentAmount } = req.body;
    const userId = req.user.id;
    const accountType = req.user.accountType;

    const loan = await Loan.findByPk(loanId);

    if (!loan || !verifyLoanOwnership(loan, userId, accountType)) {
      return res.status(403).json({ error: 'Access denied: You cannot repay this loan' });
    }

    if (loan.status !== 'active') return res.status(400).json({ error: 'Loan already completed or defaulted' });

    loan.remainingAmount = new Decimal(loan.remainingAmount).minus(paymentAmount).toNumber();

    if (loan.remainingAmount <= 0) {
      loan.status = 'completed';
    }

    await loan.save();
    res.status(200).json({ message: 'Loan repayment successful', loan });
  } catch (error) {
    console.error('Error repaying loan:', error);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
};

// Calculate loan cost based on increasing terms
export const calculateLoanCost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { principalAmount, interestRate, termInMonths } = req.body;

    const principal = new Decimal(principalAmount);
    const rate = new Decimal(interestRate).div(100);
    const term = new Decimal(termInMonths).div(12);

    const totalInterest = principal.times(rate).times(term);
    const totalLoanCost = principal.plus(totalInterest);
    const emiAmount = totalLoanCost.div(termInMonths);

    res.status(200).json({
      principalAmount: principal.toNumber(),
      totalLoanCost: totalLoanCost.toDecimalPlaces(2).toNumber(),
      emiAmount: emiAmount.toDecimalPlaces(2).toNumber()
    });
  } catch (error) {
    console.error('Error calculating loan cost:', error);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
};

export default {
  createLoan,
  repayLoan,
  calculateLoanCost,
  createLoanValidation
};