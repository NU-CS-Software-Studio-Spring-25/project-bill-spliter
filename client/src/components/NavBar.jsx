import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>Bill Splitter</Link>
      <div style={styles.buttons}>
        <Link to="/groups/new">
          <button style={styles.addGroup}>Add Group</button>
        </Link>
        <Link to="/add-expense">
          <button style={styles.addExpense}>Add Expense</button>
        </Link>
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
};
