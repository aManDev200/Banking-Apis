import DebitCard from '../models/debitCardModel.js';
import UserAccount from '../models/userAccount.js';
import EmployeeAccount from '../models/employeeAccount.js';
import Transaction from '../models/transactionmodel.js';
import CreditCard from '../models/creditCardModel.js';

// Register a card for user or employee
export const registerDebitCard = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, linkedAccountType, linkedAccountId } = req.body;

    // Ensure card doesn't already exist
    const existingDebitCard = await DebitCard.findOne({ where: { cardNumber } });
    const existingCreditCard = await CreditCard.findOne({ where: { cardNumber } });
    
    if (existingDebitCard || existingCreditCard) {
      return res.status(400).json({ error: 'Card number already exists in another card' });
    }

    // Create the debit card
    const newCard = await DebitCard.create({
      cardType: 'debit',
      cardNumber,
      expiryDate,
      cvv,
      linkedAccountType,
      linkedAccountId,
    });

    res.status(201).json({ message: 'Debit card registered successfully', newCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Register a credit card for user or employee
export const registerCreditCard = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, linkedAccountType, linkedAccountId, creditLimit } = req.body;

    // Ensure card doesn't already exist
    const existingDebitCard = await DebitCard.findOne({ where: { cardNumber } });
    const existingCreditCard = await CreditCard.findOne({ where: { cardNumber } });
    
    if (existingDebitCard || existingCreditCard) {
      return res.status(400).json({ error: 'Card number already exists in another card' });
    }

    // Validate credit limit
    if (!creditLimit || creditLimit <= 0) {
      return res.status(400).json({ error: 'Invalid credit limit' });
    }

    // Create the credit card
    const newCard = await CreditCard.create({
      cardType: 'credit',
      cardNumber,
      expiryDate,
      cvv,
      linkedAccountType,
      linkedAccountId,
      creditLimit
    });

    res.status(201).json({ message: 'Credit card registered successfully', newCard });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Make a payment using a card
export const makeCardPayment = async (req, res) => {
  try {
    const { cardId, amount, cardType } = req.body;

    let card, account;

    // Handle debit card payments
    if (cardType === 'debit') {
      card = await DebitCard.findByPk(cardId);
      if (!card) return res.status(404).json({ error: 'Debit card not found' });

      if (card.linkedAccountType === 'user') {
        account = await UserAccount.findByPk(card.linkedAccountId);
      } else if (card.linkedAccountType === 'employee') {
        account = await EmployeeAccount.findByPk(card.linkedAccountId);
      }

      if (!account) return res.status(404).json({ error: 'Linked account not found' });
      if (account.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

      // Deduct amount from account balance
      account.balance -= parseFloat(amount);
      await account.save();

      // Log the transaction
      await Transaction.create({
        accountType: card.linkedAccountType,
        accountId: card.linkedAccountId,
        transactionType: 'debit_card_payment',
        amount: parseFloat(amount),
      });

      res.status(200).json({ message: 'Debit card payment successful', balance: account.balance });

    } else if (cardType === 'credit') {
      // Handle credit card payment
      card = await CreditCard.findByPk(cardId);
      if (!card) return res.status(404).json({ error: 'Credit card not found' });

      if ((card.creditUsed + parseFloat(amount)) > card.creditLimit) {
        return res.status(400).json({ error: 'Credit limit exceeded' });
      }

      // Increase the credit used on the card
      card.creditUsed += parseFloat(amount);
      await card.save();

      // Log the transaction
      await Transaction.create({
        accountType: card.linkedAccountType,
        accountId: card.linkedAccountId,
        transactionType: 'credit_card_payment',
        amount: parseFloat(amount),
      });

      res.status(200).json({ message: 'Credit card payment successful', creditUsed: card.creditUsed, creditLimit: card.creditLimit });
    } else {
      return res.status(400).json({ error: 'Unsupported card type' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Repay a credit card
export const repayCreditCard = async (req, res) => {
  try {
    const { cardId, paymentAmount } = req.body;

    // Find the credit card
    const card = await CreditCard.findByPk(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Credit card not found' });
    }

    // Ensure the payment doesn't exceed the credit used
    if (paymentAmount > card.creditUsed) {
      return res.status(400).json({ error: 'Payment amount exceeds credit used' });
    }

    // Fetch the linked account based on the card's linkedAccountType
    let account;
    if (card.linkedAccountType === 'user') {
      account = await UserAccount.findByPk(card.linkedAccountId);
    } else if (card.linkedAccountType === 'employee') {
      account = await EmployeeAccount.findByPk(card.linkedAccountId);
    }

    if (!account) {
      return res.status(404).json({ error: 'Linked account not found' });
    }

    if (account.balance < paymentAmount) {
      return res.status(400).json({ error: 'Insufficient balance in account for repayment' });
    }

    // Deduct the repayment amount from the linked account
    account.balance -= parseFloat(paymentAmount);
    await account.save();

    // Reduce the credit used on the credit card
    card.creditUsed -= parseFloat(paymentAmount);
    await card.save();

    // Log the repayment transaction
    await Transaction.create({
      accountType: card.linkedAccountType,
      accountId: card.linkedAccountId,
      transactionType: 'credit_card_repayment',
      amount: parseFloat(paymentAmount),
    });

    res.status(200).json({
      message: 'Credit card repayment successful',
      remainingCreditUsed: card.creditUsed,
      accountBalance: account.balance,
    });
  } catch (error) {
    console.error('Error in repayCreditCard:', error);
    res.status(500).json({ error: error.message });
  }
};