import { useUser } from '../lib/userContext';
import { logout as apiLogout } from '../api';
import { useNavigate, Link } from 'react-router-dom'; // Import Link


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
        <footer className="container-fluid bg-light position-relative"> {/* Changed outer div to footer */}
            <div className="py-3 my-4"> {/* Kept div for internal styling, but main semantic wrapper is footer */}
                <nav> {/* Added nav for navigation links */}
                    <ul className="nav flex-column flex-md-row justify-content-center border-bottom pb-3 mb-3">
                        <li className="nav-item">
                            <Link to="/home" className="nav-link px-2 text-muted">Home</Link> {/* Changed <a> to Link */}
                        </li>
                        <li className="nav-item">
                            <Link to="/groups/new" className="nav-link px-2 text-muted">Create A Group</Link> {/* Changed <a> to Link */}
                        </li>
                        <li className="nav-item">
                            <Link to="/add-expense" className="nav-link px-2 text-muted">Create An Expense</Link> {/* Changed <a> to Link */}
                        </li>
                        <li className="nav-item">
                            <button onClick={handleLogout} className="nav-link px-2 text-muted">Logout</button>
                        </li>
                    </ul>
                </nav>
                <p className="text-center text-muted">© 2025 Bill Splitter -- Northwestern University |
                    <Link to="/" className="text-decoration-none"> Learn More</Link>
                </p>
            </div>
        </footer>
    ) : <></>;
}