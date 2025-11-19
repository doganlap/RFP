import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/ApiClient';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[!@#$%^&*]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  const validatePassword = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain a number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    // Validation
    const validationErrors = validatePassword();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      setMessage('Invalid token. Please request a new reset link.');
      return;
    }

    try {
      setStatus('loading');
      await apiClient.resetPassword(token, newPassword);

      setStatus('success');
      setMessage('✓ Password reset successfully! Redirecting to login...');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { passwordReset: true } });
      }, 3000);
    } catch (error) {
      setStatus('error');
      const errorMessage = error.message || 'Failed to reset password';

      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        setMessage('This reset link has expired. Please request a new one.');
      } else if (errorMessage.includes('rate limit')) {
        setMessage('Too many reset attempts. Please try again later.');
      } else {
        setMessage(errorMessage);
      }
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'No password';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Lock size={64} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Create a new password for your account</p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center py-6">
            <p className="text-gray-600">You will be redirected to login shortly.</p>
            <button onClick={() => navigate('/login')} className="mt-4 text-blue-600 hover:text-blue-800 font-semibold underline">
              Click here if not redirected
            </button>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && token && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                    errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={status === 'loading'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">Password Strength</span>
                    <span className={`text-xs font-semibold ${getPasswordStrengthColor() === 'bg-red-500' ? 'text-red-600' : getPasswordStrengthColor() === 'bg-orange-500' ? 'text-orange-600' : getPasswordStrengthColor() === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`} style={{ width: `${(passwordStrength / 5) * 100}%` }} />
                  </div>

                  {/* Requirements */}
                  <div className="mt-3 space-y-2">
                    <RequirementItem met={newPassword.length >= 8} text="At least 8 characters" />
                    <RequirementItem met={/[A-Z]/.test(newPassword)} text="Contains uppercase letter" />
                    <RequirementItem met={/[0-9]/.test(newPassword)} text="Contains number" />
                    <RequirementItem met={/[!@#$%^&*]/.test(newPassword)} text="Contains special character (!@#$%^&*)" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={status === 'loading'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading' || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        {status !== 'success' && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800 font-semibold">
                Log in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for password requirements
const RequirementItem = ({ met, text }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${met ? 'bg-green-500' : 'bg-gray-300'}`}>
      {met && <span className="text-white text-xs font-bold">✓</span>}
    </div>
    <span className={`text-xs ${met ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{text}</span>
  </div>
);

export default ResetPassword;
