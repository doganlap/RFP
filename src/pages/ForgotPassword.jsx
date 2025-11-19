import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/ApiClient';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateEmail = (emailToValidate) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    // Validation
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      setStatus('loading');
      await apiClient.forgotPassword(email);

      setStatus('success');
      setMessage('✓ Password reset email sent! Check your inbox for the reset link.');
      setEmail('');

      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login', { state: { email, resetEmailSent: true } });
      }, 5000);
    } catch (error) {
      setStatus('error');
      const errorMessage = error.message || 'Failed to send reset email';

      // More specific error messages
      if (errorMessage.includes('not found')) {
        setMessage('This email is not registered with us.');
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        setMessage('Too many reset requests. Please wait a few minutes before trying again.');
      } else {
        setMessage(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Mail size={64} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">No problem! We'll help you reset it.</p>
        </div>

        {/* Status Message */}
        {status === 'success' && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                placeholder="your@email.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={status === 'loading'}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              <p className="mt-2 text-xs text-gray-500">Enter the email address associated with your account</p>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        {/* Success Action */}
        {status === 'success' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The reset link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Back to Login
              </button>
            </div>
          </div>
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

export default ForgotPassword;
