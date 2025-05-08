import express from 'express';
import {
  getWallet,
  getWalletTransactions,
  connectBankAccount,
  withdrawFunds,
  addMoneyToWallet,
  confirmWalletDeposit,
} from '../controllers/wallet';
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

// All routes are protected
router.get('/', protect, checkAccess('wallet', 'readOwn'), getWallet);
router.get('/transactions', protect, checkAccess('wallet', 'readOwn'), getWalletTransactions);

// Provider routes
router.post('/connect-bank', protect, checkAccess('wallet', 'updateOwn'), connectBankAccount);
router.post('/withdraw', protect, checkAccess('wallet', 'updateOwn'), withdrawFunds);

// Customer routes
router.post('/add-money', protect, checkAccess('wallet', 'updateOwn'), addMoneyToWallet);
router.post('/confirm-deposit', protect, checkAccess('wallet', 'updateOwn'), confirmWalletDeposit);

export { router };
