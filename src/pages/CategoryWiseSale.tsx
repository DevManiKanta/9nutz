

// import React, { useEffect, useRef, useState } from "react";
// import { Plus, X, Edit2, Trash2, Search as SearchIcon } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../../src/api/axios";
// import { Button } from "@/components/ui/button";

// const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
// const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
// const SEARCH_DEBOUNCE_MS = 400;

// type CategoryItem = {
//   id: string | number;
//   category: string;
//   image_url?: string;
//   image?: string;
//   createdAt?: string | null;
//   productCount?: number;
// };

// function unsplashForCategory(cat?: string, size = "600x400") {
//   const keyword = (cat || "grocery").split(" ").slice(0, 3).join(",");
//   return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
// }

// function readPagination(metaLike: any) {
//   const out = {
//     total: Number(metaLike?.total ?? metaLike?.count ?? metaLike?.records ?? metaLike?.totalRecords ?? 0),
//     per_page: Number(metaLike?.per_page ?? metaLike?.perPage ?? metaLike?.limit ?? metaLike?.pageSize ?? 10),
//     current_page: Number(metaLike?.current_page ?? metaLike?.page ?? metaLike?.currentPage ?? 1),
//     last_page: Number(metaLike?.last_page ?? metaLike?.total_pages ?? Math.ceil((metaLike?.total ?? 0) / (metaLike?.per_page ?? 10))),
//   };
//   out.per_page = out.per_page > 0 ? out.per_page : 10;
//   out.current_page = out.current_page >= 1 ? out.current_page : 1;
//   out.last_page = out.last_page >= 1 ? out.last_page : 1;
//   return out;
// }

// export default function CategoriesShowcase(): JSX.Element {
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [catForm, setCatForm] = useState<{ category: string; imagePreview?: string }>({ category: "", imagePreview: "" });
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);

//   const [query, setQuery] = useState("");
//   const [page, setPage] = useState<number>(1);
//   const [perPage, setPerPage] = useState<number>(10);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   const [totalItems, setTotalItems] = useState<number>(0);

//   const searchTimer = useRef<number | null>(null);

//   // normalize single server row into CategoryItem
//   const normalizeRow = (r: any, i = 0): CategoryItem => {
//     const rawCount = r.products_count ?? r.count ?? r.productsCount ?? 0;
//     const parsedCount = typeof rawCount === "string" ? Number(rawCount || 0) : Number(rawCount ?? 0);

//     const tryTrim = (v: any) => (v === undefined || v === null ? "" : String(v).trim());

//     // prefer image_url -> imageUrl -> image and make absolute if needed
//     let resolvedImage: string | undefined = undefined;
//     const candImageUrl = tryTrim(r.image_url ?? r.imageUrl ?? "");
//     if (candImageUrl) resolvedImage = candImageUrl;
//     else {
//       const cand = tryTrim(r.image ?? r.photo ?? r.thumbnail ?? "");
//       if (cand) {
//         if (/^https?:\/\//i.test(cand)) resolvedImage = cand;
//         else {
//           try {
//             const baseCandidate = String((api as any)?.defaults?.baseURL ?? window.location.origin);
//             const base = baseCandidate.endsWith("/") ? baseCandidate : baseCandidate + "/";
//             resolvedImage = new URL(cand.replace(/^\/+/, ""), base).toString();
//           } catch {
//             try {
//               resolvedImage = `${window.location.origin}/storage/${cand.replace(/^\/+/, "")}`;
//             } catch {
//               resolvedImage = undefined;
//             }
//           }
//         }
//       }
//     }

//     const finalImage = resolvedImage ?? (r.name ? unsplashForCategory(r.name) : SAMPLE_IMG);

//     return {
//       id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
//       category: String(r.name ?? r.category ?? r.title ?? `Category ${i + 1}`),
//       image_url: finalImage,
//       image: r.image ?? undefined,
//       createdAt: r.created_at ?? r.createdAt ?? null,
//       productCount: Number.isFinite(parsedCount) ? parsedCount : 0,
//     };
//   };

//   /**
//    * fetchCategories
//    * - Accepts { search?, q?, page?, per_page? } for backward compatibility.
//    * - Uses `search` param when calling API (so backend receives ?search=...).
//    */
//  const fetchCategories = async (page = 1, search = "") => {
//   setLoading(true);
//   try {
//     const qs = `?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
//     const res = await api.get(`/admin/categories/show${qs}`);
//     const body = res?.data ?? res;
//     if (!body || typeof body !== "object") throw new Error("Unexpected response from server");

//     // try payload shapes similar to products: payload may be body.data (paginated) or body itself
//     const payload = body.data ?? body;
//     // rows often live in payload.data (pagination) or payload (array) — handle common shapes
//     let rows: any[] = [];
//     if (Array.isArray(payload)) {
//       rows = payload;
//     } else if (payload && Array.isArray(payload.data)) {
//       rows = payload.data;
//     } else if (payload && payload.data && Array.isArray(payload.data?.data)) {
//       rows = payload.data.data;
//     } else if (payload && Array.isArray(payload.rows)) {
//       rows = payload.rows;
//     } else if (payload && Array.isArray(payload.categories)) {
//       rows = payload.categories;
//     } else {
//       const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
//       if (Array.isArray(arr)) rows = arr as any[];
//     }

//     // normalize and set
//     const normalized = rows.map((r: any, i: number) => normalizeRow(r, i));
//     setCategories(normalized);

//     // pagination meta (try to extract from payload sensibly)
//     const cp = Number(payload?.current_page ?? payload?.page ?? payload?.currentPage ?? 1);
//     const lp = Number(payload?.last_page ?? payload?.total_pages ?? 1);
//     const pp = Number(payload?.per_page ?? payload?.perPage ?? perPage);
//     const tot = Number(payload?.total ?? payload?.count ?? normalized.length);

//     setPage(cp || 1);
//     setTotalPages(lp || 1);
//     setPerPage(pp || perPage);
//     setTotalItems(tot || normalized.length);

//     // If user searched and server returned zero rows, ensure cleared state (no accidental fallbacks)
//     const userSearched = search !== undefined && String(search).trim() !== "";
//     if (userSearched && rows.length === 0) {
//       setCategories([]);
//       setTotalItems(0);
//       setPerPage(pp || perPage);
//       setPage(1);
//       setTotalPages(1);
//     }
//   } catch (err: any) {
//     console.error("fetchCategories failed:", err, err?.response?.data);
//     const message = err?.response?.data?.message ?? err?.message ?? "Failed to load categories";
//     toast.error(message);
//     setCategories([]);
//     setTotalItems(0);
//     setTotalPages(1);
//   } finally {
//     setLoading(false);
//   }
// };

// // initial load
// useEffect(() => {
//   void fetchCategories(1, query);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

// // Watch query and refetch (debounced) — mirrors your products implementation
// useEffect(() => {
//   const t = window.setTimeout(() => {
//     // restart to page 1 whenever search term changes
//     void fetchCategories(1, query);
//   }, 400);
//   return () => window.clearTimeout(t);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [query]);

//   // file input preview + validation
//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] ?? null;
//     if (!file) {
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }
//     if (!file.type || !file.type.startsWith("image/")) {
//       toast.error("Selected file is not an image.");
//       if (fileRef.current) fileRef.current.value = "";
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }
//     if (file.size > MAX_IMAGE_BYTES) {
//       toast.error("Image too large (max 5MB).");
//       if (fileRef.current) fileRef.current.value = "";
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }
//     setSelectedFile(file);
//     const reader = new FileReader();
//     reader.onload = () => setCatForm((p) => ({ ...p, imagePreview: String(reader.result) }));
//     reader.readAsDataURL(file);
//   };

//   // fetch single item (for edit drawer)
//   const fetchSingle = async (id: string | number) => {
//     const res = await api.get(`/admin/categories/show/${id}`);
//     const body = res?.data ?? null;
//     const item = body?.data ?? body?.category ?? body ?? null;
//     return item ? normalizeRow(item) : null;
//   };

//   // create (server)
//   const createCategory = async (payload: { name: string; file?: File | null }) => {
//     const fd = new FormData();
//     fd.append("name", payload.name);
//     if (payload.file) fd.append("image", payload.file, payload.file.name);
//     const res = await api.post("/admin/categories/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
//     return res?.data ?? res;
//   };

//   // update (server) using POST + _method=PUT (your backend uses POST with method override)
//   const updateCategory = async (id: string | number, payload: { name: string; file?: File | null }) => {
//     const fd = new FormData();
//     fd.append("name", payload.name);
//     fd.append("_method", "POST");
//     if (payload.file) fd.append("image", payload.file, payload.file.name);
//     const res = await api.post(`/admin/categories/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//     return res?.data ?? res;
//   };

//   // delete (server)
//   const deleteCategoryReq = async (id: string | number) => {
//     const res = await api.delete(`/admin/categories/delete/${id}`);
//     return res?.data ?? res;
//   };

//   const openCreate = () => {
//     setEditingId(null);
//     setCatForm({ category: "", imagePreview: "" });
//     setSelectedFile(null);
//     if (fileRef.current) fileRef.current.value = "";
//     setDrawerOpen(true);
//   };

//   const openEdit = async (item: CategoryItem) => {
//     setEditingId(item.id);
//     setSelectedFile(null);
//     if (fileRef.current) fileRef.current.value = "";
//     try {
//       const server = await fetchSingle(item.id);
//       setCatForm({ category: server?.category ?? item.category, imagePreview: server?.image_url ?? item.image_url ?? "" });
//     } catch {
//       setCatForm({ category: item.category, imagePreview: item.image_url ?? item.image ?? "" });
//     }
//     setDrawerOpen(true);
//   };

//   const prettyDate = (iso?: string | null) => {
//     if (!iso) return "";
//     try {
//       const d = new Date(iso);
//       if (Number.isNaN(d.getTime())) return iso;
//       return new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(d);
//     } catch {
//       return iso;
//     }
//   };

//   // submit (create or update) — ALWAYS refresh list after success and use server message
//   const handleSubmit = async (ev?: React.FormEvent) => {
//     ev?.preventDefault();
//     const nameTrim = (catForm.category ?? "").trim();
//     if (!nameTrim) {
//       toast.error("Please enter a category name.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       if (editingId) {
//         const res = await updateCategory(editingId, { name: nameTrim, file: selectedFile ?? undefined });
//         const serverMsg = res?.message ?? "Category updated";
//         toast.success(serverMsg);
//       } else {
//         const res = await createCategory({ name: nameTrim, file: selectedFile ?? undefined });
//         const serverMsg = res?.message ?? "Category created";
//         toast.success(serverMsg);
//       }
//       // refresh using `search` param so backend receives ?search=...
//       await fetchCategories({ search: query, page: 1, per_page: perPage });
//       setDrawerOpen(false);
//       setCatForm({ category: "", imagePreview: "" });
//       setSelectedFile(null);
//       if (fileRef.current) fileRef.current.value = "";
//     } catch (err: any) {
//       console.error("handleSubmit error:", err);
//       const serverMsg = err?.response?.data?.message ?? err?.message ?? "Save failed";
//       toast.error(serverMsg);
//     } finally {
//       setSubmitting(false);
//       setEditingId(null);
//     }
//   };

//   const handleDelete = async (id: string | number) => {
//     const confirmed = window.confirm("Delete this category? This action cannot be undone.");
//     if (!confirmed) return;
//     try {
//       const res = await deleteCategoryReq(id);
//       const serverMsg = res?.message ?? "Category deleted";
//       toast.success(serverMsg);
//       // refresh current page (preserve search) — use `search` param
//       await fetchCategories({ search: query, page, per_page: perPage });
//     } catch (err: any) {
//       console.error("delete error:", err);
//       const serverMsg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
//       toast.error(serverMsg);
//     }
//   };

//   const goToPage = async (p: number) => {
//     const newPage = Math.max(1, Math.min(p, totalPages));
//     setPage(newPage);
//     await fetchCategories({ search: query, page: newPage });
//   };

//   const renderPageNumbers = () => {
//     const pages: number[] = [];
//     const maxButtons = 7;
//     let start = Math.max(1, page - Math.floor(maxButtons / 2));
//     let end = start + maxButtons - 1;
//     if (end > totalPages) {
//       end = totalPages;
//       start = Math.max(1, end - maxButtons + 1);
//     }
//     for (let p = start; p <= end; p++) pages.push(p);
//     return pages;
//   };

//   useEffect(() => {
//     setTotalPages(Math.max(1, Math.ceil(totalItems / perPage)));
//   }, [totalItems, perPage]);

//   // Show newest first (reverse server list)
//   const tableRows = [...categories].reverse();

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />

//       <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
//         </div>

//         <div className="flex justify-center">
//           <div className="flex items-center gap-2 w-full max-w-md">
//             <div className="relative w-full">
//               {/* Search auto-triggers backend fetch (debounced) */}
//               <input
//                 type="search"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search categories..."
//                 className="pl-9 pr-3 py-2 rounded border w-full"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     if (searchTimer.current) {
//                       window.clearTimeout(searchTimer.current);
//                       searchTimer.current = null;
//                     }
//                     setPage(1);
//                     //ts-ignore
//                     void fetchCategories({ search: e.currentTarget.value, page: 1, per_page: perPage });
//                   }
//                 }}
//               />
//               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end items-center gap-3">
//            <Button onClick={openCreate}>
//               <Plus className="h-4 w-4 mr-2" /> Add Category
//             </Button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="mb-6 bg-white shadow-sm rounded border overflow-x-auto">
//         {loading ? (
//           <div className="p-6 text-center">
//     <div className="flex flex-col items-center justify-center gap-2">
//       <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//       <span className="text-sm text-slate-600">Loading...</span>
//     </div>
//   </div>
//         ) : categories.length === 0 ? (
//           <div className="p-6 text-sm text-slate-500">
//             {query.trim() ? (
//               <>No categories found for <strong className="text-slate-700">"{query.trim()}"</strong>.</>
//             ) : (
//               <>No categories available.</>
//             )}
//           </div>
//         ) : (
//           <table className="min-w-full">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-sm font-medium">S.no</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Products</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
//                 <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y">
//               {tableRows.map((c, idx) => {
//                 // To display correct serial for server driven pagination, compute index relative to current page/perPage
//                 const serial = (page - 1) * perPage + idx + 1;
//                 return (
//                   <tr key={String(c.id)}>
//                     <td className="px-4 py-3 text-sm">{serial}</td>

//                     <td className="px-4 py-3">
//                       <div className="w-14 h-14 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
//                         <img
//                           src={c.image_url ?? SAMPLE_IMG}
//                           alt={c.category}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             const img = e.currentTarget as HTMLImageElement;
//                             if (!img.dataset.fallback) {
//                               img.dataset.fallback = "true";
//                               img.src = unsplashForCategory(c.category, "600x400");
//                             }
//                           }}
//                         />
//                       </div>
//                     </td>

//                     <td className="px-4 py-3 text-sm">
//                       <div className="font-medium">{c.category}</div>
//                     </td>

//                     <td className="px-4 py-3 text-sm">
//                       {(typeof c.productCount === "number" ? c.productCount : 0) + (c.productCount === 1 ? " Product" : " Products")}
//                     </td>

//                     <td className="px-4 py-3 text-sm text-slate-500">{c.createdAt ? prettyDate(c.createdAt) : "-"}</td>

//                     <td className="px-4 py-3 text-sm text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <button
//                           onClick={() => openEdit(c)}
//                           title="Edit"
//                           className="px-3 py-1 rounded-md border hover:bg-indigo-600 hover:text-white transition"
//                         >
//                           <Edit2 className="w-4 h-4 inline" />
//                         </button>

//                         <button
//                           onClick={() => handleDelete(c.id)}
//                           title="Delete"
//                           className="px-3 py-1 rounded-md border hover:bg-red-600 hover:text-white transition"
//                         >
//                           <Trash2 className="w-4 h-4 inline" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="mt-6 flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
//         <div className="text-sm text-slate-600">
//           Showing page {page} of {totalPages} • {totalItems} items
//         </div>

//         <div className="flex items-center gap-2">
//           <button onClick={() => void goToPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">
//             First
//           </button>
//           <button onClick={() => void goToPage(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">
//             Prev
//           </button>

//           {renderPageNumbers().map((p) => (
//             <button key={p} onClick={() => void goToPage(p)} className={`px-3 py-1 border rounded ${p === page ? "bg-indigo-600 text-white" : ""}`}>
//               {p}
//             </button>
//           ))}

//           <button onClick={() => void goToPage(page + 1)} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">
//             Next
//           </button>
//           <button onClick={() => void goToPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">
//             Last
//           </button>
//         </div>
//       </div>

//       {/* Drawer */}
//       <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
//         <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
//       </div>

//       <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
//         <div className="h-full flex flex-col bg-white shadow-xl">
//           <div className="flex items-center justify-between p-4 border-b">
//             <h2 className="text-lg font-medium">{editingId ? "Edit Category" : "Add Category"}</h2>
//             <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
//           </div>

//           <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label htmlFor="category" className="block text-sm font-medium text-gray-700">Name (Category)</label>
//                 <input id="category" value={catForm.category} onChange={(e) => setCatForm((s) => ({ ...s, category: e.target.value }))} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Beverages" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Image (optional)</label>

//                 <div className="mt-1 flex items-center gap-3">
//                   <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
//                     {catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.category || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}
//                   </div>

//                   <div className="flex-1">
//                     <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500" />
//                     <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. Leave empty to keep existing image.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
//               <button type="button" className="px-4 py-2 rounded-md border" onClick={() => { setCatForm({ category: "", imagePreview: "" }); setDrawerOpen(false); setSelectedFile(null); setEditingId(null); if (fileRef.current) fileRef.current.value = ""; }}>
//                 Cancel
//               </button>
//               <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
//                 {submitting ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update" : "Add"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </aside>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  X,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Search as SearchIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../src/api/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {IMAGES}from "../assets/images"

const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const DEBOUNCE_MS = 400;

type CategoryItem = {
  id: string | number;
  category: string;
  image_url?: string;
  image?: string;
  createdAt?: string | null;
  productCount?: number;
  [k: string]: any;
};

const unsplashForCategory = (cat?: string, size = "600x600") => {
  const keyword = (cat || "grocery").split(" ").slice(0, 3).join(",");
  return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(
    keyword
  )}`;
};

const resolveImageUrl = (raw?: string | undefined) => {
  if (!raw) return IMAGES.DummyImage;
  const s = String(raw).trim();
  if (!s) return IMAGES.DummyImage;
  if (/^https?:\/\//i.test(s)) return s;
  try {
    const base = (api as any)?.defaults?.baseURL ?? window.location.origin;
    const baseClean = base.endsWith("/") ? base : base + "/";
    return new URL(s.replace(/^\/+/, ""), baseClean).toString();
  } catch {
    return IMAGES.DummyImage;
  }
};

function normalizeRow(r: any, i = 0): CategoryItem {
  const rawCount = r.products_count ?? r.count ?? r.productsCount ?? 0;
  const parsedCount =
    typeof rawCount === "string" ? Number(rawCount || 0) : Number(rawCount ?? 0);

  const tryTrim = (v: any) => (v === undefined || v === null ? "" : String(v).trim());

  let resolvedImage: string | undefined = undefined;
  const candImageUrl = tryTrim(r.image_url ?? r.imageUrl ?? "");
  if (candImageUrl) resolvedImage = candImageUrl;
  else {
    const cand = tryTrim(r.image ?? r.photo ?? r.thumbnail ?? "");
    if (cand) {
      if (/^https?:\/\//i.test(cand)) resolvedImage = cand;
      else {
        try {
          const baseCandidate = String(
            (api as any)?.defaults?.baseURL ?? window.location.origin
          );
          const base = baseCandidate.endsWith("/") ? baseCandidate : baseCandidate + "/";
          resolvedImage = new URL(cand.replace(/^\/+/, ""), base).toString();
        } catch {
          try {
            resolvedImage = `${window.location.origin}/storage/${cand.replace(/^\/+/, "")}`;
          } catch {
            resolvedImage = undefined;
          }
        }
      }
    }
  }
  const finalImage = resolvedImage ?? (r.name ? unsplashForCategory(r.name) : SAMPLE_IMG);
  return {
    id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
    category: String(r.name ?? r.category ?? r.title ?? `Category ${i + 1}`),
    image_url: finalImage,
    image: r.image ?? undefined,
    createdAt: r.created_at ?? r.createdAt ?? null,
    productCount: Number.isFinite(parsedCount) ? parsedCount : 0,
    ...r,
  };
}

export default function Categories(): JSX.Element {
  // state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchTimer = useRef<number | null>(null);

  // drawer / view / edit
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [selectedItem, setSelectedItem] = useState<CategoryItem | null>(null);

  // form
  const defaultForm = { category: "", image: "" };
  const [form, setForm] = useState<typeof defaultForm>({ ...defaultForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // helper to fetch list
  const fetchCategories = async (p = 1, q = "") => {
    setIsLoading(true);
    try {
      const qs = `?page=${p}${q ? `&search=${encodeURIComponent(q)}` : ""}`;
      const res = await api.get(`/admin/categories/show${qs}`);
      const body = res?.data ?? res;
      if (!body || typeof body !== "object") throw new Error("Unexpected response");

      const payload = body.data ?? body;
      let rows: any[] = [];

      if (Array.isArray(payload)) rows = payload;
      else if (payload && Array.isArray(payload.data)) rows = payload.data;
      else if (payload && payload.data && Array.isArray(payload.data?.data)) rows = payload.data.data;
      else if (payload && Array.isArray(payload.rows)) rows = payload.rows;
      else if (payload && Array.isArray(payload.categories)) rows = payload.categories;
      else {
        const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      const normalized = rows.map((r: any, i: number) => normalizeRow(r, i));
      setCategories(normalized);

      // pagination meta
      const cp = Number(payload?.current_page ?? payload?.page ?? payload?.currentPage ?? p ?? 1);
      const lp = Number(payload?.last_page ?? payload?.total_pages ?? Math.max(1, Math.ceil((payload?.total ?? normalized.length) / (payload?.per_page ?? perPage))));
      const pp = Number(payload?.per_page ?? payload?.perPage ?? perPage ?? 10);
      const tot = Number(payload?.total ?? payload?.count ?? normalized.length);

      setPage(cp || 1);
      setLastPage(lp || 1);
      setPerPage(pp || perPage);
      setTotalItems(tot || normalized.length);

      // if user searched and got zero, keep empty
      const userSearched = q !== undefined && String(q).trim() !== "";
      if (userSearched && rows.length === 0) {
        setCategories([]);
        setTotalItems(0);
        setPerPage(pp || perPage);
        setPage(1);
        setLastPage(1);
      }
    } catch (err: any) {
      console.error("fetchCategories:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to load categories";
      toast.error(message);
      setCategories([]);
      setTotalItems(0);
      setLastPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  // initial
  useEffect(() => {
    void fetchCategories(1, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      void fetchCategories(1, searchTerm);
    }, DEBOUNCE_MS);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // fetch one (for edit)
  const fetchSingle = async (id: string | number) => {
    const res = await api.get(`/admin/categories/show/${id}`);
    const body = res?.data ?? null;
    const item = body?.data ?? body?.category ?? body ?? null;
    return item ? normalizeRow(item) : null;
  };

  // create / update / delete API
  const createCategoryApi = async (payload: { name: string; file?: File | null }) => {
    const fd = new FormData();
    fd.append("name", payload.name);
    if (payload.file) fd.append("image", payload.file, payload.file.name);
    const res = await api.post("/admin/categories/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res?.data ?? res;
  };

  const updateCategoryApi = async (id: string | number, payload: { name: string; file?: File | null }) => {
    const fd = new FormData();
    fd.append("name", payload.name);
    // your backend expects method override; keep pattern used previously
    fd.append("_method", "POST");
    if (payload.file) fd.append("image", payload.file, payload.file.name);
    const res = await api.post(`/admin/categories/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res?.data ?? res;
  };

  const deleteCategoryApi = async (id: string | number) => {
    const res = await api.delete(`/admin/categories/delete/${id}`);
    return res?.data ?? res;
  };

  // open add drawer
  const openAddDrawer = () => {
    setIsEditMode(false);
    setEditingId(null);
    setForm({ ...defaultForm });
    setImageFile(null);
    setErrors({});
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 120);
  };

  // open edit
  const openEditDrawer = async (c: CategoryItem) => {
    setIsEditMode(true);
    setEditingId(c.id);
    setImageFile(null);
    setErrors({});
    try {
      const server = await fetchSingle(c.id);
      setForm({
        category: server?.category ?? c.category ?? "",
        image: server?.image_url ?? c.image_url ?? c.image ?? "",
      });
    } catch {
      setForm({ category: c.category, image: c.image_url ?? c.image ?? "" });
    }
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 120);
  };

  // open view
  const openView = (c: CategoryItem) => {
    setSelectedItem(c);
    setIsViewOpen(true);
  };

  // handle file change
  const handleImageChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      setForm((f) => ({ ...f, image: "" }));
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Selected file is not an image.");
      if (fileRef.current) fileRef.current.value = "";
      setImageFile(null);
      setForm((f) => ({ ...f, image: "" }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 5MB).");
      if (fileRef.current) fileRef.current.value = "";
      setImageFile(null);
      setForm((f) => ({ ...f, image: "" }));
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  // validations
  const validateForm = () => {
    const e: Partial<Record<keyof typeof defaultForm, string>> = {};
    if (!String(form.category ?? "").trim()) e.category = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // submit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const nameTrim = String(form.category).trim();
    setIsSubmitting(true);
    try {
      if (isEditMode && editingId != null) {
        const res = await updateCategoryApi(editingId, { name: nameTrim, file: imageFile ?? undefined });
        const serverMsg = res?.message ?? "Category updated";
        toast.success(serverMsg);
      } else {
        const res = await createCategoryApi({ name: nameTrim, file: imageFile ?? undefined });
        const serverMsg = res?.message ?? "Category created";
        toast.success(serverMsg);
      }
      // refresh list (preserve search term) and put page to 1 after create
      await fetchCategories(1, searchTerm);
      setIsDrawerOpen(false);
      setForm({ ...defaultForm });
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      console.error("handleSubmit error:", err, err?.response?.data);
      const rdata = err?.response?.data;
      if (rdata && typeof rdata === "object" && rdata.errors) {
        const mapped: Partial<Record<keyof typeof defaultForm, string>> = {};
        Object.keys(rdata.errors).forEach((k) => {
          const val = rdata.errors[k];
          if (Array.isArray(val)) mapped[k as keyof typeof defaultForm] = String(val[0]);
          else mapped[k as keyof typeof defaultForm] = String(val);
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
        toast.error("Fix validation errors");
      } else {
        const serverMsg = err?.response?.data?.message ?? err?.message ?? "Save failed";
        toast.error(serverMsg);
      }
    } finally {
      setIsSubmitting(false);
      setEditingId(null);
      setIsEditMode(false);
    }
  };

  // delete flow
  const askDelete = (id: string | number) => setConfirmDeleteId(id);
  const cancelDelete = () => setConfirmDeleteId(null);

  const confirmDelete = async () => {
    if (confirmDeleteId == null) return;
    setIsDeleting(true);
    try {
      const res = await deleteCategoryApi(confirmDeleteId);
      const body = res ?? {};
      const serverMsg = body?.message ?? "Category deleted";
      toast.success(serverMsg);
      // refresh current page
      await fetchCategories(page, searchTerm);
      setSelectedItem((s) => (s && String(s.id) === String(confirmDeleteId) ? null : s));
    } catch (err: any) {
      console.error("delete error:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to delete";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  // pagination helpers
  const goToPage = async (p: number) => {
    const newP = Math.max(1, Math.min(p, lastPage || 1));
    setPage(newP);
    await fetchCategories(newP, searchTerm);
  };

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 7;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > lastPage) {
      end = lastPage;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  // show newest first (reverse)
  const tableRows = [...categories].reverse();

  // small UI refresh helper
  const handleRefresh = async () => {
    await fetchCategories(page, searchTerm);
    toast.success("Refreshed");
  };

  // keyboard escape to close drawers
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        if (isDrawerOpen) setIsDrawerOpen(false);
        if (isViewOpen) setIsViewOpen(false);
        if (confirmDeleteId) setConfirmDeleteId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, isViewOpen, confirmDeleteId]);
  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto ">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex items-center">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="border rounded-md px-3 py-2 w-72 focus:ring focus:ring-indigo-200"
              />
              <SearchIcon className="absolute right-3 h-4 w-4 text-slate-400" />
            </div>

            <Button variant="ghost" onClick={() => void handleRefresh()} className="ml-2" aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button onClick={() => openAddDrawer()} className="ml-2">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>
        </div>

        <Card className="overflow-x-auto shadow-sm rounded-md">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">S.no</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Image</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Products</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Created</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-9 w-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <div className="text-sm text-slate-600">Loading categories…</div>
                    </div>
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    {searchTerm.trim() ? (
                      <>No categories found for <strong className="text-slate-700">"{searchTerm.trim()}"</strong>.</>
                    ) : (
                      <>No categories available.</>
                    )}
                  </td>
                </tr>
              ) : (
                tableRows.map((c, i) => (
                  <tr key={String(c.id)}>
                    <td className="px-4 py-3 text-sm">{(page - 1) * perPage + i + 1}</td>

                    <td className="px-4 py-3">
                      <img
                        src={resolveImageUrl(c.image_url ??IMAGES.DummyImage)}
                        alt={c.category}
                        className="w-14 h-14 object-cover rounded"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (!img.dataset.fallback) {
                            img.dataset.fallback = "true";
                            img.src = unsplashForCategory(c.category, "600x600");
                          }
                        }}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{c.category}</div>
                      <div className="text-xs text-slate-400">{String(c.id ?? "")}</div>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600">
                      {(typeof c.productCount === "number" ? c.productCount : 0) + (c.productCount === 1 ? " Product" : " Products")}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-500">{c.createdAt ? new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(new Date(c.createdAt)) : "-"}</td>

                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => openView(c)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>

                        <Button variant="ghost" className="p-2" onClick={() => openEditDrawer(c)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <Button variant="destructive" className="p-2" onClick={() => askDelete(c.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <div className="text-sm text-slate-600">
            Showing page {page} of {Math.max(1, lastPage)} • {totalItems} items
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => void goToPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">
              First
            </button>
            <button onClick={() => void goToPage(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">
              Prev
            </button>

            <div className="flex items-center gap-1">
              {renderPageNumbers().map((p) => {
                const active = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => void goToPage(p)}
                    className={`px-3 py-1 rounded border transition-all text-sm ${active ? "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold border-transparent" : "bg-white hover:bg-slate-50 text-slate-700"}`}
                    aria-current={active ? "page" : undefined}
                    aria-label={`Go to page ${p}`}
                  >
                    {p}
                  </button>
                );
              })}
              {lastPage > 7 && <div className="px-2 text-sm text-slate-600">... {lastPage}</div>}
            </div>

            <button onClick={() => void goToPage(page + 1)} disabled={page === lastPage} className="px-2 py-1 border rounded disabled:opacity-50">
              Next
            </button>
            <button onClick={() => void goToPage(lastPage)} disabled={page === lastPage} className="px-2 py-1 border rounded disabled:opacity-50">
              Last
            </button>
          </div>
        </div>

        {/* Add / Edit Drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEditMode ? "Edit category" : "Add category"}>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setIsDrawerOpen(false);
                setForm({ ...defaultForm });
                setImageFile(null);
                setEditingId(null);
                setIsEditMode(false);
                setErrors({});
                if (fileRef.current) fileRef.current.value = "";
              }}
              aria-hidden="true"
            />

            <aside className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full">
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">{isEditMode ? "Edit Category" : "Add Category"}</h3>
                  <p className="text-sm text-slate-500">{isEditMode ? "Update category details" : "Fill in category details"}</p>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setForm({ ...defaultForm });
                    setImageFile(null);
                    setEditingId(null);
                    setIsEditMode(false);
                    setErrors({});
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  aria-label="Close drawer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <img src={form.image ||IMAGES.DummyImage} alt="Preview" className="w-full h-44 object-cover rounded-md border" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = SAMPLE_IMG; }} />
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-slate-200"}`}
                      placeholder="e.g. Beverages"
                    />
                    {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image</label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm" />
                    <p className="text-xs text-slate-400 mt-1">Max 5MB. Square images look best. Leave empty to keep existing image.</p>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => { setIsDrawerOpen(false); setForm({ ...defaultForm }); setImageFile(null); setEditingId(null); setIsEditMode(false); setErrors({}); if (fileRef.current) fileRef.current.value = ""; }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                      {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save" : "Add Category"}
                    </Button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        )}

        {/* View Drawer */}
        {isViewOpen && selectedItem && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Category details">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />

            <aside className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl md:w-96 w-full p-6">
              <div className="flex items-start justify-between border-b pb-3 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Category details</h3>
                </div>
                <button onClick={() => setIsViewOpen(false)} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <img src={resolveImageUrl(selectedItem.image_url ?? selectedItem.image)} alt={selectedItem.category} className="w-full h-44 object-cover rounded-md mb-4" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = SAMPLE_IMG; }} />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Name</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedItem.category}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Products</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedItem.productCount ?? 0}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Created</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedItem.createdAt ? new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(new Date(selectedItem.createdAt)) : "-"}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-4">
                  <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Delete confirm modal */}
        {confirmDeleteId != null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
            <div className="relative bg-white rounded shadow-lg w-full max-w-sm p-4">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-semibold">Confirm delete</h4>
                <button onClick={cancelDelete} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="mt-3 text-sm">Are you sure you want to delete this category? This action cannot be undone.</div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={cancelDelete} disabled={isDeleting}>Cancel</Button>
                <Button variant="destructive" onClick={() => void confirmDelete()} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}











