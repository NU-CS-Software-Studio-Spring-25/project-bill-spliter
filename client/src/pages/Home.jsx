import { useEffect, useState } from "react";
import { fetchGroups } from "../api";
import { CURRENT_USER } from "../lib/session";
import GroupCard from "../components/GroupCard";

export default function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchGroups(page)
      .then((data) => {
        const userGroups = data.groups.filter((g) =>
          g.members.some((member) => member.id === CURRENT_USER.id)
        );
        setGroups(userGroups);
        setTotalPages(data.total_pages);
      })
      .catch((err) => {
        console.error("Failed to load groups", err);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Welcome, {CURRENT_USER.name}!</h1>

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>You are not part of any groups.</p>
      ) : (
        <>
          <div style={styles.grid}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {/* Pagination controls */}
          <div style={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                ...styles.pageButton,
                ...(page === 1 ? styles.disabledButton : {}),
              }}
            >
              Previous
            </button>

            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                ...styles.pageButton,
                ...(page === totalPages ? styles.disabledButton : {}),
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    alignItems: "stretch",
  },
  pagination: {
    marginTop: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    fontSize: "0.95rem",
  },
  
  pageButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "0.4rem 0.9rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
  },
  
  disabledButton: {
    backgroundColor: "#d1d5db",
    cursor: "not-allowed",
  },
  
  pageInfo: {
    fontWeight: 500,
    color: "#374151",
  }
  
};