import { useEffect, useState } from "react";
import { fetchGroups } from "../api";
import { CURRENT_USER } from "../lib/session";
import GroupCard from "../components/GroupCard";

export default function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups()
      .then((allGroups) => {
        const userGroups = allGroups.filter((g) =>
          g.members.some((member) => member.id === CURRENT_USER.id)
        );
        setGroups(userGroups);
      })
      .catch((err) => {
        console.error("Failed to load groups", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Welcome, {CURRENT_USER.name}!</h1>
      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>You are not part of any groups.</p>
      ) : (
        <div style={styles.grid}>
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
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
  }
};
