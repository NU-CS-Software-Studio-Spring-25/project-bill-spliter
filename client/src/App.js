import React from 'react';
import { Routes, Route} from 'react-router-dom';
import NavBar from './components/NavBar';
import MainFooter from './components/MainFooter';
import Home from './pages/Home';
import AddGroup from './pages/AddGroup';
import AddExpense from './pages/AddExpense';
import GroupDetail from './pages/GroupDetail';
import ExpenseDetail from './pages/ExpenseDetail';
import LoginPage from './pages/LoginPage';
import { UserProvider } from './lib/userContext';
import PrivateRoute from './components/PrivateRoute';
import RegisterPage from './pages/RegisterPage';
import EditExpense from './pages/EditExpense';
import EditGroup from './pages/EditGroup';
import ErrorPage from './pages/ErrorPage';
import AboutPage from './pages/AboutPage';

// Toastify imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <UserProvider>
      <NavBar />
      <main style={{ padding: '1.5rem' }}>
        <Routes>
          {/* Public Route */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage/>} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/new"
            element={
              <PrivateRoute>
                <AddGroup />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-expense"
            element={
              <PrivateRoute>
                <AddExpense />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <PrivateRoute>
                <GroupDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:id/edit"
            element={
              <PrivateRoute>
                <EditGroup />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses/:id"
            element={
              <PrivateRoute>
                <ExpenseDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses/:id/edit"
            element={
              <PrivateRoute>
                <EditExpense />
              </PrivateRoute>
            }
          />

          {/* Redirect unknown paths to error page */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
      <MainFooter />
      <ToastContainer position="top-right" autoClose={1000} />
    </UserProvider>
  );
}

export default App;
