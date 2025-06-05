import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGroup, fetchGroupExpenses, deleteGroup } from '../api';
import { toast } from 'react-toastify';
import GroupBalances from '../components/GroupBalances';
import GroupMembers from '../components/GroupMembers';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [groupData, expensesData] = await Promise.all([
        fetchGroup(id),
        fetchGroupExpenses(id)
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(id);
        toast.success('Group deleted successfully');
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete group');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!group) {
    return <div className="text-center">Group not found</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{group.name}</h2>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => navigate(`/groups/${id}/edit`)}
          >
            Edit Group
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteGroup}
          >
            Delete Group
          </button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
          >
            Balances
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
        </li>
      </ul>

      {activeTab === 'expenses' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Expenses</h3>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/add-expense', { state: { groupId: id } })}
            >
              Add Expense
            </button>
          </div>
          <div className="row">
            {expenses.map((expense) => (
              <div key={expense.id} className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{expense.description}</h5>
                    <p className="card-text">
                      Amount: ${expense.amount.toFixed(2)}<br />
                      Paid by: {expense.paid_by_name}<br />
                      Date: {new Date(expense.date).toLocaleDateString()}
                    </p>
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => navigate(`/expenses/${expense.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <GroupBalances groupId={id} />
      )}

      {activeTab === 'members' && (
        <GroupMembers groupId={id} currentMembers={group.members} />
      )}
    </div>
  );
};

export default GroupDetail; 