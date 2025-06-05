import React, { useState, useEffect } from 'react';
import { fetchGroupBalances, fetchSettlements, createSettlement } from '../api';
import { toast } from 'react-toastify';

const GroupBalances = ({ groupId }) => {
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      const [balancesData, settlementsData] = await Promise.all([
        fetchGroupBalances(groupId),
        fetchSettlements(groupId)
      ]);
      setBalances(balancesData);
      setSettlements(settlementsData);
    } catch (error) {
      toast.error('Failed to load balances and settlements');
    } finally {
      setLoading(false);
    }
  };

  const handleSettlement = async (fromUserId, toUserId, amount) => {
    try {
      await createSettlement({
        group_id: groupId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: amount
      });
      toast.success('Settlement created successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to create settlement');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h3>Group Balances</h3>
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Current Balances</h5>
              <ul className="list-group">
                {balances.map((balance) => (
                  <li key={balance.user_id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{balance.user_name}</span>
                    <span className={`badge ${balance.amount >= 0 ? 'bg-success' : 'bg-danger'}`}>
                      ${Math.abs(balance.amount).toFixed(2)}
                      {balance.amount >= 0 ? ' owed to them' : ' they owe'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Recent Settlements</h5>
              <ul className="list-group">
                {settlements.map((settlement) => (
                  <li key={settlement.id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <span>{settlement.from_user_name} paid {settlement.to_user_name}</span>
                      <span className="text-success">${settlement.amount.toFixed(2)}</span>
                    </div>
                    <small className="text-muted">
                      {new Date(settlement.created_at).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupBalances; 