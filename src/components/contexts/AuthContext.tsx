


// // import React, { createContext, useContext, useState, useEffect, useRef } from "react";
// // import api from "../../api/axios"

// // type User = { username?: string; name?: string; id?: number; role?: string } | null;

// // type AuthContextType = {
// //   user: User;
// //   isLoading: boolean;
// //   login: (username: string, password: string) => Promise<User>;
// //   logout: () => void;
// //   refreshUserFromToken: () => Promise<User | null>;
// // };
// // const AuthContext = createContext<AuthContextType | undefined>(undefined);
// // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const [user, setUser] = useState<User>(null);
// //   const [isLoading, setIsLoading] = useState(true);

// //   const lastTokenRef = useRef<string | null>(localStorage.getItem("token"));

// //   const logout = () => {
// //     try {
// //       localStorage.removeItem("token");
// //     } catch (e) {
// //     }
// //     lastTokenRef.current = null;
// //     setUser(null);
// //   };

// //   // helper: extract a user object from various response shapes
// //   const extractServerUser = (data: any): User => {
// //     if (!data) return null;
// //     const serverUser = data?.user ?? data?.admin ?? null;
// //     if (serverUser) {
// //       return {
// //         username: serverUser.username ?? serverUser.email ?? undefined,
// //         name: serverUser.name ?? serverUser.fullName ?? undefined,
// //         id: serverUser.id ?? serverUser.user_id ?? undefined,
// //         role: serverUser.role ?? undefined,
// //       };
// //     }
// //     // fallback to top-level fields (your response had name: "admin" at top level)
// //     return {
// //       username: data?.username ?? data?.email ?? undefined,
// //       name: data?.name ?? undefined,
// //       id: data?.id ?? undefined,
// //       role: data?.role ?? undefined,
// //     };
// //   };

// //   // On mount: check for token and try refresh
// //   useEffect(() => {
// //     (async () => {
// //       const token = localStorage.getItem("token");
// //       lastTokenRef.current = token;
// //       if (!token) {
// //         logout();
// //         setIsLoading(false);
// //         return;
// //       }

// //       try {
// //         const res = await api.get("/login", {
// //           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
// //         });

// //         const data = res?.data ?? null;
// //         const sUser = extractServerUser(data);

// //         if (sUser) {
// //           setUser(sUser);
// //         } else {
// //           logout();
// //         }
// //       } catch (err) {
// //         // axios throws for non-2xx — treat as expired/invalid token
// //         console.warn("Invalid/expired token on mount, logging out", err);
// //         logout();
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     })();
// //     // run once
// //   }, []);

// //   // Listen for localStorage changes across tabs
// //   useEffect(() => {
// //     const onStorage = (ev: StorageEvent) => {
// //       if (ev.key === "token") {
// //         const newToken = ev.newValue;
// //         lastTokenRef.current = newToken;
// //         if (!newToken) {
// //           logout();
// //         } else {
// //           (async () => {
// //             setIsLoading(true);
// //             try {
// //               const res = await api.get("/login", {
// //                 headers: { Authorization: `Bearer ${newToken}`, Accept: "application/json" },
// //               });
// //               const data = res?.data ?? null;
// //               const sUser = extractServerUser(data);
// //               if (sUser) {
// //                 setUser(sUser);
// //               } else {
// //                 logout();
// //               }
// //             } catch (err) {
// //               console.warn("Token refresh on storage event failed", err);
// //               logout();
// //             } finally {
// //               setIsLoading(false);
// //             }
// //           })();
// //         }
// //       }
// //     };
// //     window.addEventListener("storage", onStorage);
// //     return () => window.removeEventListener("storage", onStorage);
// //   }, []);

// //   // Polling fallback to detect token removal in same tab
// //   useEffect(() => {
// //     let intervalId: number | null = null;

// //     const startPolling = () => {
// //       if (intervalId != null) return;
// //       intervalId = window.setInterval(() => {
// //         try {
// //           const current = localStorage.getItem("token");
// //           // If token went from present -> missing, logout
// //           if (lastTokenRef.current && !current) {
// //             lastTokenRef.current = null;
// //             logout();
// //           } else {
// //             // keep lastTokenRef updated if token changed
// //             lastTokenRef.current = current;
// //           }
// //         } catch (e) {
// //           // ignore localStorage errors
// //         }
// //       }, 1000);
// //     };

// //     const stopPolling = () => {
// //       if (intervalId != null) {
// //         clearInterval(intervalId);
// //         intervalId = null;
// //       }
// //     };

// //     if (user) startPolling();
// //     return () => {
// //       stopPolling();
// //     };
// //   }, [user]);

// //   const login = async (username: string, password: string): Promise<User> => {
// //     setIsLoading(true);
// //     try {
// //       const res = await api.post(
// //         "/login",
// //         { username, password },
// //         { headers: { "Content-Type": "application/json", Accept: "application/json" } }
// //       );

// //       const data = res?.data ?? {};

// //       // Accept multiple token field names (access_token, accessToken, token)
// //       const token =
// //         data?.access_token ?? data?.accessToken ?? data?.token ?? data?.accessToken?.token ?? null;

// //       if (!token) {
// //         // Some APIs may return nested object like data: { access_token: '...' } — handle common shapes:
// //         const maybeNested = data?.data ?? data?.token_data ?? null;
// //         const tokenNested = maybeNested?.access_token ?? maybeNested?.token ?? null;
// //         if (tokenNested) {
// //           localStorage.setItem("token", tokenNested);
// //           lastTokenRef.current = tokenNested;
// //         } else {
// //           throw new Error("No token received from login response");
// //         }
// //       } else {
// //         localStorage.setItem("token", token);
// //         lastTokenRef.current = token;
// //       }

// //       // Extract user info (data.user, data.admin, or top-level fields)
// //       const sUser = extractServerUser(data);
// //       const newUser: User = sUser ?? { username };

// //       setUser(newUser);
// //       return newUser;
// //     } catch (err: any) {
// //       // normalize error message
// //       const msg =
// //         err?.response?.data?.message ??
// //         err?.response?.data?.error ??
// //         err?.message ??
// //         "Login failed";
// //       throw new Error(msg);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const refreshUserFromToken = async (): Promise<User | null> => {
// //     setIsLoading(true);
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) {
// //         logout();
// //         return null;
// //       }
// //       try {
// //         const res = await api.get("/login", {
// //           headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
// //         });
// //         const data = res?.data ?? null;
// //         const sUser = extractServerUser(data);
// //         if (sUser) {
// //           setUser(sUser);
// //           return sUser;
// //         } else {
// //           logout();
// //           return null;
// //         }
// //       } catch (err) {
// //         console.error("refreshUserFromToken error:", err);
// //         logout();
// //         return null;
// //       }
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };
// //   return (
// //     <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserFromToken }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
// //   return ctx;
// // };

// "use client";

// import React, { createContext, useContext, useEffect, useRef, useState } from "react";
// import api from "../../api/axios";

// type User = { username?: string; name?: string; id?: number; role?: string } | null;

// type AuthContextType = {
//   user: User;
//   isLoading: boolean;
//   login: (username: string, password: string) => Promise<User>;
//   logout: () => void;
//   refreshUserFromToken: () => Promise<User | null>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const TOKEN_KEY = "token";

// function readLocalToken(): string | null {
//   try {
//     return localStorage.getItem(TOKEN_KEY);
//   } catch {
//     return null;
//   }
// }
// function writeLocalToken(t: string | null) {
//   try {
//     if (t == null) localStorage.removeItem(TOKEN_KEY);
//     else localStorage.setItem(TOKEN_KEY, t);
//   } catch {
//     /* ignore */
//   }
// }
// function setAxiosAuthHeader(token: string | null) {
//   try {
//     (api as any).defaults.headers = (api as any).defaults.headers || {};
//     (api as any).defaults.headers.common = (api as any).defaults.headers.common || {};
//     if (token) (api as any).defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     else delete (api as any).defaults.headers.common["Authorization"];
//   } catch {
//     /* ignore */
//   }
// }

// const extractServerUser = (data: any): User => {
//   if (!data) return null;
//   const serverUser = data?.user ?? data?.admin ?? data?.data?.user ?? data?.data?.admin ?? null;
//   if (serverUser) {
//     return {
//       username: serverUser.username ?? serverUser.email ?? undefined,
//       name: serverUser.name ?? serverUser.fullName ?? undefined,
//       id: serverUser.id ?? serverUser.user_id ?? undefined,
//       role: serverUser.role ?? undefined,
//     };
//   }
//   // fallback top-level fields
//   return {
//     username: data?.username ?? data?.email ?? undefined,
//     name: data?.name ?? undefined,
//     id: data?.id ?? undefined,
//     role: data?.role ?? undefined,
//   };
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const lastTokenRef = useRef<string | null>(null);

//   const logout = () => {
//     writeLocalToken(null);
//     lastTokenRef.current = null;
//     setAxiosAuthHeader(null);
//     setUser(null);
//   };

//   // Refresh user using token (expects backend returns user when Authorization header present)
//   const refreshUser = async (): Promise<User | null> => {
//     setIsLoading(true);
//     try {
//       const res = await api.get("/login"); // adjust endpoint if your backend uses /me or /profile
//       const data = res?.data ?? null;
//       const sUser = extractServerUser(data);
//       if (sUser) {
//         setUser(sUser);
//         return sUser;
//       } else {
//         // server didn't return user -> token invalid
//         logout();
//         return null;
//       }
//     } catch (err) {
//       // treat as invalid token
//       logout();
//       return null;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // On mount: set axios header from localStorage BEFORE calling refresh
//   useEffect(() => {
//     (async () => {
//       setIsLoading(true);
//       try {
//         const token = readLocalToken();
//         lastTokenRef.current = token;
//         setAxiosAuthHeader(token);

//         if (!token) {
//           // no token: not authenticated
//           setUser(null);
//           setIsLoading(false);
//           return;
//         }

//         // try to refresh user using token (axios header already set)
//         await refreshUser();
//       } catch (err) {
//         console.warn("AuthProvider mount error", err);
//         logout();
//         setIsLoading(false);
//       }
//     })();
//     // run once
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Listen to storage events from OTHER tabs (sync token across tabs)
//   useEffect(() => {
//     const onStorage = (ev: StorageEvent) => {
//       if (ev.key !== TOKEN_KEY) return;
//       const newToken = ev.newValue;
//       lastTokenRef.current = newToken;
//       setAxiosAuthHeader(newToken);
//       if (!newToken) {
//         // logged out in other tab
//         setUser(null);
//       } else {
//         // token added/changed in other tab -> try refresh
//         (async () => {
//           setIsLoading(true);
//           try {
//             await refreshUser();
//           } finally {
//             setIsLoading(false);
//           }
//         })();
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // Polling fallback to detect same-tab token changes or removals (defensive)
//   useEffect(() => {
//     const id = window.setInterval(() => {
//       try {
//         const current = readLocalToken();
//         if (lastTokenRef.current && !current) {
//           // token removed
//           lastTokenRef.current = null;
//           setAxiosAuthHeader(null);
//           setUser(null);
//         } else if (!lastTokenRef.current && current) {
//           // token added in same tab
//           lastTokenRef.current = current;
//           setAxiosAuthHeader(current);
//           // attempt to refresh user
//           (async () => {
//             setIsLoading(true);
//             try {
//               await refreshUser();
//             } finally {
//               setIsLoading(false);
//             }
//           })();
//         } else if (current && lastTokenRef.current && current !== lastTokenRef.current) {
//           // token changed
//           lastTokenRef.current = current;
//           setAxiosAuthHeader(current);
//         }
//       } catch {
//         // ignore localStorage errors
//       }
//     }, 1000);
//     return () => clearInterval(id);
//   }, []);

//   const login = async (username: string, password: string): Promise<User> => {
//     setIsLoading(true);
//     try {
//       const res = await api.post(
//         "/login",
//         { username, password },
//         { headers: { "Content-Type": "application/json", Accept: "application/json" } }
//       );
//       const data = res?.data ?? {};

//       // Try common token shapes
//       const token =
//         data?.access_token ??
//         data?.accessToken ??
//         data?.token ??
//         data?.data?.access_token ??
//         data?.data?.token ??
//         data?.token_data?.access_token ??
//         data?.token_data?.token ??
//         (typeof data?.accessToken === "object" ? data?.accessToken?.token : null) ??
//         null;

//       if (!token) throw new Error("No token received from login response");

//       // Save token and set axios header immediately
//       writeLocalToken(token);
//       lastTokenRef.current = token;
//       setAxiosAuthHeader(token);

//       // Extract user and update state
//       const sUser = extractServerUser(data);
//       const newUser = sUser ?? { username };
//       setUser(newUser);

//       return newUser;
//     } catch (err: any) {
//       const msg = err?.response?.data?.message ?? err?.message ?? "Login failed";
//       throw new Error(msg);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const refreshUserFromToken = async (): Promise<User | null> => {
//     const token = readLocalToken();
//     if (!token) {
//       logout();
//       return null;
//     }
//     // ensure axios header set
//     setAxiosAuthHeader(token);
//     return refreshUser();
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


// src/context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../../api/axios"; // adjust path if necessary

type User = {
  id?: number | string;
  username?: string;
  name?: string;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;           // loading state while validating/refreshing
  isAuthenticated: boolean;     // convenience boolean
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUserFromToken: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Token key used in localStorage. Change if your backend uses another key.
 */
const TOKEN_KEY = "token";

/**
 * Helper: extract token from various server response shapes
 */
function extractTokenFromLoginResponse(data: any): string | null {
  if (!data) return null;
  const candidates = [
    data?.access_token,
    data?.accessToken,
    data?.token,
    data?.data?.access_token,
    data?.data?.token,
    data?.token_data?.access_token,
    data?.token_data?.token,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string") return c;
    if (typeof c === "object") {
      if (c.token) return String(c.token);
      if (c.access_token) return String(c.access_token);
    }
  }
  return null;
}

/**
 * Helper: extract user from server response (common shapes).
 */
function extractUserFromResponse(data: any): User {
  if (!data) return null;
  const serverUser = data?.user ?? data?.admin ?? data?.data?.user ?? data?.data?.admin ?? null;
  if (serverUser) {
    return {
      id: serverUser.id ?? serverUser.user_id ?? serverUser._id,
      username: serverUser.username ?? serverUser.email,
      name: serverUser.name ?? serverUser.fullName,
      role: serverUser.role,
    };
  }
  // fallback: maybe the top-level contains user info
  return {
    id: data?.id,
    username: data?.username ?? data?.email,
    name: data?.name,
    role: data?.role,
  };
}

/**
 * Set axios default header (keeps requests simple)
 */
function setAxiosTokenHeader(token: string | null) {
  try {
    if (token) {
      (api.defaults.headers as any).common = { ...(api.defaults.headers as any).common, Authorization: `Bearer ${token}` };
    } else {
      if ((api.defaults.headers as any).common) delete (api.defaults.headers as any).common.Authorization;
    }
  } catch {
    // ignore
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastTokenRef = useRef<string | null>(null);

  // Save token + update axios header + track last token
  const saveToken = (token: string | null) => {
    try {
      if (token == null) localStorage.removeItem(TOKEN_KEY);
      else localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn("localStorage write failed", e);
    }
    lastTokenRef.current = token;
    setAxiosTokenHeader(token);
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  // login: call server, store token, set user
  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post("/login", { username, password }, { headers: { Accept: "application/json" } });
      const data = res?.data ?? {};
      const token = extractTokenFromLoginResponse(data);
      if (!token) {
        // attempt fallback shapes
        throw new Error("No token returned from server");
      }
      saveToken(token);

      const u = extractUserFromResponse(data) ?? { username };
      setUser(u);
      return u;
    } catch (err: any) {
      // do not auto-logout here; login failed so ensure no token left behind
      saveToken(null);
      const message = err?.response?.data?.message ?? err?.message ?? "Login failed";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // refreshUserFromToken: validate token by calling server and return user object or null
  const refreshUserFromToken = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      let token: string | null = null;
      try {
        token = localStorage.getItem(TOKEN_KEY);
      } catch (e) {
        console.warn("localStorage read failed", e);
      }
      if (!token) {
        logout();
        return null;
      }
      // make sure axios header is set
      setAxiosTokenHeader(token);
      const res = await api.get("/login", { headers: { Accept: "application/json" } });
      const data = res?.data ?? null;
      const u = extractUserFromResponse(data);
      if (!u) {
        logout();
        return null;
      }
      setUser(u);
      return u;
    } catch (err) {
      // failed to validate token -> logout
      console.warn("refreshUserFromToken failed", err);
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // mount: restore token from storage, set header and try to refresh user
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let token: string | null = null;
      try {
        token = localStorage.getItem(TOKEN_KEY);
      } catch (e) {
        console.warn("localStorage read failed", e);
      }
      lastTokenRef.current = token;
      setAxiosTokenHeader(token);

      if (!token) {
        // no token -> not authenticated
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/login", { headers: { Accept: "application/json" } });
        const u = extractUserFromResponse(res?.data ?? null);
        if (u) {
          setUser(u);
        } else {
          logout();
        }
      } catch (err) {
        // treat as invalid token
        console.warn("Token validation failed at mount", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listen storage events (other tabs)
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== TOKEN_KEY) return;
      const newToken = ev.newValue;
      lastTokenRef.current = newToken;
      setAxiosTokenHeader(newToken);
      if (!newToken) {
        setUser(null);
      } else {
        // try refresh with the new token
        (async () => {
          setIsLoading(true);
          try {
            const res = await api.get("/login", { headers: { Accept: "application/json" } });
            const u = extractUserFromResponse(res?.data ?? null);
            if (u) setUser(u);
            else {
              setUser(null);
              saveToken(null);
            }
          } catch (err) {
            console.warn("storage event refresh failed", err);
            setUser(null);
            saveToken(null);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // polling fallback to detect token removal/changes in same tab
  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        const current = localStorage.getItem(TOKEN_KEY);
        if (lastTokenRef.current && !current) {
          // token removed -> logout
          lastTokenRef.current = null;
          setUser(null);
          setAxiosTokenHeader(null);
        } else if (!lastTokenRef.current && current) {
          // added in same tab -> set header and try refresh
          lastTokenRef.current = current;
          setAxiosTokenHeader(current);
          (async () => {
            try {
              const res = await api.get("/login", { headers: { Accept: "application/json" } });
              const u = extractUserFromResponse(res?.data ?? null);
              if (u) setUser(u);
              else {
                setUser(null);
                saveToken(null);
              }
            } catch {
              setUser(null);
              saveToken(null);
            }
          })();
        } else if (current && lastTokenRef.current && current !== lastTokenRef.current) {
          lastTokenRef.current = current;
          setAxiosTokenHeader(current);
        }
      } catch {
        // ignore localStorage errors
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUserFromToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};






