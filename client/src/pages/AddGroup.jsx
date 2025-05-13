import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CURRENT_USER } from "../lib/session";
const BASE_URL = "https://bill-splitter-api-d46b8052a10f.herokuapp.com/api/v1";


export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [memberEmails, setMemberEmails] = useState(""); // ✅ 이름 변경
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const rawEmails = memberEmails.split(",").map((email) => email.trim()).filter(Boolean);
      const allEmails = Array.from(new Set([...rawEmails, CURRENT_USER.email])); // ✅ 자신 포함
      console.log(CURRENT_USER.email)
      const res = await fetch(`${BASE_URL}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: groupName,
          created_by: CURRENT_USER.id,
          member_ids: allEmails
        })
      });
      if (!res.ok) throw new Error("Failed to create group");
      alert("Group created");
      navigate("/");
    } catch (err) {
      console.error("Error creating group", err);
      alert("Failed to create group");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Create New Group</h2>
      <input
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
