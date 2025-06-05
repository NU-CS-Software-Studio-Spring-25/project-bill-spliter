import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../lib/userContext';
import { 
  fetchExpense, 
  fetchExpenseSplits, 
  markSplitSettled, 
  markSplitUnsettled,
  updateExpenseSplit
} from '../api';
import { toast } from 'react-toastify';

export default function ExpenseSplitsManager() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [expense, setExpense] = useState(null);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSplit, setEditingSplit] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, expenseId, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expenseData, splitsData] = await Promise.all([
        fetchExpense(expenseId),
        fetchExpenseSplits(expenseId)
      ]);
      
      setExpense(expenseData);
      setSplits(splitsData);
    } catch (err) {
      console.error('Error loading expense splits:', err);
      toast.error('Failed to load expense splits');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSettlement = async (split) => {
    try {
      if (split.is_settled) {
        await markSplitUnsettled(split.id);
        toast.success(`Marked ${split.user.name}'s split as unsettled`);
      } else {
        await markSplitSettled(split.id);
        toast.success(`Marked ${split.user.name}'s split as settled`);
      }
      loadData();
    } catch (err) {
      console.error('Error updating split status:', err);
      toast.error('Failed to update split status');
    }
  };

  const handleEditSplit = (split) => {
    setEditingSplit(split.id);
    setEditAmount(split.amount.toString());
  };

  const handleSaveEdit = async (splitId) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    try {
      await updateExpenseSplit(splitId, { amount });
      toast.success('Split amount updated successfully');
      setEditingSplit(null);
      setEditAmount('');
      loadData();
    } catch (err) {
      console.error('Error updating split:', err);
      toast.error('Failed to update split amount');
    }
  };

  const handleCancelEdit = () => {
    setEditingSplit(null);
    setEditAmount('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotalSplits = () => {
    return splits.reduce((total, split) => total + parseFloat(split.amount), 0);
  };

  const calculateSettledAmount = () => {
    return splits
      .filter(split => split.is_settled)
      .reduce((total, split) => total + parseFloat(split.amount), 0);
  };

  const getSettlementPercentage = () => {
    const total = calculateTotalSplits();
    const settled = calculateSettledAmount();
    return total > 0 ? (settled / total) * 100 : 0;
  };

  if (loading) return <div className="text-center p-4">Loading expense splits...</div>;
  if (!expense) return <div className="text-center p-4">Expense not found</div>;

  const settlementPercentage = getSettlementPercentage();
  const totalSplits = calculateTotalSplits();
  const settledAmount = calculateSettledAmount();
  const remainingAmount = totalSplits - settledAmount;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Expense Splits</h1>
          <p className="text-muted mb-0">{expense.description}</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate(`/expenses/${expenseId}`)}
            className="btn btn-outline-secondary"
          >
            Back to Expense
          </button>
          <button
            onClick={() => navigate(`/groups/${expense.group.id}`)}
            className="btn btn-outline-primary"
          >
            Back to Group
          </button>
        </div>
      </div>

      {/* Expense Summary */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">
            <i className="bi bi-receipt me-2"></i>
            Expense Summary
          </h3>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 mb-1 text-primary">{formatCurrency(expense.total_amount)}</div>
                <div className="small text-muted">Total Amount</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 mb-1 text-success">{formatCurrency(settledAmount)}</div>
                <div className="small text-muted">Settled</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 mb-1 text-warning">{formatCurrency(remainingAmount)}</div>
                <div className="small text-muted">Remaining</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <div className="h4 mb-1 text-info">{splits.length}</div>
                <div className="small text-muted">People</div>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">Settlement Progress</span>
              <span className="small text-muted">{settlementPercentage.toFixed(1)}%</span>
            </div>
            <div className="progress">
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: `${settlementPercentage}%` }}
                aria-valuenow={settlementPercentage}
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <div className="small text-muted mb-1">Paid by:</div>
              <span className="badge bg-primary">{expense.payer.name}</span>
            </div>
            <div className="col-md-6">
              <div className="small text-muted mb-1">Group:</div>
              <span className="badge bg-info">{expense.group.group_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Splits Management */}
      <div className="card">
        <div className="card-header">
          <h3 className="h5 mb-0">
            <i className="bi bi-pie-chart me-2"></i>
            Individual Splits ({splits.length})
          </h3>
        </div>
        <div className="card-body">
          {splits.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-exclamation-circle text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-2 mb-0">No splits found for this expense</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Amount Owed</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {splits.map((split) => (
                    <tr key={split.id} className={split.is_settled ? 'table-success' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="fw-medium">{split.user.name}</span>
                          {split.user.id === expense.payer.id && (
                            <span className="badge bg-warning ms-2">Payer</span>
                          )}
                          {split.user.id === user.id && (
                            <span className="badge bg-secondary ms-2">You</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {editingSplit === split.id ? (
                          <div className="d-flex gap-2">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '100px' }}
                              step="0.01"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                            />
                            <button
                              onClick={() => handleSaveEdit(split.id)}
                              className="btn btn-sm btn-success"
                            >
                              <i className="bi bi-check"></i>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold">{formatCurrency(split.amount)}</span>
                            <button
                              onClick={() => handleEditSplit(split)}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit amount"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          {formatCurrency(split.paid_amount || 0)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          split.is_settled ? 'bg-success' : 'bg-warning'
                        }`}>
                          {split.is_settled ? 'Settled' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleToggleSettlement(split)}
                            className={`btn btn-sm ${
                              split.is_settled ? 'btn-outline-warning' : 'btn-outline-success'
                            }`}
                            title={split.is_settled ? 'Mark as unsettled' : 'Mark as settled'}
                          >
                            <i className={`bi ${
                              split.is_settled ? 'bi-arrow-counterclockwise' : 'bi-check-circle'
                            }`}></i>
                            {split.is_settled ? 'Unsettle' : 'Settle'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-light">
                    <td className="fw-bold">Total</td>
                    <td className="fw-bold">{formatCurrency(totalSplits)}</td>
                    <td className="fw-bold text-success">{formatCurrency(settledAmount)}</td>
                    <td>
                      <span className={`badge ${
                        settlementPercentage === 100 ? 'bg-success' : 'bg-warning'
                      }`}>
                        {settlementPercentage.toFixed(1)}% Complete
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="h5 mb-0">
            <i className="bi bi-lightning me-2"></i>
            Quick Actions
          </h3>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <button
                onClick={() => {
                  splits.forEach(split => {
                    if (!split.is_settled) {
                      handleToggleSettlement(split);
                    }
                  });
                }}
                className="btn btn-success w-100"
                disabled={settlementPercentage === 100}
              >
                <i className="bi bi-check-all me-2"></i>
                Mark All as Settled
              </button>
            </div>
            <div className="col-md-4">
              <button
                onClick={() => {
                  splits.forEach(split => {
                    if (split.is_settled) {
                      handleToggleSettlement(split);
                    }
                  });
                }}
                className="btn btn-warning w-100"
                disabled={settlementPercentage === 0}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Mark All as Unsettled
              </button>
            </div>
            <div className="col-md-4">
              <button
                onClick={() => navigate(`/expenses/${expenseId}/edit`)}
                className="btn btn-outline-primary w-100"
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit Expense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}