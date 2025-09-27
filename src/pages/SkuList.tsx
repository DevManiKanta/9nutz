// // src/pages/SkuList.tsx
// import React, { useEffect, useState } from "react";
// import { Plus, Edit3, Trash2, X } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "@/api/axios";

// type GstItem = {
//   id: string | number;
//   name: string;
//   percentage: number;
// };

// const SkuList: React.FC = () => {
//   const [items, setItems] = useState<GstItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editing, setEditing] = useState<GstItem | null>(null);
//   const [form, setForm] = useState({ name: "", percentage: "" });
//   const [errors, setErrors] = useState<{ name?: string; percentage?: string }>({});
//   const [deleteTarget, setDeleteTarget] = useState<GstItem | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   useEffect(() => {
//     void fetchItems();
//   }, []);

//   const normalizeRows = (rows: any[]): GstItem[] =>
//     rows.map((r, i) => ({
//       id: r.id ?? r._id ?? r.gst_id ?? r.gstId ?? `srv-${i}`,
//       name: r.name ?? "",
//       percentage: Number(r.percentage ?? r.percentage_percent ?? r.per ?? 0),
//     }));

//   const fetchItems = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/admin/settings/gst/show");
//       const body = res.data;
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else if (Array.isArray(body.rows)) rows = body.rows;
//       else if (Array.isArray(body.gsts)) rows = body.gsts;
//       else if (body && typeof body === "object" && Array.isArray(Object.values(body))) {
//         // fallback but keep safe
//         rows = body.data ?? [];
//       }
//       const normalized = normalizeRows(rows);
//       setItems(normalized);
//     } catch (err: any) {
//       console.error("Failed to load GSTs", err);
//       toast.error("Failed to load GST list");
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openAdd = () => {
//     setEditing(null);
//     setForm({ name: "", percentage: "" });
//     setErrors({});
//     setModalOpen(true);
//   };

//   const openEdit = (it: GstItem) => {
//     setEditing(it);
//     setForm({ name: it.name, percentage: String(it.percentage) });
//     setErrors({});
//     setModalOpen(true);
//   };

//   const validate = () => {
//     const e: typeof errors = {};
//     if (!form.name.trim()) e.name = "Name is required";
//     if (form.percentage === "" || form.percentage === null) e.percentage = "Percentage is required";
//     else if (isNaN(Number(form.percentage))) e.percentage = "Must be a number";
//     else if (Number(form.percentage) < 0) e.percentage = "Must be >= 0";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSave = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!validate()) {
//       toast.error("Fix validation errors");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = { name: form.name.trim(), percentage: Number(form.percentage) };
//       if (editing) {
//         const res = await api.post(`/admin/settings/gst/update/${editing.id}`, payload);
//         const body = res.data;
//         const updatedRaw = body?.data ?? body?.gst ?? body ?? null;
//         const updated: GstItem = {
//           id: updatedRaw?.id ?? editing.id,
//           name: updatedRaw?.name ?? payload.name,
//           percentage: Number(updatedRaw?.percentage ?? payload.percentage),
//         };
//         setItems((prev) => prev.map((p) => (String(p.id) === String(editing.id) ? updated : p)));
//         toast.success("GST updated");
//       } else {
//         const res = await api.post("/admin/settings/gst/add", payload);
//         const body = res.data;
//         const createdRaw = body?.data ?? body?.gst ?? body ?? null;
//         const created: GstItem = {
//           id: createdRaw?.id ?? createdRaw?._id ?? `tmp-${Date.now()}`,
//           name: createdRaw?.name ?? payload.name,
//           percentage: Number(createdRaw?.percentage ?? payload.percentage),
//         };
//         setItems((prev) => [created, ...prev]);
//         toast.success("GST added");
//       }
//       setModalOpen(false);
//       setEditing(null);
//       setForm({ name: "", percentage: "" });
//     } catch (err: any) {
//       console.error("Save GST error", err);
//       const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save";
//       toast.error(String(msg));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const confirmDelete = (it: GstItem) => {
//     setDeleteTarget(it);
//   };

//   const doDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     try {
//       await api.delete(`/admin/settings/gst/delete/${deleteTarget.id}`);
//       setItems((prev) => prev.filter((p) => String(p.id) !== String(deleteTarget.id)));
//       toast.success("GST deleted");
//     } catch (err: any) {
//       console.error("Delete error", err);
//       const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete";
//       toast.error(String(msg));
//     } finally {
//       setDeleteLoading(false);
//       setDeleteTarget(null);
//     }
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <h2 className="text-2xl font-semibold">GST Management</h2>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={openAdd}
//             className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700"
//           >
//             <Plus className="w-4 h-4" />
//             Add GST
//           </button>
//           <button
//             onClick={() => void fetchItems()}
//             className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//         <div className="hidden md:block">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="px-4 py-3">Name</th>
//                 <th className="px-4 py-3">Percentage (%)</th>
//                 <th className="px-4 py-3 w-40">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
//                     Loading…
//                   </td>
//                 </tr>
//               ) : items.length === 0 ? (
//                 <tr>
//                   <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
//                     No GST entries found.
//                   </td>
//                 </tr>
//               ) : (
//                 items.map((it) => (
//                   <tr key={String(it.id)} className="border-t hover:bg-slate-50">
//                     <td className="px-4 py-3">{it.name}</td>
//                     <td className="px-4 py-3">{it.percentage}%</td>
//                     <td className="px-4 py-3">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => openEdit(it)}
//                           className="px-3 py-1 rounded border inline-flex items-center gap-2"
//                         >
//                           <Edit3 className="w-4 h-4" />
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => confirmDelete(it)}
//                           className="px-3 py-1 rounded bg-red-600 text-white inline-flex items-center gap-2"
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

//         <div className="md:hidden p-4 grid gap-3">
//           {loading ? (
//             <div className="text-center text-slate-500">Loading…</div>
//           ) : items.length === 0 ? (
//             <div className="text-center text-slate-500">No GST entries found.</div>
//           ) : (
//             items.map((it) => (
//               <div key={String(it.id)} className="border rounded-lg p-3 flex items-center justify-between">
//                 <div>
//                   <div className="font-medium">{it.name}</div>
//                   <div className="text-sm text-slate-500">{it.percentage}%</div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button onClick={() => openEdit(it)} className="p-2 border rounded">
//                     <Edit3 className="w-4 h-4" />
//                   </button>
//                   <button onClick={() => confirmDelete(it)} className="p-2 rounded bg-red-600 text-white">
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {modalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
//           <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-medium">{editing ? "Edit GST" : "Add GST"}</h3>
//               <button onClick={() => setModalOpen(false)} className="p-2 rounded hover:bg-slate-100">
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//             <form onSubmit={handleSave} className="p-4 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Name</label>
//                 <input
//                   value={form.name}
//                   onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
//                   className="w-full border rounded px-3 py-2"
//                   placeholder="e.g. GST Standard"
//                 />
//                 {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Percentage</label>
//                 <input
//                   value={form.percentage}
//                   onChange={(e) => setForm((s) => ({ ...s, percentage: e.target.value }))}
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   className="w-full border rounded px-3 py-2"
//                   placeholder="e.g. 18"
//                 />
//                 {errors.percentage && <div className="text-xs text-red-500 mt-1">{errors.percentage}</div>}
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setModalOpen(false);
//                     setEditing(null);
//                   }}
//                   className="px-4 py-2 rounded border"
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white">
//                   {saving ? "Saving…" : editing ? "Update" : "Add"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
//           <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10 p-5">
//             <h3 className="text-lg font-medium">Confirm delete</h3>
//             <p className="text-sm text-slate-600 mt-2">
//               Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
//             </p>
//             <div className="mt-4 flex justify-end gap-2">
//               <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading} className="px-3 py-1 rounded border">
//                 Cancel
//               </button>
//               <button
//                 onClick={() => void doDelete()}
//                 disabled={deleteLoading}
//                 className="px-3 py-1 rounded bg-red-600 text-white"
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

// export default SkuList;
// src/pages/SkuList.tsx



import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/api/axios";

type GstItem = {
  id: string | number;
  name: string;
  percentage: number;
};

const SkuList: React.FC = () => {
  const [items, setItems] = useState<GstItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<GstItem | null>(null);
  const [form, setForm] = useState({ name: "", percentage: "" });
  const [errors, setErrors] = useState<{ name?: string; percentage?: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<GstItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search + Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 👈 adjust as needed

  useEffect(() => {
    void fetchItems();
  }, []);

  // keep page in range when items or search change
  useEffect(() => {
    const filtered = getFiltered(items, searchTerm);
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [items, searchTerm]);

  const normalizeRows = (rows: any[]): GstItem[] =>
    rows.map((r, i) => ({
      id: r.id ?? r._id ?? r.gst_id ?? r.gstId ?? `srv-${i}`,
      name: r.name ?? "",
      percentage: Number(r.percentage ?? r.percentage_percent ?? r.per ?? 0),
    }));

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings/gst/show");
      const body = res.data;
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else if (Array.isArray(body.gsts)) rows = body.gsts;
      else if (body && typeof body === "object" && Array.isArray(Object.values(body))) {
        rows = body.data ?? [];
      }
      const normalized = normalizeRows(rows);
      setItems(normalized);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Failed to load GSTs", err);
      toast.error("Failed to load GST list");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", percentage: "" });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (it: GstItem) => {
    setEditing(it);
    setForm({ name: it.name, percentage: String(it.percentage) });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.percentage === "" || form.percentage === null) e.percentage = "Percentage is required";
    else if (isNaN(Number(form.percentage))) e.percentage = "Must be a number";
    else if (Number(form.percentage) < 0) e.percentage = "Must be >= 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error("Fix validation errors");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), percentage: Number(form.percentage) };
      if (editing) {
        const res = await api.post(`/admin/settings/gst/update/${editing.id}`, payload);
        const body = res.data;
        const updatedRaw = body?.data ?? body?.gst ?? body ?? null;
        const updated: GstItem = {
          id: updatedRaw?.id ?? editing.id,
          name: updatedRaw?.name ?? payload.name,
          percentage: Number(updatedRaw?.percentage ?? payload.percentage),
        };
        setItems((prev) => prev.map((p) => (String(p.id) === String(editing.id) ? updated : p)));
        toast.success("GST updated");
      } else {
        const res = await api.post("/admin/settings/gst/add", payload);
        const body = res.data;
        const createdRaw = body?.data ?? body?.gst ?? body ?? null;
        const created: GstItem = {
          id: createdRaw?.id ?? createdRaw?._id ?? `tmp-${Date.now()}`,
          name: createdRaw?.name ?? payload.name,
          percentage: Number(createdRaw?.percentage ?? payload.percentage),
        };
        setItems((prev) => [created, ...prev]);
        // after adding, show first page so user sees the new item
        setCurrentPage(1);
        toast.success("GST added");
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: "", percentage: "" });
    } catch (err: any) {
      console.error("Save GST error", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (it: GstItem) => {
    setDeleteTarget(it);
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/settings/gst/delete/${deleteTarget.id}`);
      setItems((prev) => prev.filter((p) => String(p.id) !== String(deleteTarget.id)));
      // adjust page if deletion emptied last page
      setCurrentPage((p) => {
        const filtered = getFiltered(items.filter((p) => String(p.id) !== String(deleteTarget.id)), searchTerm);
        const pages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
        return Math.min(p, pages);
      });
      toast.success("GST deleted");
    } catch (err: any) {
      console.error("Delete error", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete";
      toast.error(String(msg));
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // Search + pagination helpers
  function getFiltered(list: GstItem[], term: string) {
    const q = term.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (it) =>
        String(it.name ?? "").toLowerCase().includes(q) ||
        String(it.percentage ?? "").toLowerCase().includes(q)
    );
  }

  const filteredItems = getFiltered(items, searchTerm);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">GST Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add GST
          </button>
          <button
            onClick={() => void fetchItems()}
            className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50"
          >
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
          placeholder="Search GST by name or percentage"
          className="w-full md:w-1/2 border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Percentage (%)</th>
                <th className="px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    No GST entries found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((it) => (
                  <tr key={String(it.id)} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3">{it.name}</td>
                    <td className="px-4 py-3">{it.percentage}%</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(it)}
                          className="px-3 py-1 rounded border inline-flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(it)}
                          className="px-3 py-1 rounded bg-red-600 text-white inline-flex items-center gap-2"
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

        <div className="md:hidden p-4 grid gap-3">
          {loading ? (
            <div className="text-center text-slate-500">Loading…</div>
          ) : paginatedItems.length === 0 ? (
            <div className="text-center text-slate-500">No GST entries found.</div>
          ) : (
            paginatedItems.map((it) => (
              <div key={String(it.id)} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-slate-500">{it.percentage}%</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(it)} className="p-2 border rounded">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirmDelete(it)} className="p-2 rounded bg-red-600 text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredItems.length > 0 && (
        <div className="flex justify-flex-end items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Existing modals remain unchanged */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{editing ? "Edit GST" : "Add GST"}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. GST Standard"
                />
                {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Percentage</label>
                <input
                  value={form.percentage}
                  onChange={(e) => setForm((s) => ({ ...s, percentage: e.target.value }))}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. 18"
                />
                {errors.percentage && <div className="text-xs text-red-500 mt-1">{errors.percentage}</div>}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white">
                  {saving ? "Saving…" : editing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10 p-5">
            <h3 className="text-lg font-medium">Confirm delete</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading} className="px-3 py-1 rounded border">
                Cancel
              </button>
              <button
                onClick={() => void doDelete()}
                disabled={deleteLoading}
                className="px-3 py-1 rounded bg-red-600 text-white"
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

export default SkuList;

