import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../lib/userContext";
import { fetchGroup, deleteExpense, deleteGroup } from "../api";
import { toast } from "react-toastify";

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
      const response = await deleteExpense(expenseId);
      setGroup((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== expenseId),
      }));
      toast.success(response.message);
      console.log("Expense deleted successfully:", response);
    } catch (err) {
      console.error(err);
      if (err.message.includes("Creator must exist")) {
        toast.error("Session expired. Please log in.");
        navigate("/login");
      }
      else{
        toast.error(err.message || "Failed to delete expense");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      const response = await deleteGroup(group.id);
      if (!response.message) {
        throw new Error(response.error || "Failed to delete group");
      }
      toast.success(response.message);
      navigate("/");
    } catch (err) {
      console.error(err);
       if (err.message.includes("Creator must exist")) {
        toast.error("Session expired. Please log in.");
        navigate("/login");
      }
      else {
      toast.error(err.message || "Failed to delete group");
      }
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
      <div style={styles.header}>
        <h1>{group.group_name}</h1>
        <button style={styles.deleteBtn} onClick={handleDeleteGroup}>
          Delete Group
        </button>
      </div>

      <div style={styles.section}>
        <h2>Members ({members.length})</h2>
        <ul style={styles.list}>
          {members.map((m) => (
            <li key={m.id} style={styles.listItem}>
              {m.name}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h2>Expenses</h2>
        <table style={styles.table}>
          <thead>
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
                <td>${Number(e.total_amount).toFixed(2)}</td>
                <td>{e.payer?.name}</td>
                <td>
                  <button style={{ margin: "5px" }} onClick={() => navigate(`/expenses/${e.id}`)}>
                    View
                  </button>
                  <button style={{ margin: "5px" }} onClick={() => navigate(`/expenses/${e.id}/edit`)}>
                    Edit
                  </button>
                  <button style={{ margin: "5px" }} onClick={() => handleDeleteExpense(e.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2>Your Settlement Summary</h2>
        {youOwe.length === 0 && othersOweYou.length === 0 ? (
          <p>You're all settled up 🎉</p>
        ) : (
          <>
            {youOwe.length > 0 && (
              <div>
                <h4>You owe:</h4>
                <ul>
                  {youOwe.map((s, i) => (
                    <li key={i}>
                      You owe <strong>{s.to}</strong> ${s.amount}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {othersOweYou.length > 0 && (
              <div>
                <h4>They owe you:</h4>
                <ul>
                  {othersOweYou.map((s, i) => (
                    <li key={i}>
                      <strong>{s.from}</strong> owes you ${s.amount}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
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
