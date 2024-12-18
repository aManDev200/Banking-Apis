import fetch from 'node-fetch';

const cardService = {
  registerDebitCard: async (card) => {
    try {
      const response = await fetch('https://payment-processor-a68l.onrender.com/api/banks/register-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: card.cardNumber,
          expiryDate: card.expiryDate,
          cvv: card.cvv,
          linkedAccountType: card.linkedAccountType,
          linkedAccountId: card.linkedAccountId,
          cardType: 'debit',
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to register debit card in payment processor:', error);
      return { success: false, message: 'Failed to register debit card in payment processor' };
    }
  },

  registerCreditCard: async (card) => {
    try {
      const response = await fetch('https://payment-processor-a68l.onrender.com/api/banks/register-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: card.cardNumber,
          expiryDate: card.expiryDate,
          cvv: card.cvv,
          linkedAccountType: card.linkedAccountType,
          linkedAccountId: card.linkedAccountId,
          cardType: 'credit',
          creditLimit: card.creditLimit,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to register credit card in payment processor:', error);
      return { success: false, message: 'Failed to register credit card in payment processor' };
    }
  },
};

export default cardService;
