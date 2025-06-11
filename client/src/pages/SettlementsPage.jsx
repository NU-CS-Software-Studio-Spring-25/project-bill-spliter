import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../lib/userContext';
import { 
  fetchGroup, 
  fetchSettlements, 
  createSettlement, 
  deleteSettlement,
  fetchGroupBalances 
} from '../api';
import { toast } from 'react-toastify';

export default function SettlementsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [group, setGroup] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [selectedPayee, setSelectedPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [settlementDate, setSettlementDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, groupId, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupData, settlementsData, balancesData] = await Promise.all([
        fetchGroup(groupId),
        fetchSettlements(groupId),
        fetchGroupBalances(groupId)
      ]);
      
      setGroup(groupData);
      setSettlements(settlementsData);
      setBalances(balancesData);
    } catch (err) {
      console.error('Error loading settlements data:', err);
      toast.error('Failed to load settlements data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async (e) => {
    e.preventDefault();
    
    if (!selectedPayee || !amount || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    if (selectedPayee === user.id) {
      toast.error('You cannot create a settlement with yourself');
      return;
    }
    if (parsedAmount > 100000) {
      toast.error('Amount is too large: has to be less than $100,000');
      return;
    }
    if (description.length > 255) {
      toast.error('Description cannot exceed 255 characters');
      return;
    }

    try {
      const settlementData = {
        payer_id: user.id,
        payee_id: selectedPayee,
        group_id: parseInt(groupId),
        amount: parsedAmount,
        description: description.trim(),
        settlement_date: settlementDate
      };

      const response = await createSettlement(settlementData);
      toast.success('Settlement created successfully');
      
      // Reset form
      setSelectedPayee('');
      setAmount('');
      setDescription('');
      setSettlementDate(new Date().toISOString().split('T')[0]);
      setShowAddForm(false);
      
      // Reload data
      loadData();
    } catch (err) {
      console.error('Error creating settlement:', err);
      toast.error(err.message || 'Failed to create settlement');
    }
  };

  const handleDeleteSettlement = async (settlementId) => {
    if (!window.confirm('Are you sure you want to delete this settlement?')) {
      return;
    }

    try {
      await deleteSettlement(settlementId);
      toast.success('Settlement deleted successfully');
      loadData();
    } catch (err) {
      console.error('Error deleting settlement:', err);
      toast.error(err.message || 'Failed to delete settlement');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="text-center p-4">Loading settlements...</div>;
  if (!group) return <div className="text-center p-4">Group not found</div>;

  const members = group.members || [];
  const otherMembers = members.filter(m => m.id !== user.id);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Settlements</h1>
          <p className="text-muted mb-0">Group: {group.group_name}</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Record Settlement'}
          </button>
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="btn btn-outline-secondary"
          >
            Back to Group
          </button>
        </div>
      </div>

      {/* Balance Summary */}
      {balances && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="h5 mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Current Balances
            </h3>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {balances.balances?.map((balance) => (
                <div key={balance.user.id} className="col-md-4">
                  <div className={`p-3 rounded ${
                    balance.balance > 0 ? 'bg-danger bg-opacity-10' : 
                    balance.balance < 0 ? 'bg-success bg-opacity-10' : 
                    'bg-light'
                  }`}>
                    <div className="fw-bold">{balance.user.name}</div>
                    <div className={`fs-5 ${
                      balance.balance > 0 ? 'text-danger' : 
                      balance.balance < 0 ? 'text-success' : 
                      'text-muted'
                    }`}>
                      {balance.balance > 0 ? 'Owes: ' : balance.balance < 0 ? 'Owed: ' : 'Settled: '}
                      {formatCurrency(Math.abs(balance.balance))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {balances.simplified_debts?.length > 0 && (
              <div className="mt-4">
                <h4 className="h6 mb-3">Suggested Settlements:</h4>
                <div className="row g-2">
                  {balances.simplified_debts.map((debt, index) => (
                    <div key={index} className="col-md-6">
                      <div className="alert alert-info mb-2 py-2">
                        <strong>{debt.debtor.name}</strong> should pay{' '}
                        <strong>{debt.creditor.name}</strong>{' '}
                        <span className="fw-bold">{formatCurrency(debt.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Settlement Form */}
      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="h5 mb-0">Record New Settlement</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateSettlement}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="payee-select" className="form-label">
                    You are paying:
                  </label>
                  <select
                    id="payee-select"
                    className="form-select"
                    value={selectedPayee}
                    onChange={(e) => setSelectedPayee(e.target.value)}
                    required
                  >
                    <option value="">Select member</option>
                    {otherMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="amount-input" className="form-label">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    id="amount-input"
                    className="form-control"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="description-input" className="form-label">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description-input"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Payment description"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="date-input" className="form-label">
                    Settlement Date
                  </label>
                  <input
                    type="date"
                    id="date-input"
                    className="form-control"
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-success me-2">
                    Record Settlement
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settlements List */}
      <div className="card">
        <div className="card-header">
          <h3 className="h5 mb-0">
            <i className="bi bi-arrow-left-right me-2"></i>
            Settlement History ({settlements.length})
          </h3>
        </div>
        <div className="card-body">
          {settlements.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-receipt text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-2 mb-0">No settlements recorded yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((settlement) => (
                    <tr key={settlement.id}>
                      <td>{formatDate(settlement.settlement_date)}</td>
                      <td>
                        <span className="badge bg-info">
                          {settlement.payer.name}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {settlement.payee.name}
                        </span>
                      </td>
                      <td className="fw-bold text-success">
                        {formatCurrency(settlement.amount)}
                      </td>
                      <td>{settlement.description || 'Settlement'}</td>
                      <td>
                        {(settlement.payer.id === user.id || settlement.payee.id === user.id) && (
                          <button
                            onClick={() => handleDeleteSettlement(settlement.id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete settlement"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}