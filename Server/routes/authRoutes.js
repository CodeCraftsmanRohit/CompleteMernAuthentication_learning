import express from 'express';
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetpassword,
} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

// Auth Routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

// Verification Routes
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);

// Authenticated Check (supports both POST and GET)
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.get('/is-auth', userAuth, isAuthenticated); // ✅ added GET route

// Password Reset Routes
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetpassword);

export default authRouter;
