import React, { useState } from 'react';
import { apiClient } from '../services/ApiClient';
import { AlertTriangle, Eye, EyeOff, X, CheckCircle } from 'lucide-react';

const AccountDeactivationModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('confirm'); // confirm, details, success
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const deactivationReasons = [
    { value: 'found-alternative', label: 'Found another solution' },
    { value: 'not-needed', label: "Don't need this anymore" },
    { value: 'privacy-concerns', label: 'Privacy concerns' },
    { value: 'too-expensive', label: 'Too expensive' },
    { value: 'poor-performance', label: 'Poor performance' },
    { value: 'difficult-to-use', label: 'Difficult to use' },
    { value: 'other', label: 'Other reason' },
  ];

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  const validateDeactivation = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required to confirm deactivation';
    }

    if (!reason) {
      newErrors.reason = 'Please select a reason for deactivation';
    }

    return newErrors;
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    const validationErrors = validateDeactivation();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      // Call deactivate API
      await apiClient.deactivateAccount(password, reason, feedback);

      setStep('success');
      setMessage('Your account has been deactivated successfully.');

      // Auto-logout and redirect after 5 seconds
      setTimeout(() => {
        // Clear token and logout
        apiClient.clearToken();
        window.location.href = '/goodbye';
      }, 5000);
    } catch (error) {
      const errorMessage = error.message || 'Failed to deactivate account';

      if (errorMessage.includes('password')) {
        setErrors({ password: 'Incorrect password' });
      } else if (errorMessage.includes('not found')) {
        setMessage('Account not found. Please try logging in again.');
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Deactivate Account</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Confirm Step */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-2">Warning: This action cannot be undone</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Your account will be permanently deleted</li>
                    <li>• All your data will be removed after 30 days</li>
                    <li>• You won't be able to recover any documents</li>
                    <li>• All active sessions will be ended</li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                If you're having trouble with the platform, our support team might be able to help. Contact us before deactivating.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('details')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Continue with Deactivation
                </button>
                <button
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <form onSubmit={handleDeactivate} className="space-y-6">
              {/* Message */}
              {message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{message}</p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you leaving? (Required)
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (errors.reason) setErrors({ ...errors, reason: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select a reason...</option>
                  {deactivationReasons.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
              </div>

              {/* Feedback */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Feedback (Optional)
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Let us know how we can improve..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">{feedback.length}/500 characters</p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password (Required)
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-500">We need your password to confirm this action</p>
              </div>

              {/* Confirm Checkbox */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="understand"
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    required
                    disabled={loading}
                  />
                  <span className="text-sm text-red-900">
                    I understand that deactivating my account will permanently delete all my data and cannot be reversed
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Deactivating...' : 'Deactivate My Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  disabled={loading}
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-6">
              <CheckCircle size={64} className="mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Account Deactivated</h3>
              <p className="text-gray-600 mb-4">
                Your account has been successfully deactivated. You'll be redirected shortly.
              </p>
              <p className="text-sm text-gray-500">
                Your data will be permanently deleted after 30 days.
              </p>
              <button
                onClick={() => {
                  apiClient.clearToken();
                  window.location.href = '/goodbye';
                }}
                className="mt-6 text-blue-600 hover:text-blue-800 font-semibold"
              >
                Continue to Goodbye Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDeactivationModal;
