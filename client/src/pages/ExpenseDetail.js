import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchExpense, deleteExpense } from '../api';
import { toast } from 'react-toastify';
import ExpenseSplits from '../components/ExpenseSplits';

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    try {
      const data = await fetchExpense(id);
      setExpense(data);
    } catch (error) {
      toast.error('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        toast.success('Expense deleted successfully');
        navigate(`/groups/${expense.group_id}`);
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!expense) {
    return <div className="text-center">Expense not found</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Expense Details</h2>
        <div>
          <button
            className="btn btn-warning me-2"
            onClick={() => navigate(`/expenses/${id}/edit`)}
          >
            Edit Expense
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteExpense}
          >
            Delete Expense
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">{expense.description}</h3>
          <div className="row mt-3">
            <div className="col-md-6">
              <p><strong>Amount:</strong> ${expense.amount.toFixed(2)}</p>
              <p><strong>Paid by:</strong> {expense.paid_by_name}</p>
              <p><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Group:</strong> {expense.group_name}</p>
              <p><strong>Category:</strong> {expense.category || 'Uncategorized'}</p>
              <p><strong>Created:</strong> {new Date(expense.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <ExpenseSplits expenseId={id} />
    </div>
  );
};

export default ExpenseDetail; 