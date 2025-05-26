// src/lib/auth.js
import { BASE_URL } from '../api/index';

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data.user;
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
}

export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) return { logged_in: false };
  return res.json();
}
