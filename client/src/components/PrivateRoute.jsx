import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../lib/userContext';

function PrivateRoute({ children }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
