import { useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import { fetchExpense, fetchGroups, fetchUsers } from "../api";

export default function ExpenseDetail() {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpense(id)
      .then((exp) => {
        setExpense(exp);
        return Promise.all([fetchGroups(), fetchUsers(), Promise.resolve(exp)]);
      })
      .then(([groups, usersData, exp]) => {
        const grp = groups.find((g) => g.id === exp.group_id);
        setGroup(grp);
        setUsers(usersData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading expense...</p>;
  if (!expense || !group) return <p>Expense not found</p>;

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return (
    <div style={styles.card}>
      <h2 style={styles.header}>Expense Information</h2>
      <div style={styles.row}>
        <strong>Description:</strong> <span>{expense.description}</span>
      </div>
      <div style={styles.row}>
        <strong>Total Amount:</strong> <span>${Number(expense.total_amount).toFixed(2)}</span>
      </div>
      <div style={styles.row}>
        <strong>Group:</strong>{" "}
        <span style={styles.groupBadge} onClick={() => navigate(`/groups/${group.id}`)}>{group.group_name}</span>
      </div>
      <div style={styles.row}>
        <strong>Added by:</strong>{" "}
        <span style={styles.userBadge}>{userMap[expense.payer_id]}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#fff",
    padding: "1.5rem",
    marginTop: "1rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    maxWidth: "600px",
  },
  header: {
    fontSize: "1.25rem",
    fontWeight: 600,
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
  },
  row: {
    marginBottom: "0.75rem",
    display: "flex",
    gap: "1rem",
  },
  groupBadge: {
    backgroundColor: "#06b6d4",
    color: "white",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  userBadge: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontWeight: 500,
    fontSize: "0.85rem",
  },
};
