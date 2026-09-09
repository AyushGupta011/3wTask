import { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, signupAPI, getMeAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          setToken(storedToken);
          // Backend returns { success, data: { user } }
          // Axios wraps in response.data, so response.data = { success, data: { user } }
          const response = await getMeAPI();
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to authenticate token:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await loginAPI({ email, password });
    // response.data = { success, data: { user, token } }
    const { token: jwt, user: userData } = response.data.data;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(userData);
    return response;
  };

  const signup = async (username, email, password) => {
    const response = await signupAPI({ username, email, password });
    // response.data = { success, data: { user, token } }
    const { token: jwt, user: userData } = response.data.data;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
