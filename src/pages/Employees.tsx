"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Mail, Phone, X, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Employee = {
  id: number | string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "Away" | "Offline";
  image?: string;
  meetingsToday?: number;
  lastSeen?: string;
  notes?: string;
};

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: "John Smith",
    role: "Sales Manager",
    email: "john@company.com",
    phone: "+91 98765 43210",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
    meetingsToday: 8,
    lastSeen: "10 minutes ago",
    notes: "Top performer this month. Focus on key accounts.",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Marketing Lead",
    email: "sarah@company.com",
    phone: "+91 98765 43211",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    meetingsToday: 5,
    lastSeen: "2 minutes ago",
    notes: "Working on the new campaign creative.",
  },
    {
    id: 1,
    name: "John Smith",
    role: "Sales Manager",
    email: "john@company.com",
    phone: "+91 98765 43210",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
    meetingsToday: 8,
    lastSeen: "10 minutes ago",
    notes: "Top performer this month. Focus on key accounts.",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Marketing Lead",
    email: "sarah@company.com",
    phone: "+91 98765 43211",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    meetingsToday: 5,
    lastSeen: "2 minutes ago",
    notes: "Working on the new campaign creative.",
  },
   {
    id: 2,
    name: "Sarah Johnson",
    role: "Marketing Lead",
    email: "sarah@company.com",
    phone: "+91 98765 43211",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    meetingsToday: 5,
    lastSeen: "2 minutes ago",
    notes: "Working on the new campaign creative.",
  },
];

const API_BASE = "http://localhost:4000/api";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // profile & add drawer state
  const [selected, setSelected] = useState<Employee | null>(null); // for profile
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileMounted, setIsProfileMounted] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);

  // form state
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    status: "Active" as Employee["status"],
    image: "",
    meetingsToday: "0",
    lastSeen: "",
    notes: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // PROFILE constants (used for push width)
  const PROFILE_WIDTH_PX = 384; // 24rem
  const PROFILE_TRANSITION_MS = 280;
  const profileTransform = isProfileOpen ? "translateX(0)" : `translateX(100%)`;
  // main margin to visually "push" when panel open
  const mainMarginRight = isProfileOpen ? `${PROFILE_WIDTH_PX}px` : "0px";

  // Mount/unmount add drawer (for nice animation & focus)
  useEffect(() => {
    if (isDrawerOpen) {
      setIsDrawerMounted(true);
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setIsDrawerMounted(false), 300);
      const r = setTimeout(() => addBtnRef.current?.focus(), 300);
      document.body.style.overflow = "";
      return () => {
        clearTimeout(t);
        clearTimeout(r);
      };
    }
  }, [isDrawerOpen]);

  // Mount/unmount profile drawer (keep mounted for animation)
  useEffect(() => {
    if (isProfileOpen) {
      setIsProfileMounted(true);
      setTimeout(() => profileRef.current?.focus(), 120);
    } else {
      const t = setTimeout(() => setIsProfileMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isProfileOpen]);

  // close on ESC and simple focus trap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isProfileOpen) setIsProfileOpen(false);
        if (isDrawerOpen) setIsDrawerOpen(false);
      }

      // focus trap logic (keeps tab inside drawer/panel)
      const trap = (ref: HTMLDivElement | null) => {
        if (!ref) return;
        const nodes = ref.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      if (isDrawerOpen) trap(drawerRef.current);
      if (isProfileOpen) trap(profileRef.current);
    };

    if (isDrawerOpen || isProfileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, isProfileOpen]);

  // view profile functions -> open as profile side column (push)
  const openProfile = (emp: Employee) => {
    setSelected(emp);
    setIsProfileOpen(true);
  };
  const closeProfile = () => {
    setIsProfileOpen(false);
    setTimeout(() => setSelected(null), 250);
  };

  // handle input change
  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  // validation
  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.role.trim()) e.role = "Role is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // fetch employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/employes`);
      if (!res.ok) {
        toast.error(`Failed to load employees (${res.status})`);
        console.error("Failed to fetch employes:", res.status);
        return;
      }
      const body = await res.json();
      if (body && Array.isArray(body.data)) setEmployees(body.data);
      else if (Array.isArray(body)) setEmployees(body);
      else console.warn("Unexpected employees response:", body);
    } catch (err) {
      console.error("Network error fetching employees:", err);
      toast.error("Network error while fetching employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // submit new employee
  const submitEmployee = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
      image: form.image?.trim() || undefined,
      meetingsToday: form.meetingsToday ? Number(form.meetingsToday) : 0,
      lastSeen: form.lastSeen?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/employes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (!res.ok) {
        if (body && body.errors && typeof body.errors === "object") {
          setErrors(body.errors);
          toast.error("Please fix the highlighted errors.");
        } else {
          toast.error(`Failed to add employee (${res.status})`);
        }
        return;
      }

      let newEmployee: Employee;
      if (body && body.data) newEmployee = body.data as Employee;
      else if (body && typeof body === "object") newEmployee = body as Employee;
      else
        newEmployee = {
          id: Date.now(),
          name: payload.name,
          role: payload.role,
          email: payload.email,
          phone: payload.phone,
          status: payload.status,
          image: payload.image,
          meetingsToday: payload.meetingsToday,
          lastSeen: payload.lastSeen,
          notes: payload.notes,
        };

      setEmployees((prev) => [newEmployee, ...prev]);
      toast.success("Employee added");
      setForm({
        name: "",
        role: "",
        email: "",
        phone: "",
        status: "Active",
        image: "",
        meetingsToday: "0",
        lastSeen: "",
        notes: "",
      });
      setIsDrawerOpen(false);
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error while adding employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  // delete employee
  const deleteEmployee = async (empId: number | string) => {
    const ok = window.confirm("Are you sure you want to delete this employee?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/employes/${empId}`, {
        method: "DELETE",
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      if (!res.ok) {
        console.error("Failed to delete employee", body || res.status);
        toast.error(`Failed to delete (${res.status})`);
        return;
      }

      setEmployees((prev) => prev.filter((e) => String(e.id) !== String(empId)));
      toast.success("Employee deleted");
    } catch (err) {
      console.error("Network error while deleting employee:", err);
      toast.error("Network error while deleting employee");
    }
  };
  return (
    <div className="relative">
      <div className="flex gap-4">
        <ToastContainer position="top-right" autoClose={3000} />
        {/* Main content column (flex-1) */}
        <main
          className="flex-1 space-y-6 transition-[margin] duration-300 ease-in-out min-w-0"
          style={{
            marginRight: mainMarginRight,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Employees</h1>
              <p className="text-sm text-muted-foreground">Manage your team members</p>
            </div>
            <Button
              ref={addBtnRef}
              className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-3 rounded-md shadow-sm"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent >
              <div className="max-w-[1100px] mx-auto px-2">
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 2fr))",
                  }}
                >
                  {isLoading ? (
                    <div className="col-span-full p-4 text-center text-muted-foreground">Loading employees...</div>
                  ) : employees.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-muted-foreground">No employees yet.</div>
                  ) : (
                    employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="p-3 rounded-md hover:shadow-md transition-shadow bg-card"
                        // style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <div
                          className="flex items-start gap-4 p-4 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200"
                          style={{ border: "0.5px solid rgba(0,0,0,0.08)" }}
                        >
                          <Avatar className="w-12 h-12 ring-2 ring-gray-200">
                            {employee.image ? (
                              <AvatarImage src={employee.image} alt={employee.name} />
                            ) : (
                              <AvatarFallback className="bg-chart-primary text-white text-sm">
                                {employee.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <h3 className="font-semibold text-base text-gray-800">{employee.name}</h3>
                                <p className="text-xs text-gray-500">{employee.role}</p>
                              </div>
                              <Badge
                                className="px-2 py-0.5 text-xs rounded-md"
                                variant={employee.status === "Active" ? "default" : "secondary"}
                              >
                                {employee.status}
                              </Badge>
                            </div>

                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="truncate">{employee.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{employee.phone}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-gray-300"
                                onClick={() => openProfile(employee)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-gray-300"
                                onClick={() => alert("Edit flow (implement)")}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-gray-300 text-red-500 hover:text-red-600 hover:border-red-400"
                                onClick={() => deleteEmployee(employee.id)}
                                title="Delete employee"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Drawer (unchanged) */}
          {isDrawerMounted && (
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Add employee drawer">
              <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsDrawerOpen(false)}
                aria-hidden="true"
              />

              <aside
                ref={drawerRef}
                className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full`}
                style={{ transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }}
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h3 className="text-lg font-semibold">Add Employee</h3>
                    <p className="text-sm text-muted-foreground">Enter employee details</p>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} aria-label="Close drawer" className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={submitEmployee} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                          ref={firstInputRef}
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? 'border-red-400' : 'border-muted'}`}
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Full name"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Role <span className="text-red-500">*</span></label>
                        <input
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.role ? 'border-red-400' : 'border-muted'}`}
                          value={form.role}
                          onChange={(e) => handleChange('role', e.target.value)}
                          placeholder="e.g. Developer"
                        />
                        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.email ? 'border-red-400' : 'border-muted'}`}
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="email@company.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                        <input
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.phone ? 'border-red-400' : 'border-muted'}`}
                          value={form.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="+91 99999 99999"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="block w-full border rounded-md p-2 focus:outline-none focus:ring">
                          <option value="Active">Active</option>
                          <option value="Away">Away</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Image URL</label>
                        <input
                          className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                          value={form.image}
                          onChange={(e) => handleChange('image', e.target.value)}
                          placeholder="Optional avatar URL"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Meetings Today</label>
                        <input
                          className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                          value={form.meetingsToday}
                          onChange={(e) => handleChange('meetingsToday', e.target.value)}
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Seen</label>
                        <input
                          className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                          value={form.lastSeen}
                          onChange={(e) => handleChange('lastSeen', e.target.value)}
                          placeholder="e.g. 2 hours ago"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        className="block w-full border rounded-md p-2 focus:outline-none focus:ring"
                        value={form.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button variant="ghost" onClick={() => { setIsDrawerOpen(false); }}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-chart-primary hover:bg-chart-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Employee'}
                      </Button>
                    </div>
                  </form>
                </div>
              </aside>
            </div>
          )}
        </main>

        {/* Profile side panel (push/collapsible) */}
        {isProfileMounted && selected && (
          <aside
            ref={profileRef}
            role="dialog"
            aria-modal="false"
            aria-label="Employee profile"
            className="fixed top-0 right-0 h-screen bg-background shadow-2xl overflow-auto"
            style={{
              width: PROFILE_WIDTH_PX,
              maxWidth: "100%",
              transform: profileTransform,
              transition: `transform ${PROFILE_TRANSITION_MS}ms ease`,
              pointerEvents: isProfileOpen ? "auto" : "none",
              zIndex: 50,
            }}
            tabIndex={-1}
          >
            <div
              className="h-full flex flex-col"
              style={{
                opacity: isProfileOpen ? 1 : 0,
                transition: `opacity ${PROFILE_TRANSITION_MS / 1.5}ms ease ${isProfileOpen ? "0ms" : "0ms"}`,
              }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    {selected.image ? <AvatarImage src={selected.image} alt={selected.name} /> : (
                      <AvatarFallback className="bg-chart-primary text-white text-sm">
                        {selected.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">{selected.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={selected.status === "Active" ? "default" : "secondary"}>{selected.status}</Badge>
                  <button onClick={closeProfile} className="p-2 rounded-md hover:bg-muted" aria-label="Close profile">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a className="text-sm text-foreground hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a className="text-sm text-foreground" href={`tel:${selected.phone}`}>{selected.phone}</a>
                  </div>
                  <div className="text-sm text-muted-foreground">Last seen: {selected.lastSeen ?? "—"}</div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Today</h4>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="rounded-md p-2 border w-28 text-center">
                      <div className="text-xs text-muted-foreground">Meetings</div>
                      <div className="text-lg font-semibold">{selected.meetingsToday ?? 0}</div>
                    </div>
                    <div className="rounded-md p-2 border w-28 text-center">
                      <div className="text-xs text-muted-foreground">Tasks</div>
                      <div className="text-lg font-semibold">—</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selected.notes ?? "No notes available."}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={() => alert(`Calling ${selected.phone}`)}>Call</Button>
                  <Button onClick={() => (window.location.href = `mailto:${selected.email}`)}>Send Email</Button>
                  <Button variant="outline" onClick={() => alert('Open full profile (implement)')}>Open Full Profile</Button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Employees;
