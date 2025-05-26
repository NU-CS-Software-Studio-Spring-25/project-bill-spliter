import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchProfile } from './auth';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile().then((res) => {
      if (res.logged_in) setUser(res.user);
      setLoading(false);
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
