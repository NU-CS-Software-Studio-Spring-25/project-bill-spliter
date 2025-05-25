import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import MainFooter from './components/MainFooter';
import Home from './pages/Home';
import AddGroup from './pages/AddGroup';
import AddExpense from './pages/AddExpense';
import GroupDetail from './pages/PageDetail';
import ExpenseDetail from './pages/ExpenseDetail';

function App() {
  return (
    <div>
      <NavBar />
      <main style={{ padding: '1.5rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups/new" element={<AddGroup />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/expenses/:id" element={<ExpenseDetail />} />
        </Routes>
      </main>
      <MainFooter />
    </div>
  );
}

export default App;
