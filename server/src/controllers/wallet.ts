import { Request, Response, NextFunction } from "express";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import User from "../models/User";
import stripe from "../config/stripe";

// @desc    Get wallet for the logged-in user
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find or create wallet for the user
    let wallet = await Wallet.findOne({ user: req.user?.id });

    if (!wallet) {
      // Create wallet for both customers and providers
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      wallet = await Wallet.create({
        user: req.user?.id,
        userType: user.role === 'provider' ? 'provider' : 'customer',
        balance: 0,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
export const getWalletTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user?.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .populate('booking');

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Connect bank account (for providers)
// @route   POST /api/wallet/connect-bank
// @access  Private (Provider only)
export const connectBankAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        error: "Only service providers can connect bank accounts",
      });
    }

    const wallet = await Wallet.findOne({ user: req.user?.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    // Create or retrieve Stripe Connect account
    let stripeAccount;

    if (wallet.stripeAccountId) {
      // Retrieve existing account
      stripeAccount = await stripe.accounts.retrieve(wallet.stripeAccountId);
    } else {
      // Create new account
      stripeAccount = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Default to US, can be made dynamic
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: user.name,
        },
        metadata: {
          userId: user.id,
        },
      });

      // Update wallet with Stripe account ID
      wallet.stripeAccountId = stripeAccount.id;
      await wallet.save();
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${req.headers.origin}/provider/wallet/connect-bank`,
      return_url: `${req.headers.origin}/provider/wallet/bank-connected`,
      type: 'account_onboarding',
    });

    res.status(200).json({
      success: true,
      data: {
        url: accountLink.url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add money to wallet (for customers)
// @route   POST /api/wallet/add-money
// @access  Private (Customer only)
export const addMoneyToWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid amount to add",
      });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: "Only customers can add money to their wallet",
      });
    }

    const wallet = await Wallet.findOne({ user: req.user?.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomer;
    if (wallet.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(wallet.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      // Update wallet with Stripe customer ID
      wallet.stripeCustomerId = stripeCustomer.id;
      await wallet.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomer.id,
      metadata: {
        userId: user.id,
        walletId: wallet.id,
        type: 'wallet_deposit',
      },
      description: `Add money to wallet`,
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm money added to wallet
// @route   POST /api/wallet/confirm-deposit
// @access  Private (Customer only)
export const confirmWalletDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID and amount are required",
      });
    }

    const wallet = await Wallet.findOne({ user: req.user?.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: "Payment has not been completed",
      });
    }

    if (paymentIntent.metadata.userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to confirm this payment",
      });
    }

    // Update wallet balance
    wallet.balance += parseFloat(amount);
    await wallet.save();

    // Create transaction record
    const transaction = await Transaction.create({
      wallet: wallet._id,
      user: req.user?.id,
      amount: parseFloat(amount),
      type: 'deposit',
      status: 'completed',
      stripePaymentId: paymentIntentId,
      description: `Added money to wallet`,
    });

    res.status(200).json({
      success: true,
      data: {
        transaction,
        wallet,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Withdraw funds to bank account
// @route   POST /api/wallet/withdraw
// @access  Private (Provider only)
export const withdrawFunds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid amount to withdraw",
      });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        error: "Only service providers can withdraw funds",
      });
    }

    const wallet = await Wallet.findOne({ user: req.user?.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
      });
    }

    if (!wallet.stripeAccountId || !wallet.bankAccountConnected) {
      return res.status(400).json({
        success: false,
        error: "Please connect a bank account first",
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient funds in wallet",
      });
    }

    // Create a transfer to the connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: wallet.stripeAccountId,
      metadata: {
        userId: req.user?.id,
        walletId: wallet.id,
      },
    });

    // Create transaction record
    const transaction = await Transaction.create({
      wallet: wallet._id,
      user: req.user?.id,
      amount: -amount, // Negative amount for withdrawal
      type: 'withdrawal',
      status: 'completed',
      stripeTransferId: transfer.id,
      description: `Withdrawal to bank account`,
    });

    // Update wallet balance
    wallet.balance -= amount;
    await wallet.save();

    res.status(200).json({
      success: true,
      data: {
        transaction,
        wallet,
      },
    });
  } catch (err) {
    next(err);
  }
};
