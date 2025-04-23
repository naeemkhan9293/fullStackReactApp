import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth';
import { protect } from '../middleware/auth';
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, checkAccess('profile', 'readOwn'), getMe);
router.put('/updatedetails', protect, checkAccess('profile', 'updateOwn'), updateDetails);
router.put('/updatepassword', protect, checkAccess('profile', 'updateOwn'), updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export { router };
