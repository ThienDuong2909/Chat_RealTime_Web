import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloudy, Loader2, Mail, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import AuthImagePattern from '../components/AuthImgPattern';
const ForgetPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const { isRequestingPasswordReset, requestPasswordReset } = useAuthStore();
  const navigate = useNavigate();
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setErrors({});
      setSuccessMessage('');
      await requestPasswordReset(formData.email);
      setSuccessMessage('Password OTP code sent to your email');
      navigate('/verify-otp', { state: { email: formData.email, flow: 'forget-password' } });
    } catch (error) {
      const errorMessage = error.message || 'Failed to send OTP code';
      setErrors({ server: errorMessage });
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Cloudy className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Reset Your Password</h1>
              <p className="text-base-content/60">Enter your email to receive a OTP code</p>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="form-control relative">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 ${errors.email || errors.server ? 'input-error' : ''}`}
                  placeholder="example@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-error text-sm absolute top-full left-0 mt-1 ml-2">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              {errors.server && (
                <p className="absolute text-error text-sm mb-2 mt-[-1.4rem] ml-2">{errors.server}</p>
              )}
              {successMessage && (
                <p className="absolute text-success text-sm mb-2 mt-[-1.4rem] ml-2">{successMessage}</p>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={isRequestingPasswordReset}>
                {isRequestingPasswordReset ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Get OTP code'
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Back to{' '}
              <Link to="/login" className="link link-primary no-underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImagePattern
        title="Reset your password"
        subtitle="Don’t worry! We’ll help you recover access to your account quickly and securely."
        />
    </div>
  );
};

export default ForgetPasswordPage;