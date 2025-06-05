import React, { useState, useEffect } from 'react';
import { fetchUsers, addGroupMembers, deleteGroupMember } from '../api';
import { toast } from 'react-toastify';

const GroupMembers = ({ groupId, currentMembers }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      // Filter out users who are already members
      const availableUsers = data.filter(
        user => !currentMembers.some(member => member.id === user.id)
      );
      setUsers(availableUsers);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select at least one user');
      return;
    }

    try {
      await addGroupMembers(groupId, selectedUsers);
      toast.success('Members added successfully');
      setSelectedUsers([]);
      // Reload the page or update the parent component
      window.location.reload();
    } catch (error) {
      toast.error('Failed to add members');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await deleteGroupMember(groupId, memberId);
      toast.success('Member removed successfully');
      // Reload the page or update the parent component
      window.location.reload();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Current Members</h5>
              <ul className="list-group">
                {currentMembers.map((member) => (
                  <li key={member.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {member.name}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Add New Members</h5>
              <div className="mb-3">
                <select
                  className="form-select"
                  multiple
                  value={selectedUsers}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedUsers(values);
                  }}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <small className="text-muted">Hold Ctrl/Cmd to select multiple users</small>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0}
              >
                Add Selected Members
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers; 