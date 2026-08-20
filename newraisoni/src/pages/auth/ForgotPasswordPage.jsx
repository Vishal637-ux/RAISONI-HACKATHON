import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.sendPasswordResetEmail(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#EAF4EC] text-[#2F8F46] rounded-xl flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#18201B]">Reset Your Password</h1>
          <p className="text-xs text-[#66706A] mt-1">
            Enter your registered email address and we will send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="p-4 bg-[#EAF4EC] border border-[#2F8F46] rounded-xl text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-[#2F8F46] mx-auto" />
            <h3 className="text-sm font-bold text-[#1F6B32]">Reset Link Sent!</h3>
            <p className="text-xs text-[#66706A]">
              We have sent a password reset link to <strong className="text-[#18201B]">{email}</strong>. Please check your inbox.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-block mt-2 text-xs font-bold text-[#2F8F46] hover:text-[#1F6B32]"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#66706A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@raisoni.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] placeholder-[#66706A] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs text-[#66706A] hover:text-[#1F6B32] font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
