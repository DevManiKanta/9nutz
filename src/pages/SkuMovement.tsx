// "use client";

// import React, { useEffect, useState } from "react";
// import { Plus, Edit3, Trash2, X, RefreshCw } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "@/api/axios";
// import type { AxiosError } from "axios";

// type Vendor = {
//   id: string | number;
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
// };

// const SkuMovement: React.FC = () => {
//   const [vendors, setVendors] = useState<Vendor[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editing, setEditing] = useState<Vendor | null>(null);
//   const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
//   const [errors, setErrors] = useState<{ [k: string]: string }>({});
//   const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   useEffect(() => {
//     void fetchVendors();
//   }, []);

//   // Helper: robust error formatter for Axios/pure errors
//   function formatAxiosError(err: unknown) {
//     // default fallback
//     const fallback = { message: "An unknown error occurred", details: null as any, status: undefined as number | undefined };
//     try {
//       if (!err) return fallback;

//       // AxiosError shape
//       const ae = err as AxiosError & { response?: any; request?: any };
//       if (ae && (ae.isAxiosError || ae.response || ae.request)) {
//         const status = ae.response?.status;
//         // prefer message from response payload
//         const data = ae.response?.data;
//         let message = ae.message || "Request failed";
//         // common server message fields
//         if (data) {
//           if (typeof data === "string") message = data;
//           else if (data.message) message = data.message;
//           else if (data.error) message = data.error;
//           else if (data.errors && typeof data.errors === "string") message = data.errors;
//           // else keep ae.message
//         }
//         return { message: String(message), details: data ?? ae.response ?? ae.request ?? ae.stack, status };
//       }

//       // plain Error
//       if (err instanceof Error) {
//         return { message: err.message, details: err.stack, status: undefined };
//       }

//       // unknown object or string
//       if (typeof err === "string") return { message: err, details: null, status: undefined };
//       return { message: "Unknown error", details: JSON.stringify(err), status: undefined };
//     } catch (parseErr) {
//       return { message: "Error while parsing error", details: parseErr, status: undefined };
//     }
//   }

//   const fetchVendors = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/admin/settings/vendors/show");
//       const body = res.data;
//       const rows: Vendor[] = Array.isArray(body)
//         ? body
//         : body?.data ?? body?.vendors ?? [];
//       setVendors(rows);
//     } catch (err: unknown) {
//       const { message, details, status } = formatAxiosError(err);
//       console.error("Failed to load vendors:", { message, status, details, raw: err });
//       // user friendly message
//       if (status === 401) {
//         toast.error("Unauthorized — please login again.");
//         // optionally: logout or redirect
//       } else {
//         toast.error(message || "Failed to load vendor list");
//       }
//       setVendors([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openAdd = () => {
//     setEditing(null);
//     setForm({ name: "", email: "", phone: "", address: "" });
//     setErrors({});
//     setModalOpen(true);
//   };

//   const openEdit = (it: Vendor) => {
//     setEditing(it);
//     setForm({
//       name: it.name,
//       email: it.email,
//       phone: it.phone,
//       address: it.address,
//     });
//     setErrors({});
//     setModalOpen(true);
//   };

//   const validate = () => {
//     const e: { [k: string]: string } = {};
//     if (!form.name.trim()) e.name = "Name is required";
//     if (!form.email.trim()) e.email = "Email is required";
//     if (!form.phone.trim()) e.phone = "Phone is required";
//     if (!form.address.trim()) e.address = "Address is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // attempt to extract form-field errors from server response (common shapes)
//   function extractFieldErrors(responseData: any): { [k: string]: string } | null {
//     if (!responseData) return null;
//     // Laravel-style: errors: { field: [msg, ...] }
//     if (responseData.errors && typeof responseData.errors === "object") {
//       const out: { [k: string]: string } = {};
//       for (const k of Object.keys(responseData.errors)) {
//         const val = responseData.errors[k];
//         if (Array.isArray(val)) out[k] = String(val[0]);
//         else out[k] = String(val);
//       }
//       return out;
//     }
//     // Generic validation object
//     if (responseData.validation && typeof responseData.validation === "object") {
//       const out: { [k: string]: string } = {};
//       for (const k of Object.keys(responseData.validation)) {
//         const val = responseData.validation[k];
//         out[k] = Array.isArray(val) ? String(val[0]) : String(val);
//       }
//       return out;
//     }
//     // Field-level messages (e.g. { name: "required", email: "invalid" })
//     const possibleFields = ["name", "email", "phone", "address"];
//     const out: { [k: string]: string } = {};
//     let found = false;
//     for (const f of possibleFields) {
//       if (responseData[f]) {
//         out[f] = String(responseData[f]);
//         found = true;
//       }
//     }
//     return found ? out : null;
//   }

//   const handleSave = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!validate()) {
//       toast.error("Fix validation errors");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = {
//         name: form.name.trim(),
//         email: form.email.trim(),
//         phone: form.phone.trim(),
//         address: form.address.trim(),
//       };

//       if (editing) {
//         const res = await api.post(`/admin/settings/vendors/update/${editing.id}`, payload);
//         const updated = res.data?.data ?? res.data?.vendor ?? payload;
//         setVendors((prev) =>
//           prev.map((v) =>
//             String(v.id) === String(editing.id)
//               ? { ...editing, ...updated }
//               : v
//           )
//         );
//         toast.success("Vendor updated");
//       } else {
//         const res = await api.post("/admin/settings/vendors/add", payload);
//         const created = res.data?.data ?? res.data?.vendor ?? payload;
//         setVendors((prev) => [created, ...prev]);
//         toast.success("Vendor added");
//       }

//       setModalOpen(false);
//       setEditing(null);
//       setForm({ name: "", email: "", phone: "", address: "" });
//     } catch (err: unknown) {
//       const { message, details, status } = formatAxiosError(err);
//       console.error("Save vendor error:", { message, status, details, raw: err });

//       // try to extract field-level validation errors (if any)
//       let fieldErrors: { [k: string]: string } | null = null;
//       try {
//         const ae = err as AxiosError & { response?: any };
//         fieldErrors = extractFieldErrors(ae?.response?.data ?? null);
//       } catch (_) {
//         fieldErrors = null;
//       }
//       if (fieldErrors) {
//         setErrors((prev) => ({ ...prev, ...fieldErrors }));
//         toast.error("Validation error — check the form fields");
//       } else {
//         const short = message ?? "Failed to save";
//         toast.error(short);
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const confirmDelete = (it: Vendor) => setDeleteTarget(it);

//   const doDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     try {
//       await api.delete(`/admin/settings/vendors/delete/${deleteTarget.id}`);
//       setVendors((prev) =>
//         prev.filter((v) => String(v.id) !== String(deleteTarget.id))
//       );
//       toast.success("Vendor deleted");
//     } catch (err: unknown) {
//       const { message, details, status } = formatAxiosError(err);
//       console.error("Delete vendor error:", { message, status, details, raw: err });
//       toast.error(message ?? "Failed to delete");
//     } finally {
//       setDeleteLoading(false);
//       setDeleteTarget(null);
//     }
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <Toaster position="top-right" />
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <h2 className="text-2xl font-semibold text-slate-800">Vendor Management</h2>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={openAdd}
//             className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
//           >
//             <Plus className="w-4 h-4" />
//             Add Vendor
//           </button>
//           <button
//             onClick={() => void fetchVendors()}
//             className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-slate-50 transition"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Table (desktop) */}
//       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//         <div className="hidden md:block">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="px-4 py-3">Name</th>
//                 <th className="px-4 py-3">Email</th>
//                 <th className="px-4 py-3">Phone</th>
//                 <th className="px-4 py-3">Address</th>
//                 <th className="px-4 py-3 w-40">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
//                     Loading…
//                   </td>
//                 </tr>
//               ) : vendors.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
//                     No vendors found.
//                   </td>
//                 </tr>
//               ) : (
//                 vendors.map((it) => (
//                   <tr key={String(it.id)} className="border-t hover:bg-slate-50 transition">
//                     <td className="px-4 py-3">{it.name}</td>
//                     <td className="px-4 py-3">{it.email}</td>
//                     <td className="px-4 py-3">{it.phone}</td>
//                     <td className="px-4 py-3">{it.address}</td>
//                     <td className="px-4 py-3">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => openEdit(it)}
//                           className="px-3 py-1 rounded border inline-flex items-center gap-2 hover:bg-slate-100 transition"
//                         >
//                           <Edit3 className="w-4 h-4" />
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => confirmDelete(it)}
//                           className="px-3 py-1 rounded bg-red-600 text-white inline-flex items-center gap-2 hover:bg-red-700 transition"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Cards (mobile) */}
//         <div className="md:hidden p-4 grid gap-3">
//           {loading ? (
//             <div className="text-center text-slate-500">Loading…</div>
//           ) : vendors.length === 0 ? (
//             <div className="text-center text-slate-500">No vendors found.</div>
//           ) : (
//             vendors.map((it) => (
//               <div
//                 key={String(it.id)}
//                 className="border rounded-lg p-3 flex flex-col gap-2 hover:bg-slate-50 transition"
//               >
//                 <div className="font-medium">{it.name}</div>
//                 <div className="text-sm text-slate-600">{it.email}</div>
//                 <div className="text-sm text-slate-600">{it.phone}</div>
//                 <div className="text-sm text-slate-600">{it.address}</div>
//                 <div className="flex gap-2 mt-2">
//                   <button onClick={() => openEdit(it)} className="flex-1 p-2 border rounded hover:bg-slate-100">
//                     <Edit3 className="w-4 h-4 inline" /> Edit
//                   </button>
//                   <button
//                     onClick={() => confirmDelete(it)}
//                     className="flex-1 p-2 rounded bg-red-600 text-white hover:bg-red-700"
//                   >
//                     <Trash2 className="w-4 h-4 inline" /> Delete
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Modal Add/Edit */}
//       {modalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
//           <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-medium">{editing ? "Edit Vendor" : "Add Vendor"}</h3>
//               <button onClick={() => setModalOpen(false)} className="p-2 rounded hover:bg-slate-100">
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//             <form onSubmit={handleSave} className="p-4 space-y-4">
//               {["name", "email", "phone", "address"].map((field) => (
//                 <div key={field}>
//                   <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
//                   <input
//                     value={(form as any)[field]}
//                     onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
//                     className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
//                     placeholder={`Enter ${field}`}
//                   />
//                   {errors[field] && <div className="text-xs text-red-500 mt-1">{errors[field]}</div>}
//                 </div>
//               ))}

//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setModalOpen(false);
//                     setEditing(null);
//                   }}
//                   className="px-4 py-2 rounded border hover:bg-slate-100"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
//                 >
//                   {saving ? "Saving…" : editing ? "Update" : "Add"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete confirmation */}
//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
//           <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10 p-5">
//             <h3 className="text-lg font-medium">Confirm delete</h3>
//             <p className="text-sm text-slate-600 mt-2">
//               Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
//             </p>
//             <div className="mt-4 flex justify-end gap-2">
//               <button
//                 onClick={() => setDeleteTarget(null)}
//                 disabled={deleteLoading}
//                 className="px-3 py-1 rounded border hover:bg-slate-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => void doDelete()}
//                 disabled={deleteLoading}
//                 className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
//               >
//                 {deleteLoading ? "Deleting…" : "Yes, delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default SkuMovement;
"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/api/axios";
import type { AxiosError } from "axios";

type Vendor = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  address: string;
};

const SkuMovement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search + Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    void fetchVendors();
  }, []);

  // clamp currentPage when vendors/search results change
  useEffect(() => {
    setCurrentPage((p) => {
      const filtered = getFiltered(vendors, searchTerm);
      const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
      return Math.min(p, totalPages);
    });
  }, [vendors, searchTerm]);

  // Helper: robust error formatter for Axios/pure errors
  function formatAxiosError(err: unknown) {
    // default fallback
    const fallback = { message: "An unknown error occurred", details: null as any, status: undefined as number | undefined };
    try {
      if (!err) return fallback;

      // AxiosError shape
      const ae = err as AxiosError & { response?: any; request?: any };
      if (ae && (ae.isAxiosError || ae.response || ae.request)) {
        const status = ae.response?.status;
        // prefer message from response payload
        const data = ae.response?.data;
        let message = ae.message || "Request failed";
        // common server message fields
        if (data) {
          if (typeof data === "string") message = data;
          else if (data.message) message = data.message;
          else if (data.error) message = data.error;
          else if (data.errors && typeof data.errors === "string") message = data.errors;
          // else keep ae.message
        }
        return { message: String(message), details: data ?? ae.response ?? ae.request ?? ae.stack, status };
      }

      // plain Error
      if (err instanceof Error) {
        return { message: err.message, details: err.stack, status: undefined };
      }

      // unknown object or string
      if (typeof err === "string") return { message: err, details: null, status: undefined };
      return { message: "Unknown error", details: JSON.stringify(err), status: undefined };
    } catch (parseErr) {
      return { message: "Error while parsing error", details: parseErr, status: undefined };
    }
  }

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings/vendors/show");
      const body = res.data;
      const rows: Vendor[] = Array.isArray(body)
        ? body
        : body?.data ?? body?.vendors ?? [];
      setVendors(rows);
      setCurrentPage(1);
    } catch (err: unknown) {
      const { message, details, status } = formatAxiosError(err);
      console.error("Failed to load vendors:", { message, status, details, raw: err });
      // user friendly message
      if (status === 401) {
        toast.error("Unauthorized — please login again.");
        // optionally: logout or redirect
      } else {
        toast.error(message || "Failed to load vendor list");
      }
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", address: "" });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (it: Vendor) => {
    setEditing(it);
    setForm({
      name: it.name,
      email: it.email,
      phone: it.phone,
      address: it.address,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // attempt to extract form-field errors from server response (common shapes)
  function extractFieldErrors(responseData: any): { [k: string]: string } | null {
    if (!responseData) return null;
    // Laravel-style: errors: { field: [msg, ...] }
    if (responseData.errors && typeof responseData.errors === "object") {
      const out: { [k: string]: string } = {};
      for (const k of Object.keys(responseData.errors)) {
        const val = responseData.errors[k];
        if (Array.isArray(val)) out[k] = String(val[0]);
        else out[k] = String(val);
      }
      return out;
    }
    // Generic validation object
    if (responseData.validation && typeof responseData.validation === "object") {
      const out: { [k: string]: string } = {};
      for (const k of Object.keys(responseData.validation)) {
        const val = responseData.validation[k];
        out[k] = Array.isArray(val) ? String(val[0]) : String(val);
      }
      return out;
    }
    // Field-level messages (e.g. { name: "required", email: "invalid" })
    const possibleFields = ["name", "email", "phone", "address"];
    const out: { [k: string]: string } = {};
    let found = false;
    for (const f of possibleFields) {
      if (responseData[f]) {
        out[f] = String(responseData[f]);
        found = true;
      }
    }
    return found ? out : null;
  }

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error("Fix validation errors");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (editing) {
        const res = await api.post(`/admin/settings/vendors/update/${editing.id}`, payload);
        const updated = res.data?.data ?? res.data?.vendor ?? payload;
        setVendors((prev) =>
          prev.map((v) =>
            String(v.id) === String(editing.id)
              ? { ...editing, ...updated }
              : v
          )
        );
        toast.success("Vendor updated");
      } else {
        const res = await api.post("/admin/settings/vendors/add", payload);
        const created = res.data?.data ?? res.data?.vendor ?? payload;
        setVendors((prev) => [created, ...prev]);
        // if adding item pushes to earlier pages, reset to page 1 so user sees new item
        setCurrentPage(1);
        toast.success("Vendor added");
      }

      setModalOpen(false);
      setEditing(null);
      setForm({ name: "", email: "", phone: "", address: "" });
    } catch (err: unknown) {
      const { message, details, status } = formatAxiosError(err);
      console.error("Save vendor error:", { message, status, details, raw: err });

      // try to extract field-level validation errors (if any)
      let fieldErrors: { [k: string]: string } | null = null;
      try {
        const ae = err as AxiosError & { response?: any };
        fieldErrors = extractFieldErrors(ae?.response?.data ?? null);
      } catch (_) {
        fieldErrors = null;
      }
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        toast.error("Validation error — check the form fields");
      } else {
        const short = message ?? "Failed to save";
        toast.error(short);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (it: Vendor) => setDeleteTarget(it);

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/settings/vendors/delete/${deleteTarget.id}`);
      setVendors((prev) =>
        prev.filter((v) => String(v.id) !== String(deleteTarget.id))
      );
      toast.success("Vendor deleted");
      // adjust current page if needed
      setCurrentPage((p) => {
        const filtered = getFiltered(vendors.filter((v) => String(v.id) !== String(deleteTarget.id)), searchTerm);
        const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
        return Math.min(p, totalPages);
      });
    } catch (err: unknown) {
      const { message, details, status } = formatAxiosError(err);
      console.error("Delete vendor error:", { message, status, details, raw: err });
      toast.error(message ?? "Failed to delete");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // ---------- Search & Pagination helpers ----------
  function getFiltered(list: Vendor[], term: string) {
    const q = term.trim().toLowerCase();
    if (!q) return list;
    return list.filter((v) =>
      String(v.name ?? "").toLowerCase().includes(q) ||
      String(v.email ?? "").toLowerCase().includes(q) ||
      String(v.phone ?? "").toLowerCase().includes(q) ||
      String(v.address ?? "").toLowerCase().includes(q)
    );
  }

  const filteredVendors = getFiltered(vendors, searchTerm);
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / itemsPerPage));
  const paginatedVendors = filteredVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ---------- End helpers ----------

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Vendor Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
          <button
            onClick={() => void fetchVendors()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search vendors by name, email, phone or address"
          className="w-full md:w-1/2 border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
        />
      </div>

      {/* Table (desktop) */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No vendors found.
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((it) => (
                  <tr key={String(it.id)} className="border-t hover:bg-slate-50 transition">
                    <td className="px-4 py-3">{it.name}</td>
                    <td className="px-4 py-3">{it.email}</td>
                    <td className="px-4 py-3">{it.phone}</td>
                    <td className="px-4 py-3">{it.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(it)}
                          className="px-3 py-1 rounded border inline-flex items-center gap-2 hover:bg-slate-100 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(it)}
                          className="px-3 py-1 rounded bg-red-600 text-white inline-flex items-center gap-2 hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden p-4 grid gap-3">
          {loading ? (
            <div className="text-center text-slate-500">Loading…</div>
          ) : paginatedVendors.length === 0 ? (
            <div className="text-center text-slate-500">No vendors found.</div>
          ) : (
            paginatedVendors.map((it) => (
              <div
                key={String(it.id)}
                className="border rounded-lg p-3 flex flex-col gap-2 hover:bg-slate-50 transition"
              >
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-slate-600">{it.email}</div>
                <div className="text-sm text-slate-600">{it.phone}</div>
                <div className="text-sm text-slate-600">{it.address}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(it)} className="flex-1 p-2 border rounded hover:bg-slate-100">
                    <Edit3 className="w-4 h-4 inline" /> Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(it)}
                    className="flex-1 p-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 inline" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredVendors.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-600">
            Showing {(filteredVendors.length === 0) ? 0 : ( (currentPage - 1) * itemsPerPage + 1 )} - {Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {/* page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded ${isActive ? "bg-slate-100" : ""}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{editing ? "Edit Vendor" : "Add Vendor"}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              {["name", "email", "phone", "address"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
                  <input
                    value={(form as any)[field]}
                    onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
                    placeholder={`Enter ${field}`}
                  />
                  {errors[field] && <div className="text-xs text-red-500 mt-1">{errors[field]}</div>}
                </div>
              ))}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 rounded border hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {saving ? "Saving…" : editing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10 p-5">
            <h3 className="text-lg font-medium">Confirm delete</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-3 py-1 rounded border hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => void doDelete()}
                disabled={deleteLoading}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {deleteLoading ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SkuMovement;

