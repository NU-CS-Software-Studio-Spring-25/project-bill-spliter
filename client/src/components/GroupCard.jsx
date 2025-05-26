import { Link } from "react-router-dom";

export default function GroupCard({ group }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{group.group_name}</h2>
        <span style={styles.members}>{`${group.members.length} members`}</span>
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
    padding: "1.5rem",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "140px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  members: {
    display: "inline-block",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    borderRadius: "9999px",
    padding: "0.35rem 0.75rem",
    fontSize: "0.85rem",
    fontWeight: 500,
    lineHeight: 1.2,
    textAlign: "center",
    whiteSpace: "nowrap",
    marginLeft: "4px"
  },
  link: {
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#3b82f6",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    textAlign: "center",
    width: "fit-content",
    transition: "background-color 0.2s ease",
    marginTop: "auto",
    alignSelf: "flex-start",
  },
};
