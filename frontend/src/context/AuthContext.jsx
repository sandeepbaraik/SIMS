import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const data = await apiRequest("/auth/me");

        if (isMounted) {
          setUser(data.user);
          setOrganization(data.organization);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          setOrganization(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    user,
    organization,
    loading,
    isAuthenticated: Boolean(user),
    async login(formValues) {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(formValues),
      });

      setUser(data.user);
      setOrganization(data.organization);
      return data;
    },
    async signup(formValues) {
      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(formValues),
      });

      setUser(data.user);
      setOrganization(data.organization);
      return data;
    },
    async logout() {
      await apiRequest("/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setOrganization(null);
    },
    updateOrganization(partialOrganization) {
      setOrganization((current) => ({ ...current, ...partialOrganization }));
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
