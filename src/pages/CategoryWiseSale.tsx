
// import React, { useEffect, useRef, useState } from "react";
// import { Plus, X, Edit2, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../../src/api/axios"

// const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
// const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

// type CategoryItem = {
//   id: string | number;
//   category: string;
//   image?: string; // full URL
//   createdAt?: string;
//   productCount?: number;
// };

// function unsplashForCategory(cat?: string, size = "600x400") {
//   const keyword = (cat || "grocery").split(" ").slice(0, 3).join(",");
//   return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
// }

// export default function CategoriesShowcase(): JSX.Element {
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Drawer + form states
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [catForm, setCatForm] = useState<{ category: string; imagePreview?: string }>({ category: "", imagePreview: "" });
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const fileRef = useRef<HTMLInputElement | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);

//   // normalization helper: prefer image_url (full URL) returned by server
//   const normalizeRow = (r: any, i = 0): CategoryItem => ({
//     id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
//     category: (r.name ?? r.category ?? r.title ?? `Category ${i + 1}`).toString(),
//     image:
//       r.image_url ??
//       r.imageUrl ??
//       r.image ??
//       r.photo ??
//       (r.name ? unsplashForCategory(r.name) : undefined) ??
//       SAMPLE_IMG,
//     createdAt: r.created_at ?? r.createdAt ?? undefined,
//     productCount: r.products_count ?? r.count ?? 0,
//   });

//   // FETCH (GET all)
//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       // NOTE: api instance should include baseURL (e.g. http://.../api) and auth interceptor
//       const res = await api.get("/admin/categories/show");
//       const body = res?.data ?? null;
//       let rows: any[] = [];

//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else if (Array.isArray(body.rows)) rows = body.rows;
//       else if (body && Array.isArray(body.categories)) rows = body.categories;
//       else {
//         const arr = Object.values(body || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr as any[];
//       }

//       if (rows.length) {
//         setCategories(rows.map((r, i) => normalizeRow(r, i)));
//       } else {
//         setCategories([]);
//         toast.success("No categories returned from server.");
//       }
//     } catch (err: any) {
//       console.error("fetchCategories error:", err);
//       const serverMsg = err?.response?.data?.message ?? err?.message ?? "Network error while loading categories.";
//       toast.error(serverMsg);
//       setCategories([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void fetchCategories();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // FILE handling (store raw File and preview)
//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] ?? null;

//     // If user cleared input
//     if (!file) {
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }

//     // Content-type check
//     if (!file.type || !file.type.startsWith("image/")) {
//       toast.error("Selected file is not an image. Please choose a valid image file.");
//       if (fileRef.current) fileRef.current.value = "";
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }

//     // Size check
//     if (file.size > MAX_IMAGE_BYTES) {
//       toast.error("Image too large (max 5MB). Please select a smaller file.");
//       if (fileRef.current) fileRef.current.value = "";
//       setSelectedFile(null);
//       setCatForm((p) => ({ ...p, imagePreview: "" }));
//       return;
//     }

//     // All good -> set file and preview
//     setSelectedFile(file);
//     const reader = new FileReader();
//     reader.onload = () => setCatForm((p) => ({ ...p, imagePreview: String(reader.result) }));
//     reader.readAsDataURL(file);
//   };

//   // GET single (used when opening edit, fallback if we need fresh server data)
//   const fetchSingle = async (id: string | number) => {
//     try {
//       const res = await api.get(`/admin/categories/show/${id}`);
//       const body = res?.data ?? null;
//       const item = body?.data ?? body?.category ?? body ?? null;
//       return item ? normalizeRow(item) : null;
//     } catch (err: any) {
//       const msg = err?.response?.data?.message ?? err?.message ?? `Failed to fetch item`;
//       throw new Error(msg);
//     }
//   };

//   // CREATE (POST with FormData -> /admin/categories/add)
//   const createCategory = async (payload: { name: string; file?: File | null }) => {
//     try {
//       const fd = new FormData();
//       fd.append("name", payload.name);
//       if (payload.file) fd.append("image", payload.file);

//       const res = await api.post("/admin/categories/add", fd);
//       const body = res?.data ?? null;
//       const serverItem = body?.data ?? body?.category ?? body ?? null;
//       return serverItem ? normalizeRow(serverItem) : null;
//     } catch (err: any) {
//       const msg = err?.response?.data?.message ?? err?.message ?? "Create failed";
//       throw new Error(msg);
//     }
//   };

//   // UPDATE (POST with FormData -> /admin/categories/update/:id)
//   const updateCategory = async (id: string | number, payload: { name: string; file?: File | null }) => {
//     try {
//       const fd = new FormData();
//       fd.append("name", payload.name);
//       if (payload.file) fd.append("image", payload.file);

//       const res = await api.post(`/admin/categories/update/${id}`, fd);
//       const body = res?.data ?? null;
//       const serverItem = body?.data ?? body?.category ?? body ?? null;
//       return serverItem ? normalizeRow(serverItem) : null;
//     } catch (err: any) {
//       const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
//       throw new Error(msg);
//     }
//   };

//   // DELETE -> /admin/categories/delete/:id
//   const deleteCategoryReq = async (id: string | number) => {
//     try {
//       await api.delete(`/admin/categories/delete/${id}`);
//       return true;
//     } catch (err: any) {
//       const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
//       throw new Error(msg);
//     }
//   };

//   // open drawer for create
//   const openCreate = () => {
//     setEditingId(null);
//     setCatForm({ category: "", imagePreview: "" });
//     setSelectedFile(null);
//     if (fileRef.current) fileRef.current.value = "";
//     setDrawerOpen(true);
//   };

//   // open drawer for edit (try to fetch fresh server item; fallback to local)
//   const openEdit = async (item: CategoryItem) => {
//     setEditingId(item.id);
//     setSelectedFile(null);
//     if (fileRef.current) fileRef.current.value = "";
//     try {
//       const server = await fetchSingle(item.id);
//       setCatForm({ category: server?.category ?? item.category, imagePreview: server?.image ?? item.image ?? "" });
//     } catch {
//       setCatForm({ category: item.category, imagePreview: item.image ?? "" });
//     }
//     setDrawerOpen(true);
//   };

//   // handle submit (create or update)
//   const handleSubmit = async (ev?: React.FormEvent) => {
//     ev?.preventDefault();

//     if (!catForm.category.trim()) {
//       toast.error("Please enter a category name.");
//       return;
//     }

//     // Validation: When creating (editingId === null), require an image file
//     if (!editingId) {
//       if (!selectedFile) {
//         toast.error("Please select an image for the new category (max 5MB).");
//         return;
//       }
//     }

//     setSubmitting(true);
//     const payload = { name: catForm.category.trim(), file: selectedFile };

//     try {
//       if (editingId) {
//         await updateCategory(editingId, payload);
//         toast.success("Category updated");
//       } else {
//         await createCategory(payload);
//         toast.success("Category created");
//       }

//       await fetchCategories();
//       setDrawerOpen(false);
//       setCatForm({ category: "", imagePreview: "" });
//       setSelectedFile(null);
//       if (fileRef.current) fileRef.current.value = "";
//     } catch (err: any) {
//       console.error("submit error:", err);
//       const serverMsg = err?.message ?? "Failed to save category";
//       toast.error(serverMsg);
//     } finally {
//       setSubmitting(false);
//       setEditingId(null);
//     }
//   };

//   const handleDelete = async (id: string | number) => {
//     const confirmed = window.confirm("Delete this category? This action cannot be undone.");
//     if (!confirmed) return;
//     const prev = categories;
//     setCategories((p) => p.filter((c) => String(c.id) !== String(id)));
//     try {
//       await deleteCategoryReq(id);
//       toast.success("Category deleted");
//       await fetchCategories();
//     } catch (err: any) {
//       console.error("delete error:", err);
//       setCategories(prev);
//       const serverMsg = err?.message ?? "Failed to delete category";
//       toast.error(serverMsg);
//     }
//   };

//   return (
//     <div className="p-6">
//       <Toaster position="top-right" />
//       <div className="flex items-start justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
//         </div>
//         <div className="ml-auto flex items-center gap-3">
//           <button
//             onClick={openCreate}
//             className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm"
//             title="Add Category"
//           >
//             Add Category
//           </button>
//         </div>
//       </div>

//       {/* Grid */}
//       <div className="mb-6">
//         {loading ? (
//           <div className="flex flex-wrap gap-6">
//             {[1, 2, 3, 4, 5].map((n) => (
//               <div key={n} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 animate-pulse">
//                 <div className="w-full h-40 rounded-full bg-slate-200 mb-3" />
//                 <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
//                 <div className="h-3 w-1/3 bg-slate-200 rounded" />
//               </div>
//             ))}
//           </div>
//         ) : categories.length === 0 ? (
//           <div className="text-sm text-slate-500">No categories yet.</div>
//         ) : (
//           <div className="flex flex-wrap gap-8">
//             {categories.map((c) => (
//               <div key={String(c.id)} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col items-center text-center">
//                 <div
//                   className="w-36 h-36 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center"
//                   style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
//                 >
//                   {c.image ? (
//                     <img
//                       src={c.image}
//                       alt={c.category}
//                       className="w-full h-full object-cover"
//                       loading="lazy"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src = unsplashForCategory(c.category, "600x400");
//                       }}
//                     />
//                   ) : (
//                     <img src={unsplashForCategory(c.category, "600x400")} alt={c.category} className="w-full h-full object-cover" />
//                   )}
//                 </div>

//                 <div className="mt-4 px-2 w-full">
//                   <div className="text-green-800 font-semibold text-lg leading-tight">{c.category}</div>
//                   <div className="text-sm text-slate-500 mt-1">{(typeof c.productCount === "number" ? c.productCount : 0) + " Products"}</div>

//                   {/* ACTIONS: horizontal row below name */}
//                   <div className="mt-3 flex items-center justify-center gap-3">
//                     <button
//                       onClick={() => openEdit(c)}
//                       aria-label={`Edit ${c.category}`}
//                       title="Edit"
//                       className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
//                     >
//                       <Edit2 className="w-4 h-4" />
//                       <span className="text-sm">Edit</span>
//                     </button>

//                     <button
//                       onClick={() => handleDelete(c.id)}
//                       aria-label={`Delete ${c.category}`}
//                       title="Delete"
//                       className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       <span className="text-sm">Delete</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
//         <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
//       </div>

//       <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
//         <div className="h-full flex flex-col bg-white shadow-xl">
//           <div className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center gap-3">
//               <div className="rounded-md bg-gray-100 p-2"><Plus className="w-5 h-5" /></div>
//               <div>
//                 <h2 className="text-lg font-medium">{editingId ? "Edit Category" : "Add Category"}</h2>
//                 <p className="text-sm text-gray-500">Add or edit a name and optional image (image is uploaded to server).</p>
//               </div>
//             </div>
//             <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
//           </div>

//           <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label htmlFor="category" className="block text-sm font-medium text-gray-700">Name (Category)</label>
//                 <input id="category" value={catForm.category} onChange={(e) => setCatForm((s) => ({ ...s, category: e.target.value }))} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Beverages" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Image {editingId ? <span className="text-xs text-gray-400">(optional)</span> : <span className="text-xs text-red-500">(required)</span>}
//                 </label>

//                 <div className="mt-1 flex items-center gap-3">
//                   <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
//                     {catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.category || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}
//                   </div>

//                   <div className="flex-1">
//                     <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500" />
//                     <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. {editingId ? "Leave empty to keep existing image." : ""}</p>
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

// components/CategoriesShowcase.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../src/api/axios";

const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

type CategoryItem = {
  id: string | number;
  category: string;
  image?: string; // full URL
  createdAt?: string | null;
  productCount?: number;
};

function unsplashForCategory(cat?: string, size = "600x400") {
  const keyword = (cat || "grocery").split(" ").slice(0, 3).join(",");
  return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
}

export default function CategoriesShowcase(): JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Drawer + form states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ category: string; imagePreview?: string }>({ category: "", imagePreview: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // --- IMPORTANT CHANGE: improved normalization that converts relative `image` into absolute URL ---
  const normalizeRow = (r: any, i = 0): CategoryItem => {
    // parse product count safely (may be string)
    const rawCount = r.products_count ?? r.count ?? r.productsCount ?? 0;
    const parsedCount = typeof rawCount === "string" ? Number(rawCount || 0) : Number(rawCount ?? 0);

    // prefer explicit full URL returned by server
    let resolvedImage: string | undefined = undefined;

    if (r.image_url && String(r.image_url).trim()) {
      resolvedImage = String(r.image_url).trim();
    } else if (r.imageUrl && String(r.imageUrl).trim()) {
      resolvedImage = String(r.imageUrl).trim();
    } else if (r.image && String(r.image).trim()) {
      // r.image may be a relative path like 'categories/xxx.png' — convert to absolute using api.defaults.baseURL if available
      const raw = String(r.image).trim();

      // If it already looks absolute, use it
      if (/^https?:\/\//i.test(raw)) {
        resolvedImage = raw;
      } else {
        // try to resolve relative against axios baseURL, fallback to window.location.origin
        try {
          // api.defaults.baseURL may be something like "https://9nutsapi.nearbydoctors.in/public" or "https://9nutsapi.nearbydoctors.in/public/api"
          const baseCandidate = String((api && (api as any).defaults && (api as any).defaults.baseURL) || window.location.origin);
          // ensure base ends with slash so new URL handles relative properly
          const base = baseCandidate.endsWith("/") ? baseCandidate : baseCandidate + "/";
          resolvedImage = new URL(raw.replace(/^\/+/, ""), base).toString();
        } catch (e) {
          // fallback: try to guess common storage path used by your API (this is conservative)
          try {
            resolvedImage = `${window.location.origin}/storage/${raw.replace(/^\/+/, "")}`;
          } catch {
            resolvedImage = undefined;
          }
        }
      }
    }

    // final fallback: use unsplash or sample image
    const finalImage =
      resolvedImage ??
      (r.name ? unsplashForCategory(r.name) : undefined) ??
      SAMPLE_IMG;

    return {
      id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
      category: (r.name ?? r.category ?? r.title ?? `Category ${i + 1}`).toString(),
      image: finalImage,
      createdAt: r.created_at ?? r.createdAt ?? null,
      productCount: Number.isFinite(parsedCount) ? parsedCount : 0,
    };
  };

  // FETCH (GET all)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/categories/show");
      const body = res?.data ?? null;
      let rows: any[] = [];

      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else if (body && Array.isArray(body.categories)) rows = body.categories;
      else {
        const arr = Object.values(body || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      if (rows.length) {
        setCategories(rows.map((r, i) => normalizeRow(r, i)));
      } else {
        setCategories([]);
        toast.success("No categories returned from server.");
      }
    } catch (err: any) {
      console.error("fetchCategories error:", err);
      const serverMsg = err?.response?.data?.message ?? err?.message ?? "Network error while loading categories.";
      toast.error(serverMsg);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FILE handling (store raw File and preview)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Selected file is not an image. Please choose a valid image file.");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 5MB). Please select a smaller file.");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setCatForm((p) => ({ ...p, imagePreview: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  // GET single (used when opening edit, fallback if we need fresh server data)
  const fetchSingle = async (id: string | number) => {
    try {
      const res = await api.get(`/admin/categories/show/${id}`);
      const body = res?.data ?? null;
      const item = body?.data ?? body?.category ?? body ?? null;
      return item ? normalizeRow(item) : null;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? `Failed to fetch item`;
      throw new Error(msg);
    }
  };

  // CREATE (POST with FormData -> /admin/categories/add)
  const createCategory = async (payload: { name: string; file?: File | null }) => {
    try {
      const fd = new FormData();
      fd.append("name", payload.name);
      if (payload.file) {
        fd.append("image", payload.file, payload.file.name);
      }

      const res = await api.post("/admin/categories/add", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const body = res?.data ?? null;
      const serverItem = body?.data ?? body?.category ?? body ?? null;
      return serverItem ? normalizeRow(serverItem) : null;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Create failed";
      throw new Error(msg);
    }
  };

  // UPDATE (POST with FormData -> /admin/categories/update/:id)
  const updateCategory = async (id: string | number, payload: { name: string; file?: File | null }) => {
    try {
      const fd = new FormData();
      fd.append("name", payload.name);
      fd.append("_method", "PUT");
      if (payload.file) {
        fd.append("image", payload.file, payload.file.name);
      }

      const res = await api.post(`/admin/categories/update/${id}`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const body = res?.data ?? null;
      const serverItem = body?.data ?? body?.category ?? body ?? null;
      return serverItem ? normalizeRow(serverItem) : null;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      throw new Error(msg);
    }
  };

  // DELETE -> /admin/categories/delete/:id
  const deleteCategoryReq = async (id: string | number) => {
    try {
      await api.delete(`/admin/categories/delete/${id}`);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
      throw new Error(msg);
    }
  };

  // open drawer for create
  const openCreate = () => {
    setEditingId(null);
    setCatForm({ category: "", imagePreview: "" });
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setDrawerOpen(true);
  };

  // open drawer for edit (try to fetch fresh server item; fallback to local)
  const openEdit = async (item: CategoryItem) => {
    setEditingId(item.id);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    try {
      const server = await fetchSingle(item.id);
      setCatForm({ category: server?.category ?? item.category, imagePreview: server?.image ?? item.image ?? "" });
    } catch {
      setCatForm({ category: item.category, imagePreview: item.image ?? "" });
    }
    setDrawerOpen(true);
  };

  // helper: pretty date
  const prettyDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return iso;
    }
  };

  // handle submit (create or update)
  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();

    if (!catForm.category.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    if (!editingId) {
      if (!selectedFile) {
        toast.error("Please select an image for the new category (max 5MB).");
        return;
      }
    }

    setSubmitting(true);
    const payload = { name: catForm.category.trim(), file: selectedFile };

    try {
      if (editingId) {
        await updateCategory(editingId, payload);
        toast.success("Category updated");
      } else {
        await createCategory(payload);
        toast.success("Category created");
      }

      await fetchCategories();
      setDrawerOpen(false);
      setCatForm({ category: "", imagePreview: "" });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      console.error("submit error:", err);
      const serverMsg = err?.message ?? "Failed to save category";
      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = window.confirm("Delete this category? This action cannot be undone.");
    if (!confirmed) return;
    const prev = categories;
    setCategories((p) => p.filter((c) => String(c.id) !== String(id)));
    try {
      await deleteCategoryReq(id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (err: any) {
      console.error("delete error:", err);
      setCategories(prev);
      const serverMsg = err?.message ?? "Failed to delete category";
      toast.error(serverMsg);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={openCreate}
            className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm"
            title="Add Category"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mb-6">
        {loading ? (
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 animate-pulse">
                <div className="w-full h-40 rounded-full bg-slate-200 mb-3" />
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-1/3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-slate-500">No categories yet.</div>
        ) : (
          <div className="flex flex-wrap gap-8">
            {categories.map((c) => (
              <div key={String(c.id)} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col items-center text-center">
                <div
                  className="w-36 h-36 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center"
                  style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.category}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // fallback to Unsplash if the resolved image fails
                        (e.currentTarget as HTMLImageElement).src = unsplashForCategory(c.category, "600x400");
                      }}
                    />
                  ) : (
                    <img src={unsplashForCategory(c.category, "600x400")} alt={c.category} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="mt-4 px-2 w-full">
                  <div className="text-green-800 font-semibold text-lg leading-tight">{c.category}</div>

                  <div className="text-sm text-slate-500 mt-1">
                    {(typeof c.productCount === "number" ? c.productCount : 0) + (c.productCount === 1 ? " Product" : " Products")}
                  </div>

                  {c.createdAt ? (
                    <div className="text-xs text-slate-400 mt-1">Created {prettyDate(c.createdAt)}</div>
                  ) : null}

                  {/* ACTIONS: horizontal row below name */}
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.category}`}
                      title="Edit"
                      className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      aria-label={`Delete ${c.category}`}
                      title="Delete"
                      className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
        <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      </div>

      <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-gray-100 p-2"><Plus className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-medium">{editingId ? "Edit Category" : "Add Category"}</h2>
                <p className="text-sm text-gray-500">Add or edit a name and optional image (image is uploaded to server).</p>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
          </div>

          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Name (Category)</label>
                <input id="category" value={catForm.category} onChange={(e) => setCatForm((s) => ({ ...s, category: e.target.value }))} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Beverages" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image {editingId ? <span className="text-xs text-gray-400">(optional)</span> : <span className="text-xs text-red-500">(required)</span>}
                </label>

                <div className="mt-1 flex items-center gap-3">
                  <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
                    {catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.category || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}
                  </div>

                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500" />
                    <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. {editingId ? "Leave empty to keep existing image." : ""}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-md border" onClick={() => { setCatForm({ category: "", imagePreview: "" }); setDrawerOpen(false); setSelectedFile(null); setEditingId(null); if (fileRef.current) fileRef.current.value = ""; }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                {submitting ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}

