import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Clapperboard, Lock, Mail, User, ShieldCheck, KeyRound, ArrowRight, RotateCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification Window State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If user arrives via email link ?token=...&email=...
  useEffect(() => {
    const token = searchParams.get('token');
    const paramEmail = searchParams.get('email');
    if (token && paramEmail) {
      handleLinkVerification(token, paramEmail);
    }
  }, [searchParams]);

  // Resend Cooldown Timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLinkVerification = async (token, mail) => {
    try {
      setLoading(true);
      const res = await api.get(`/auth/verify-email?token=${token}&email=${encodeURIComponent(mail)}`);
      if (res.data?.success) {
        toast.success('Email verified successfully! You can now log in.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification link expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      toast.error('Username must be between 3 and 20 characters');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await register({ username, email, password });

      if (res?.requiresVerification) {
        setOtpEmail(res.email || email);
        setShowOtpModal(true);
        setCooldown(60);
        toast.info(res.message || 'Verification code sent to your email.');
      } else {
        toast.success(res.message || 'Account created successfully! Welcome to iMovies.');
        navigate('/home', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.warning('Please enter the full 6-digit OTP code.');
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await verifyOtp(otpEmail, otpCode.trim());
      toast.success(res.message || 'Account activated! Welcome to iMovies.');
      setShowOtpModal(false);
      navigate('/home', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setResendingOtp(true);
      const res = await resendOtp(otpEmail);
      toast.success(res.message || 'A fresh OTP code has been dispatched to your email.');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP. Try again shortly.');
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12"
         style={{ background: '#0f171e' }}>
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2 no-underline mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
             style={{ background: 'linear-gradient(135deg, #00a8e1, #0067a3)' }}>
          <Clapperboard size={22} color="#fff" />
        </div>
        <span className="text-2xl font-black text-white tracking-tight">
          i<span style={{ color: '#00a8e1' }}>Movies</span>
        </span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-widest text-[#00a8e1] border border-[#00a8e1]/40 ml-1">
          PRIME
        </span>
      </Link>

      <div
        className="w-full max-w-md p-8 rounded-xl border border-[#2c3e50] shadow-2xl relative"
        style={{ background: '#1a242f' }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white mb-1">Create Account</h2>
          <p className="text-xs text-[#8ea3b0]">
            Sign up to reserve cinema seats and unlock Prime movie experiences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                className="input-prime pl-9 text-sm"
                placeholder="cinephile_01"
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6275]" />
            </div>
            <p className="text-[10px] text-[#4a6275] mt-1">3 - 20 alphanumeric characters</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                className="input-prime pl-9 text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6275]" />
            </div>
            <p className="text-[10px] text-[#00a8e1] mt-1 flex items-center gap-1">
              <ShieldCheck size={12} /> A 6-digit verification code will be sent to this email
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="input-prime pl-9 text-sm"
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6275]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="input-prime pl-9 text-sm"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6275]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-prime w-full py-2.5 rounded font-bold justify-center text-sm shadow-md shadow-[#00a8e1]/20 mt-2"
          >
            {loading ? 'Sending Verification...' : 'Agree & Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#2c3e50] text-center">
          <p className="text-xs text-[#8ea3b0]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00a8e1] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal Window */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#1a242f] rounded-2xl overflow-hidden border border-[#2c3e50] shadow-2xl p-7 text-center">
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-full bg-[#00a8e1]/15 border border-[#00a8e1]/30 mx-auto flex items-center justify-center mb-4 text-[#00a8e1]">
              <KeyRound size={26} />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              Verify Your Email
            </h3>
            <p className="text-xs text-[#8ea3b0] mb-6">
              We have sent an authentication code to<br />
              <strong className="text-white font-semibold">{otpEmail}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8ea3b0] mb-2">
                  Enter 6-Digit One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl font-black tracking-[12px] py-3.5 rounded-lg border-2 border-[#00a8e1] bg-[#0e1620] text-white focus:outline-none focus:ring-4 focus:ring-[#00a8e1]/25 transition-all font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otpCode.length !== 6}
                className="btn-prime w-full py-3 rounded-lg font-bold text-sm justify-center shadow-lg shadow-[#00a8e1]/30 flex items-center gap-2 disabled:opacity-50"
              >
                {verifyingOtp ? (
                  'Verifying Code...'
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Verify & Complete Registration
                  </>
                )}
              </button>
            </form>

            {/* Resend OTP Bar */}
            <div className="mt-5 pt-4 border-t border-[#233546] flex items-center justify-between text-xs text-[#8ea3b0]">
              <span>Didn't receive email?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resendingOtp}
                className="text-[#00a8e1] font-bold hover:underline disabled:text-[#4a6275] disabled:no-underline flex items-center gap-1"
              >
                <RotateCw size={12} className={resendingOtp ? 'animate-spin' : ''} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-xs text-[#627d92] hover:text-white"
              >
                Cancel and edit email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
