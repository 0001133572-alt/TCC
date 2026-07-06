import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 1, name: 'Administrador', email: 'admin@xsalgados.com', role: 'admin' },
  { id: 2, name: 'Operador', email: 'operador@xsalgados.com', role: 'operador' },
];

const MOCK_PASSWORDS = {
  'admin@xsalgados.com': 'admin123',
  'operador@xsalgados.com': 'operador123',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); }
        catch (e) { /* ignore */ }
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 500));

    const mockUser = MOCK_USERS.find(u => u.email === email);
    if (mockUser && MOCK_PASSWORDS[email] === password) {
      const fakeToken = 'mock-token-' + Date.now();
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken(fakeToken);
      setUser(mockUser);
      return { success: true };
    }

    return {
      success: false,
      message: 'Credenciais inválidas'
    };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};