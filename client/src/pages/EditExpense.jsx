import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGroups, fetchExpense, updateExpense } from "../api";
import { useUser } from "../lib/userContext";
import { toast } from "react-toastify";

export default function EditExpense() {
    const { user } = useUser();
    const { id } = useParams();
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [groupId, setGroupId] = useState("");
    const [expenseDate, setExpenseDate] = useState("");

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

        fetchExpense(id)
            .then((data) => {
                setDescription(data.description || "");
                setAmount(data.total_amount || "");
                setGroupId(data.group?.id || "");
                setExpenseDate(data.expense_date?.split("T")[0] || "");
            })
            .catch((err) => {
                console.error("Failed to load expense", err);
                toast.error("Failed to load expense");
                navigate("/");
            });
    }, [user, navigate, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim() || !amount || !groupId || !expenseDate) {
            toast.error("Please fill in all the fields");
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("Amount must be a positive number.");
            return;
        }
        if (parsedAmount > 100000){
              toast.error("Amount is too large: has to be less than $10,000");
              return;
            }
        if (description.length > 255) {
            toast.error("Description cannot exceed 250 characters");
            return;
        }
        const today = new Date().toISOString().split("T")[0];
        if (expenseDate > today) {
            toast.error("Expense date cannot be in the future.");
            return;
        }
        try {
            const updatedExpense = {
                description,
                total_amount: parseFloat(amount),
                group_id: parseInt(groupId, 10),
                payer_id: user.id,
                expense_date: expenseDate,
            };

            const response = await updateExpense(id, updatedExpense);

            if (!response || response.error) {
                throw new Error(response.error || "Failed to update expense");
            }

            toast.success(response.message || "Expense updated successfully");
            console.log("Expense updated successfully:", response);
            navigate("/groups/" + groupId);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to update expense");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h1 className="fs-2">Edit Expense</h1>

            <label htmlFor="expense-description" style={styles.label}>
                Expense description
                <input
                    id="expense-description"
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={styles.input}
                />
            </label>

            <label htmlFor="expense-amount" style={styles.label}>
                Amount ($)
                <input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    style={styles.input}
                />
            </label>

            <label htmlFor="expense-date" style={styles.label}>
                Date (MM/DD/YYYY)
                <input
                    id="expense-date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                    style={styles.input}
                />
            </label>

            <label htmlFor="group-select" style={styles.label}>
                Group to split expense with
                <select
                    id="group-select" // Changed ID to avoid conflict with `id` prop if it existed
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    required
                    style={styles.input}
                >
                    <option value="">Select group</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.group_name}
                        </option>
                    ))}
                </select>
            </label>

            <button type="submit" style={styles.button}>
                Update
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
        backgroundColor: "#0d6efd",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontWeight: "bold",
        cursor: "pointer",
    },
};