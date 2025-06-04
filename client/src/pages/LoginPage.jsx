import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { useUser } from '../lib/userContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

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

    try {
      const data = await login(email, password);
      const userObj = data.user || data;
      setUser(userObj);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <h2 style={styles.heading}>Login</h2>
      {error && <p id="login-error" style={styles.error}>{error}</p>}
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
      <button type="submit" style={styles.button}>Login</button>
      <p style={styles.registerPrompt}>
        Don't have an account?{' '}
        <Link to="/register" style={styles.registerLink}>Register here</Link>
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
  registerPrompt: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#4b5563',
  },
  registerLink: {
    color: '#3b82f6',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};