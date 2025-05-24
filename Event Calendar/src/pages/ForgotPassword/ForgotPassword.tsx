import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendPasswordReset } from '../../services/auth.service'; 
import { Link } from 'react-router-dom';
// import './ForgotPassword.css'; 

interface IForgotPasswordInputs {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IForgotPasswordInputs>();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: IForgotPasswordInputs) => {
    setMessage(null);
    setError(null);
    try {
      await sendPasswordReset(data.email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      console.error('Error sending password reset email:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Forgot Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>
          <button type="submit" className="reset-password-button">
            Send Reset Link
          </button>
        </form>
        <p className="login-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;