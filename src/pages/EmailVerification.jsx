import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/ApiClient';
import { CheckCircle, AlertCircle, Clock, Mail } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyingManual, setVerifyingManual] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setStatus('ready');
    }
  }, [token]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmailToken = async (tokenToVerify) => {
    try {
      setStatus('verifying');
      setMessage('');

      const response = await apiClient.verifyEmail(tokenToVerify);

      setStatus('success');
      setMessage('✓ Email verified successfully! Redirecting to login...');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { email, verified: true } });
      }, 3000);
    } catch (error) {
      const errorMessage = error.message || 'Verification failed';

      if (errorMessage.includes('expired') || errorMessage.includes('Expired')) {
        setStatus('expired');
        setMessage('Your verification link has expired. Please request a new one.');
      } else {
        setStatus('error');
        setMessage(errorMessage);
      }
    }
  };

  const handleManualVerification = async (e) => {
    e.preventDefault();

    if (!manualToken.trim()) {
      setMessage('Please enter a verification code');
      return;
    }

    await verifyEmailToken(manualToken.trim());
    setVerifyingManual(true);
  };

  const handleResendEmail = async () => {
    try {
      if (!email) {
        setMessage('Email address not found. Please check your verification link.');
        return;
      }

      await apiClient.forgotPassword(email);
      setMessage('Verification email sent! Check your inbox.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      setMessage(`Failed to resend email: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          {status === 'success' && (
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-green-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex justify-center mb-4">
              <AlertCircle size={64} className="text-red-500" />
            </div>
          )}
          {status === 'expired' && (
            <div className="flex justify-center mb-4">
              <Clock size={64} className="text-orange-500" />
            </div>
          )}
          {(status === 'ready' || status === 'loading') && (
            <div className="flex justify-center mb-4">
              <Mail size={64} className="text-blue-500" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'expired' && 'Link Expired'}
            {(status === 'ready' || status === 'loading' || status === 'verifying') && 'Verify Your Email'}
          </h1>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              status === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : status === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : status === 'expired'
                    ? 'bg-orange-50 text-orange-800 border border-orange-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}

        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
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

        {/* Manual Verification Form */}
        {(status === 'ready' || status === 'error' || status === 'expired') && (
          <form onSubmit={handleManualVerification} className="space-y-6">
            <div>
              {email && (
                <p className="text-sm text-gray-600 mb-4">We sent a verification code to: <span className="font-semibold">{email}</span></p>
              )}
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="token"
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Enter verification code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono tracking-widest text-center"
                disabled={verifyingManual}
              />
              <p className="mt-2 text-xs text-gray-500">The code is in the email we sent you</p>
            </div>

            <button
              type="submit"
              disabled={!manualToken.trim() || verifyingManual}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {verifyingManual ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        {/* Resend Email */}
        {(status === 'error' || status === 'expired') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Didn't receive the email?</p>
            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
            </button>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/login')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
