import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/index';
import { useUser } from '../lib/userContext';
import { toast } from "react-toastify";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const passwordChecks = [
  {
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    label: "At least one lowercase letter",
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    label: "At least one uppercase letter",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: "At least one digit",
    test: (pw) => /\d/.test(pw),
  },
  {
    label: "At least one special character",
    test: (pw) => /[\W_]/.test(pw),
  },
];

const isPasswordStrong = passwordChecks.every(check => check.test(password));


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
    const failedChecks = passwordChecks.filter((check) => !check.test(password));
    if (failedChecks.length > 0) {
      failedChecks.forEach((check) => setError(`Does not pass password requirement: ${check.label}`));
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
      navigate('/home');
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleRegister} style={styles.form}>
      <h1 style={styles.heading}>Register</h1>
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
      <ul style={styles.checklist}>
        {passwordChecks.map((check, i) => (
          <li key={i} style={{ color: check.test(password) ? 'green' : 'red' }}>
            {check.label}
          </li>
        ))}
      </ul>
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
      {error && <p id="register-error" style={styles.error}>{error}</p>}
      <p style={styles.loginPrompt}>
        Already have an account?{' '}
        <Link to="/login" style={styles.loginLink}>Login here</Link>
        <br /><br />
        <Link to="/" style={styles.loginLink}>Learn more about Checkmate</Link>
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
    backgroundColor: '#1A6EF4',
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
    color: '#1A6EF4',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  checklist: {
    listStyle: "none", 
    padding: 0, 
    marginBottom: '10px',
  }
};