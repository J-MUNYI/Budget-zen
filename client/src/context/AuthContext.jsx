import { useState, useEffect, useCallback } from "react";
import { API_URL, fetchMe } from "../api/client";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oauthProviders, setOauthProviders] = useState({ google: false, instagram: false });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const refreshOauthProviders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/providers`);
      if (!response.ok) throw new Error("Failed to load auth providers");
      const data = await response.json();
      setOauthProviders({
        google: Boolean(data.google),
        instagram: Boolean(data.instagram),
      });
      return data;
    } catch {
      setOauthProviders({ google: false, instagram: false });
      return null;
    }
  }, []);

  useEffect(() => {
    refreshOauthProviders();
  }, [refreshOauthProviders]);

  const loginWithToken = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const data = await response.json();
          if (data.errors && Array.isArray(data.errors)) {
            const validationErrors = data.errors.reduce((acc, err) => {
              if (err?.path && err?.msg) acc[err.path] = err.msg;
              return acc;
            }, {});
            return {
              success: false,
              error: "Please fix the highlighted fields.",
              validationErrors,
            };
          }
          errorMessage = data.message || errorMessage;
        } catch {
          errorMessage = response.statusText || `Server error (${response.status})`;
        }
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        return {
          success: false,
          error: "Cannot connect to server. Please check if the backend is running.",
        };
      }
      return { success: false, error: error.message || "Login failed. Please try again." };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          return {
            success: false,
            validationErrors: data.errors.reduce((acc, err) => {
              if (err?.path && err?.msg) acc[err.path] = err.msg;
              return acc;
            }, {}),
            error: "Please fix the highlighted fields.",
          };
        }
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const profile = await fetchMe();
      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        loginWithToken,
        oauthProviders,
        refreshOauthProviders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}