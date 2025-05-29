import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchExpense } from "../api/index";

export default function ExpenseDetail() {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpense(id)
      .then(setExpense)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading expense...</p>;
  if (!expense) return <p>Expense not found</p>;

  return (
    <div style={styles.card} className="container">
      <h2 style={styles.header}>Expense Information</h2>
      <div style={styles.row}>
        <strong>Description:</strong> <span>{expense.description}</span>
      </div>
      <div style={styles.row}>
        <strong>Total Amount:</strong> <span>${Number(expense.total_amount).toFixed(2)}</span>
      </div>
      <div style={styles.row}>
        <strong>Group:</strong>{" "}
        <span
          style={styles.groupBadge}
          onClick={() => navigate(`/groups/${expense.group.id}`)}
        >
          {expense.group.group_name}
        </span>
      </div>
      <div style={styles.row}>
        <strong>Added by:</strong>{" "}
        <span style={styles.userBadge}>{expense.payer.name}</span>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Expense Splits:</h3>
        {expense.expense_splits.map((split) => (
          <div key={split.id} style={styles.splitRow}>
            <span style={styles.userName}>{split.user.name}</span>
            <span>${Number(split.amount).toFixed(2)}</span>
            <span style={split.is_settled ? styles.settled : styles.unsettled}>
              {split.is_settled ? "Settled" : "Unsettled"}
            </span>
          </div>
        ))}
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
    cursor: "pointer",
  },
  userBadge: {
    backgroundColor: "#6b7280",
    color: "white",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontWeight: 500,
    fontSize: "0.85rem",
  },
  splitRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid #f3f4f6",
  },
  userName: {
    fontWeight: 500,
  },
  settled: {
    color: "green",
    fontWeight: 500,
  },
  unsettled: {
    color: "red",
    fontWeight: 500,
  },
};
