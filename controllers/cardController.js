import DebitCard from '../models/debitCardModel.js';
import UserAccount from '../models/userAccount.js';
import EmployeeAccount from '../models/employeeAccount.js';
import Transaction from '../models/transactionmodel.js';
import CreditCard from '../models/creditCardModel.js';
import cardService from '../services/cardServices.js';

// Register a card for user or employee
export const registerDebitCard = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, linkedAccountType, linkedAccountId } = req.body;

    // Ensure card doesn't already exist in the bank
    const existingDebitCard = await DebitCard.findOne({ where: { cardNumber } });
    const existingCreditCard = await CreditCard.findOne({ where: { cardNumber } });

    if (existingDebitCard || existingCreditCard) {
      return res.status(400).json({ error: 'Card number already exists' });
    }

    // Register the debit card in the bank
    const newCard = await DebitCard.create({
      cardType: 'debit',
      cardNumber,
      expiryDate,
      cvv,
      linkedAccountType,
      linkedAccountId,
    });

    // Call the Payment Processor API to register the card using cardService
    const paymentProcessorResponse = await cardService.registerDebitCard({
      cardNumber,
      expiryDate,
      cvv,
      linkedAccountType,
      linkedAccountId,
    });

    if (!paymentProcessorResponse.success) {
      console.error('Error registering card in payment processor:', paymentProcessorResponse.message);
      return res.status(500).json({ error: 'Error registering card in payment processor' });
    }

    res.status(201).json({ message: 'Debit card registered successfully', newCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register a credit card for user or employee
export const registerCreditCard = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, linkedAccountType, linkedAccountId, creditLimit } = req.body;

    // Ensure card doesn't already exist in the bank
    const existingDebitCard = await DebitCard.findOne({ where: { cardNumber } });
    const existingCreditCard = await CreditCard.findOne({ where: { cardNumber } });

    if (existingDebitCard || existingCreditCard) {
      return res.status(400).json({ error: 'Card number already exists' });
    }

    // Validate credit limit
    if (!creditLimit || creditLimit <= 0) {
      return res.status(400).json({ error: 'Invalid credit limit' });
    }

    // Register the credit card in the bank
    const newCard = await CreditCard.create({
      cardType: 'credit',
      cardNumber,
      expiryDate,
      cvv,
      linkedAccountType,
      linkedAccountId,
      creditLimit,
    });

    // Call the Payment Processor API to register the card using cardService
    const paymentProcessorResponse = await cardService.registerCreditCard({
      cardNumber,
      expiryDate,
      cvv,
      linkedAccountType,
      linkedAccountId,
      creditLimit,
    });

    if (!paymentProcessorResponse.success) {
      console.error('Error registering card in payment processor:', paymentProcessorResponse.message);
      return res.status(500).json({ error: 'Error registering card in payment processor' });
    }

    res.status(201).json({ message: 'Credit card registered successfully', newCard });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Validate a card (separate from making payments)
export const validateCard = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, cardType } = req.body;
    console.log({cardNumber,cardType,expiryDate,cvv});
    // Find the card in the bank database (debit or credit)
    let card;
    if (cardType === 'debit') {
      card = await DebitCard.findOne({ where: { cardNumber, expiryDate, cvv } });
    } else if (cardType === 'credit') {
      card = await CreditCard.findOne({ where: { cardNumber, expiryDate, cvv } });
    } else {
      return res.status(400).json({ error: 'Unsupported card type' });
    }

    if (!card) {
      return res.status(404).json({ error: 'Card not found or invalid' });
    }

    res.status(200).json({ success: true, message: 'Card is valid' });
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

// Update a bank account after making a payment or repayment
export const updateBankAccount = async (req, res) => {
  try {
    const { amount, cardType, cardNumber, cvv } = req.body;

    let card;
    if (cardType === 'debit') {
      card = await DebitCard.findOne({ where: { cardNumber, cvv } });
    } else if (cardType === 'credit') {
      card = await CreditCard.findOne({ where: { cardNumber, cvv } });
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported card type' });
    }

    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found or invalid' });
    }

    let account;
    if (card.linkedAccountType === 'user') {
      account = await UserAccount.findByPk(card.linkedAccountId);
    } else if (card.linkedAccountType === 'employee') {
      account = await EmployeeAccount.findByPk(card.linkedAccountId);
    }

    if (!account) {
      return res.status(404).json({ success: false, error: 'Linked account not found' });
    }

    // Logic for updating balances based on card type
    if (cardType === 'credit') {
      // Update the used credit amount
      const creditUsed = card.creditUsed || 0; // Get existing credit used or default to 0
      const newCreditUsed = creditUsed + parseFloat(amount); // Increment used credit

      // Check if the new credit usage exceeds the credit limit
      if (newCreditUsed > card.creditLimit) {
        return res.status(400).json({ success: false, error: 'Credit limit exceeded' });
      }

      // Update the card's used credit
      card.creditUsed = newCreditUsed;
      await card.save();
      
      // Respond with the updated credit usage
      return res.status(200).json({ success: true, message: 'Credit used updated successfully', creditUsed: newCreditUsed });
    } else if (cardType === 'debit') {
      // Update the bank account balance for debit card payments
      const updatedBalance = account.balance - parseFloat(amount);
      
      // Check for insufficient balance for debit card payments
      if (updatedBalance < 0) {
        return res.status(400).json({ success: false, error: 'Insufficient balance in linked account' });
      }

      // Save the updated balance to the account
      account.balance = updatedBalance;
      await account.save();

      if (cardType === 'debit')
      {
        await Transaction.create({
          accountType: card.linkedAccountType,
          accountId: card.linkedAccountId,
          transactionType: 'debit_card_payment',
          amount: parseFloat(paymentAmount),
        });
      }
      else
      {
        await Transaction.create({
          accountType: card.linkedAccountType,
          accountId: card.linkedAccountId,
          transactionType: 'credit_card_payment',
          amount: parseFloat(paymentAmount),
        });    
      }

      return res.status(200).json({ success: true, message: 'Bank account updated successfully', newBalance: account.balance });
    }
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
