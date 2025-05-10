import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { isResettingPassword, resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/forget-password');
    }
  }, [email, navigate]);
  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await resetPassword({ email, password: formData.password });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.message || 'Failed to reset password';
      setErrors({ server: errorMessage });
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Set New Password</h1>
              <p className="text-base-content/60">Enter your new password for {email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="form-control relative">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input input-bordered w-full pl-10 ${errors.password || errors.server ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm absolute top-full left-0 mt-1 ml-2">{errors.password}</p>
              )}
            </div>

            <div className="form-control relative">
              <label className="label">
                <span className="label-text font-medium">Confirm New Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input input-bordered w-full pl-10 ${errors.confirmPassword || errors.server ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-error text-sm absolute top-full left-0 mt-1 ml-2">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="relative">
              {errors.server && (
                <p className="absolute text-error text-sm mb-2 mt-[-1.4rem] ml-2">{errors.server}</p>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={isResettingPassword}>
                {isResettingPassword ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
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
    </div>
  );
};

export default ResetPasswordPage;