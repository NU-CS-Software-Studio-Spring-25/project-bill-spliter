import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/userContext";
import { createGroup } from "../api";
import { toast } from "react-toastify";

export default function CreateGroup() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const emails = memberEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      const allEmails = Array.from(new Set([...(emails || []), user.email]));

      const response = await createGroup({ group_name: groupName, member_emails: allEmails });
      if (!response.data) {
        throw new Error(response.error || "Failed to create group");
      }
      console.log("Group created successfully:", response);
      toast.success(response.message || "Group created successfully");
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.message.includes("Creator must exist")) {
        alert("Session expired. Please log in.");
        navigate("/login");
      } else {
        toast.error(err.message || "Failed to create group");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Create New Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        required
        style={styles.input}
      />
      <textarea
        placeholder="Enter member emails, separated by commas"
        value={memberEmails}
        onChange={(e) => setMemberEmails(e.target.value)}
        rows={4}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        Create Group
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
  button: {
    padding: "0.75rem 1.25rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
