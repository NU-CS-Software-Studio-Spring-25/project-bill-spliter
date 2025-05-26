import { useUser } from '../lib/userContext';
import { logout as apiLogout } from '../api';
import { useNavigate } from 'react-router-dom';


export default function MainFooter() {
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
    

    return user ? (
        <div className='container position-absolute bottom-0 start-0 end-0'>
            <footer className='py-3 my-4'>
                <ul className="nav justify-content-center border-bottom pb-3 mb-3">
                    <li className="nav-item"><a href="/" className="nav-link px-2 text-muted">Home</a></li>
                    <li className="nav-item"><a href="/groups/new" className="nav-link px-2 text-muted">Create A Group</a></li>
                    <li className="nav-item"><a href="/add-expense" className="nav-link px-2 text-muted">Create An Expense</a></li>
                    <li className='nav-item'><button onClick={handleLogout} className="nav-link px-2 text-muted">Logout</button></li>
                </ul>
            <p className="text-center text-muted">© 2025 Bill Splitter -- Northwestern University</p>
            </footer>
        </div>
    ) : <></>;
}