import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../lib/userContext';
import { logout as apiLogout } from '../api';

export default function NavBar() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const handleLogout = async () => {
    try {
      await apiLogout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>Bill Splitter</Link>
      <div style={styles.buttons}>
        {user && (
          <>
            <Link to="/groups/new">
              <button style={styles.addGroup}>Add Group</button>
            </Link>
            <Link to="/add-expense">
              <button style={styles.addExpense}>Add Expense</button>
            </Link>
            <button onClick={handleLogout} style={styles.logout}>Logout</button>
          </>
        )}
        {!user 

        }
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    textDecoration: 'none',
    color: 'white',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
  },
  addGroup: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
  },
  addExpense: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
  },
  logout: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
  },
  login: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
  }
};
