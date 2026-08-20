import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.updateUserPassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#EAF4EC] text-[#2F8F46] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#18201B]">Set New Password</h1>
          <p className="text-xs text-[#66706A] mt-1">
            Please enter your new password to update your account security.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-[#EAF4EC] border border-[#2F8F46] rounded-xl text-center space-y-2 text-[#1F6B32]">
            <CheckCircle className="w-8 h-8 text-[#2F8F46] mx-auto" />
            <h3 className="text-sm font-bold">Password Updated!</h3>
            <p className="text-xs text-[#66706A]">Redirecting you to the sign in page...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
