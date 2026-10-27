import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Clapperboard,
  Lock,
  Mail,
  Shield,
  User,
  Sparkles,
  KeyRound,
  X,
  CheckCircle2,
  RotateCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleMode, setRoleMode] = useState('user');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendingForgot, setResendingForgot] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Unverified Account OTP Modal State (if user logs in before verifying)
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyOtpCode, setVerifyOtpCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const { login, forgotPassword, resetPassword, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // If user arrives via reset password link ?resetToken=...&email=...
  useEffect(() => {
    const resetToken = searchParams.get('resetToken');
    const paramEmail = searchParams.get('email');
    if (resetToken && paramEmail) {
      setForgotEmail(paramEmail);
      setForgotStep(2);
      setShowForgotModal(true);
      toast.info('Please enter your new password.');
    }
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      toast.success(res.message || 'Welcome back to iMovies!');
      if (res.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.requiresVerification) {
        setVerifyEmail(errData.email || email);
        setShowVerifyModal(true);
        toast.warning(errData.message || 'Please verify your email address to continue.');
      } else {
        toast.error(errData?.message || err.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccountOtp = async (e) => {
    e.preventDefault();
    if (!verifyOtpCode || verifyOtpCode.trim().length !== 6) {
      toast.warning('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setVerifyLoading(true);
      const res = await verifyOtp(verifyEmail, verifyOtpCode.trim());
      toast.success(res.message || 'Email verified! Welcome to iMovies.');
      setShowVerifyModal(false);
      navigate('/home', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOpenForgotModal = () => {
    setForgotEmail(email || '');
    setForgotStep(1);
    setForgotOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowForgotModal(true);
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your registered email address');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await forgotPassword(forgotEmail);
      toast.success(res.message || 'Recovery instructions sent to your email.');
      setForgotStep(2);
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not send recovery email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      toast.warning('Please enter the 6-digit recovery code from your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await resetPassword({
        email: forgotEmail,
        otp: forgotOtp.trim(),
        token: searchParams.get('resetToken') || undefined,
        newPassword,
      });

      toast.success(res.message || 'Password successfully reset! Please sign in.');
      setShowForgotModal(false);
      setPassword(newPassword);
      setEmail(forgotEmail);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const fillDemoUser = () => {
    setRoleMode('user');
    setEmail('user@imovies.com');
    setPassword('user123');
    toast.info('Auto-filled Demo User credentials');
  };

  const fillDemoAdmin = () => {
    setRoleMode('admin');
    setEmail('admin@imovies.com');
    setPassword('admin123');
    toast.info('Auto-filled Demo Admin credentials');
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
          <h2 className="text-2xl font-black text-white mb-1">Sign In</h2>
          <p className="text-xs text-[#8ea3b0]">
            Enter your credentials to access your iMovies Prime account
          </p>
        </div>

        {/* Demo Fill Pills */}
        <div className="mb-6 p-3 rounded-lg bg-[#141d26] border border-[#2c3e50]/70">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4a6275] mb-2 flex items-center gap-1">
            <Sparkles size={12} className="text-[#00a8e1]" /> Quick Evaluator Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoUser}
              className="text-xs py-1.5 px-2 rounded font-semibold border border-[#2c3e50] bg-[#1f2d3a] hover:border-[#00a8e1] text-white transition-all flex items-center justify-center gap-1.5"
            >
              <User size={13} className="text-[#00a8e1]" /> Demo User
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-xs py-1.5 px-2 rounded font-semibold border border-[#2c3e50] bg-[#1f2d3a] hover:border-yellow-400 text-yellow-400 transition-all flex items-center justify-center gap-1.5"
            >
              <Shield size={13} className="text-yellow-400" /> Demo Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                className="input-prime pl-9 text-sm"
                placeholder="name@imovies.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6275]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8ea3b0]">
                Password
              </label>
              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-xs text-[#00a8e1] font-semibold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                className="input-prime pl-9 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#2c3e50] text-center">
          <p className="text-xs text-[#8ea3b0]">
            New to iMovies?{' '}
            <Link to="/register" className="text-[#00a8e1] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#1a242f] rounded-2xl overflow-hidden border border-[#2c3e50] shadow-2xl p-7">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[#8ea3b0] hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#e50914]/15 border border-[#e50914]/30 mx-auto flex items-center justify-center mb-4 text-[#ff4d58]">
              <KeyRound size={22} />
            </div>

            <h3 className="text-xl font-black text-white text-center mb-1">
              {forgotStep === 1 ? 'Reset Password' : 'Enter Recovery Code'}
            </h3>
            <p className="text-xs text-[#8ea3b0] text-center mb-6">
              {forgotStep === 1
                ? 'Enter your registered email address to receive password reset instructions and OTP.'
                : `We sent a recovery code to ${forgotEmail}`}
            </p>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input-prime pl-9 text-sm"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6275]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-lg font-bold text-sm text-white justify-center shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#e50914' }}
                >
                  {forgotLoading ? 'Sending Recovery Code...' : 'Send Reset Code & Link'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                    6-Digit Recovery OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-xl font-bold tracking-[8px] py-2.5 rounded-lg border-2 border-[#e50914] bg-[#0e1620] text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="input-prime text-sm"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="input-prime text-sm"
                    placeholder="Confirm password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-lg font-bold text-sm text-white justify-center shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#e50914' }}
                >
                  {forgotLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>

                <div className="flex items-center justify-between text-xs text-[#8ea3b0] pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="hover:text-white"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    disabled={cooldown > 0}
                    className="text-[#00a8e1] font-bold hover:underline disabled:text-[#4a6275] disabled:no-underline"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Unverified Account OTP Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#1a242f] rounded-2xl overflow-hidden border border-[#2c3e50] shadow-2xl p-7 text-center">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-[#8ea3b0] hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-full bg-[#00a8e1]/15 border border-[#00a8e1]/30 mx-auto flex items-center justify-center mb-4 text-[#00a8e1]">
              <KeyRound size={26} />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              Verify Account Email
            </h3>
            <p className="text-xs text-[#8ea3b0] mb-6">
              Enter the 6-digit OTP code sent to<br />
              <strong className="text-white font-semibold">{verifyEmail}</strong>
            </p>

            <form onSubmit={handleVerifyAccountOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                value={verifyOtpCode}
                onChange={(e) => setVerifyOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl font-black tracking-[10px] py-3 rounded-lg border-2 border-[#00a8e1] bg-[#0e1620] text-white focus:outline-none font-mono"
                required
              />

              <button
                type="submit"
                disabled={verifyLoading || verifyOtpCode.length !== 6}
                className="btn-prime w-full py-3 rounded-lg font-bold text-sm justify-center shadow-lg shadow-[#00a8e1]/30 flex items-center gap-2 disabled:opacity-50"
              >
                {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
