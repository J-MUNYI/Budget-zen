import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token on mount
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

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle network errors
      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const data = await response.json();
          // Handle validation errors
          if (data.errors && Array.isArray(data.errors)) {
            return { 
              success: false, 
              error: JSON.stringify({ errors: data.errors })
            };
          }
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `Server error (${response.status})`;
        }
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Store token and user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      // Handle network errors (server down, CORS, etc.)
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        return { 
          success: false, 
          error: "Cannot connect to server. Please check if the backend is running." 
        };
      }
      return { success: false, error: error.message || "Login failed. Please try again." };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from express-validator
        if (data.errors && Array.isArray(data.errors)) {
          return { 
            success: false, 
            error: JSON.stringify({ errors: data.errors })
          };
        }
        // Handle other error messages
        throw new Error(data.message || "Registration failed");
      }

      // Store token and user
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
