// Constants.js
const production = 'https://bill-splitter-api-d46b8052a10f.herokuapp.com/api/v1'
const development ='http://localhost:3000/api/v1'
export const BASE_URL = process.env.NODE_ENV === 'development' ? development : production;

export async function fetchGroups() {
  const res = await fetch(`${BASE_URL}/groups`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
}

export async function fetchExpenses(groupId) {
    const res = await fetch(`${BASE_URL}/expenses?group_id=${groupId}`);
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return res.json();
}
  
export async function fetchUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function fetchExpense(id) {
    const res = await fetch(`${BASE_URL}/expenses/${id}`);
    if (!res.ok) throw new Error("Failed to fetch expense");
    return res.json();
}

export async function deleteExpense(id) {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete expense");
}

export async function deleteGroup(groupId) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete group");
  }
  