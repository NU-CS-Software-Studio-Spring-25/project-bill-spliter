import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGroups, fetchExpenses, fetchUsers } from "../api";
import { CURRENT_USER } from "../lib/session";
import { useNavigate } from "react-router-dom";
import { deleteExpense, deleteGroup } from "../api";

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleDelete = async (expenseId) => {
    const confirm = window.confirm("Are you sure?");
    if (!confirm) return;
  
    try {
      await deleteExpense(expenseId);
      setExpenses(prev => prev.filter(e => e.id !== expenseId)); 
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete.");
    }
  };
  const handleGroupDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this group?");
    if (!confirm) return;
  
    try {
      await deleteGroup(group.id);
      alert("Group deleted.");
      navigate("/")
    } catch (err) {
      console.error("Failed to delete group", err);
      alert("Failed to delete group.");
    }
  };

  useEffect(() => {
    Promise.all([
      fetchGroups(),
      fetchExpenses(id),
      fetchUsers(),
    ])
      .then(([groups, expensesData, usersData]) => {
        const g = groups.find((g) => g.id === parseInt(id));
        setGroup(g);
        setExpenses(expensesData);
        setUsers(usersData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found</p>;

  const memberObjects = users.filter((u) => group.member_ids.includes(u.id));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const totalsByUser = {};
  for (const expense of expenses) {
    const { added_by, total_amount } = expense;
    if (!totalsByUser[added_by]) totalsByUser[added_by] = 0;
    totalsByUser[added_by] += Number(total_amount);
  }

  const totalSpent = Object.values(totalsByUser).reduce((sum, val) => sum + val, 0);
  const numMembers = group.member_ids.length;
  const sharePerPerson = totalSpent / numMembers;

  const balances = {};
  group.member_ids.forEach((id) => {
    const spent = totalsByUser[id] || 0;
    balances[id] = parseFloat((spent - sharePerPerson).toFixed(2));
  });

  const EPSILON = 0.01;
  const currentUserId = CURRENT_USER.id;
  const myBalance = balances[currentUserId];
  const youOwe = [];
  const othersOweYou = [];

  for (const [otherId, balance] of Object.entries(balances)) {
    if (otherId === currentUserId) continue;
    const otherBalance = balances[otherId];
    const amount = Math.min(Math.abs(myBalance), Math.abs(otherBalance));

    if (myBalance < -EPSILON && otherBalance > EPSILON) {
      youOwe.push({ to: userMap[otherId], amount });
    } else if (myBalance > EPSILON && otherBalance < -EPSILON) {
      othersOweYou.push({ from: userMap[otherId], amount });
    }
  }

  return (
    <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h1>{group.group_name}</h1>
  <button style={styles.deleteGroupBtn} onClick={handleGroupDelete}>Delete Group</button>
</div>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Members</h2>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {memberObjects.map((m) => (
              <li key={m.id} style={styles.memberRow}>
                <span>{m.name}</span>
                <span style={styles.memberBadge}>Member</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Expenses</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Added By</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={e.id} style={i % 2 === 1 ? styles.zebra : null}>
                  <td style={styles.td}>
                    <span style={styles.link} onClick={() => navigate(`/expenses/${e.id}`)}>{e.description}</span>
                  </td>
                  <td style={styles.td}>${Number(e.total_amount).toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={styles.userBadge}>{userMap[e.added_by]}</span>
                  </td>
                  <td style={styles.td}>
                    <button
                        onClick={() => navigate(`/expenses/${e.id}`)}
                        style={styles.viewBtn}
                    >
                        View
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                  <li key={`owe-${i}`}>
                    You owe <strong>{s.to}</strong> ${s.amount.toFixed(2)}
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
                  <li key={`get-${i}`}>
                    <strong>{s.from}</strong> owes you ${s.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}
const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 3fr",
    gap: "1.5rem",
    marginTop: "1rem",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    padding: "1rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.5rem",
  },
  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    padding: "0.25rem 0",
    borderBottom: "1px solid #f1f1f1",
  },
  memberBadge: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderRadius: "9999px",
    padding: "0.25rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem",
  },
  th: {
    textAlign: "left",
    padding: "0.5rem",
    backgroundColor: "#f3f4f6",
    fontWeight: 600,
  },
  td: {
    padding: "0.75rem",
    verticalAlign: "top",
  },
  zebra: {
    backgroundColor: "#f1f5f9",
  },
  userBadge: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  viewBtn: {
    marginRight: "0.5rem",
    border: "1px solid #3b82f6",
    backgroundColor: "white",
    color: "#3b82f6",
    padding: "0.25rem 0.75rem",
    borderRadius: "6px",
    fontWeight: 500,
    cursor: "pointer",
  },
  deleteBtn: {
    border: "1px solid #dc2626",
    backgroundColor: "white",
    color: "#dc2626",
    padding: "0.25rem 0.75rem",
    borderRadius: "6px",
    fontWeight: 500,
    cursor: "pointer",
  },
  link: {
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteGroupBtn: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  }
  
};
