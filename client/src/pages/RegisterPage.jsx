import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/index';
import { useUser } from '../lib/userContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!passwordConfirmation) {
      setError('Password confirmation is required.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const data = await register({ name, email, password, password_confirmation: passwordConfirmation });
      const userObj = data.user || data;
      setUser(userObj);
      navigate('/');
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleRegister} style={styles.form}>
      <h2 style={styles.heading}>Register</h2>
      {error && <p id="register-error" style={styles.error}>{error}</p>}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={styles.input}
        aria-label="Name" // Added for accessibility
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
        aria-label="Email" // Added for accessibility
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={styles.input}
        aria-label="Password" // Added for accessibility
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        required
        style={styles.input}
        aria-label="Confirm Password" // Added for accessibility
      />
      <button type="submit" style={styles.button}>Register</button>
      <p style={styles.loginPrompt}>
        Already have an account?{' '}
        <Link to="/login" style={styles.loginLink}>Login here</Link>
        <br /><br />
        <Link to="/about" style={styles.registerLink}>Learn more about Checkmate</Link>
      </p>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: '400px',
    margin: '4rem auto',
    padding: '2rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: '#ffffff',
  },
  heading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#111827',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  loginPrompt: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#4b5563',
  },
  loginLink: {
    color: '#3b82f6',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};