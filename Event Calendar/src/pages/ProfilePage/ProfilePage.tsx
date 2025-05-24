import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; 
import { updateProfile } from '../../services/users.service';
import { updateEmail, updatePassword as firebaseUpdatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase-config'; 
import { IProfileUpdateInputs, IUserData } from '../../types/app.types';
import './ProfilePage.css'; 

const ProfilePage: React.FC = () => {
  const { user, userData, setUserData, setUser } = useAuth();

  const [firstName, setFirstName] = useState<string>(userData?.firstName || '');
  const [lastName, setLastName] = useState<string>(userData?.lastName || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      if (firstName === '' || firstName !== userData.firstName) setFirstName(userData.firstName || '');
      if (lastName === '' || lastName !== userData.lastName) setLastName(userData.lastName || '');
    }
    if (user) {
      if (email === '' || email !== user.email) setEmail(user.email || '');
    }
  }, [userData, user, firstName, lastName, email]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!user) {
      setError('User not authenticated.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      let profileUpdated = false;
      const userDataUpdates: Partial<IUserData> = {};

      if (firstName !== (userData?.firstName || '')) {
        userDataUpdates.firstName = firstName;
      }
      if (lastName !== (userData?.lastName || '')) {
        userDataUpdates.lastName = lastName;
      }

      if (Object.keys(userDataUpdates).length > 0) {
        await updateProfile(user.uid, userDataUpdates);
        setUserData({ ...userData!, ...userDataUpdates });
        profileUpdated = true;
      }

      if (email !== user.email) {
        await updateEmail(user, email);
        setUser({ ...user, email: email });
        profileUpdated = true;
      }

      if (newPassword) {
        await firebaseUpdatePassword(user, newPassword);
        setNewPassword('');
        setConfirmPassword('');
        profileUpdated = true;
      }

      if (profileUpdated) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('No changes to save.');
      }

    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Please re-authenticate to update your email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. It should be at least 6 characters.');
      } else {
        setError(`Failed to update profile: ${err.message || 'An unknown error occurred'}`);
      }
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setMessage(null);
    if (!user?.email) {
      setError("No email found for password reset.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email); 
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      console.error("Error sending password reset email:", err);
      setError(`Failed to send password reset email: ${err.message || 'An unknown error occurred'}`);
    }
  };

  if (!user || !userData) {
    const { isLoading } = useAuth();
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading Profile...
            </div>
        );
    }
    return <p className="error-message">You must be logged in to view this page.</p>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <h2>Your Profile</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>New Password (leave blank to keep current):</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="profile-button">Update Profile</button>
        </form>
        <button onClick={handlePasswordReset} className="reset-password-button">Send Password Reset Email</button>
      </div>
    </div>
  );
};

export default ProfilePage;