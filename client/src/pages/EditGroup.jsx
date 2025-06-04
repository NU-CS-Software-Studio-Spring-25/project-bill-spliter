import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../lib/userContext";
import { fetchGroup, updateGroup } from "../api";
import { toast } from "react-toastify";
import { deleteGroupMember, deleteGroup } from "../api";

export default function EditGroup() {
    const { user } = useUser();
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState({});
    const [groupName, setGroupName] = useState("");
    const [members, setMembers] = useState([]);
    const [newMemberEmails, setNewMemberEmails] = useState("");

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const handleDeleteMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const response = await deleteGroupMember(group.id, memberId);
            if (!response.message) {
                throw new Error(response.error);
            }
            toast.success("Member removed successfully");
            navigate(`/groups/${group.id}`);
        } catch (err) {
            console.error(err);
            if (err.message.includes("Creator must exist")) {
                toast.error("Session expired. Please log in.");
                navigate("/login");
            } else {
                toast.error(err.message || "Failed to remove member");
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;
        try {
            const response = await deleteGroup(group.id);
            if (!response.message) {
                throw new Error(response.error || "Failed to delete group");
            }
            toast.success(response.message);
            navigate("/");
        } catch (err) {
            console.error(err);
            if (err.message.includes("Creator must exist")) {
                toast.error("Session expired. Please log in.");
                navigate("/login");
            } else {
                toast.error(err.message || "Failed to delete group");
            }
        }
    };

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        fetchGroup(id)
            .then((data) => {
                setGroup(data);
                setGroupName(data.group_name || "");
                setMembers(data.members || []);
            })
            .catch((err) => console.error("Failed to load groups", err));
    }, [user, navigate, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            toast.error("Please fill in the group name field");
            return;
        }
        try {
            const emails = newMemberEmails
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean);

            const invalidEmails = emails.filter((email) => !isValidEmail(email));
            if (invalidEmails.length > 0) {
                toast.error(
                    `Invalid email(s): ${invalidEmails.join(
                        ", "
                    )}. Please enter valid email addresses.`
                );
                return;
            }
            const updatedGroupData = { group_name: groupName };
            if (emails.length > 0) {
                updatedGroupData.member_emails = emails;
            }
            const response = await updateGroup(id, updatedGroupData);
            if (!response.data) {
                throw new Error(response.error || "Failed to create group");
            }
            toast.success(response.message || "Group updated successfully");
            navigate("/groups/" + id);
        } catch (err) {
            console.error(err);
            if (err.message.includes("Creator must exist")) {
                alert("Session expired. Please log in.");
                navigate("/login");
            } else {
                toast.error(err.message || "Failed to update group");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2>Edit Group</h2>
            <label htmlFor="group-name" style={styles.label}>Group Name
                <input
                    id="group-name"
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    style={styles.input}
                />
            </label>
            <h3 className="fs-5 fw-info text-secondary mb-1">Invite New Members</h3>
            <textarea
                placeholder="Enter user emails, separated by commas"
                value={newMemberEmails}
                onChange={(e) => setNewMemberEmails(e.target.value)}
                rows={4}
                style={styles.input}
            />
            {user.id === group.creator_id && (
                <>
                    <h3 className="fs-5 fw-info text-secondary mb-1">Edit Current Members</h3>
                    <ul className="list-unstyled">
                        {members.map((m) => (
                            <li key={m.id} className="col">
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                                    <span className="fw-medium">{m.name}</span>
                                    {m.id !== user.id && (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteMember(m.id)}
                                        >
                                            <i className="bi bi-trash-fill"></i> Remove
                                        </button>
                                    )}
                                    {m.id === user.id && (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteMember(m.id)}
                                        >
                                            <i className="bi bi-trash-fill"></i> Leave
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <button type="submit" className="btn btn-primary text-center gap-1">
                Update Group
            </button>
            {user.id === group.creator_id && (
                <button
                    className="btn btn-outline-danger text-center gap-1"
                    onClick={handleDeleteGroup}
                >
                    Delete Group
                </button>
            )}
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
        padding: "0.75rem 1.25rem",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontWeight: "bold",
        cursor: "pointer",
    },
};