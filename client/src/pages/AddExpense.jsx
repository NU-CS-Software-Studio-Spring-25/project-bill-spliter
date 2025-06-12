import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroups } from "../api";
import { useUser } from "../lib/userContext";
import { toast } from "react-toastify";
import { createExpense } from "../api";

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
  const [image, setImage] = useState(null);

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
  
    const parsedAmount = parseFloat(amount);
    const today = new Date().toISOString().split("T")[0];
  
    // Validation
    if (!description.trim() || !amount || !groupId || !expenseDate) {
      toast.error("Please fill in all the fields");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (parsedAmount > 100000) {
      toast.error("Amount is too large: must be less than $100,000");
      return;
    }
    if (description.length > 255) {
      toast.error("Description cannot exceed 250 characters");
      return;
    }
    if (expenseDate > today) {
      toast.error("Expense date cannot be in the future.");
      return;
    }
  
    // Prepare data
    const expenseData = {
      description: description.trim(),
      total_amount: parsedAmount,
      group_id: groupId,
      payer_id: user.id,
      expense_date: expenseDate,
      image, // Can be null or File
    };
  
    try {
      const result = await createExpense(expenseData); // 🔁 Pass plain object
      toast.success(result.message || "Expense created successfully");
      navigate("/home");
    } catch (err) {
      console.error(err);
      if (err.message.includes("Creator must exist")) {
        toast.error("Session expired. Please log in.");
        navigate("/login");
      } else {
        toast.error(err.message || "Failed to create expense. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
      <h1 className="fs-2">Create New Expense</h1>

      <input
        type="text"
        placeholder="Expense description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        style={styles.input}
      />

      <input
        type="number"
        step="0.01"
        placeholder="Amount ($)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={styles.input}
      />

      <label style={styles.label}>
        Date:
        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
          style={styles.input}
        />
      </label>

      <select
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        required
        style={styles.input}
      >
        <option value="">Select group to split expense with</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.group_name}
          </option>
        ))}
      </select>

      <label style={styles.label}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={styles.input}
        />
      </label>

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
