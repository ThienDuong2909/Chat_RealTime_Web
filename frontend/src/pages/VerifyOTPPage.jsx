import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isResendCooldown, setIsResendCooldown] = useState(false);
  const { isVerifyingOTP, verifyOTP, refreshOTP, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Xóa tất cả thông báo khi người dùng bắt đầu nhập lại
    setErrors({});
    setSuccessMessage('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter a 6-digit OTP' });
      return;
    }

    try {
      setErrors({});
      setSuccessMessage('');
      await verifyOTP({ email, otpCode });
      await checkAuth();
      navigate('/');
    } catch (error) {
      const errorMessage = error.message || 'OTP verification failed';
      setErrors({ server: errorMessage });
    }
  };

  const handleResendOTP = async () => {
    if (isResendCooldown) return;

    try {
      setErrors({});
      setSuccessMessage('');
      await refreshOTP({ email });
      setSuccessMessage('New OTP sent to your email');
      setIsResendCooldown(true);
      setTimeout(() => setIsResendCooldown(false), 30000);
    } catch (error) {
      const errorMessage = error.message || 'Failed to resend OTP';
      setErrors({ server: errorMessage });
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md mt-4 space-y-2">
          <div className="text-center">
            <div className="flex flex-col items-center group space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Verify OTP</h1>
              <p className="text-base-content/60">Enter the 6-digit code sent to {email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mb-6">
            <div className="form-control relative">

              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className={`input input-bordered w-12 h-12 text-center text-lg ${errors.otp || errors.server ? 'input-error' : ''}`}
                    placeholder="0"
                  />
                ))}
              </div>
              <div className="mt-1 h-2">
                {errors.otp && <p className="text-error text-sm ml-2">{errors.otp}</p>}
                {errors.server && <p className="text-error text-sm ml-2">{errors.server}</p>}
                {successMessage && <p className="text-success text-sm ml-2">{successMessage}</p>}
              </div>
            </div>

            <div className="relative">
              <button type="submit" className="btn btn-primary w-full mt-1" disabled={isVerifyingOTP}>
                {isVerifyingOTP ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Didn't receive the OTP?{' '}
              <button
                onClick={handleResendOTP}
                className={`link link-primary ${isResendCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isResendCooldown}
              >
                Resend OTP
              </button>
              {isResendCooldown && <span className="text-sm ml-2">(Wait 30s)</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;