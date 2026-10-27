const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const generateToken = require('../utils/generateToken');
const store = require('../config/store');
const emailService = require('../services/emailService');

// @desc    Register a new user (with mandatory Email OTP Verification)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = (username || name || email.split('@')[0]).trim();

    // Check existing in MongoDB or store
    let existingUser = null;
    try {
      existingUser = await User.findOne({ email: cleanEmail });
    } catch (e) {
      existingUser = store.users.find((u) => u.email === cleanEmail);
    }

    // Generate 6-digit numeric OTP and 24-byte hex token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email is already registered and verified. Please sign in.',
        });
      }

      // If user registered earlier but didn't verify, update their password and fresh OTP
      existingUser.username = cleanUsername;
      existingUser.password = password;
      existingUser.verificationOTP = otp;
      existingUser.verificationOTPExpires = otpExpires;
      existingUser.verificationToken = verificationToken;

      try {
        if (typeof existingUser.save === 'function') await existingUser.save();
      } catch (e) {
        existingUser.password = await bcrypt.hash(password, 10);
      }

      // Send verification email with OTP and Link
      try {
        await emailService.sendVerificationEmail(cleanEmail, {
          otp,
          verificationToken,
          name: cleanUsername,
        });
      } catch (mailErr) {
        console.warn('[Auth Controller] Brevo email delivery notice:', mailErr.message);
      }

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        message: 'Account pending verification. A fresh 6-digit OTP code has been sent to your email.',
        email: cleanEmail,
      });
    }

    // Create new unverified user
    let newUser = null;
    try {
      newUser = await User.create({
        username: cleanUsername,
        email: cleanEmail,
        password,
        role: 'user',
        isVerified: false,
        verificationOTP: otp,
        verificationOTPExpires: otpExpires,
        verificationToken,
      });
    } catch (err) {
      // Store fallback
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = {
        _id: 'user_' + Date.now(),
        username: cleanUsername,
        name: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: 'user',
        isVerified: false,
        verificationOTP: otp,
        verificationOTPExpires: otpExpires,
        verificationToken,
        createdAt: new Date(),
      };
      store.users.push(newUser);
    }

    // Send verification email with OTP and Link
    try {
      await emailService.sendVerificationEmail(cleanEmail, {
        otp,
        verificationToken,
        name: cleanUsername,
      });
    } catch (mailErr) {
      console.warn('[Auth Controller] Brevo email delivery notice:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Account created! Please enter the 6-digit OTP code sent to your email to activate your account.',
      email: cleanEmail,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {
      user = store.users.find((u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.isVerified) {
      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. You can log in.',
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name || user.username,
          email: user.email,
          role: user.role || 'user',
        },
      });
    }

    // Validate OTP match
    if (user.verificationOTP !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification OTP code. Please check your email and try again.',
      });
    }

    // Validate OTP expiration
    if (user.verificationOTPExpires && new Date(user.verificationOTPExpires).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification OTP has expired. Please request a new code.',
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    user.verificationToken = null;

    try {
      if (typeof user.save === 'function') await user.save();
    } catch (e) {}

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Email verification successful! Welcome to iMovies.',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Registration Link
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmailLink = async (req, res, next) => {
  try {
    const { token, email } = req.query;
    if (!token && !email) {
      return res.status(400).json({ success: false, message: 'Invalid verification link' });
    }

    const cleanEmail = (email || '').toLowerCase().trim();

    let user = null;
    try {
      if (cleanEmail) {
        user = await User.findOne({ email: cleanEmail });
      } else {
        user = await User.findOne({ verificationToken: token });
      }
    } catch (e) {
      user = store.users.find((u) => u.email === cleanEmail || u.verificationToken === token);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (token && user.verificationToken !== token) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationOTP = null;

    try {
      if (typeof user.save === 'function') await user.save();
    } catch (e) {}

    const authToken = generateToken(user);
    return res.status(200).json({
      success: true,
      message: 'Account successfully activated!',
      token: authToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role || 'user' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {
      user = store.users.find((u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const verificationToken = crypto.randomBytes(24).toString('hex');

    user.verificationOTP = otp;
    user.verificationOTPExpires = otpExpires;
    user.verificationToken = verificationToken;

    try {
      if (typeof user.save === 'function') await user.save();
    } catch (e) {}

    await emailService.sendVerificationEmail(cleanEmail, {
      otp,
      verificationToken,
      name: user.name || user.username,
    });

    return res.status(200).json({
      success: true,
      message: 'A fresh 6-digit OTP code has been sent to your email.',
      email: cleanEmail,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request (Sends OTP & Reset Link)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {
      user = store.users.find((u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOTP = otp;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    try {
      if (typeof user.save === 'function') await user.save();
    } catch (e) {}

    await emailService.sendPasswordResetEmail(cleanEmail, {
      otp,
      resetToken,
      name: user.name || user.username,
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset code and link have been sent to your email.',
      email: cleanEmail,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with OTP or Link
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, token, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required',
      });
    }

    if (!otp && !token) {
      return res.status(400).json({
        success: false,
        message: 'Verification code (OTP) or reset token is required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {
      user = store.users.find((u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check expiration
    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new password recovery code.',
      });
    }

    // Check OTP or Token
    const isOtpValid = otp && String(user.resetPasswordOTP).trim() === String(otp).trim();
    const isTokenValid = token && user.resetPasswordToken === token;

    if (!isOtpValid && !isTokenValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recovery code or token. Please check and try again.',
      });
    }

    // Update password
    if (typeof user.save === 'function') {
      user.password = newPassword; // Mongoose pre('save') hook hashes it
      user.resetPasswordOTP = null;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.isVerified = true;
      await user.save();
    } else {
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordOTP = null;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.isVerified = true;
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // First try User model
    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {
      user = store.users.find((u) => u.email === cleanEmail);
    }

    // If not found as user, check if Admin is logging in via unified login
    if (!user) {
      try {
        const adminUser = await Admin.findOne({ email: cleanEmail });
        if (adminUser) user = adminUser;
      } catch (e) {
        const a = store.admins.find((adm) => adm.email === cleanEmail);
        if (a) user = a;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is verified (Admins and seeded accounts pass)
    if (user.role === 'user' && user.isVerified === false) {
      // Generate fresh OTP and resend
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationOTP = otp;
      user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      try {
        if (typeof user.save === 'function') await user.save();
      } catch (e) {}

      emailService.sendVerificationEmail(cleanEmail, {
        otp,
        name: user.name || user.username,
      }).catch((err) => console.warn('Resend verification email notice:', err.message));

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: 'Your account requires email verification. A fresh 6-digit OTP code has been sent to your email.',
        email: cleanEmail,
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new admin
// @route   POST /api/auth/admin/register
// @access  Public
const registerAdmin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    let existing = null;
    try {
      existing = await Admin.findOne({ email: cleanEmail });
    } catch (e) {
      existing = store.admins.find((a) => a.email === cleanEmail);
    }

    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin email already registered' });
    }

    let newAdmin = null;
    try {
      newAdmin = await Admin.create({ username, email: cleanEmail, password, role: 'admin' });
    } catch (e) {
      const hashedPassword = await bcrypt.hash(password, 10);
      newAdmin = {
        _id: 'admin_' + Date.now(),
        username,
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      };
      store.admins.push(newAdmin);
    }

    const token = generateToken(newAdmin);
    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: { id: newAdmin._id, username: newAdmin.username, email: newAdmin.email, role: 'admin' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate admin
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let admin = null;
    try {
      admin = await Admin.findOne({ email: cleanEmail });
    } catch (e) {
      admin = store.admins.find((a) => a.email === cleanEmail);
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    let isMatch = false;
    if (typeof admin.matchPassword === 'function') {
      isMatch = await admin.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, admin.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin);
    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      user: { id: admin._id, username: admin.username, email: admin.email, role: 'admin' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        username: req.user.username,
        name: req.user.name || req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  verifyEmailLink,
  resendOtp,
  forgotPassword,
  resetPassword,
  loginUser,
  registerAdmin,
  loginAdmin,
  getUserProfile,
};
