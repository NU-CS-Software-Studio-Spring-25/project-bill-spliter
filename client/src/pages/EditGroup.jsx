import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../lib/userContext";
import { fetchGroup, updateGroup } from "../api";
import { toast } from "react-toastify";

export default function EditGroup() {
    const { user } = useUser();
    const { id } = useParams();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState("");
    const [memberEmails, setMemberEmails] = useState("");

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

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
                setGroupName(data.group_name || "");
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
            const emails = memberEmails
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
            const updatedGroupData = {group_name: groupName};
            if (emails.length > 0) {
                updatedGroupData.member_emails = emails;
            }
            const response = await updateGroup(id, updatedGroupData);
            if (!response.data) {
                throw new Error(response.error || "Failed to create group");
            }
            console.log("Group updated successfully:", response);
            toast.success(response.message || "Group updated successfully");
            navigate("/");
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
            <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                style={styles.input}
            />
            <h3 className="fs-5 fw-info text-secondary mb-1">Adding New Members</h3>
            <textarea
                placeholder="Enter member emails, separated by commas"
                value={memberEmails}
                onChange={(e) => setMemberEmails(e.target.value)}
                rows={4}
                style={styles.input}
            />
            <button type="submit" style={styles.button}>
                Update Group
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