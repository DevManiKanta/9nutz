// import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// type User = { username?: string; name?: string; id?: number; role?: string } | null;

// type AuthContextType = {
//   user: User;
//   isLoading: boolean;
//   login: (username: string, password: string) => Promise<User>;
//   logout: () => void;
//   refreshUserFromToken: () => Promise<User | null>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const lastTokenRef = useRef<string | null>(localStorage.getItem("token"));

//   const logout = () => {
//     try {
//       localStorage.removeItem("token");
//     } catch (e) {
//       /* ignore */
//     }
//     lastTokenRef.current = null;
//     setUser(null);
//   };

//   // helper: extract a user object from various response shapes
//   const extractServerUser = (data: any): User => {
//     if (!data) return null;
//     const serverUser = data?.user ?? data?.admin ?? null;
//     if (serverUser) {
//       return {
//         username: serverUser.username ?? serverUser.email ?? undefined,
//         name: serverUser.name ?? serverUser.fullName ?? undefined,
//         id: serverUser.id ?? serverUser.user_id ?? undefined,
//         role: serverUser.role ?? undefined,
//       };
//     }
//     // fallback to top-level fields (your response had name: "admin" at top level)
//     return {
//       username: data?.username ?? data?.email ?? undefined,
//       name: data?.name ?? undefined,
//       id: data?.id ?? undefined,
//       role: data?.role ?? undefined,
//     };
//   };

//   // On mount: check for token and try refresh
//   useEffect(() => {
//     (async () => {
//       const token = localStorage.getItem("token");
//       lastTokenRef.current = token;
//       if (!token) {
//         logout();
//         setIsLoading(false);
//         return;
//       }

//       try {
//         // endpoint that returns current user from token; adjust path if your API differs
//         const res = await fetch("http://192.168.29.100:8001/api/login", {
//           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//         });

//         if (!res.ok) {
//           console.warn("Invalid/expired token on mount, logging out");
//           logout();
//           setIsLoading(false);
//           return;
//         }

//         const data = await res.json().catch(() => null);
//         const sUser = extractServerUser(data);

//         if (sUser) {
//           setUser(sUser);
//         } else {
//           logout();
//         }
//       } catch (err) {
//         console.error("Error while refreshing user from token on mount:", err);
//         logout();
//       } finally {
//         setIsLoading(false);
//       }
//     })();
//     // run once
//   }, []);

//   // Listen for localStorage changes across tabs
//   useEffect(() => {
//     const onStorage = (ev: StorageEvent) => {
//       if (ev.key === "token") {
//         const newToken = ev.newValue;
//         lastTokenRef.current = newToken;
//         if (!newToken) {
//           logout();
//         } else {
//           (async () => {
//             setIsLoading(true);
//             try {
//               const res = await fetch("http://192.168.29.100:8001/api/login", {
//                 headers: { Authorization: `Bearer ${newToken}`, Accept: "application/json" },
//               });
//               if (!res.ok) {
//                 logout();
//                 return;
//               }
//               const data = await res.json().catch(() => null);
//               const sUser = extractServerUser(data);
//               if (sUser) {
//                 setUser(sUser);
//               } else {
//                 logout();
//               }
//             } catch {
//               logout();
//             } finally {
//               setIsLoading(false);
//             }
//           })();
//         }
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // Polling fallback to detect token removal in same tab
//   useEffect(() => {
//     let intervalId: number | null = null;

//     const startPolling = () => {
//       if (intervalId != null) return;
//       intervalId = window.setInterval(() => {
//         try {
//           const current = localStorage.getItem("token");
//           // If token went from present -> missing, logout
//           if (lastTokenRef.current && !current) {
//             lastTokenRef.current = null;
//             logout();
//           } else {
//             // keep lastTokenRef updated if token changed
//             lastTokenRef.current = current;
//           }
//         } catch (e) {
//           // ignore localStorage errors
//         }
//       }, 1000);
//     };

//     const stopPolling = () => {
//       if (intervalId != null) {
//         clearInterval(intervalId);
//         intervalId = null;
//       }
//     };

//     if (user) startPolling();
//     return () => {
//       stopPolling();
//     };
//   }, [user]);

//   const login = async (username: string, password: string): Promise<User> => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("http://192.168.29.100:8001/api/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({ username, password }),
//       });

//       if (!res.ok) {
//         const errBody = await res.json().catch(() => null);
//         const message = errBody?.message || errBody?.error || `Login failed (${res.status})`;
//         throw new Error(message);
//       }

//       const data = await res.json();

//       // Accept multiple token field names (access_token, accessToken, token)
//       const token =
//         data?.access_token ?? data?.accessToken ?? data?.token ?? data?.accessToken?.token ?? null;

//       if (!token) {
//         // Some APIs may return nested object like data: { access_token: '...' } — handle common shapes:
//         const maybeNested = data?.data ?? data?.token_data ?? null;
//         const tokenNested = maybeNested?.access_token ?? maybeNested?.token ?? null;
//         if (tokenNested) {
//           localStorage.setItem("token", tokenNested);
//           lastTokenRef.current = tokenNested;
//         } else {
//           // as a last resort, check if response contains a field called access_token as string somewhere
//           throw new Error("No token received from login response");
//         }
//       } else {
//         localStorage.setItem("token", token);
//         lastTokenRef.current = token;
//       }

//       // Extract user info (data.user, data.admin, or top-level fields)
//       const sUser = extractServerUser(data);
//       const newUser: User = sUser ?? { username };

//       setUser(newUser);
//       return newUser;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const refreshUserFromToken = async (): Promise<User | null> => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         logout();
//         return null;
//       }
//       try {
//         const res = await fetch("http://192.168.1.6:8001/api/login", {
//           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
//         });
//         if (!res.ok) {
//           logout();
//           return null;
//         }
//         const data = await res.json().catch(() => null);
//         const sUser = extractServerUser(data);
//         if (sUser) {
//           setUser(sUser);
//           return sUser;
//         } else {
//           logout();
//           return null;
//         }
//       } catch (err) {
//         console.error("refreshUserFromToken error:", err);
//         logout();
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
// src/contexts/AuthContext.tsx


import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../../api/axios"

type User = { username?: string; name?: string; id?: number; role?: string } | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUserFromToken: () => Promise<User | null>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lastTokenRef = useRef<string | null>(localStorage.getItem("token"));

  const logout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {
    }
    lastTokenRef.current = null;
    setUser(null);
  };

  // helper: extract a user object from various response shapes
  const extractServerUser = (data: any): User => {
    if (!data) return null;
    const serverUser = data?.user ?? data?.admin ?? null;
    if (serverUser) {
      return {
        username: serverUser.username ?? serverUser.email ?? undefined,
        name: serverUser.name ?? serverUser.fullName ?? undefined,
        id: serverUser.id ?? serverUser.user_id ?? undefined,
        role: serverUser.role ?? undefined,
      };
    }
    // fallback to top-level fields (your response had name: "admin" at top level)
    return {
      username: data?.username ?? data?.email ?? undefined,
      name: data?.name ?? undefined,
      id: data?.id ?? undefined,
      role: data?.role ?? undefined,
    };
  };

  // On mount: check for token and try refresh
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
        // Use api instance — assumes baseURL is set and axios returns res.data
        // If your api instance doesn't automatically add Authorization header, it should;
        // if not, we pass it explicitly here.
        const res = await api.get("/login", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });

        const data = res?.data ?? null;
        const sUser = extractServerUser(data);

        if (sUser) {
          setUser(sUser);
        } else {
          logout();
        }
      } catch (err) {
        // axios throws for non-2xx — treat as expired/invalid token
        console.warn("Invalid/expired token on mount, logging out", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    })();
    // run once
  }, []);

  // Listen for localStorage changes across tabs
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "token") {
        const newToken = ev.newValue;
        lastTokenRef.current = newToken;
        if (!newToken) {
          logout();
        } else {
          (async () => {
            setIsLoading(true);
            try {
              const res = await api.get("/login", {
                headers: { Authorization: `Bearer ${newToken}`, Accept: "application/json" },
              });
              const data = res?.data ?? null;
              const sUser = extractServerUser(data);
              if (sUser) {
                setUser(sUser);
              } else {
                logout();
              }
            } catch (err) {
              console.warn("Token refresh on storage event failed", err);
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

  // Polling fallback to detect token removal in same tab
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
          // ignore localStorage errors
        }
      }, 1000);
    };

    const stopPolling = () => {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (user) startPolling();
    return () => {
      stopPolling();
    };
  }, [user]);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post(
        "/login",
        { username, password },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );

      const data = res?.data ?? {};

      // Accept multiple token field names (access_token, accessToken, token)
      const token =
        data?.access_token ?? data?.accessToken ?? data?.token ?? data?.accessToken?.token ?? null;

      if (!token) {
        // Some APIs may return nested object like data: { access_token: '...' } — handle common shapes:
        const maybeNested = data?.data ?? data?.token_data ?? null;
        const tokenNested = maybeNested?.access_token ?? maybeNested?.token ?? null;
        if (tokenNested) {
          localStorage.setItem("token", tokenNested);
          lastTokenRef.current = tokenNested;
        } else {
          throw new Error("No token received from login response");
        }
      } else {
        localStorage.setItem("token", token);
        lastTokenRef.current = token;
      }

      // Extract user info (data.user, data.admin, or top-level fields)
      const sUser = extractServerUser(data);
      const newUser: User = sUser ?? { username };

      setUser(newUser);
      return newUser;
    } catch (err: any) {
      // normalize error message
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Login failed";
      throw new Error(msg);
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
        const res = await api.get("/login", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = res?.data ?? null;
        const sUser = extractServerUser(data);
        if (sUser) {
          setUser(sUser);
          return sUser;
        } else {
          logout();
          return null;
        }
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




