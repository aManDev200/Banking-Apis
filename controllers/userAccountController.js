import UserAccount from '../models/userAccount.js';
import Transaction from '../models/transactionmodel.js';
import CreditCard from '../models/creditCardModel.js';
import DebitCard from '../models/debitCardModel.js';

export const deposit = async (req, res) => {
  try {
    const {  amount } = req.body;
    const userId =  req.user.id;
    // Ensure amount is numeric
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount)) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }

    // Find the user's account
    const userAccount = await UserAccount.findOne({ where: { userId } });
    if (!userAccount) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Perform the deposit operation
    const currentBalance = parseFloat(userAccount.balance);
    userAccount.balance = parseFloat((currentBalance + depositAmount).toFixed(2));

    await userAccount.save();

    // Record the transaction
    await Transaction.create({
      accountType: 'user',
      accountId: userAccount.id,
      transactionType: 'deposit',
      amount: depositAmount,
    });

    res.status(200).json({ message: 'Deposit successful', balance: userAccount.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    // Ensure amount is numeric
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount)) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    // Find the user's account
    const userAccount = await UserAccount.findOne({ where: { userId } });
    if (!userAccount) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Ensure balance is sufficient
    const currentBalance = parseFloat(userAccount.balance);
    if (currentBalance < withdrawalAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Perform the withdrawal operation
    userAccount.balance = parseFloat((currentBalance - withdrawalAmount).toFixed(2));

    await userAccount.save();

    // Record the transaction
    await Transaction.create({
      accountType: 'user',
      accountId: userAccount.id,
      transactionType: 'withdrawal',
      amount: withdrawalAmount,
    });

    res.status(200).json({ message: 'Withdrawal successful', balance: userAccount.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Add a route for fetching transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findAll({
      where: { accountId: userId, accountType: 'user' },
      order: [['createdAt', 'DESC']],
    });

    if (!transactions.length) return res.status(404).json({ error: 'No transactions found' });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Balance inquiry for user with card details
export const balanceInquiry = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's account
    const userAccount = await UserAccount.findOne({ where: { userId } });
    if (!userAccount) return res.status(404).json({ error: 'User account not found' });

    // Find all credit cards linked to the user account
    const creditCards = await CreditCard.findAll({ 
      where: { 
        linkedAccountId: userAccount.id, 
        linkedAccountType: 'user' 
      }
    });

    // Find all debit cards linked to the user account
    const debitCards = await DebitCard.findAll({ 
      where: { 
        linkedAccountId: userAccount.id, 
        linkedAccountType: 'user'  
      }
    });

    // Combine card information
    const cardDetails = {
      creditCards: creditCards.map(card => ({
        cardNumber: card.cardNumber,
        creditLimit: card.creditLimit,
        usedCredit: card.usedCredit || 0.00  // Assuming you track used credit
      })),
      debitCards: debitCards.map(card => ({
        cardNumber: card.cardNumber,
        linkedAccountBalance: userAccount.balance  // Assuming debit card links to the user balance
      }))
    };

    // Log the balance inquiry
    await Transaction.create({
      accountType: 'user',
      accountId: userAccount.id,
      transactionType: 'balance_inquiry',
      amount: 0.00,  
    });

    // Respond with user balance and card details
    res.status(200).json({
      balance: userAccount.balance,
      cards: cardDetails
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};