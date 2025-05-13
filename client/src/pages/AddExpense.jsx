import { useEffect, useState } from "react";
import { fetchGroups } from "../api";
import { useNavigate } from "react-router-dom";
import { CURRENT_USER } from "../lib/session";
const BASE_URL = "https://bill-splitter-api-d46b8052a10f.herokuapp.com/api/v1";

export default function CreateExpense() {
  const [groups, setGroups] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [groupId, setGroupId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups().then((allGroups) => {
      const myGroups = allGroups.filter((g) => g.member_ids.includes(CURRENT_USER.id));
      setGroups(myGroups);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: parseInt(groupId),
          added_by: CURRENT_USER.id,
          description,
          total_amount: parseFloat(amount)
        })
      });
      if (!res.ok) throw new Error("Failed to create expense");
      alert("Expense created");
      navigate("/");
    } catch (err) {
      console.error("Error creating expense", err);
      alert("Failed to create expense");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Create New Expense</h2>
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        style={styles.input}
      />
      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        type="number"
        step="0.01"
        style={styles.input}
      />
      <select
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        required
        style={styles.input}
      >
        <option value="">Select group</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>{g.group_name}</option>
        ))}
      </select>
      <button style={styles.button}>Create</button>
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
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    },
    input: {
      padding: "0.5rem",
      fontSize: "1rem",
      borderRadius: "4px",
      border: "1px solid #ccc"
    },
    button: {
      padding: "0.5rem 1rem",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontWeight: "bold",
      cursor: "pointer"
    }
  };
  