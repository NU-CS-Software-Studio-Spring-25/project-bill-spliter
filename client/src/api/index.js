// Constants.js
const production = 'https://bill-splitter-api-d46b8052a10f.herokuapp.com/api/v1'
const development ='http://localhost:3000/api/v1'
export const BASE_URL = process.env.NODE_ENV === 'development' ? development : production;

async function parseJsonOrText(res) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return res.text();
  }
  
  async function handleFetch(res) {
    const data = await parseJsonOrText(res);
    if (!res.ok) {
      const errorMessage = data && data.error ? data.error : res.statusText;
      throw new Error(errorMessage);
    }
    return data;
  }
  
  export async function fetchGroups(page = 1) {
    // Use the 'my_groups' endpoint for the authenticated user's groups
    const res = await fetch(`${BASE_URL}/groups/my_groups?page=${page}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }  

  export async function fetchGroup(id) {
    const res = await fetch(`${BASE_URL}/groups/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }
  
  export async function fetchExpenses(groupId) {
    const res = await fetch(`${BASE_URL}/expenses?group_id=${groupId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }
  
  export async function fetchUsers() {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }
  
  export async function fetchExpense(id) {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }

  export async function updateExpense(id, expenseData) {
    const response = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expense: expenseData }),
    });
    return await response.json();
  }

  export async function createGroup(groupData) {
    const res = await fetch(`${BASE_URL}/groups`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group: groupData }),
    });
    return handleFetch(res);
  }

  export async function updateGroup(id, groupData) {
    const res = await fetch(`${BASE_URL}/groups/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group: groupData }),
    });
    return handleFetch(res);
  }

  export async function deleteGroupMember(groupId, memberId) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleFetch(res);
  }
  
  export async function createExpense(expenseData) {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense: expenseData }),
    });
    return handleFetch(res);
  }
  
  
  export async function deleteExpense(id) {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleFetch(res);
  }
  
  export async function deleteGroup(groupId) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleFetch(res);
  }
  
  export async function login(email, password) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleFetch(res);
  }
  
  export async function logout() {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleFetch(res);
  }
  
  export async function fetchProfile() {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await handleFetch(res);
    return data;
  }
  
  export async function register(userData) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userData }),
    });
    return handleFetch(res);
  }
  
  export async function fetchExpenseSplits(expenseId) {
    const res = await fetch(`${BASE_URL}/expenses/${expenseId}/splits`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }

  export async function updateExpenseSplit(expenseId, splitId, splitData) {
    const res = await fetch(`${BASE_URL}/expenses/${expenseId}/splits/${splitId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ split: splitData }),
    });
    return handleFetch(res);
  }

  export async function markSplitSettled(expenseId, splitId) {
    const res = await fetch(`${BASE_URL}/expenses/${expenseId}/splits/${splitId}/settle`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }

  export async function markSplitUnsettled(expenseId, splitId) {
    const res = await fetch(`${BASE_URL}/expenses/${expenseId}/splits/${splitId}/unsettle`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }

  export async function fetchGroupBalances(groupId) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/balances`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }

  export async function fetchSettlements(groupId) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/settlements`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }

  export async function createSettlement(groupId, settlementData) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/settlements`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settlement: settlementData }),
    });
    return handleFetch(res);
  }

  export async function addGroupMembers(groupId, memberIds) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_ids: memberIds }),
    });
    return handleFetch(res);
  }

  export async function fetchGroupExpenses(groupId) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/expenses`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleFetch(res);
  }
  