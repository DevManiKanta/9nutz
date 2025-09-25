

// import React, { useEffect, useState } from "react";
// import { Plus, Edit3, Trash2, X, RefreshCw } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "@/api/axios";
// import type { AxiosError } from "axios";

// type Inventory = {
//   id: string | number;
//   product_id: string | number;
//   quantity: number;
//   type: "in" | "out" | string;
//   vendor_id?: string | number | null;
//   note?: string | null;
//   created_at?: string | null;
//   updated_at?: string | null;
// };

// /**
//  * Form shape
//  */
// type FormState = {
//   product_id: string;
//   quantity: string; // keep as string for input and convert when sending
//   type: string;
//   vendor_id: string;
//   note: string;
// };

// const defaultForm: FormState = { product_id: "", quantity: "0", type: "in", vendor_id: "", note: "" };

// /* ----------------------
//    Error helpers (robust)
//    ---------------------- */
// function formatAxiosError(err: unknown) {
//   const fallback = { message: "An unknown error occurred", details: null as any, status: undefined as number | undefined };
//   try {
//     if (!err) return fallback;
//     const ae = err as AxiosError & { response?: any; request?: any };
//     if (ae && (ae.isAxiosError || ae.response || ae.request)) {
//       const status = ae.response?.status;
//       const data = ae.response?.data;
//       let message = ae.message || "Request failed";
//       if (data) {
//         if (typeof data === "string") message = data;
//         else if (data.message) message = data.message;
//         else if (data.error) message = data.error;
//         else if (data.errors && typeof data.errors === "string") message = data.errors;
//       }
//       return { message: String(message), details: data ?? ae.response ?? ae.request ?? ae.stack, status };
//     }
//     if (err instanceof Error) return { message: err.message, details: err.stack, status: undefined };
//     if (typeof err === "string") return { message: err, details: null, status: undefined };
//     return { message: "Unknown error", details: JSON.stringify(err), status: undefined };
//   } catch (e) {
//     return { message: "Error while parsing error", details: e, status: undefined };
//   }
// }

// /**
//  * Try to extract field-level validation errors from the server response.
//  */
// function extractFieldErrors(responseData: any): Record<string, string> | null {
//   if (!responseData) return null;
//   if (responseData.errors && typeof responseData.errors === "object") {
//     const out: Record<string, string> = {};
//     for (const k of Object.keys(responseData.errors)) {
//       const v = responseData.errors[k];
//       out[k] = Array.isArray(v) ? String(v[0]) : String(v);
//     }
//     return out;
//   }
//   if (responseData.validation && typeof responseData.validation === "object") {
//     const out: Record<string, string> = {};
//     for (const k of Object.keys(responseData.validation)) {
//       const v = responseData.validation[k];
//       out[k] = Array.isArray(v) ? String(v[0]) : String(v);
//     }
//     return out;
//   }
//   const possible = ["product_id", "quantity", "type", "vendor_id", "note"];
//   const out: Record<string, string> = {};
//   let found = false;
//   for (const f of possible) {
//     if (responseData[f]) {
//       out[f] = String(responseData[f]);
//       found = true;
//     }
//   }
//   return found ? out : null;
// }

// /* -------------------------
//    Inventory component
//    ------------------------- */
// const InventoryManager: React.FC = () => {
//   const [items, setItems] = useState<Inventory[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState<Inventory | null>(null);
//   const [form, setForm] = useState<FormState>(defaultForm);
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//   const [saving, setSaving] = useState(false);

//   const [deleteTarget, setDeleteTarget] = useState<Inventory | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   // products from API (for dropdown)
//   const [products, setProducts] = useState<any[]>([]);
//   const [productsLoading, setProductsLoading] = useState(false);

//   // vendors from API (for vendor dropdown)
//   const [vendors, setVendors] = useState<any[]>([]);
//   const [vendorsLoading, setVendorsLoading] = useState(false);

//   // Product & Vendor endpoints (local network)
//   const PRODUCTS_URL = "http://192.168.1.6:8000/api/admin/products/show";
//   const VENDORS_URL = "http://192.168.1.6:8000/api/admin/settings/vendors/show";

//   // Fetch products used in dropdown
//   async function fetchProductsList() {
//     setProductsLoading(true);
//     try {
//       const res = await api.get(PRODUCTS_URL);
//       const body = res.data;
//       const rows: any[] = Array.isArray(body)
//         ? body
//         : Array.isArray(body?.data)
//         ? body.data
//         : Array.isArray(body?.products)
//         ? body.products
//         : Array.isArray(body?.rows)
//         ? body.rows
//         : [];
//       setProducts(rows);
//     } catch (err: unknown) {
//       const { message, status } = formatAxiosError(err);
//       console.error("Failed to load products for dropdown:", err);
//       if (status === 401) toast.error("Unauthorized while fetching products");
//       else toast.error(message || "Failed to load products");
//       setProducts([]);
//     } finally {
//       setProductsLoading(false);
//     }
//   }

//   // Fetch vendors for vendor dropdown
//   async function fetchVendorsList() {
//     setVendorsLoading(true);
//     try {
//       const res = await api.get(VENDORS_URL);
//       const body = res.data;
//       const rows: any[] = Array.isArray(body)
//         ? body
//         : Array.isArray(body?.data)
//         ? body.data
//         : Array.isArray(body?.vendors)
//         ? body.vendors
//         : Array.isArray(body?.rows)
//         ? body.rows
//         : [];
//       setVendors(rows);
//     } catch (err: unknown) {
//       const { message, status } = formatAxiosError(err);
//       console.error("Failed to load vendors for dropdown:", err);
//       if (status === 401) toast.error("Unauthorized while fetching vendors");
//       else toast.error(message || "Failed to load vendors");
//       setVendors([]);
//     } finally {
//       setVendorsLoading(false);
//     }
//   }

//   // productOptions normalized
//   const productOptions = products
//     .map((p) => {
//       const id = p?.id ?? p?._id ?? p?.product_id ?? p?.productId ?? "";
//       const name = p?.name ?? p?.title ?? "";
//       if (id === null || id === undefined || id === "") return null;
//       return { id: String(id), label: name ? `${id} — ${name}` : String(id) };
//     })
//     .filter(Boolean) as { id: string; label: string }[];

//   // vendorOptions normalized
//   const vendorOptions = vendors
//     .map((v) => {
//       const id = v?.id ?? v?._id ?? v?.vendor_id ?? v?.vendorId ?? "";
//       const name = v?.name ?? v?.title ?? v?.company ?? "";
//       if (id === null || id === undefined || id === "") return null;
//       return { id: String(id), label: name ? `${id} — ${name}` : String(id) };
//     })
//     .filter(Boolean) as { id: string; label: string }[];

//   // --- Inventory API helpers ---
//   async function fetchItems() {
//     setLoading(true);
//     try {
//       const res = await api.get("/admin/settings/stock-inventory/show");
//       const body = res.data;
//       const rows: any[] = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : body?.inventory ?? body?.items ?? [];
//       setItems(rows.map((r: any) => normalizeInventory(r)));
//     } catch (err: unknown) {
//       const { message, status } = formatAxiosError(err);
//       console.error("Failed to load inventory:", err);
//       if (status === 401) toast.error("Unauthorized — please login.");
//       else toast.error(message || "Failed to load inventory");
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function normalizeInventory(raw: any): Inventory {
//     return {
//       id: raw.id ?? raw._id ?? raw.inventory_id ?? raw.inventoryId ?? String(Date.now()) + Math.random(),
//       product_id: raw.product_id ?? raw.productId ?? raw.product ?? raw?.item_id ?? raw?.sku ?? "",
//       quantity: Number(raw.quantity ?? raw.qty ?? 0),
//       type: raw.type ?? "in",
//       vendor_id: raw.vendor_id ?? raw.vendorId ?? raw.vendor ?? null,
//       note: raw.note ?? raw.notes ?? null,
//       created_at: raw.created_at ?? raw.createdAt ?? null,
//       updated_at: raw.updated_at ?? raw.updatedAt ?? null,
//     };
//   }

//   // mount: fetch both lists
//   useEffect(() => {
//     void fetchProductsList();
//     void fetchVendorsList();
//     void fetchItems();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // open add modal
//   function openAdd() {
//     setEditing(null);
//     setForm(defaultForm);
//     setFormErrors({});
//     setModalOpen(true);
//     if (!products.length) void fetchProductsList();
//     if (!vendors.length) void fetchVendorsList();
//   }
//   // open edit
//   function openEdit(it: Inventory) {
//     setEditing(it);
//     setForm({
//       product_id: String(it.product_id ?? ""),
//       quantity: String(it.quantity ?? 0),
//       type: String(it.type ?? "in"),
//       vendor_id: String(it.vendor_id ?? ""),
//       note: String(it.note ?? ""),
//     });
//     setFormErrors({});
//     setModalOpen(true);
//   }

//   // validation
//   function validateForm(): boolean {
//     const e: Record<string, string> = {};
//     if (!form.product_id.trim()) e.product_id = "Product is required";
//     if (form.quantity === "" || Number.isNaN(Number(form.quantity))) e.quantity = "Quantity is required and must be a number";
//     else if (Number(form.quantity) <= 0) e.quantity = "Quantity must be > 0";
//     if (!form.type.trim()) e.type = "Type is required";
//     setFormErrors(e);
//     return Object.keys(e).length === 0;
//   }

//   // create or update
//   async function saveItem(e?: React.FormEvent) {
//     e?.preventDefault();
//     if (!validateForm()) {
//       toast.error("Fix validation errors");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = {
//         product_id: form.product_id,
//         quantity: Number(form.quantity),
//         type: form.type,
//         vendor_id: form.vendor_id || null,
//         note: form.note || null,
//       };

//       if (editing) {
//         const updatedCandidate: Inventory = { ...editing, ...payload, quantity: Number(payload.quantity) };
//         setItems((p) => p.map((it) => (String(it.id) === String(editing.id) ? updatedCandidate : it)));
//         setModalOpen(false);
//         const res = await api.post(`/admin/settings/stock-inventory/update/${editing.id}`, payload);
//         const raw = res.data?.data ?? res.data?.inventory ?? res.data ?? null;
//         const updated = raw ? normalizeInventory(raw) : updatedCandidate;
//         setItems((p) => p.map((it) => (String(it.id) === String(editing.id) ? updated : it)));
//         toast.success("Inventory updated");
//       } else {
//         const tmpId = `tmp-${Date.now()}`;
//         const optimistic: Inventory = {
//           id: tmpId,
//           product_id: payload.product_id,
//           quantity: Number(payload.quantity),
//           type: payload.type,
//           vendor_id: payload.vendor_id,
//           note: payload.note,
//         };
//         setItems((p) => [optimistic, ...p]);
//         setModalOpen(false);

//         const res = await api.post("/admin/settings/stock-inventory/add", payload);
//         const raw = res.data?.data ?? res.data?.inventory ?? res.data ?? null;
//         const created = raw ? normalizeInventory(raw) : { ...optimistic, id: res.data?.id ?? tmpId };
//         setItems((p) => [created, ...p.filter((x) => x.id !== tmpId)]);
//         toast.success("Inventory added");
//       }

//       setEditing(null);
//       setForm(defaultForm);
//       setFormErrors({});
//     } catch (err: unknown) {
//       const { message, details, status } = formatAxiosError(err);
//       console.error("Save inventory error:", { message, status, details, raw: err });

//       const ae = err as AxiosError & { response?: any };
//       const fieldErrs = extractFieldErrors(ae?.response?.data ?? null);
//       if (fieldErrs) {
//         setFormErrors((prev) => ({ ...prev, ...fieldErrs }));
//         toast.error("Validation error — check fields");
//       } else {
//         toast.error(message ?? "Failed to save inventory");
//       }

//       // re-fetch to rollback optimistic changes if any
//       await fetchItems();
//     } finally {
//       setSaving(false);
//     }
//   }

//   function confirmDelete(item: Inventory) {
//     setDeleteTarget(item);
//   }

//   async function doDelete() {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     const id = deleteTarget.id;
//     const prev = items;
//     setItems((p) => p.filter((x) => String(x.id) !== String(id)));
//     try {
//       await api.delete(`/admin/settings/stock-inventory/delete/${id}`);
//       toast.success("Inventory deleted");
//     } catch (err: unknown) {
//       const { message, details, status } = formatAxiosError(err);
//       console.error("Delete inventory error:", { message, status, details, raw: err });
//       toast.error(message ?? "Failed to delete");
//       setItems(prev);
//     } finally {
//       setDeleteLoading(false);
//       setDeleteTarget(null);
//     }
//   }

//   async function handleRefresh() {
//     setRefreshing(true);
//     try {
//       await fetchItems();
//       await fetchProductsList();
//       await fetchVendorsList();
//       toast.success("Inventory, products & vendors refreshed");
//     } catch {
//       // handled in inner functions
//     } finally {
//       setRefreshing(false);
//     }
//   }

//   // small controlled input helper
//   function updateField<K extends keyof FormState>(k: K, v: string) {
//     setForm((s) => ({ ...s, [k]: v }));
//     setFormErrors((fe) => ({ ...fe, [k]: undefined }));
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <Toaster position="top-right" />
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <h2 className="text-2xl font-semibold text-slate-800">Inventory Management</h2>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={openAdd}
//             className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700 transition"
//           >
//             <Plus className="w-4 h-4" /> Add Inventory
//           </button>

//           <button
//             onClick={() => void handleRefresh()}
//             className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-slate-50 transition"
//           >
//             <RefreshCw className="w-4 h-4" />
//             {refreshing ? "Refreshing..." : "Refresh"}
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//         <div className="hidden md:block">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="px-4 py-3">ID</th>
//                 <th className="px-4 py-3">Product ID</th>
//                 <th className="px-4 py-3">Quantity</th>
//                 <th className="px-4 py-3">Type</th>
//                 <th className="px-4 py-3">Vendor</th>
//                 <th className="px-4 py-3">Note</th>
//                 <th className="px-4 py-3">When</th>
//                 <th className="px-4 py-3 w-44">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
//                     Loading…
//                   </td>
//                 </tr>
//               ) : items.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
//                     No inventory records.
//                   </td>
//                 </tr>
//               ) : (
//                 items.map((it) => (
//                   <tr key={String(it.id)} className="border-t hover:bg-slate-50 transition">
//                     <td className="px-4 py-3">{String(it.id).slice(0, 8)}</td>
//                     <td className="px-4 py-3">{it.product_id}</td>
//                     <td className="px-4 py-3">{it.quantity}</td>
//                     <td className="px-4 py-3">{it.type}</td>
//                     <td className="px-4 py-3">{it.vendor_id ?? "-"}</td>
//                     <td className="px-4 py-3">{it.note ?? "-"}</td>
//                     <td className="px-4 py-3">{it.created_at ? new Date(String(it.created_at)).toLocaleString() : "-"}</td>
//                     <td className="px-4 py-3">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => openEdit(it)}
//                           className="px-3 py-1 rounded border inline-flex items-center gap-2 hover:bg-slate-100 transition"
//                         >
//                           <Edit3 className="w-4 h-4" /> Edit
//                         </button>
//                         <button
//                           onClick={() => confirmDelete(it)}
//                           className="px-3 py-1 rounded bg-red-600 text-white inline-flex items-center gap-2 hover:bg-red-700 transition"
//                         >
//                           <Trash2 className="w-4 h-4" /> Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* mobile cards */}
//         <div className="md:hidden p-4 grid gap-3">
//           {loading ? (
//             <div className="text-center text-slate-500">Loading…</div>
//           ) : items.length === 0 ? (
//             <div className="text-center text-slate-500">No inventory records.</div>
//           ) : (
//             items.map((it) => (
//               <div key={String(it.id)} className="border rounded-lg p-3 hover:bg-slate-50 transition">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <div className="font-medium">Product: {it.product_id}</div>
//                     <div className="text-sm text-slate-600">Type: {it.type}</div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-lg font-semibold">{it.quantity}</div>
//                     <div className="text-xs text-slate-500">{it.created_at ? new Date(String(it.created_at)).toLocaleString() : "-"}</div>
//                   </div>
//                 </div>
//                 <div className="mt-3 text-sm text-slate-600">{it.note ?? "-"}</div>
//                 <div className="mt-3 flex gap-2">
//                   <button onClick={() => openEdit(it)} className="flex-1 p-2 border rounded hover:bg-slate-100 inline-flex items-center justify-center gap-2">
//                     <Edit3 /> Edit
//                   </button>
//                   <button onClick={() => confirmDelete(it)} className="flex-1 p-2 rounded bg-red-600 text-white hover:bg-red-700 inline-flex items-center justify-center gap-2">
//                     <Trash2 /> Delete
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
//           <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg z-10">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-medium">{editing ? "Edit Inventory" : "Add Inventory"}</h3>
//               <button onClick={() => setModalOpen(false)} className="p-2 rounded hover:bg-slate-100">
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//             <form onSubmit={saveItem} className="p-4 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Product ID</label>
//                 <select
//                   value={form.product_id}
//                   onChange={(e) => updateField("product_id", e.target.value)}
//                   className={`w-full p-2 border rounded ${formErrors.product_id ? "border-red-400" : ""}`}
//                 >
//                   <option value="">-- select product --</option>
//                   {productOptions.map((opt) => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.label}
//                     </option>
//                   ))}
//                 </select>
//                 {productOptions.length === 0 ? (
//                   <div className="text-xs text-slate-500 mt-1">{productsLoading ? "Loading products…" : "No products available."}</div>
//                 ) : (
//                   <div className="text-xs text-slate-400 mt-1">Choose product by id (label shows id — name)</div>
//                 )}
//                 {formErrors.product_id && <div className="text-xs text-red-500 mt-1">{formErrors.product_id}</div>}
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Quantity</label>
//                   <input value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} type="number" min="0" className={`w-full p-2 border rounded ${formErrors.quantity ? "border-red-400" : ""}`} />
//                   {formErrors.quantity && <div className="text-xs text-red-500 mt-1">{formErrors.quantity}</div>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">Type</label>
//                   <select value={form.type} onChange={(e) => updateField("type", e.target.value)} className={`w-full p-2 border rounded ${formErrors.type ? "border-red-400" : ""}`}>
//                     <option value="in">In (stock in)</option>
//                     <option value="out">Out (stock out)</option>
//                   </select>
//                   {formErrors.type && <div className="text-xs text-red-500 mt-1">{formErrors.type}</div>}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Vendor (optional)</label>
//                 <select value={form.vendor_id} onChange={(e) => updateField("vendor_id", e.target.value)} className="w-full p-2 border rounded">
//                   <option value="">-- select vendor (optional) --</option>
//                   {vendorOptions.map((v) => (
//                     <option key={v.id} value={v.id}>
//                       {v.label}
//                     </option>
//                   ))}
//                 </select>
//                 {vendorOptions.length === 0 ? (
//                   <div className="text-xs text-slate-500 mt-1">{vendorsLoading ? "Loading vendors…" : "No vendors available."}</div>
//                 ) : (
//                   <div className="text-xs text-slate-400 mt-1">Choose vendor by id (label shows id — name)</div>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Note (optional)</label>
//                 <textarea value={form.note} onChange={(e) => updateField("note", e.target.value)} className="w-full p-2 border rounded" rows={3} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 rounded border hover:bg-slate-100">Cancel</button>
//                 <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">
//                   {saving ? (editing ? "Saving…" : "Adding…") : editing ? "Save Changes" : "Add Inventory"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete confirm */}
//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
//           <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10 p-5">
//             <h3 className="text-lg font-medium">Confirm delete</h3>
//             <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete this inventory record (product {deleteTarget.product_id})?</p>
//             <div className="mt-4 flex justify-end gap-2">
//               <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading} className="px-3 py-1 rounded border hover:bg-slate-100">Cancel</button>
//               <button onClick={() => void doDelete()} disabled={deleteLoading} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
//                 {deleteLoading ? "Deleting…" : "Yes, delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InventoryManager;
// src/components/InventoryManager.tsx
// src/components/InventoryManager.tsx
import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/api/axios";
import type { AxiosError } from "axios";

type Inventory = {
  id: string | number;
  product_id: string | number;
  quantity: number;
  type: "in" | "out" | string;
  vendor_id?: string | number | null;
  note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type FormState = {
  product_id: string;
  quantity: string; // keep as string for input and convert when sending
  type: string;
  vendor_id: string;
  note: string;
};

const defaultForm: FormState = { product_id: "", quantity: "0", type: "in", vendor_id: "", note: "" };

/* ----------------------
   Error helpers (robust)
   ---------------------- */
function formatAxiosError(err: unknown) {
  const fallback = { message: "An unknown error occurred", details: null as any, status: undefined as number | undefined };
  try {
    if (!err) return fallback;
    const ae = err as AxiosError & { response?: any; request?: any };
    if (ae && (ae.isAxiosError || ae.response || ae.request)) {
      const status = ae.response?.status;
      const data = ae.response?.data;
      let message = ae.message || "Request failed";
      if (data) {
        if (typeof data === "string") message = data;
        else if (data.message) message = data.message;
        else if (data.error) message = data.error;
        else if (data.errors && typeof data.errors === "string") message = data.errors;
      }
      return { message: String(message), details: data ?? ae.response ?? ae.request ?? ae.stack, status };
    }
    if (err instanceof Error) return { message: err.message, details: err.stack, status: undefined };
    if (typeof err === "string") return { message: err, details: null, status: undefined };
    return { message: "Unknown error", details: JSON.stringify(err), status: undefined };
  } catch (e) {
    return { message: "Error while parsing error", details: e, status: undefined };
  }
}

function extractFieldErrors(responseData: any): Record<string, string> | null {
  if (!responseData) return null;
  if (responseData.errors && typeof responseData.errors === "object") {
    const out: Record<string, string> = {};
    for (const k of Object.keys(responseData.errors)) {
      const v = responseData.errors[k];
      out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return out;
  }
  if (responseData.validation && typeof responseData.validation === "object") {
    const out: Record<string, string> = {};
    for (const k of Object.keys(responseData.validation)) {
      const v = responseData.validation[k];
      out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return out;
  }
  const possible = ["product_id", "quantity", "type", "vendor_id", "note"];
  const out: Record<string, string> = {};
  let found = false;
  for (const f of possible) {
    if (responseData[f]) {
      out[f] = String(responseData[f]);
      found = true;
    }
  }
  return found ? out : null;
}

/* -------------------------
   Inventory component
   ------------------------- */
const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Inventory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // products & vendors for dropdown + name lookup
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // -------------------------
  // Product & Vendor endpoints
  // NOTE: using api instance; baseURL assumed set in api
  // -------------------------
  async function fetchProductsList() {
    setProductsLoading(true);
    try {
      const res = await api.get("/admin/products/show");
      const body = res.data;
      const rows: any[] = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.products)
        ? body.products
        : Array.isArray(body?.rows)
        ? body.rows
        : [];
      setProducts(rows);
    } catch (err: unknown) {
      const { message, status } = formatAxiosError(err);
      console.error("Failed to load products for dropdown:", err);
      if (status === 401) toast.error("Unauthorized while fetching products");
      else toast.error(message || "Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }

  async function fetchVendorsList() {
    setVendorsLoading(true);
    try {
      const res = await api.get("/admin/settings/vendors/show");
      const body = res.data;
      const rows: any[] = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.vendors)
        ? body.vendors
        : Array.isArray(body?.rows)
        ? body.rows
        : [];
      setVendors(rows);
    } catch (err: unknown) {
      const { message, status } = formatAxiosError(err);
      console.error("Failed to load vendors for dropdown:", err);
      if (status === 401) toast.error("Unauthorized while fetching vendors");
      else toast.error(message || "Failed to load vendors");
      setVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  }

  // normalized options used in dropdowns
  const productOptions = products
    .map((p) => {
      const id = p?.id ?? p?._id ?? p?.product_id ?? p?.productId ?? "";
      const name = p?.name ?? p?.title ?? "";
      if (id === null || id === undefined || id === "") return null;
      return { id: String(id), label: name ? `${id} — ${name}` : String(id), raw: p };
    })
    .filter(Boolean) as { id: string; label: string; raw: any }[];

  const vendorOptions = vendors
    .map((v) => {
      const id = v?.id ?? v?._id ?? v?.vendor_id ?? v?.vendorId ?? "";
      const name = v?.name ?? v?.title ?? v?.company ?? "";
      if (id === null || id === undefined || id === "") return null;
      return { id: String(id), label: name ? `${id} — ${name}` : String(id), raw: v };
    })
    .filter(Boolean) as { id: string; label: string; raw: any }[];

  function getProductName(productId: string | number | undefined | null) {
    if (productId === null || productId === undefined || productId === "") return "-";
    const pid = String(productId);
    const found = productOptions.find((p) => p.id === pid);
    if (found) return found.raw?.name ?? found.raw?.title ?? String(pid);
    // fallback to searching raw products with other id keys
    const fallback = products.find((p) => String(p?.id ?? p?._id ?? p?.product_id ?? p?.productId) === pid);
    if (fallback) return fallback?.name ?? fallback?.title ?? pid;
    return String(pid);
  }

  function getVendorName(vendorId: string | number | undefined | null) {
    if (vendorId === null || vendorId === undefined || vendorId === "") return "-";
    const vid = String(vendorId);
    const found = vendorOptions.find((v) => v.id === vid);
    if (found) return found.raw?.name ?? found.raw?.title ?? found.raw?.company ?? String(vid);
    const fallback = vendors.find((v) => String(v?.id ?? v?._id ?? v?.vendor_id ?? v?.vendorId) === vid);
    if (fallback) return fallback?.name ?? fallback?.title ?? fallback?.company ?? vid;
    return String(vid);
  }

  // --- Inventory API helpers ---
  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings/stock-inventory/show");
      const body = res.data;
      const rows: any[] = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.inventory)
        ? body.inventory
        : Array.isArray(body?.items)
        ? body.items
        : [];
      setItems(rows.map((r: any) => normalizeInventory(r)));
    } catch (err: unknown) {
      const { message, status } = formatAxiosError(err);
      console.error("Failed to load inventory:", err);
      if (status === 401) toast.error("Unauthorized — please login.");
      else toast.error(message || "Failed to load inventory");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function normalizeInventory(raw: any): Inventory {
    return {
      id: raw.id ?? raw._id ?? raw.inventory_id ?? raw.inventoryId ?? String(Date.now()) + Math.random(),
      product_id: raw.product_id ?? raw.productId ?? raw.product ?? raw?.item_id ?? raw?.sku ?? "",
      quantity: Number(raw.quantity ?? raw.qty ?? 0),
      type: raw.type ?? "in",
      vendor_id: raw.vendor_id ?? raw.vendorId ?? raw.vendor ?? null,
      note: raw.note ?? raw.notes ?? null,
      created_at: raw.created_at ?? raw.createdAt ?? null,
      updated_at: raw.updated_at ?? raw.updatedAt ?? null,
    };
  }

  useEffect(() => {
    void fetchProductsList();
    void fetchVendorsList();
    void fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(defaultForm);
    setFormErrors({});
    setModalOpen(true);
    if (!products.length) void fetchProductsList();
    if (!vendors.length) void fetchVendorsList();
  }

  function openEdit(it: Inventory) {
    setEditing(it);
    setForm({
      product_id: String(it.product_id ?? ""),
      quantity: String(it.quantity ?? 0),
      type: String(it.type ?? "in"),
      vendor_id: String(it.vendor_id ?? ""),
      note: String(it.note ?? ""),
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const e: Record<string, string> = {};
    if (!form.product_id.trim()) e.product_id = "Product is required";
    if (form.quantity === "" || Number.isNaN(Number(form.quantity))) e.quantity = "Quantity is required and must be a number";
    else if (Number(form.quantity) <= 0) e.quantity = "Quantity must be > 0";
    if (!form.type.trim()) e.type = "Type is required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveItem(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validateForm()) {
      toast.error("Fix validation errors");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        product_id: form.product_id,
        quantity: Number(form.quantity),
        type: form.type,
        vendor_id: form.vendor_id || null,
        note: form.note || null,
      };

      if (editing) {
        const updatedCandidate: Inventory = { ...editing, ...payload, quantity: Number(payload.quantity) };
        setItems((p) => p.map((it) => (String(it.id) === String(editing.id) ? updatedCandidate : it)));
        setModalOpen(false);
        const res = await api.post(`/admin/settings/stock-inventory/update/${editing.id}`, payload);
        const raw = res.data?.data ?? res.data?.inventory ?? res.data ?? null;
        const updated = raw ? normalizeInventory(raw) : updatedCandidate;
        setItems((p) => p.map((it) => (String(it.id) === String(editing.id) ? updated : it)));
        toast.success("Inventory updated");
      } else {
        const tmpId = `tmp-${Date.now()}`;
        const optimistic: Inventory = {
          id: tmpId,
          product_id: payload.product_id,
          quantity: Number(payload.quantity),
          type: payload.type,
          vendor_id: payload.vendor_id,
          note: payload.note,
        };
        setItems((p) => [optimistic, ...p]);
        setModalOpen(false);

        const res = await api.post("/admin/settings/stock-inventory/add", payload);
        const raw = res.data?.data ?? res.data?.inventory ?? res.data ?? null;
        const created = raw ? normalizeInventory(raw) : { ...optimistic, id: res.data?.id ?? tmpId };
        setItems((p) => [created, ...p.filter((x) => x.id !== tmpId)]);
        toast.success("Inventory added");
      }

      setEditing(null);
      setForm(defaultForm);
      setFormErrors({});
    } catch (err: unknown) {
      const { message, details, status } = formatAxiosError(err);
      console.error("Save inventory error:", { message, status, details, raw: err });

      const ae = err as AxiosError & { response?: any };
      const fieldErrs = extractFieldErrors(ae?.response?.data ?? null);
      if (fieldErrs) {
        setFormErrors((prev) => ({ ...prev, ...fieldErrs }));
        toast.error("Validation error — check fields");
      } else {
        toast.error(message ?? "Failed to save inventory");
      }

      // re-fetch to rollback optimistic changes if any
      await fetchItems();
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item: Inventory) {
    setDeleteTarget(item);
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const id = deleteTarget.id;
    const prev = items;
    setItems((p) => p.filter((x) => String(x.id) !== String(id)));
    try {
      await api.delete(`/admin/settings/stock-inventory/delete/${id}`);
      toast.success("Inventory deleted");
    } catch (err: unknown) {
      const { message } = formatAxiosError(err);
      console.error("Delete inventory error:", { message, raw: err });
      toast.error(message ?? "Failed to delete");
      setItems(prev);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetchItems();
      await fetchProductsList();
      await fetchVendorsList();
      toast.success("Inventory, products & vendors refreshed");
    } catch {
      // inner functions already handle errors/toasts
    } finally {
      setRefreshing(false);
    }
  }

  function updateField<K extends keyof FormState>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
    setFormErrors((fe) => ({ ...fe, [k]: undefined }));
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Inventory Management</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" /> Add Inventory
          </button>

          <button
            onClick={() => void handleRefresh()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3 w-44">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    No inventory records.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={String(it.id)} className="border-t hover:bg-slate-50 transition">
                    <td className="px-4 py-3">{String(it.id).slice(0, 8)}</td>

                    {/* Product column: show name only (no small id) */}
                    <td className="px-4 py-3">
                      <div className="font-medium">{getProductName(it.product_id)}</div>
                    </td>

                    <td className="px-4 py-3">{it.quantity}</td>
                    <td className="px-4 py-3">{it.type}</td>

                    {/* Vendor column: show name only (no small id) */}
                    <td className="px-4 py-3">
                      <div className="text-sm">{getVendorName(it.vendor_id)}</div>
                    </td>

                    <td className="px-4 py-3">{it.note ?? "-"}</td>
                    <td className="px-4 py-3">{it.created_at ? new Date(String(it.created_at)).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(it)}
                          className="px-3 py-1 rounded border inline-flex items-center gap-2 hover:bg-slate-100 transition"
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(it)}
                          className="px-3 py-1 rounded bg-red-600 text-white inline-flex items-center gap-2 hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* mobile cards */}
        <div className="md:hidden p-4 grid gap-3">
          {loading ? (
            <div className="text-center text-slate-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center text-slate-500">No inventory records.</div>
          ) : (
            items.map((it) => (
              <div key={String(it.id)} className="border rounded-lg p-3 hover:bg-slate-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Product: {getProductName(it.product_id)}</div>
                    <div className="text-sm text-slate-600">Type: {it.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{it.quantity}</div>
                    <div className="text-xs text-slate-500">{it.created_at ? new Date(String(it.created_at)).toLocaleString() : "-"}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600">Vendor: {getVendorName(it.vendor_id)}</div>
                <div className="mt-2 text-sm text-slate-600">{it.note ?? "-"}</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(it)} className="flex-1 p-2 border rounded hover:bg-slate-100 inline-flex items-center justify-center gap-2">
                    <Edit3 /> Edit
                  </button>
                  <button onClick={() => confirmDelete(it)} className="flex-1 p-2 rounded bg-red-600 text-white hover:bg-red-700 inline-flex items-center justify-center gap-2">
                    <Trash2 /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg z-10">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{editing ? "Edit Inventory" : "Add Inventory"}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveItem} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select
                  value={form.product_id}
                  onChange={(e) => updateField("product_id", e.target.value)}
                  className={`w-full p-2 border rounded ${formErrors.product_id ? "border-red-400" : ""}`}
                >
                  <option value="">-- select product --</option>
                  {productOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {productOptions.length === 0 ? (
                  <div className="text-xs text-slate-500 mt-1">{productsLoading ? "Loading products…" : "No products available."}</div>
                ) : (
                  <div className="text-xs text-slate-400 mt-1">Choose product by id (label shows id — name)</div>
                )}
                {formErrors.product_id && <div className="text-xs text-red-500 mt-1">{formErrors.product_id}</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} type="number" min="0" className={`w-full p-2 border rounded ${formErrors.quantity ? "border-red-400" : ""}`} />
                  {formErrors.quantity && <div className="text-xs text-red-500 mt-1">{formErrors.quantity}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={(e) => updateField("type", e.target.value)} className={`w-full p-2 border rounded ${formErrors.type ? "border-red-400" : ""}`}>
                    <option value="in">In (stock in)</option>
                    <option value="out">Out (stock out)</option>
                  </select>
                  {formErrors.type && <div className="text-xs text-red-500 mt-1">{formErrors.type}</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vendor (optional)</label>
                <select value={form.vendor_id} onChange={(e) => updateField("vendor_id", e.target.value)} className="w-full p-2 border rounded">
                  <option value="">-- select vendor (optional) --</option>
                  {vendorOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                {vendorOptions.length === 0 ? (
                  <div className="text-xs text-slate-500 mt-1">{vendorsLoading ? "Loading vendors…" : "No vendors available."}</div>
                ) : (
                  <div className="text-xs text-slate-400 mt-1">Choose vendor by id (label shows id — name)</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <textarea value={form.note} onChange={(e) => updateField("note", e.target.value)} className="w-full p-2 border rounded" rows={3} />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 rounded border hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                  {saving ? (editing ? "Saving…" : "Adding…") : editing ? "Save Changes" : "Add Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg z-10 p-5">
            <h3 className="text-lg font-medium">Confirm delete</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete this inventory record (product {getProductName(deleteTarget.product_id)})?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading} className="px-3 py-1 rounded border hover:bg-slate-100">Cancel</button>
              <button onClick={() => void doDelete()} disabled={deleteLoading} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                {deleteLoading ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;




