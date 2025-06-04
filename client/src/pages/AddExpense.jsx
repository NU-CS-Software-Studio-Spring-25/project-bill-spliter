import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroups, createExpense } from "../api";
import { useUser } from "../lib/userContext";
import { toast } from "react-toastify";

export default function CreateExpense() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [groupId, setGroupId] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchGroups()
      .then((data) => {
        const rawGroups = data.groups || data;
        const myGroups = rawGroups.filter((g) =>
          g.members.some((m) => m.id === user.id)
        );
        setGroups(myGroups);
      })
      .catch((err) => console.error("Failed to load groups", err));
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || !groupId || !expenseDate) {
      toast.error("Please fill in all the fields");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (parsedAmount > 10000000){
      toast.error("Amount is too large");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    if (expenseDate > today) {
      toast.error("Expense date cannot be in the future.");
      return;
    }
    try {
      const expenseData = {
        description,
        total_amount: parseFloat(amount),
        group_id: parseInt(groupId, 10),
        payer_id: user.id,
        expense_date: expenseDate,
      };

      const response = await createExpense(expenseData);
      if (!response.data) {
        throw new Error(response.error || "Failed to create expense");
      }
      console.log("Expense created successfully:", response);
      toast.success(response.message || "Expense created successfully");
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.message.includes("Creator must exist")) {
        toast.error("Session expired. Please log in.");
        navigate("/login");
      }
      else {
      toast.error(
        err.message || "Failed to create expense. Please try again."
      );
    }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Create New Expense</h2>

      <label htmlFor="expense-description" className="visually-hidden">Expense description</label>
      <input
        type="text"
        id="expense-description" // Added id
        placeholder="Expense description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        style={styles.input}
        aria-label="Expense description" // Added aria-label
      />

      <label htmlFor="expense-amount" className="visually-hidden">Amount</label>
      <input
        type="number"
        id="expense-amount" // Added id
        step="0.01"
        placeholder="Amount ($)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={styles.input}
        aria-label="Amount in dollars" // Added aria-label
      />

      <label htmlFor="expense-date" style={styles.label}>
        Date:
        <input
          type="date"
          id="expense-date" // Added id
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
          style={styles.input}
        />
      </label>

      <label htmlFor="group-select" className="visually-hidden">Select group to split expense with</label>
      <select
        id="group-select" // Added id
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        required
        style={styles.input}
        aria-label="Select group to split expense with" // Added aria-label
      >
        <option value="">Select group to split expense with</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.group_name}
          </option>
        ))}
      </select>

      <button type="submit" style={styles.button}>
        Create
      </button>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: "500px",
    margin: "2rem auto",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    border: "1px solid #e5e7eb",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.9rem",
    color: "#374151",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};