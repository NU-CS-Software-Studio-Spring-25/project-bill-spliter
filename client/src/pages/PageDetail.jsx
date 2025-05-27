import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../lib/userContext";
import { fetchGroup, deleteExpense, deleteGroup } from "../api";
import { Link } from "react-router-dom";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetchGroup(id)
      .then((data) => setGroup(data))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpense(expenseId);
      setGroup((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== expenseId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await deleteGroup(group.id);
      alert("Group deleted successfully.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete group.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!group) return <p>Group not found</p>;

  // Members and user map
  const members = group.members || [];
  const userMap = Object.fromEntries(members.map((m) => [m.id, m.name]));

  // Calculate spending
  const totalsByUser = {};
  (group.expenses || []).forEach((expense) => {
    const payerId = expense.payer?.id;
    const amount = Number(expense.total_amount);
    totalsByUser[payerId] = (totalsByUser[payerId] || 0) + amount;
  });

  const totalSpent = Object.values(totalsByUser).reduce((sum, v) => sum + v, 0);
  const sharePerPerson = members.length ? totalSpent / members.length : 0;

  const balances = {};
  members.forEach((m) => {
    const spent = totalsByUser[m.id] || 0;
    balances[m.id] = parseFloat((spent - sharePerPerson).toFixed(2));
  });

  // Determine debts
  const EPSILON = 0.01;
  const currentUserId = user.id;
  const myBalance = balances[currentUserId] || 0;
  const youOwe = [];
  const othersOweYou = [];

  Object.entries(balances).forEach(([otherId, balance]) => {
    if (otherId === String(currentUserId)) return;
    const amount = parseFloat(
      Math.min(Math.abs(myBalance), Math.abs(balance)).toFixed(2)
    );
    if (myBalance < -EPSILON && balance > EPSILON) {
      youOwe.push({ to: userMap[otherId], amount });
    } else if (myBalance > EPSILON && balance < -EPSILON) {
      othersOweYou.push({ from: userMap[otherId], amount });
    }
  });

  return (
    <>
  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
    <h1 className="h2 mb-0">{group.group_name}</h1>
    <div className="d-flex gap-2">
      <button 
        className="btn btn-outline-danger d-flex align-items-center gap-1"
        onClick={handleDeleteGroup}
      >
        <i className="bi bi-trash-fill"></i> Delete Group
      </button>
    </div>
  </div>

  <div className="d-flex flex-column gap-4">
    {/* Members Section */}
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h5 mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-people-fill"></i> Members ({members.length})
        </h2>
      </div>
      <div className="card-body">
        <ul className="list-unstyled row row-cols-1 row-cols-md-3 g-3">
          {members.map((m) => (
            <li key={m.id} className="col">
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <span className="fw-medium">{m.name}</span>
                {m.id === group.owner_id && (
                  <span className="badge bg-info text-dark">Owner</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Expenses Section */}
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h5 mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-receipt"></i> Expenses
        </h2>
        <Link 
          to={`/add-expense`}
          className="btn btn-primary btn-sm d-flex align-items-center gap-1"
        >
          <i className="bi bi-plus-lg"></i> Add Expense
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Payer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {group.expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.description}</td>
                  <td className="fw-bold text-success">${Number(e.total_amount).toFixed(2)}</td>
                  <td>{e.payer?.name}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        onClick={() => navigate(`/expenses/${e.id}`)}
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-eye-fill"></i> View
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(e.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <i className="bi bi-trash-fill">Delete</i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Settlement Section */}
    <div className="card">
      <div className="card-header">
        <h2 className="h5 mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-cash-stack"></i> Settlement Summary
        </h2>
      </div>
      <div className="card-body">
        {youOwe.length === 0 && othersOweYou.length === 0 ? (
          <div className="text-center py-4 bg-success bg-opacity-10 rounded">
            <i className="bi bi-check-circle-fill text-success fs-1"></i>
            <p className="h5 text-success mt-2 mb-0">You're all settled up! 🎉</p>
          </div>
        ) : (
          <div className="row g-3">
            {youOwe.length > 0 && (
              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <h4 className="h6 d-flex align-items-center gap-2 text-danger">
                    <i className="bi bi-arrow-up-circle-fill"></i> You owe:
                  </h4>
                  <ul className="list-unstyled mt-3">
                    {youOwe.map((s, i) => (
                      <li key={i} className="p-2 bg-white rounded mb-2 shadow-sm">
                        You owe <strong>{s.to}</strong> <span className="fw-bold text-danger">${s.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {othersOweYou.length > 0 && (
              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <h4 className="h6 d-flex align-items-center gap-2 text-success">
                    <i className="bi bi-arrow-down-circle-fill"></i> They owe you:
                  </h4>
                  <ul className="list-unstyled mt-3">
                    {othersOweYou.map((s, i) => (
                      <li key={i} className="p-2 bg-white rounded mb-2 shadow-sm">
                        <strong>{s.from}</strong> owes you <span className="fw-bold text-success">${s.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '2rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: '0.25rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
};
