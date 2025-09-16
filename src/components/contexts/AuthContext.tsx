// import React, { createContext, useContext, useState, ReactNode } from "react";

// type AuthContextType = {
//   user: any | null;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<any | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const login = async (email: string, password: string) => {
//     setIsLoading(true);
//     // Fake auth API (replace with real backend call)
//     return new Promise<void>((resolve, reject) => {
//       setTimeout(() => {
//         if (email === "admin@gmail.com" && password === "admin123") {
//           setUser({ email });
//           resolve();
//         } else {
//           reject(new Error("Invalid credentials"));
//         }
//         setIsLoading(false);
//       }, 1000);
//     });
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };
// src/contexts/AuthContext.tsx
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type User = { email: string } | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUserFromToken: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore user from token
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Option A: if your API has /me endpoint, call it to get user
        // Option B: if token encodes email, decode it or set a placeholder
        // We'll attempt a /me call safely, fallback to a placeholder
        try {
          const res = await fetch("http://192.168.29.102:5000/api/auth/login", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("RES",res?.accessToken)
          if (res.ok) {
            const data = await res.json();
            setUser(data.user ?? { email: data.email ?? "unknown" });
          } else {
            // fallback
            setUser({ email: "demo@blk.com" });
          }
        } catch {
          setUser({ email: "demo@blk.com" });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    })();
  }, []);

  // login: calls API, stores token, sets user and returns user
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch("http://192.168.29.102:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const message = errBody?.message || errBody?.error || `Login failed (${res.status})`;
        throw new Error(message);
      }

      const data = await res.json();

      // Save token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // If API returns user info, use it. Otherwise fallback to provided email.
      const newUser = (data.user && { ...(data.user as object) } as User) ?? { email };
      setUser(newUser);

      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // helper to refresh user from existing token (optional)
  const refreshUserFromToken = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const res = await fetch("http://192.168.29.102:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const refreshed = (data.user && { ...(data.user as object) } as User) ?? { email: data.email ?? "unknown" };
        setUser(refreshed);
        return refreshed;
      } catch {
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
