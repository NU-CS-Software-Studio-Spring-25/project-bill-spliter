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
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <Link to="/home" className='navbar-brand px-3'>
        <img
          src="/logo.png"
          alt="CheckMate logo" // Added alt text
          style={{ height: '30px', marginRight: '10px' }}
        />
        CheckMate
      </Link>
      {user && (
        <>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse px-3" id="navbarSupportedContent">
  <ul className="navbar-nav ms-auto text-center"> {/* Add text-center here */}
    <li className="nav-item">
      <Link to="/groups/new" className='nav-link btn btn-outline-primary text-white border-0 mx-1 w-100'> {/* Add w-100 */}
        Add Group
      </Link>
    </li>
    <li className="nav-item">
      <Link to="/add-expense" className='nav-link btn btn-outline-success text-white border-0 mx-1 w-100'> {/* Add w-100 */}
        Add Expense
      </Link>
    </li>
    <li className="nav-item">
      <button onClick={handleLogout} className='nav-link btn btn-outline-danger text-white border-0 border-danger mx-1 w-100'>Logout</button> {/* Add w-100 */}
    </li>
  </ul>
</div>
        </>
      )}
      {/* The original `{!user}` had no meaningful content, so it's removed.
          If there was a login/register link, it would go here. */}
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