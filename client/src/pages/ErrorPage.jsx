import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => (
    <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#721c24'
    }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1.5rem',
            background: '#721c24',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none'
        }}>
            Go Home
        </Link>
    </main>
);

export default ErrorPage;