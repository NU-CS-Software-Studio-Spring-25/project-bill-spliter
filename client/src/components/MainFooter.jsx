import { Link } from 'react-router-dom';

export default function MainFooter() {
    return (
        <div className='container'>
            <footer className='py-3 my-4'>
                <ul className="nav justify-content-center border-bottom pb-3 mb-3">
                    <li className="nav-item"><a href="/" className="nav-link px-2 text-muted">Home</a></li>
                    <li className="nav-item"><a href="/groups/new" className="nav-link px-2 text-muted">Create A Group</a></li>
                    <li className="nav-item"><a href="/add-expense" className="nav-link px-2 text-muted">Create An Expense</a></li>
                </ul>
            <p className="text-center text-muted">© 2025 Bill Splitter -- Northwestern University</p>
            </footer>
        </div>
    );
}