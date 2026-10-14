import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    const u = { id: data.id, fullName: data.fullName, email: data.email, role: data.role };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  const home = (u = user) => (u?.role === 'EMPLOYER' ? '/employer' : '/seeker');

  return <AuthContext.Provider value={{ user, login, logout, home }}>{children}</AuthContext.Provider>;
}
