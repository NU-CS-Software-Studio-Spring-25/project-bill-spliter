import React, { useState, useEffect } from 'react';
import { fetchExpenseSplits, updateExpenseSplit, markSplitSettled, markSplitUnsettled } from '../api';
import { toast } from 'react-toastify';

const ExpenseSplits = ({ expenseId }) => {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSplits();
  }, [expenseId]);

  const loadSplits = async () => {
    try {
      const data = await fetchExpenseSplits(expenseId);
      setSplits(data);
    } catch (error) {
      toast.error('Failed to load expense splits');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSplit = async (splitId, amount) => {
    try {
      await updateExpenseSplit(splitId, { amount });
      toast.success('Split updated successfully');
      loadSplits();
    } catch (error) {
      toast.error('Failed to update split');
    }
  };

  const handleToggleSettled = async (splitId, isSettled) => {
    try {
      if (isSettled) {
        await markSplitUnsettled(splitId);
      } else {
        await markSplitSettled(splitId);
      }
      toast.success(`Split marked as ${isSettled ? 'unsettled' : 'settled'}`);
      loadSplits();
    } catch (error) {
      toast.error('Failed to update split status');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h3>Expense Splits</h3>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {splits.map((split) => (
                  <tr key={split.id}>
                    <td>{split.user_name}</td>
                    <td>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          value={split.amount}
                          onChange={(e) => handleUpdateSplit(split.id, parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${split.settled ? 'bg-success' : 'bg-warning'}`}>
                        {split.settled ? 'Settled' : 'Unsettled'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${split.settled ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleSettled(split.id, split.settled)}
                      >
                        {split.settled ? 'Mark Unsettled' : 'Mark Settled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSplits; 