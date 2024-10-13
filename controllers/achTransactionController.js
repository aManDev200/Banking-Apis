import ACHTransaction from '../models/achTransactionModel.js';
import UserAccount from '../models/userAccount.js';
import EmployeeAccount from '../models/employeeAccount.js';
import Transaction from '../models/transactionmodel.js';


export const initiateACHWithFee = async (req, res) => {
  try {
    const { amount, frequency, purpose } = req.body;
    const linkedAccountId = req.user.id;
    const linkedAccountType = req.user.accountType;
    const transactionFee = 2.5;

    let account;
    if (linkedAccountType === 'user') {
      account = await UserAccount.findByPk(linkedAccountId);
    } else if (linkedAccountType === 'employee') {
      account = await EmployeeAccount.findByPk(linkedAccountId);
    }

    if (!account) return res.status(404).json({ error: 'Linked account not found' });
    if (account.balance < (amount + (amount * transactionFee) / 100)) return res.status(400).json({ error: 'Insufficient balance including transaction fee' });

    const totalDeduction = parseFloat(amount) + parseFloat((amount * transactionFee) / 100);
    account.balance -= totalDeduction;
    await account.save();

    const newACHTransaction = await ACHTransaction.create({
      amount: parseFloat(amount),
      linkedAccountType,
      linkedAccountId,
      status: 'pending',
      frequency: frequency || 'one-time',
      purpose: purpose || null,
      transactionFee,
    });

    // Create the Transaction record with all required fields
    await Transaction.create({
      amount: parseFloat(amount),
      type: 'ACH',
      status: 'pending',
      accountType: linkedAccountType,  // Set the accountType
      accountId: linkedAccountId,      // Set the accountId
      transactionType: 'ach',          // Set the transactionType
      purpose: purpose || null,
      transactionFee,
    });

    res.status(200).json({ message: 'ACH transaction with fee initiated', newACHTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const reverseACHTransaction = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const achTransaction = await ACHTransaction.findByPk(transactionId);

    if (!achTransaction) return res.status(404).json({ error: 'Transaction not found' });
    if (achTransaction.status !== 'pending') return res.status(400).json({ error: 'Only pending transactions can be reversed' });

    let account;
    if (achTransaction.linkedAccountType === 'user') {
      account = await UserAccount.findByPk(achTransaction.linkedAccountId);
    } else if (achTransaction.linkedAccountType === 'employee') {
      account = await EmployeeAccount.findByPk(achTransaction.linkedAccountId);
    }

    // Parse the amount as a float before adding
    const amountToReverse = parseFloat(achTransaction.amount);
    if (isNaN(amountToReverse)) {
      throw new Error(`Invalid amount format: ${achTransaction.amount}`);
    }

    account.balance = parseFloat(account.balance) + amountToReverse;
    await account.save();

    achTransaction.status = 'reversed';
    await achTransaction.save();

    res.status(200).json({ message: 'ACH transaction reversed successfully', achTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const cancelRecurringACH = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const achTransaction = await ACHTransaction.findByPk(transactionId);

    if (!achTransaction) return res.status(404).json({ error: 'Transaction not found' });
    if (achTransaction.frequency === 'one-time') return res.status(400).json({ error: 'Cannot cancel one-time transactions' });

    achTransaction.status = 'cancelled';
    await achTransaction.save();

    // Update the transaction in the Transaction schema
    const transaction = await Transaction.findOne({ where: { id: transactionId } });
    if (transaction) {
      transaction.status = 'cancelled';
      await transaction.save();
    }

    res.status(200).json({ message: 'Recurring ACH transaction cancelled successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

