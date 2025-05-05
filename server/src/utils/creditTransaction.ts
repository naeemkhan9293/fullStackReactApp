import User from '../models/User';
import CreditTransaction from '../models/CreditTransaction';

/**
 * Deduct credits from a user and record the transaction
 * @param userId User ID
 * @param amount Amount of credits to deduct (positive number)
 * @param description Description of the transaction
 * @param reference Optional reference ID (e.g., booking ID)
 * @returns Updated user with new credit balance
 */
export const deductCredits = async (
  userId: string,
  amount: number,
  description: string,
  reference?: string
) => {
  // Find user
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if user has enough credits
  if (user.credits < amount) {
    throw new Error('Insufficient credits');
  }
  
  // Deduct credits
  user.credits -= amount;
  await user.save();
  
  // Record transaction
  await CreditTransaction.create({
    user: userId,
    amount: -amount, // Negative amount for deduction
    type: 'usage',
    description,
    reference,
  });
  
  return user;
};

/**
 * Check if a user has enough credits
 * @param userId User ID
 * @param requiredAmount Amount of credits required
 * @returns Boolean indicating if user has enough credits
 */
export const hasEnoughCredits = async (
  userId: string,
  requiredAmount: number
): Promise<boolean> => {
  const user = await User.findById(userId);
  
  if (!user) {
    return false;
  }
  
  return user.credits >= requiredAmount;
};
