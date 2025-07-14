import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Lock, Mail, User, Cloudy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthImagePattern from '../components/AuthImgPattern';
const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { isLoading, signup } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
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
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/verify-otp', { state: { email: formData.email, flow: 'signup' } });

    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      setErrors({ server: errorMessage });
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md mt-4">
          <div className="text-center">
            <div className="flex flex-col items-center  group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-base-content/60">Sign up for a new account</p>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-3 mb-6">
            <div className="form-control relative">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 ${errors.username || errors.server ? 'input-error' : ''}`}
                  placeholder="John Smith"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              {errors.username && (
                <p className="text-error text-sm absolute top-full left-0 mt-1 ml-2">{errors.username}</p>
              )}
            </div>

            <div className="form-control relative">
              <label className="label mt-2">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 ${errors.email || errors.server ? 'input-error' : ''}`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-error text-sm absolute top-full left-0 mt-1 ml-2">{errors.email}</p>
              )}
            </div>

            <div className="form-control relative">
              <label className="label mt-2">
                <span className="label-text font-medium">Password</span>
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
              <label className="label mt-2">
                <span className="label-text font-medium">Confirm Password</span>
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
                <p className="absolute text-error text-sm mb-2 mt-[-0.8rem] ml-2">{errors.server}</p>
              )}
              <button type="submit" className="btn btn-primary w-full mt-3" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        />
    </div>
  );
};

export default SignUpPage;