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
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !memberEmails.trim()) {
      toast.error("Please fill in all the fields");
      return;
    }
    if (groupName.length > 100) {
      toast.error("Group name cannot exceed 100 characters");
      return;
    }
    try {
      const emails = memberEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      const invalidEmails = emails.filter((email) => !isValidEmail(email));
      if (invalidEmails.length > 0) {
        toast.error(`Invalid email(s): ${invalidEmails.join(", ")}. Please enter valid email addresses.`);
        return;
      }
      const allEmails = Array.from(new Set([...(emails || []), user.email]));

      const response = await createGroup({ group_name: groupName, member_emails: allEmails });
      if (!response.data) {
        throw new Error(response.error || "Failed to create group");
      }
      console.log("Group created successfully:", response);
      toast.success(response.message || "Group created successfully");
      navigate("/home");
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
      <h1 className="fs-2">Create New Group</h1>
      <label htmlFor="group-name-input" className="visually-hidden">Group Name</label>
      <input
        type="text"
        id="group-name-input" // Added id
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        required
        style={styles.input}
        aria-label="Group Name" // Added aria-label for accessibility without visible label
      />
      <label htmlFor="member-emails-textarea" className="visually-hidden">Member Emails</label>
      <textarea
        id="member-emails-textarea" // Added id
        placeholder="Enter member emails, separated by commas"
        value={memberEmails}
        onChange={(e) => setMemberEmails(e.target.value)}
        rows={4}
        style={styles.input}
        aria-label="Enter member emails, separated by commas" // Added aria-label
        aria-describedby="member-emails-hint" // Associate with hint
      />
      <span id="member-emails-hint" className="visually-hidden">
        Enter email addresses separated by commas to invite members to the group.
      </span>
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