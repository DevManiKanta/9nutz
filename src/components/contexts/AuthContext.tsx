
// import React, { createContext, useContext, useState, useEffect } from "react";

// type User = { email: string } | null;

// type AuthContextType = {
//   user: User;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<User>;
//   logout: () => void;
//   refreshUserFromToken: () => Promise<User | null>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // On mount: try to restore user from token
//   useEffect(() => {
//     (async () => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         // Option A: if your API has /me endpoint, call it to get user
//         // Option B: if token encodes email, decode it or set a placeholder
//         // We'll attempt a /me call safely, fallback to a placeholder
//         try {
//           const res = await fetch("http://192.168.29.102:5000/api/auth/login", {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           console.log("RES",res)
//           if (res.ok) {
//             const data = await res.json();
//             setUser(data.user ?? { email: data.email ?? "unknown" });
//           } else {
//             // fallback
//             setUser({ email: "demo@blk.com" });
//           }
//         } catch {
//           setUser({ email: "demo@blk.com" });
//         }
//       } else {
//         setUser(null);
//       }
//       setIsLoading(false);
//     })();
//   }, []);

//   // login: calls API, stores token, sets user and returns user
//   const login = async (email: string, password: string): Promise<User> => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("http://192.168.29.102:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!res.ok) {
//         const errBody = await res.json().catch(() => null);
//         const message = errBody?.message || errBody?.error || `Login failed (${res.status})`;
//         throw new Error(message);
//       }

//       const data = await res.json();

//       // Save token
//       if (data.token) {
//         localStorage.setItem("token", data.token);
//       }

//       // If API returns user info, use it. Otherwise fallback to provided email.
//       const newUser = (data.user && { ...(data.user as object) } as User) ?? { email };
//       setUser(newUser);

//       return newUser;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   // helper to refresh user from existing token (optional)
//   const refreshUserFromToken = async (): Promise<User | null> => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return null;
//       try {
//         const res = await fetch("http://192.168.29.102:5000/api/auth/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) return null;
//         const data = await res.json();
//         const refreshed = (data.user && { ...(data.user as object) } as User) ?? { email: data.email ?? "unknown" };
//         setUser(refreshed);
//         return refreshed;
//       } catch {
//         return null;
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserFromToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// };

// import React, { createContext, useContext, useState, useEffect } from "react";

// type User = { email?: string; name?: string; id?: number; role?: string } | null;

// type AuthContextType = {
//   user: User;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<User>;
//   logout: () => void;
//   refreshUserFromToken: () => Promise<User | null>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // On mount: try to restore user from token
//   useEffect(() => {
//     (async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setUser(null);
//         setIsLoading(false);
//         return;
//       }

//       try {
//         // Try to fetch current user from a /me endpoint (recommended)
//         const res = await fetch("http://192.168.29.102:5000/api/auth/me", {
//           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//         });

//         if (!res.ok) {
//           // If /me fails, try a lightweight fallback: decode token client-side or set minimal user
//           console.warn("Token present but /me returned", res.status);
//           setUser({ email: "unknown" });
//           setIsLoading(false);
//           return;
//         }

//         const data = await res.json().catch(() => null);
//         // Some APIs return user under different keys; try common possibilities
//         const serverUser = data?.user ?? data?.admin ?? (data?.data && data.data.user) ?? null;

//         if (serverUser) {
//           setUser({
//             email: serverUser.email,
//             name: serverUser.name,
//             id: serverUser.id,
//             role: serverUser.role,
//           });
//         } else {
//           setUser({ email: data?.email ?? "unknown" });
//         }
//       } catch (err) {
//         console.error("Error while refreshing user from token:", err);
//         setUser({ email: "unknown" });
//       } finally {
//         setIsLoading(false);
//       }
//     })();
//   }, []);

//   // login: calls API, stores token, sets user and returns user
//   const login = async (email: string, password: string): Promise<User> => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("http://192.168.29.102:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!res.ok) {
//         const errBody = await res.json().catch(() => null);
//         const message = errBody?.message || errBody?.error || `Login failed (${res.status})`;
//         throw new Error(message);
//       }

//       const data = await res.json();

//       // Server returns accessToken in your sample; support both accessToken and token keys
//       const token = data?.accessToken ?? data?.token ?? null;
//       if (token) {
//         localStorage.setItem("token", token);
//       } else {
//         console.warn("Login response did not include accessToken/token:", data);
//       }

//       // The API in your sample returns admin object with user info
//       const serverUser = data?.admin ?? data?.user ?? null;

//       const newUser: User = serverUser
//         ? {
//             email: serverUser.email,
//             name: serverUser.name,
//             id: serverUser.id,
//             role: serverUser.role,
//           }
//         : { email };

//       setUser(newUser);

//       return newUser;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   // helper to refresh user from existing token (optional)
//   const refreshUserFromToken = async (): Promise<User | null> => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return null;
//       try {
//         const res = await fetch("http://192.168.29.102:5000/api/auth/me", {
//           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//         });
//         if (!res.ok) return null;
//         const data = await res.json().catch(() => null);
//         const serverUser = data?.user ?? data?.admin ?? null;
//         const refreshed: User = serverUser
//           ? { email: serverUser.email, name: serverUser.name, id: serverUser.id, role: serverUser.role }
//           : { email: data?.email ?? "unknown" };
//         setUser(refreshed);
//         return refreshed;
//       } catch (err) {
//         console.error("refreshUserFromToken error:", err);
//         return null;
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserFromToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// };


import React, { createContext, useContext, useState, useEffect, useRef } from "react";

type User = { email?: string; name?: string; id?: number; role?: string } | null;

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

  // keep a ref of last known token to compare quickly
  const lastTokenRef = useRef<string | null>(localStorage.getItem("token"));

  const logout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {
      /* ignore */
    }
    lastTokenRef.current = null;
    setUser(null);
  };

  // On mount: check for token; if missing -> logout
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      lastTokenRef.current = token;
      if (!token) {
        logout();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("http://192.168.29.102:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });

        if (!res.ok) {
          console.warn("Invalid/expired token on mount, logging out");
          logout();
          setIsLoading(false);
          return;
        }

        const data = await res.json().catch(() => null);
        const serverUser = data?.user ?? data?.admin ?? null;

        if (serverUser) {
          setUser({
            email: serverUser.email,
            name: serverUser.name,
            id: serverUser.id,
            role: serverUser.role,
          });
        } else {
          logout();
        }
      } catch (err) {
        console.error("Error while refreshing user from token on mount:", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    })();
    // empty deps -> run once
  }, []);

  // Listen for cross-tab localStorage changes (fires in other tabs)
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "token") {
        // token removed or changed in another tab
        const newToken = ev.newValue;
        lastTokenRef.current = newToken;
        if (!newToken) {
          // removed -> logout
          logout();
        } else {
          // token changed (e.g., login in other tab) -> optionally refresh user
          // We'll attempt to refresh user from the new token
          (async () => {
            setIsLoading(true);
            try {
              const res = await fetch("http://192.168.29.102:5000/api/auth/me", {
                headers: { Authorization: `Bearer ${newToken}`, Accept: "application/json" },
              });
              if (!res.ok) {
                logout();
                return;
              }
              const data = await res.json().catch(() => null);
              const serverUser = data?.user ?? data?.admin ?? null;
              if (serverUser) {
                setUser({
                  email: serverUser.email,
                  name: serverUser.name,
                  id: serverUser.id,
                  role: serverUser.role,
                });
              } else {
                logout();
              }
            } catch {
              logout();
            } finally {
              setIsLoading(false);
            }
          })();
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Polling fallback to detect token removal in the same tab (e.g., devtools manual delete)
  useEffect(() => {
    let intervalId: number | null = null;

    const startPolling = () => {
      if (intervalId != null) return;
      intervalId = window.setInterval(() => {
        try {
          const current = localStorage.getItem("token");
          // If token went from present -> missing, logout
          if (lastTokenRef.current && !current) {
            lastTokenRef.current = null;
            logout();
          } else {
            // keep lastTokenRef updated if token changed
            lastTokenRef.current = current;
          }
        } catch (e) {
          // if accessing localStorage fails for any reason, do nothing
        }
      }, 1000); // 1s
    };

    const stopPolling = () => {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Start polling only when there's a logged-in user (saves work when logged out)
    if (user) startPolling();

    // If user becomes null, stop polling
    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // restart polling when user changes

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch("http://192.168.29.102:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const message = errBody?.message || errBody?.error || `Login failed (${res.status})`;
        throw new Error(message);
      }

      const data = await res.json();
      const token = data?.accessToken ?? data?.token ?? null;

      if (token) {
        localStorage.setItem("token", token);
        lastTokenRef.current = token;
      } else {
        console.warn("Login response did not include accessToken/token:", data);
        throw new Error("No token received");
      }

      const serverUser = data?.admin ?? data?.user ?? null;
      const newUser: User = serverUser
        ? {
            email: serverUser.email,
            name: serverUser.name,
            id: serverUser.id,
            role: serverUser.role,
          }
        : { email };

      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserFromToken = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
        return null;
      }
      try {
        const res = await fetch("http://192.168.29.102:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) {
          logout();
          return null;
        }
        const data = await res.json().catch(() => null);
        const serverUser = data?.user ?? data?.admin ?? null;
        const refreshed: User = serverUser
          ? { email: serverUser.email, name: serverUser.name, id: serverUser.id, role: serverUser.role }
          : { email: data?.email ?? "unknown" };
        setUser(refreshed);
        return refreshed;
      } catch (err) {
        console.error("refreshUserFromToken error:", err);
        logout();
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

