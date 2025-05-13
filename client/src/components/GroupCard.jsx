import { Link } from "react-router-dom";

export default function GroupCard({ group }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{group.group_name}</h2>
        <span style={styles.members}>
          👥 {group.member_ids.length} members
        </span>
      </div>

      <Link to={`/groups/${group.id}`} style={styles.link}>
        View Group →
      </Link>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e7eb",
    padding: "1.25rem",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "0.2s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "600",
    margin: 0,
  },
  members: {
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  list: {
    margin: "0.5rem 0",
    paddingLeft: "1rem",
    listStyleType: "none",
  },
  memberName: {
    fontSize: "0.95rem",
    color: "#374151",
  },
  link: {
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#3b82f6",
  }
};
