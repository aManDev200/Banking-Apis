import EmployeeAccount from '../models/employeeAccount.js';
import Transaction from '../models/transactionmodel.js';
import CreditCard from '../models/creditCardModel.js';
import DebitCard from '../models/debitCardModel.js';

// Deposit into employee account

export const deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const employeeId = req.user.id;
    // Ensure `amount` is numeric
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount)) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }

    // Find the employee's account
    const employeeAccount = await EmployeeAccount.findOne({ where: { employeeId } });
    if (!employeeAccount) {
      return res.status(404).json({ error: 'Employee account not found' });
    }

    // Ensure balance is a number before adding
    const currentBalance = parseFloat(employeeAccount.balance);
    if (isNaN(currentBalance)) {
      return res.status(500).json({ error: 'Account balance is invalid' });
    }

    // Perform the deposit operation and ensure precision
    employeeAccount.balance = parseFloat((currentBalance + depositAmount).toFixed(2));

    await employeeAccount.save();

    // Record the transaction
    await Transaction.create({
      accountType: 'employee',
      accountId: employeeAccount.id,
      transactionType: 'deposit',
      amount: depositAmount,
    });

    res.status(200).json({ message: 'Deposit successful', balance: employeeAccount.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdraw from employee account
export const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const employeeId = req.user.id;
    // Ensure amount is numeric
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount)) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    // Find the employee's account
    const employeeAccount = await EmployeeAccount.findOne({ where: { employeeId } });
    if (!employeeAccount) {
      return res.status(404).json({ error: 'Employee account not found' });
    }

    // Ensure balance is sufficient
    const currentBalance = parseFloat(employeeAccount.balance);
    if (currentBalance < withdrawalAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Perform the withdrawal operation
    employeeAccount.balance = parseFloat((currentBalance - withdrawalAmount).toFixed(2));

    await employeeAccount.save();

    // Record the transaction
    await Transaction.create({
      accountType: 'employee',
      accountId: employeeAccount.id,
      transactionType: 'withdrawal',
      amount: withdrawalAmount,
    });

    res.status(200).json({ message: 'Withdrawal successful', balance: employeeAccount.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get employee transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const employeeId  = req.user.id;
    const transactions = await Transaction.findAll({
      where: { accountId: employeeId, accountType: 'employee' },
      order: [['createdAt', 'DESC']],
    });

    if (!transactions.length) return res.status(404).json({ error: 'No transactions found' });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const calculateTax = (salary) => {
  let tax = 0;
  if (salary > 1500000) {
    tax = salary * 0.30; // 30% for salary above 15 lakhs
  } else if (salary > 1000000) {
    tax = salary * 0.20; // 20% for salary between 10-15 lakhs
  } else if (salary > 500000) {
    tax = salary * 0.10; // 10% for salary between 5-10 lakhs
  } else if (salary > 250000) {
    tax = salary * 0.05; // 5% for salary between 2.5-5 lakhs
  }
  return tax;
};


export const getPayroll = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    // Find the employee's account
    const employeeAccount = await EmployeeAccount.findOne({ where: { employeeId } });
    if (!employeeAccount) return res.status(404).json({ error: 'Employee account not found' });
    const { payroll} = employeeAccount;
    const taxDeduction = calculateTax(payroll);
    const benefits = {
      medicalInsurance: 'Covered (₹3,00,000)',
      lifeInsurance: 'Covered (₹10,00,000)',
      otherBenefits: 'Annual Bonus, Paid Time Off',
    };

    const payrollBreakdown = {
      grossSalary: payroll,
      taxDeduction,
      netSalary: payroll - taxDeduction,
      benefits
    };

    // Record payroll transaction
    await Transaction.create({
      accountType: 'employee',
      accountId: employeeAccount.id,
      transactionType: 'payroll',
      amount: payrollBreakdown.netSalary,
    });

    // Respond with payroll breakdown
    res.status(200).json({ payrollBreakdown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Balance inquiry with card details
export const balanceInquiry = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    // Find the employee's account
    const employeeAccount = await EmployeeAccount.findOne({ where: { employeeId } });
    if (!employeeAccount) return res.status(404).json({ error: 'Employee account not found' });

    // Find all credit cards linked to the employee account
    const creditCards = await CreditCard.findAll({ where: { 
      linkedAccountId: employeeAccount.id,
      linkedAccountType: 'employee'  
    } });;
    
    // Find all debit cards linked to the employee account
    const debitCards = await DebitCard.findAll({ where: { 
      linkedAccountId: employeeAccount.id,
      linkedAccountType: 'employee' 
    } });

    // Combine card information
    const cardDetails = {
      creditCards: creditCards.map(card => ({
        cardNumber: card.cardNumber,
        creditLimit: card.creditLimit,
        usedCredit: card.creditUsed
      })),
      debitCards: debitCards.map(card => ({
        cardNumber: card.cardNumber,
        linkedAccountBalance: employeeAccount.balance
      }))
    };

    // Log balance inquiry (optional)
    await Transaction.create({
      accountType: 'employee',
      accountId: employeeAccount.id,
      transactionType: 'balance_inquiry',
      amount: 0.00,  // Inquiry, no amount changed
    });

    // Respond with employee balance and card details
    res.status(200).json({
      balance: employeeAccount.balance,
      cards: cardDetails
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

