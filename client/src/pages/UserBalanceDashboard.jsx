import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../lib/userContext';
import { 
  fetchUserBalance, 
  fetchUserGroups,
  fetchExpenseSplits
} from '../api';
import { toast } from 'react-toastify';

export default function UserBalanceDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [balanceData, setBalanceData] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [userSplits, setUserSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balanceResult, groupsResult, splitsResult] = await Promise.all([
        fetchUserBalance(user.id),
        fetchUserGroups(user.id),
        fetchExpenseSplits(null, user.id)
      ]);
      
      setBalanceData(balanceResult);
      setUserGroups(groupsResult);
      setUserSplits(splitsResult);
    } catch (err) {
      console.error('Error loading user balance data:', err);
      toast.error('Failed to load balance information');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBalanceStatus = (balance) => {
    if (balance > 0) return { text: 'You owe', color: 'danger', icon: 'arrow-up-circle' };
    if (balance < 0) return { text: 'You are owed', color: 'success', icon: 'arrow-down-circle' };
    return { text: 'All settled', color: 'secondary', icon: 'check-circle' };
  };

  const getPendingSplits = () => {
    return userSplits.filter(split => !split.is_settled);
  };

  const getSettledSplits = () => {
    return userSplits.filter(split => split.is_settled);
  };

  const calculateTotalOwed = () => {
    return getPendingSplits().reduce((total, split) => total + parseFloat(split.amount), 0);
  };

  const calculateTotalPaid = () => {
    return getSettledSplits().reduce((total, split) => total + parseFloat(split.amount), 0);
  };

  if (loading) return <div className="text-center p-4">Loading balance dashboard...</div>;

  const totalBalance = balanceData?.total_balance || 0;
  const groupBalances = balanceData?.group_balances || [];
  const balanceStatus = getBalanceStatus(totalBalance);
  const pendingSplits = getPendingSplits();
  const settledSplits = getSettledSplits();
  const totalOwed = calculateTotalOwed();
  const totalPaid = calculateTotalPaid();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Balance Dashboard</h1>
          <p className="text-muted mb-0">Your financial overview across all groups</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-outline-secondary"
        >
          Back to Home
        </button>
      </div>

      {/* Overview Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className={`display-6 mb-2 text-${balanceStatus.color}`}>
                <i className={`bi bi-${balanceStatus.icon}`}></i>
              </div>
              <h3 className={`h4 mb-1 text-${balanceStatus.color}`}>
                {formatCurrency(Math.abs(totalBalance))}
              </h3>
              <p className="text-muted small mb-0">{balanceStatus.text}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-6 mb-2 text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <h3 className="h4 mb-1 text-warning">
                {formatCurrency(totalOwed)}
              </h3>
              <p className="text-muted small mb-0">Pending payments</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-6 mb-2 text-success">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h3 className="h4 mb-1 text-success">
                {formatCurrency(totalPaid)}
              </h3>
              <p className="text-muted small mb-0">Total settled</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-6 mb-2 text-info">
                <i className="bi bi-people-fill"></i>
              </div>
              <h3 className="h4 mb-1 text-info">
                {userGroups.length}
              </h3>
              <p className="text-muted small mb-0">Active groups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-grid-3x3-gap me-2"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <i className="bi bi-people me-2"></i>
            Groups
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'splits' ? 'active' : ''}`}
            onClick={() => setActiveTab('splits')}
          >
            <i className="bi bi-pie-chart me-2"></i>
            My Splits
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          {/* Group Balances */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Balance by Group
                </h3>
              </div>
              <div className="card-body">
                {groupBalances.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-2 mb-0">No group balances available</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Group</th>
                          <th>Balance</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupBalances.map((groupBalance) => {
                          const status = getBalanceStatus(groupBalance.balance);
                          return (
                            <tr key={groupBalance.group.id}>
                              <td>
                                <Link
                                  to={`/groups/${groupBalance.group.id}`}
                                  className="text-decoration-none fw-medium"
                                >
                                  {groupBalance.group.name}
                                </Link>
                              </td>
                              <td>
                                <span className={`fw-bold text-${status.color}`}>
                                  {formatCurrency(Math.abs(groupBalance.balance))}
                                </span>
                              </td>
                              <td>
                                <span className={`badge bg-${status.color}`}>
                                  {status.text}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Link
                                    to={`/groups/${groupBalance.group.id}`}
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    View
                                  </Link>
                                  <Link
                                    to={`/settlements/${groupBalance.group.id}`}
                                    className="btn btn-sm btn-outline-success"
                                  >
                                    Settle
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Quick Stats
                </h3>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Pending splits:</span>
                  <span className="badge bg-warning">{pendingSplits.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Settled splits:</span>
                  <span className="badge bg-success">{settledSplits.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Active groups:</span>
                  <span className="badge bg-info">{userGroups.length}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium">Net balance:</span>
                  <span className={`fw-bold text-${balanceStatus.color}`}>
                    {formatCurrency(Math.abs(totalBalance))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="card">
          <div className="card-header">
            <h3 className="h5 mb-0">
              <i className="bi bi-people me-2"></i>
              Your Groups ({userGroups.length})
            </h3>
          </div>
          <div className="card-body">
            {userGroups.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="text-muted mt-2 mb-3">You're not part of any groups yet</p>
                <Link to="/groups/new" className="btn btn-primary">
                  Create Your First Group
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {userGroups.map((group) => (
                  <div key={group.id} className="col-md-6 col-lg-4">
                    <div className="card border">
                      <div className="card-body">
                        <h4 className="card-title h6">{group.group_name}</h4>
                        <p className="card-text text-muted small">
                          {group.members?.length || 0} members
                        </p>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/groups/${group.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </Link>
                          <Link
                            to={`/settlements/${group.id}`}
                            className="btn btn-sm btn-outline-success"
                          >
                            Settlements
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'splits' && (
        <div className="row g-4">
          {/* Pending Splits */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">
                  <i className="bi bi-hourglass-split me-2"></i>
                  Pending Splits ({pendingSplits.length})
                </h3>
              </div>
              <div className="card-body">
                {pendingSplits.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-2 mb-0">All caught up! No pending splits</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Expense</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingSplits.slice(0, 10).map((split) => (
                          <tr key={split.id}>
                            <td>
                              <Link
                                to={`/expenses/${split.expense.id}`}
                                className="text-decoration-none"
                              >
                                {split.expense.description}
                              </Link>
                            </td>
                            <td className="fw-bold text-warning">
                              {formatCurrency(split.amount)}
                            </td>
                            <td>
                              <Link
                                to={`/expenses/${split.expense.id}/splits`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Manage
                              </Link>
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

          {/* Recent Settled Splits */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  Recent Settled ({settledSplits.length})
                </h3>
              </div>
              <div className="card-body">
                {settledSplits.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-2 mb-0">No settled splits yet</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Expense</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settledSplits.slice(0, 10).map((split) => (
                          <tr key={split.id}>
                            <td>
                              <Link
                                to={`/expenses/${split.expense.id}`}
                                className="text-decoration-none"
                              >
                                {split.expense.description}
                              </Link>
                            </td>
                            <td className="fw-bold text-success">
                              {formatCurrency(split.amount)}
                            </td>
                            <td>
                              <Link
                                to={`/expenses/${split.expense.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                View
                              </Link>
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
        </div>
      )}
    </div>
  );
}