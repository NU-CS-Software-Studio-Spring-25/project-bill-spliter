import React, { useEffect, useState } from "react";
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
    <article style={styles.card} className="container">
      <h1 style={styles.header}>Expense Information</h1>
      <dl> {/* Using a definition list for key-value pairs */}
        <div style={styles.row}>
          <dt>Description:</dt> <dd>{expense.description}</dd>
        </div>
        <div style={styles.row}>
          <dt>Total Amount:</dt> <dd>${Number(expense.total_amount).toFixed(2)}</dd>
        </div>
        <div style={styles.row}>
          <dt>Group:</dt>{" "}
          <dd>
            <span
              style={styles.groupBadge}
              onClick={() => navigate(`/groups/${expense.group.id}`)}
            >
              {expense.group.group_name}
            </span>
          </dd>
        </div>
        <div style={styles.row}>
          <dt>Added by:</dt>{" "}
          <dd>
            <span style={styles.userBadge}>{expense.payer.name}</span>
          </dd>
        </div>
      </dl>
      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Expense Splits:</h2>
        <ul style={styles.list}> {/* Using an unordered list for splits */}
          {expense.expense_splits.map((split) => (
            <li key={split.id} style={styles.splitRow}>
              <span style={styles.userName}>{split.user.name}</span>
              <span>${Number(split.amount).toFixed(2)}</span>
              <span style={split.is_settled ? styles.settled : styles.unsettled}>
                {split.is_settled ? "Settled" : "Unsettled"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </article>
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
  list: { // Added style for the new <ul> element
    listStyle: 'none',
    padding: 0,
    margin: 0,
  }
};