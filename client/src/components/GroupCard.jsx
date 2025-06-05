import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { FaArrowRight } from 'react-icons/fa'; // Ensure react-icons is installed

export default function GroupCard({ group }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header style={styles.header}>
        <h2 style={styles.title}>{group.group_name}</h2>
      </header>

      {/* Moved members count here, above the link and below the header */}
      <span style={styles.members}>{`${group.members.length} members`}</span>

      <Link
        to={`/groups/${group.id}`}
        style={{
          ...styles.link,
          ...(isHovered ? styles.linkHover : {})
        }}
      >
        View Group <FaArrowRight style={styles.arrowIcon} />
      </Link>
    </article>
  );
}

const styles = {
  card: {
    border: "1px solid #e0e0e0",
    padding: "1.5rem",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "140px",
    position: 'relative',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  header: {
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: "1.35rem",
    fontWeight: "700",
    color: "#2d3748",
    margin: 0,
    marginBottom: '0.75rem',
  },
  members: {
    display: "inline-block",
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
    borderRadius: "9999px",
    padding: "0.25rem 0.75rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: "nowrap",
    marginTop: 'auto',
    marginBottom: '1rem',
    alignSelf: 'flex-start',
  },
  link: {
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#2B73B6",
    backgroundColor: "#ebf8ff",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    textAlign: "center",
    width: "fit-content",
    transition: "background-color 0.2s ease, color 0.2s ease, transform 0.1s ease",
    alignSelf: "flex-start",
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid #90cdf4',
  },
  linkHover: {
    backgroundColor: '#cce5ff',
    color: '#2966A8',
    transform: 'translateX(2px)',
  },
  arrowIcon: {
    fontSize: '1rem',
  },
};