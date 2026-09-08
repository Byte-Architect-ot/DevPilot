// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, getLoginUrl, logoutUser } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedRepo, setConnectedRepo] = useState(() => {
    try {
      const saved = localStorage.getItem('devpilot_connected_repo');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const checkAuth = async () => {
    setLoading(true);
    try {
      const userData = await getMe();
      if (userData && userData.id) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async () => {
    try {
      const targetUrl = await getLoginUrl();
      window.location.href = targetUrl;
    } catch (error) {
      window.location.href = '/oauth2/authorization/github';
    }
  };

  const loginAsDemoUser = () => {
    const demoUser = {
      id: 'usr_8f7b2c1a-9e3d-4b5c-8f1e-2a3b4c5d6e7f',
      github_id: 10495821,
      github_username: 'octocat',
      display_name: 'Mona Lisa Octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
    };
    setUser(demoUser);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setUser(null);
      setConnectedRepo(null);
      localStorage.removeItem('devpilot_connected_repo');
      setLoading(false);
    }
  };

  const connectRepo = (repo) => {
    setConnectedRepo(repo);
    try {
      localStorage.setItem('devpilot_connected_repo', JSON.stringify(repo));
    } catch (e) {
      // Ignore storage errors
    }
  };

  const disconnectRepo = () => {
    setConnectedRepo(null);
    localStorage.removeItem('devpilot_connected_repo');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: !!user,
        connectedRepo,
        connectRepo,
        disconnectRepo,
        login,
        loginAsDemoUser,
        logout,
        refreshAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
