import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.signIn({ email, password });
      // Session subscriber in AuthContext / PublicRoute will handle portal redirect automatically
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#2F8F46] text-white font-bold text-xl rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            IT
          </div>
          <h1 className="text-2xl font-bold text-[#18201B] tracking-tight">INTERTRACK</h1>
          <p className="text-xs text-[#66706A] mt-1 font-medium">
            Institutional Internship Management & Verification Platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#18201B]">
                Password
              </label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs text-[#2F8F46] hover:text-[#1F6B32] font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#66706A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#66706A]">
          Don't have a student account?{' '}
          <Link to={ROUTES.REGISTER} className="text-[#2F8F46] font-bold hover:text-[#1F6B32]">
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};
