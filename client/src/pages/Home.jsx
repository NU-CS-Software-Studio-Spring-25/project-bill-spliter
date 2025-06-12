import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroups } from "../api";
import { useUser } from "../lib/userContext";
import GroupCard from "../components/GroupCard";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    fetchGroups(page)
      .then((data) => {
        let rawGroups = [];
        let pagesCount = 1;

        if (data.groups) {
          rawGroups = data.groups;
          pagesCount = data.total_pages;
        } else if (Array.isArray(data)) {
          rawGroups = data;
        }

        const userGroups = rawGroups.filter((g) => {
          if (g.member_ids) {
            return g.member_ids.includes(user.id);
          } else if (Array.isArray(g.members)) {
            return g.members.some((m) => m.id === user.id);
          }
          return true;
        });

        setGroups(userGroups);
        setTotalPages(pagesCount);
      })
      .catch((err) => console.error('Failed to load groups', err))
      .finally(() => setLoading(false));
  }, [page, user, navigate]);

  const handleSearch = async () => {
    setLoading(true);
    fetchGroups(page, query)
      .then((data) => {
        let rawGroups = [];
        let pagesCount = 1;

        if (data.groups) {
          rawGroups = data.groups;
          pagesCount = data.total_pages;
        } else if (Array.isArray(data)) {
          rawGroups = data;
        }

        const userGroups = rawGroups.filter((g) => {
          if (g.member_ids) {
            return g.member_ids.includes(user.id);
          } else if (Array.isArray(g.members)) {
            return g.members.some((m) => m.id === user.id);
          }
          return true;
        });

        setGroups(userGroups);
        setTotalPages(pagesCount);
      })
      .catch((err) => console.error('Failed to load groups', err))
      .finally(() => setLoading(false));
  };


  return (
    <main style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>
        Welcome, {user?.name || 'Guest'}!
      </h1>
      <input
        className="form-control mb-3"
        type="text"
        placeholder="Search groups..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && handleSearch()}
      />

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>You are not part of any groups.</p>
      ) : (
        <>
          <section style={styles.grid} aria-label="Your Groups">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </section>

          <nav aria-label="Pagination" style={styles.pagination}>
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
          </nav>
        </>
      )}
    </main>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr)',
    gap: '1rem',
    alignItems: 'stretch',
  },
  pagination: {
    marginTop: '2rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.95rem',
  },
  pageButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontWeight: 500,
    color: '#374151',
  },
};