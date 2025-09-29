
// import React, { useEffect, useRef, useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Plus, RefreshCw, Trash2, Edit3, Eye, X } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../api/axios";

// type Product = {
//   id: string | number;
//   name: string;
//   price: string;
//   grams?: string;
//   discount_amount?: string;
//   discount_price?: string;
//   image?: string;
//   image_url?: string;
//   category?: { id?: number | string; name?: string } | string | null;
//   stock?: number | string | null;
//   slug?: string;
//   [k: string]: any;
// };

// type CategoryItem = { id: string; name: string };

// const defaultForm = {
//   name: "",
//   grams: "",
//   category: "", // category id (string)
//   price: "",
//   discount_amount: "",
//   discount_price: "",
//   image: "",
// };

// export default function Products(): JSX.Element {
//   const basePath = "/admin/products";
//   const DUMMY_IMAGE = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";

//   // state
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // pagination (server-driven)
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [lastPage, setLastPage] = useState<number>(1);
//   const [perPage, setPerPage] = useState<number>(10);
//   const [totalItems, setTotalItems] = useState<number>(0);

//   // search
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   // drawers & view
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [isViewOpen, setIsViewOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   // form
//   const [form, setForm] = useState({ ...defaultForm });
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // delete confirm modal
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const firstInputRef = useRef<HTMLInputElement | null>(null);
//   const drawerRef = useRef<HTMLDivElement | null>(null);
//   const viewDrawerRef = useRef<HTMLDivElement | null>(null);

//   // ---------------- helpers ----------------
//   const resolveImage = (p?: Product | string | undefined) => {
//     let raw: string | undefined;
//     if (!p) raw = undefined;
//     else if (typeof p === "string") raw = p;
//     else raw = (p as any).image_url ?? (p as any).image;
//     if (!raw) return DUMMY_IMAGE;
//     if (/^https?:\/\//i.test(raw)) return raw;
//     try {
//       const base = (api as any)?.defaults?.baseURL ?? window.location.origin;
//       const baseClean = base.endsWith("/") ? base : base + "/";
//       return new URL(String(raw).replace(/^\/+/, ""), baseClean).toString();
//     } catch {
//       return raw;
//     }
//   };

//   function normalizeProduct(raw: any): Product {
//     if (!raw) return { id: `local-${Date.now()}`, name: "Untitled", price: "0" };
//     const id = raw.id ?? raw._id ?? raw.product_id ?? raw.slug ?? `local-${Date.now()}`;
//     const cat = raw.category ?? raw.cat ?? raw.category_id ?? null;
//     const category =
//       cat && typeof cat === "object" ? { id: cat.id ?? cat._id ?? cat.category_id, name: cat.name ?? cat.title } : cat ?? null;
//     return {
//       id,
//       name: String(raw.name ?? raw.title ?? "Untitled"),
//       price: String(raw.price ?? raw.amount ?? raw.cost ?? "0"),
//       grams: raw.grams ?? raw.gram ?? raw.weight ?? "",
//       discount_amount: raw.discount_amount ?? raw.discountAmount ?? "",
//       discount_price: raw.discount_price ?? raw.discountPrice ?? "",
//       image: raw.image ?? raw.image_url ?? raw.imageUrl ?? undefined,
//       image_url: raw.image_url ?? raw.imageUrl ?? raw.image ?? undefined,
//       category,
//       stock: raw.stock ?? raw.qty ?? null,
//       slug: raw.slug ?? "",
//       ...raw,
//     };
//   }

//   // safe trim helper — converts anything to string, returns undefined for empty strings
//   const safeTrim = (v: unknown): string | undefined => {
//     if (v === undefined || v === null) return undefined;
//     const s = String(v).trim();
//     return s === "" ? undefined : s;
//   };

//   // ----------- fetch categories endpoint (site-wide list) -----------
//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/admin/categories/show");
//       const body = res.data ?? res;
//       // robust extraction: try common shapes
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) {
//         // body.data might be paginated or plain array
//         if (Array.isArray(body.data.data)) rows = body.data.data;
//         else rows = body.data;
//       } else {
//         // scan shallow values for first array
//         const arr = Object.values(body || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr as any[];
//       }

//       // normalize category items
//       const normalizedCats: CategoryItem[] = rows
//         .map((r) => {
//           const id = String(r.id ?? r._id ?? r.category_id ?? r.categoryId ?? r.id?.toString?.() ?? "").trim();
//           const name = String(r.name ?? r.title ?? r.label ?? r.category_name ?? id ?? "");
//           return id ? { id, name } : null;
//         })
//         .filter(Boolean) as CategoryItem[];

//       // dedupe
//       const dedup: Record<string, CategoryItem> = {};
//       normalizedCats.forEach((c) => (dedup[c.id] = c));
//       setCategories(Object.values(dedup));
//     } catch (err: any) {
//       console.error("fetchCategories failed:", err, err?.response?.data);
//       toast.error("Failed to load categories (dropdown may be incomplete)");
//     }
//   };

//   // ---------------- API ----------------
//   // Modified to accept `search` param and include it in query string
//   const fetchProducts = async (page = 1, search = "") => {
//     setIsLoading(true);
//     try {
//       const qs = `?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
//       const res = await api.get(`${basePath}/show${qs}`);
//       const body = res.data ?? res;
//       if (!body || typeof body !== "object") throw new Error("Unexpected response from server");

//       const payload = body.data ?? body;
//       const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(body.data) ? body.data : [];

//       const normalized = rows.map((r: any) => normalizeProduct(r));
//       setProducts(normalized);

//       // pagination meta
//       const cp = Number(payload?.current_page ?? 1);
//       const lp = Number(payload?.last_page ?? 1);
//       const pp = Number(payload?.per_page ?? payload?.perPage ?? perPage);
//       const tot = Number(payload?.total ?? payload?.count ?? normalized.length);

//       setCurrentPage(cp);
//       setLastPage(lp || 1);
//       setPerPage(pp || perPage);
//       setTotalItems(tot || normalized.length);
//     } catch (err: any) {
//       console.error("fetchProducts failed:", err, err?.response?.data);
//       const message = err?.response?.data?.message ?? err?.message ?? "Failed to load products";
//       toast.error(message);
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createProductApi = async (payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name) fd.append("name", String(payload.name));
//     if (payload.price) fd.append("price", String(payload.price));
//     if (payload.discount_price) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
//     if (file) fd.append("image", file);
//     try {
//       const res = await api.post(`${basePath}/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//       return res.data ?? res;
//     } catch (err) {
//       console.error("createProductApi error:", err);
//       throw err;
//     }
//   };

//   const updateProductApi = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name !== undefined) fd.append("name", String(payload.name));
//     if (payload.price !== undefined) fd.append("price", String(payload.price));
//     if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
//     if (file) fd.append("image", file);
//     try {
//       const res = await api.post(`${basePath}/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//       return res.data ?? res;
//     } catch (err) {
//       console.error("updateProductApi error:", err);
//       throw err;
//     }
//   };

//   const deleteProductApi = async (id: string | number) => {
//     try {
//       const res = await api.delete(`${basePath}/delete/${id}`);
//       return res.data ?? res;
//     } catch (err) {
//       console.error("deleteProductApi error:", err);
//       throw err;
//     }
//   };

//   // ---------------- lifecycle ----------------
//   useEffect(() => {
//     void fetchProducts(1, searchTerm);
//     void fetchCategories(); // load categories once so dropdown is complete
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Watch searchTerm and refetch (debounced)
//   useEffect(() => {
//     const t = setTimeout(() => {
//       // restart to page 1 whenever search term changes
//       void fetchProducts(1, searchTerm);
//     }, 400);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchTerm]);

//   // ---------------- form & drawers ----------------
//   const openAddDrawer = () => {
//     setForm({ ...defaultForm });
//     setImageFile(null);
//     setErrors({});
//     setIsEditMode(false);
//     setEditingId(null);
//     setIsDrawerOpen(true);
//     setTimeout(() => firstInputRef.current?.focus(), 100);
//   };

//   const openEditDrawer = (p: Product) => {
//     setIsEditMode(true);
//     setEditingId(p.id);
//     setForm({
//       name: p.name ?? "",
//       grams: p.grams ?? "",
//       category: typeof p.category === "object" ? String((p.category as any).id ?? (p.category as any).name ?? "") : String(p.category ?? ""),
//       price: p.price ?? "",
//       discount_amount: p.discount_amount ?? "",
//       discount_price: p.discount_price ?? "",
//       image: p.image_url ?? p.image ?? "",
//     });
//     setImageFile(null);
//     setIsDrawerOpen(true);
//     setTimeout(() => firstInputRef.current?.focus(), 120);
//   };

//   const openView = (p: Product) => {
//     setSelectedProduct(p);
//     setIsViewOpen(true);
//     setTimeout(() => viewDrawerRef.current?.focus(), 120);
//   };

//   const resetForm = () => {
//     setForm({ ...defaultForm });
//     setImageFile(null);
//     setErrors({});
//     setIsEditMode(false);
//     setEditingId(null);
//   };

//   const validateForm = () => {
//     const e: Partial<Record<keyof typeof defaultForm, string>> = {};
//     // use String to guard against non-strings
//     if (!String(form.name ?? "").trim()) e.name = "Name is required";
//     if (!String(form.price ?? "").trim()) e.price = "Price is required";
//     if (!String(form.category ?? "").trim()) e.category = "Category is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleImageChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
//     const file = ev.target.files?.[0] ?? null;
//     if (!file) return;
//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       toast.error("Image too large (max 5MB)");
//       return;
//     }
//     setImageFile(file);
//     const reader = new FileReader();
//     reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
//     reader.readAsDataURL(file);
//   };

//   // ---------- submit (create/update) ----------
//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     if (!validateForm()) {
//       toast.error("Please fix the highlighted fields");
//       return;
//     }

//     // prepare safe trimmed values
//     const nameTrimmed = safeTrim(form.name) ?? "";
//     const priceTrimmed = safeTrim(form.price) ?? "";
//     const discount_price_trimmed = safeTrim(form.discount_price);
//     const discount_amount_trimmed = safeTrim(form.discount_amount);
//     const grams_trimmed = safeTrim(form.grams);

//     let categoryToSend: string | number | undefined = undefined;
//     if (form.category !== "" && form.category != null) {
//       const trimmed = String(form.category).trim();
//       const asNum = Number(trimmed);
//       categoryToSend = !Number.isNaN(asNum) && /^\d+$/.test(trimmed) ? asNum : trimmed;
//     }

//     const payload: Partial<Product> = {
//       name: nameTrimmed,
//       price: priceTrimmed,
//       discount_price: discount_price_trimmed,
//       discount_amount: discount_amount_trimmed,
//       grams: grams_trimmed,
//       category: categoryToSend as any,
//     };

//     setIsSubmitting(true);
//     setErrors({});
//     try {
//       if (isEditMode && editingId != null) {
//         const res = await updateProductApi(editingId, payload, imageFile);
//         const body = res.data ?? res;
//         const updatedRaw = body?.data ?? body?.product ?? body;
//         // refresh current page from server to keep server pagination in sync, preserve search
//         await fetchProducts(currentPage, searchTerm);
//         // re-fetch categories in case category changed/was created
//         await fetchCategories();
//         toast.success("Product updated");
//       } else {
//         const res = await createProductApi(payload, imageFile);
//         const body = res.data ?? res;
//         const createdRaw = body?.data ?? body?.product ?? body;
//         const created = normalizeProduct(createdRaw);

//         // --- NEW: prepend created product so it appears first ---
//         setProducts((prev) => [created, ...prev]);
//         // increment total count so pagination text stays correct
//         setTotalItems((prev) => (typeof prev === "number" ? prev + 1 : 1));
//         // ensure user sees the newest item at top
//         setCurrentPage(1);
//         // re-fetch categories in case category changed/was created
//         await fetchCategories();
//         toast.success("Product added");
//       }
//       setIsDrawerOpen(false);
//       resetForm();
//     } catch (err: any) {
//       console.error("handleSubmit error:", err, err?.response?.data);

//       // If backend returns validation errors in shape { errors: { field: [msg] } } map them to our form
//       const rdata = err?.response?.data;
//       if (rdata && typeof rdata === "object") {
//         if (rdata.errors && typeof rdata.errors === "object") {
//           const mapped: Partial<Record<keyof typeof defaultForm, string>> = {};
//           Object.keys(rdata.errors).forEach((k) => {
//             const val = rdata.errors[k];
//             if (Array.isArray(val)) mapped[k as keyof typeof defaultForm] = String(val[0]);
//             else mapped[k as keyof typeof defaultForm] = String(val);
//           });
//           setErrors((prev) => ({ ...prev, ...mapped }));
//           toast.error("Fix validation errors");
//           setIsSubmitting(false);
//           return;
//         }
//         // message fallback
//         const message = rdata.message ?? rdata.error ?? err?.message;
//         toast.error(typeof message === "string" ? message : "Save failed");
//       } else {
//         toast.error(err?.message ?? "Save failed");
//       }
//     } finally {
//       setIsSubmitting(false);
//       setImageFile(null);
//     }
//   };

//   // show confirm modal (mini-modal) instead of window.confirm
//   const askDelete = (id: string | number) => {
//     setConfirmDeleteId(id);
//   };

//   const confirmDelete = async () => {
//     if (confirmDeleteId == null) return;
//     setIsDeleting(true);
//     try {
//       const res = await deleteProductApi(confirmDeleteId);
//       const body = res.data ?? res;
//       if (body && body.status === false) {
//         toast.error(body.message ?? "Delete failed");
//         setIsDeleting(false);
//         setConfirmDeleteId(null);
//         return;
//       }
//       // refresh the same page after delete (server-driven), preserve search
//       await fetchProducts(currentPage, searchTerm);
//       toast.success("Product deleted");
//       setSelectedProduct((s) => (s && String(s.id) === String(confirmDeleteId) ? null : s));
//     } catch (err: any) {
//       console.error("Delete error:", err, err?.response?.data);
//       const message = err?.response?.data?.message ?? err?.message ?? "Failed to delete product";
//       toast.error(message);
//     } finally {
//       setIsDeleting(false);
//       setConfirmDeleteId(null);
//     }
//   };

//   const cancelDelete = () => {
//     setConfirmDeleteId(null);
//   };

//   const handleRefresh = async () => {
//     await fetchProducts(currentPage, searchTerm);
//     await fetchCategories();
//     toast.success("Refreshed");
//   };

//   // ----------------- filtering (client-side on current page) ----------------
//   const getFiltered = (list: Product[], q: string) => {
//     const s = q.trim().toLowerCase();
//     if (!s) return list;
//     return list.filter((p) => {
//       const id = String(p.id ?? "").toLowerCase();
//       const name = String(p.name ?? "").toLowerCase();
//       const price = String(p.price ?? "").toLowerCase();
//       const grams = String(p.grams ?? "").toLowerCase();
//       const cat = typeof p.category === "object" ? String((p.category as any).name ?? (p.category as any).id ?? "") : String(p.category ?? "");
//       return `${id} ${name} ${price} ${grams} ${cat}`.includes(s);
//     });
//   };

//   const filteredOnPage = getFiltered(products, searchTerm);

//   // keyboard escape for drawers
//   useEffect(() => {
//     const onKey = (ev: KeyboardEvent) => {
//       if (ev.key === "Escape") {
//         if (isDrawerOpen) setIsDrawerOpen(false);
//         if (isViewOpen) setIsViewOpen(false);
//         if (confirmDeleteId) setConfirmDeleteId(null);
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [isDrawerOpen, isViewOpen, confirmDeleteId]);

//   // ---------------- Render ----------------
//   return (
//     <>
//       <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

//       <div className="p-6 max-w-7xl mx-auto">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
//           </div>
//           <div className="flex items-center gap-2 w-full sm:w-auto">
//             <input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by id, name, price, grams or category"
//               className="flex-1 sm:flex-none w-full sm:w-72 border rounded-md px-3 py-2 focus:ring focus:ring-indigo-200"
//             />

//             <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products">
//               <RefreshCw className="h-4 w-4" />
//             </Button>

//             <Button onClick={() => openAddDrawer()}>
//               <Plus className="h-4 w-4 mr-2" /> Add Product
//             </Button>
//           </div>
//         </div>

//         <Card className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-slate-200">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="px-4 py-2 text-left text-sm font-medium">S.no</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Image</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Category (id)</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Grams</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Price</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Discount</th>
//                 <th className="px-4 py-2 text-left text-sm font-medium">Stock</th>
//                 <th className="px-4 py-2 text-right text-sm font-medium">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="bg-white divide-y divide-slate-100">
//               {isLoading ? (
//                 <tr>
//                   <td colSpan={9} className="p-6 text-center text-muted-foreground">
//                     Loading products...
//                   </td>
//                 </tr>
//               ) : filteredOnPage.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="p-6 text-center text-muted-foreground">
//                     No products found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredOnPage.map((p, i) => (
//                   <tr key={String(p.id)}>
//                     <td className="px-4 py-3 text-sm">{(currentPage - 1) * perPage + i + 1}</td>

//                     <td className="px-4 py-3">
//                       <img src={resolveImage(p)} alt={p.name} className="w-14 h-14 object-cover rounded" />
//                     </td>

//                     <td className="px-4 py-3">
//                       <div className="text-sm font-medium">{p.name}</div>
//                       <div className="text-xs text-muted-foreground">{p.slug ?? ""}</div>
//                     </td>

//                     <td className="px-4 py-3 text-sm text-muted-foreground">
//                       {typeof p.category === "object"
//                         ? `${(p.category as any).name ?? "-"} (${(p.category as any).id ?? "-"})`
//                         : `${p.category ?? "-"}`}
//                     </td>

//                     <td className="px-4 py-3 text-sm">{p.grams ?? "-"}</td>

//                     <td className="px-4 py-3 text-sm">₹ {p.price}</td>

//                     <td className="px-4 py-3 text-sm">
//                       <div>{p.discount_price ? `₹ ${p.discount_price}` : "-"}</div>
//                       {p.discount_amount && <div className="text-xs text-muted-foreground">Saved {p.discount_amount}</div>}
//                     </td>

//                     <td className="px-4 py-3 text-sm">{p.stock ?? "-"}</td>

//                     <td className="px-4 py-3 text-sm text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => openView(p)}>
//                           <Eye className="w-4 h-4 mr-1" /> View
//                         </Button>
//                         <Button variant="ghost" className="p-2" onClick={() => openEditDrawer(p)}>
//                           <Edit3 className="w-4 h-4" />
//                         </Button>
//                         <Button variant="destructive" className="p-2" onClick={() => askDelete(p.id)}>
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </Card>

//         {/* Pagination (server-driven) */}
//         <div className="flex items-center justify-between mt-4">
//           <div className="text-sm text-slate-600">
//             Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalItems)} of {totalItems}
//           </div>

//           <div className="flex items-center gap-2">
//             <Button variant="ghost" onClick={() => void fetchProducts(1, searchTerm)} disabled={currentPage === 1}>
//               First
//             </Button>
//             <Button variant="ghost" onClick={() => void fetchProducts(Math.max(1, currentPage - 1), searchTerm)} disabled={currentPage === 1}>
//               Prev
//             </Button>

//             <div className="hidden sm:flex items-center gap-1">
//               {Array.from({ length: lastPage })
//                 .slice(Math.max(0, currentPage - 3), Math.min(lastPage, currentPage + 2))
//                 .map((_, idx) => {
//                   const pageNum = Math.max(1, currentPage - 3) + idx;
//                   const active = pageNum === currentPage;
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => void fetchProducts(pageNum, searchTerm)}
//                       className={`px-3 py-1 rounded border ${active ? "bg-slate-100 font-semibold" : ""}`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//               {lastPage > 6 && <div className="px-2">... {lastPage}</div>}
//             </div>

//             <Button variant="ghost" onClick={() => void fetchProducts(Math.min(lastPage, currentPage + 1), searchTerm)} disabled={currentPage === lastPage}>
//               Next
//             </Button>
//             <Button variant="ghost" onClick={() => void fetchProducts(lastPage, searchTerm)} disabled={currentPage === lastPage}>
//               Last
//             </Button>
//           </div>
//         </div>

//         {/* ----------- Add / Edit Drawer ----------- */}
//         {isDrawerOpen && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEditMode ? "Edit product" : "Add products"}>
//             <div
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//               onClick={() => {
//                 setIsDrawerOpen(false);
//                 resetForm();
//               }}
//               aria-hidden="true"
//             />

//             <aside
//               ref={drawerRef}
//               className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full"
//               style={{ transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)" }}
//             >
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div>
//                   <h3 className="text-xl font-semibold">{isEditMode ? "Edit Product" : "Add Product"}</h3>
//                   <p className="text-sm text-muted-foreground">{isEditMode ? "Update product details" : "Fill in product details"}</p>
//                 </div>

//                 <button
//                   onClick={() => {
//                     setIsDrawerOpen(false);
//                     resetForm();
//                   }}
//                   aria-label="Close drawer"
//                   className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <div className="p-6">
//                 {/* Always show preview (dummy if not provided) */}
//                 <div className="mb-4">
//                   <img src={form.image || DUMMY_IMAGE} alt="Preview" className="w-full h-44 object-cover rounded-md border" />
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Product Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       ref={firstInputRef}
//                       value={form.name}
//                       onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                       className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? "border-red-400" : "border-muted"}`}
//                       placeholder="e.g. Shimla Apple"
//                     />
//                     {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
//                       <input
//                         value={form.price}
//                         onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
//                         className={`block w-full border rounded-md p-2 ${errors.price ? "border-red-400" : "border-muted"}`}
//                         placeholder="1000.00"
//                       />
//                       {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
//                       <select
//                         value={form.category}
//                         onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
//                         className={`block w-full border rounded-md p-2 ${errors.category ? "border-red-400" : "border-muted"}`}
//                       >
//                         <option value="">-- Select category (id) --</option>
//                         {categories.map((c) => (
//                           <option key={c.id} value={c.id}>
//                             {c.name} ({c.id})
//                           </option>
//                         ))}
//                       </select>
//                       {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Grams</label>
//                       <input value={form.grams} onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="750" />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Discount Price</label>
//                       <input value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="800.00" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Discount Amount</label>
//                     <input value={form.discount_amount} onChange={(e) => setForm((f) => ({ ...f, discount_amount: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="200.00" />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Upload Image</label>
//                     <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm" />
//                     <p className="text-xs text-muted-foreground mt-1">If you don't upload, existing image_url will stay.</p>
//                   </div>

//                   <div className="flex items-center justify-end gap-3">
//                     <Button variant="ghost" onClick={() => { resetForm(); setIsDrawerOpen(false); }}>
//                       Cancel
//                     </Button>
//                     <Button type="submit" disabled={isSubmitting} className="bg-chart-primary hover:bg-chart-primary/90">
//                       {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save" : "Add Product"}
//                     </Button>
//                   </div>
//                 </form>
//               </div>
//             </aside>
//           </div>
//         )}

//         {/* ----------- View Drawer ----------- */}
//         {isViewOpen && selectedProduct && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Product details">
//             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />

//             <aside ref={viewDrawerRef} tabIndex={-1} className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl md:w-96 w-full p-6">
//               <div className="flex items-start justify-between border-b pb-3 mb-4">
//                 <div>
//                   <h3 className="text-xl font-semibold">Product details</h3>
//                   <p className="text-sm text-muted-foreground">Viewing product</p>
//                 </div>

//                 <button onClick={() => setIsViewOpen(false)} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <div>
//                 <img src={resolveImage(selectedProduct)} alt={selectedProduct.name} className="w-full h-44 object-cover rounded-md mb-4" />
//                 <div className="space-y-3">
//                   <div>
//                     <div className="text-sm font-medium text-muted-foreground">Name</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.name}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-muted-foreground">Price</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">₹ {selectedProduct.price}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-muted-foreground">Discount Price</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.discount_price ?? "-"}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-muted-foreground">Grams</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.grams ?? "-"}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-muted-foreground">Category</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">
//                       {typeof selectedProduct.category === "object" ? (selectedProduct.category as any).name ?? (selectedProduct.category as any).id : selectedProduct.category ?? "-"}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-end mt-4">
//                   <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
//                 </div>
//               </div>
//             </aside>
//           </div>
//         )}

//         {/* ---------- Delete confirmation mini-modal ---------- */}
//         {confirmDeleteId != null && (
//           <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
//             <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
//             <div className="relative bg-white rounded shadow-lg w-full max-w-sm p-4">
//               <div className="flex items-start justify-between">
//                 <h4 className="text-lg font-semibold">Confirm delete</h4>
//                 <button onClick={cancelDelete} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
//               </div>
//               <div className="mt-3 text-sm">
//                 Are you sure you want to delete this product? This action cannot be undone.
//               </div>
//               <div className="mt-4 flex justify-end gap-2">
//                 <Button variant="ghost" onClick={cancelDelete} disabled={isDeleting}>Cancel</Button>
//                 <Button variant="destructive" onClick={() => void confirmDelete()} disabled={isDeleting}>
//                   {isDeleting ? "Deleting..." : "Delete"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }


"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2, Edit3, Eye, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";

type Product = {
  id: string | number;
  name: string;
  price: string;
  grams?: string;
  discount_amount?: string;
  discount_price?: string;
  image?: string;
  image_url?: string;
  category?: { id?: number | string; name?: string } | string | null;
  stock?: number | string | null;
  slug?: string;
  [k: string]: any;
};

type CategoryItem = { id: string; name: string };

const defaultForm = {
  name: "",
  grams: "",
  category: "", // category id (string)
  price: "",
  discount_amount: "",
  discount_price: "",
  image: "",
};

export default function Products(): JSX.Element {
  const basePath = "/admin/products";
  const DUMMY_IMAGE = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";

  // state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // pagination (server-driven)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // search
  const [searchTerm, setSearchTerm] = useState<string>("");

  // drawers & view
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // form
  const [form, setForm] = useState({ ...defaultForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // delete confirm modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const viewDrawerRef = useRef<HTMLDivElement | null>(null);

  // ---------------- helpers ----------------
  const safeTrim = (v: unknown): string | undefined => {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    return s === "" ? undefined : s;
  };

  // Resolve image for a product or a string URL. Always return a usable image (dummy if needed).
  const resolveImage = (p?: Product | string | undefined) => {
    let raw: string | undefined;
    if (!p) raw = undefined;
    else if (typeof p === "string") raw = p;
    else {
      // prefer a few possible keys
      raw =
        (p as any).image_url ??
        (p as any).image ??
        (p as any).imageUrl ??
        (p as any).photo ??
        (p as any).thumbnail ??
        undefined;
    }

    if (!raw) return DUMMY_IMAGE;

    // if already absolute url, return
    if (/^https?:\/\//i.test(String(raw))) return String(raw);

    // try to resolve relative against API base or origin; if fails return dummy
    try {
      const base = (api as any)?.defaults?.baseURL ?? window.location.origin;
      const baseClean = base.endsWith("/") ? base : base + "/";
      return new URL(String(raw).replace(/^\/+/, ""), baseClean).toString();
    } catch {
      return DUMMY_IMAGE;
    }
  };

  // Normalizer - makes product shape predictable, coerces image fields and strings
  function normalizeProduct(raw: any): Product {
    if (!raw) return { id: `local-${Date.now()}`, name: "Untitled", price: "0" };

    const id = raw.id ?? raw._id ?? raw.product_id ?? raw.slug ?? `local-${Date.now()}`;

    // Normalize category: convert empty string or falsy to null, coerce object shape
    let catRaw = raw.category ?? raw.cat ?? raw.category_id ?? null;
    if (catRaw === "" || catRaw === 0) catRaw = null;
    const category =
      catRaw && typeof catRaw === "object"
        ? { id: catRaw.id ?? catRaw._id ?? catRaw.category_id, name: catRaw.name ?? catRaw.title ?? "" }
        : catRaw ?? null;

    // normalize image fields and ensure image and image_url are strings or undefined
    const imageVal =
      raw.image ??
      raw.image_url ??
      raw.imageUrl ??
      raw.photo ??
      raw.thumbnail ??
      undefined;

    const image_url_val = raw.image_url ?? raw.imageUrl ?? raw.image ?? undefined;

    return {
      id,
      name: String(raw.name ?? raw.title ?? "Untitled"),
      price: String(raw.price ?? raw.amount ?? raw.cost ?? "0"),
      grams: raw.grams ?? raw.gram ?? raw.weight ?? "",
      discount_amount: safeTrim(raw.discount_amount ?? raw.discountAmount) ?? "",
      discount_price: safeTrim(raw.discount_price ?? raw.discountPrice) ?? "",
      image: imageVal,
      image_url: image_url_val,
      category,
      stock: raw.stock ?? raw.qty ?? null,
      slug: raw.slug ?? "",
      ...raw,
    };
  }

  // ----------- fetch categories endpoint (site-wide list) -----------
  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories/show");
      const body = res.data.data ?? res;
      // robust extraction: try common shapes
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) {
        if (Array.isArray(body.data.data)) rows = body.data.data;
        else rows = body.data;
      } else {
        const arr = Object.values(body || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      const normalizedCats: CategoryItem[] = rows
        .map((r) => {
          const id = String(r.id ?? r._id ?? r.category_id ?? r.categoryId ?? r.id?.toString?.() ?? "").trim();
          const name = String(r.name ?? r.title ?? r.label ?? r.category_name ?? id ?? "");
          return id ? { id, name } : null;
        })
        .filter(Boolean) as CategoryItem[];

      const dedup: Record<string, CategoryItem> = {};
      normalizedCats.forEach((c) => (dedup[c.id] = c));
      setCategories(Object.values(dedup));
    } catch (err: any) {
      console.error("fetchCategories failed:", err, err?.response?.data);
      toast.error("Failed to load categories (dropdown may be incomplete)");
    }
  };

  // ---------------- API ----------------
  const fetchProducts = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const qs = `?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const res = await api.get(`${basePath}/show${qs}`);
      const body = res.data ?? res;
      if (!body || typeof body !== "object") throw new Error("Unexpected response from server");

      const payload = body.data ?? body;
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(body.data) ? body.data : [];

      const normalized = rows.map((r: any) => normalizeProduct(r));
      setProducts(normalized);

      // pagination meta
      const cp = Number(payload?.current_page ?? 1);
      const lp = Number(payload?.last_page ?? 1);
      const pp = Number(payload?.per_page ?? payload?.perPage ?? perPage);
      const tot = Number(payload?.total ?? payload?.count ?? normalized.length);

      setCurrentPage(cp);
      setLastPage(lp || 1);
      setPerPage(pp || perPage);
      setTotalItems(tot || normalized.length);
    } catch (err: any) {
      console.error("fetchProducts failed:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to load products";
      toast.error(message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createProductApi = async (payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
    if (file) fd.append("image", file);
    try {
      const res = await api.post(`${basePath}/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data ?? res;
    } catch (err) {
      console.error("createProductApi error:", err, err?.response?.data ?? err);
      throw err;
    }
  };

  const updateProductApi = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
    if (file) fd.append("image", file);
    try {
      const res = await api.post(`${basePath}/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data ?? res;
    } catch (err) {
      console.error("updateProductApi error:", err, err?.response?.data ?? err);
      throw err;
    }
  };

  const deleteProductApi = async (id: string | number) => {
    try {
      const res = await api.delete(`${basePath}/delete/${id}`);
      return res.data ?? res;
    } catch (err) {
      console.error("deleteProductApi error:", err);
      throw err;
    }
  };

  // ---------------- lifecycle ----------------
  useEffect(() => {
    void fetchProducts(1, searchTerm);
    void fetchCategories(); // load categories once so dropdown is complete
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch searchTerm and refetch (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      // restart to page 1 whenever search term changes
      void fetchProducts(1, searchTerm);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // ---------------- form & drawers ----------------
  const openAddDrawer = () => {
    setForm({ ...defaultForm });
    setImageFile(null);
    setErrors({});
    setIsEditMode(false);
    setEditingId(null);
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 100);
  };

  const openEditDrawer = (p: Product) => {
    setIsEditMode(true);
    setEditingId(p.id);
    // Coerce values to strings (so form always contains strings) and avoid non-string .trim errors
    setForm({
      name: safeTrim(p.name) ?? String(p.name ?? ""),
      grams: safeTrim(p.grams) ?? String(p.grams ?? ""),
      category:
        p.category && typeof p.category === "object"
          ? String((p.category as any).id ?? (p.category as any).name ?? "")
          : String(p.category ?? ""),
      price: safeTrim(p.price) ?? String(p.price ?? ""),
      discount_amount: safeTrim(p.discount_amount) ?? String(p.discount_amount ?? ""),
      discount_price: safeTrim(p.discount_price) ?? String(p.discount_price ?? ""),
      image: (p.image_url ?? p.image ?? "") as string,
    });
    setImageFile(null);
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 120);
  };

  const openView = (p: Product) => {
    setSelectedProduct(p);
    setIsViewOpen(true);
    setTimeout(() => viewDrawerRef.current?.focus(), 120);
  };

  const resetForm = () => {
    setForm({ ...defaultForm });
    setImageFile(null);
    setErrors({});
    setIsEditMode(false);
    setEditingId(null);
  };

  const validateForm = () => {
    const e: Partial<Record<keyof typeof defaultForm, string>> = {};
    if (!String(form.name ?? "").trim()) e.name = "Name is required";
    if (!String(form.price ?? "").trim()) e.price = "Price is required";
    if (!String(form.category ?? "").trim()) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  // ---------- submit (create/update) ----------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    // prepare safe trimmed values (safeTrim guards non-strings)
    const nameTrimmed = safeTrim(form.name) ?? "";
    const priceTrimmed = safeTrim(form.price) ?? "";
    const discount_price_trimmed = safeTrim(form.discount_price);
    const discount_amount_trimmed = safeTrim(form.discount_amount);
    const grams_trimmed = safeTrim(form.grams);

    let categoryToSend: string | number | undefined = undefined;
    if (form.category !== "" && form.category != null) {
      const trimmed = String(form.category).trim();
      const asNum = Number(trimmed);
      categoryToSend = !Number.isNaN(asNum) && /^\d+$/.test(trimmed) ? asNum : trimmed;
    }

    const payload: Partial<Product> = {
      name: nameTrimmed,
      price: priceTrimmed,
      discount_price: discount_price_trimmed,
      discount_amount: discount_amount_trimmed,
      grams: grams_trimmed,
      category: categoryToSend as any,
    };

    setIsSubmitting(true);
    setErrors({});
    try {
      if (isEditMode && editingId != null) {
        const res = await updateProductApi(editingId, payload, imageFile);
        // refresh current page from server to keep server pagination in sync, preserve search
        await fetchProducts(currentPage, searchTerm);
        // re-fetch categories in case category changed/was created
        await fetchCategories();
        toast.success("Product updated");
      } else {
        const res = await createProductApi(payload, imageFile);
        const body = res.data ?? res;
        const createdRaw = body?.data ?? body?.product ?? body;
        const created = normalizeProduct(createdRaw);

        // Prepend created product so it appears first (user requested)
        setProducts((prev) => [created, ...prev]);
        // increment total count so pagination text stays correct
        setTotalItems((prev) => (typeof prev === "number" ? prev + 1 : 1));
        // ensure user sees the newest item at top
        setCurrentPage(1);
        // re-fetch categories in case category changed/was created
        await fetchCategories();
        toast.success("Product added");
      }
      setIsDrawerOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("handleSubmit error:", err, err?.response?.data);

      // Map backend validation errors to the form when present
      const rdata = err?.response?.data;
      if (rdata && typeof rdata === "object") {
        if (rdata.errors && typeof rdata.errors === "object") {
          const mapped: Partial<Record<keyof typeof defaultForm, string>> = {};
          Object.keys(rdata.errors).forEach((k) => {
            const val = rdata.errors[k];
            if (Array.isArray(val)) mapped[k as keyof typeof defaultForm] = String(val[0]);
            else mapped[k as keyof typeof defaultForm] = String(val);
          });
          setErrors((prev) => ({ ...prev, ...mapped }));
          toast.error("Fix validation errors");
          setIsSubmitting(false);
          return;
        }
        const message = rdata.message ?? rdata.error ?? err?.message;
        toast.error(typeof message === "string" ? message : "Save failed");
      } else {
        toast.error(err?.message ?? "Save failed");
      }
    } finally {
      setIsSubmitting(false);
      setImageFile(null);
    }
  };

  // show confirm modal (mini-modal) instead of window.confirm
  const askDelete = (id: string | number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId == null) return;
    setIsDeleting(true);
    try {
      const res = await deleteProductApi(confirmDeleteId);
      const body = res.data ?? res;
      if (body && body.status === false) {
        toast.error(body.message ?? "Delete failed");
        setIsDeleting(false);
        setConfirmDeleteId(null);
        return;
      }
      // refresh the same page after delete (server-driven), preserve search
      await fetchProducts(currentPage, searchTerm);
      toast.success("Product deleted");
      setSelectedProduct((s) => (s && String(s.id) === String(confirmDeleteId) ? null : s));
    } catch (err: any) {
      console.error("Delete error:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to delete product";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleRefresh = async () => {
    await fetchProducts(currentPage, searchTerm);
    await fetchCategories();
    toast.success("Refreshed");
  };

  // ----------------- filtering (client-side on current page) ----------------
  const getFiltered = (list: Product[], q: string) => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((p) => {
      const id = String(p.id ?? "").toLowerCase();
      const name = String(p.name ?? "").toLowerCase();
      const price = String(p.price ?? "").toLowerCase();
      const grams = String(p.grams ?? "").toLowerCase();
      const cat =
        p.category && typeof p.category === "object"
          ? String((p.category as any).name ?? (p.category as any).id ?? "")
          : String(p.category ?? "");
      return `${id} ${name} ${price} ${grams} ${cat}`.includes(s);
    });
  };

  const filteredOnPage = getFiltered(products, searchTerm);

  // keyboard escape for drawers
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

  // ---------------- Render ----------------
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by id, name, price, grams or category"
              className="flex-1 sm:flex-none w-full sm:w-72 border rounded-md px-3 py-2 focus:ring focus:ring-indigo-200"
            />

            <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button onClick={() => openAddDrawer()}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>

        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">S.no</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Image</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Category (id)</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Grams</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Discount</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Stock</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : filteredOnPage.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredOnPage.map((p, i) => (
                  <tr key={String(p.id)}>
                    <td className="px-4 py-3 text-sm">{(currentPage - 1) * perPage + i + 1}</td>

                    <td className="px-4 py-3">
                      <img src={resolveImage(p)} alt={p.name ?? "product"} className="w-14 h-14 object-cover rounded" />
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.slug ?? ""}</div>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {p.category && typeof p.category === "object"
                        ? `${(p.category as any).name ?? "-"} (${(p.category as any).id ?? "-"})`
                        : `${p.category ?? "-"}`}
                    </td>

                    <td className="px-4 py-3 text-sm">{p.grams ?? "-"}</td>

                    <td className="px-4 py-3 text-sm">₹ {p.price}</td>

                    <td className="px-4 py-3 text-sm">
                      <div>{p.discount_price ? `₹ ${p.discount_price}` : "-"}</div>
                      {p.discount_amount && <div className="text-xs text-muted-foreground">Saved {p.discount_amount}</div>}
                    </td>

                    <td className="px-4 py-3 text-sm">{p.stock ?? "-"}</td>

                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => openView(p)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button variant="ghost" className="p-2" onClick={() => openEditDrawer(p)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" className="p-2" onClick={() => askDelete(p.id)}>
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

        {/* Pagination (server-driven) */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-600">
            Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalItems)} of {totalItems}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => void fetchProducts(1, searchTerm)} disabled={currentPage === 1}>
              First
            </Button>
            <Button variant="ghost" onClick={() => void fetchProducts(Math.max(1, currentPage - 1), searchTerm)} disabled={currentPage === 1}>
              Prev
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: lastPage })
                .slice(Math.max(0, currentPage - 3), Math.min(lastPage, currentPage + 2))
                .map((_, idx) => {
                  const pageNum = Math.max(1, currentPage - 3) + idx;
                  const active = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => void fetchProducts(pageNum, searchTerm)}
                      className={`px-3 py-1 rounded border ${active ? "bg-slate-100 font-semibold" : ""}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              {lastPage > 6 && <div className="px-2">... {lastPage}</div>}
            </div>

            <Button variant="ghost" onClick={() => void fetchProducts(Math.min(lastPage, currentPage + 1), searchTerm)} disabled={currentPage === lastPage}>
              Next
            </Button>
            <Button variant="ghost" onClick={() => void fetchProducts(lastPage, searchTerm)} disabled={currentPage === lastPage}>
              Last
            </Button>
          </div>
        </div>

        {/* ----------- Add / Edit Drawer ----------- */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEditMode ? "Edit product" : "Add products"}>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setIsDrawerOpen(false);
                resetForm();
              }}
              aria-hidden="true"
            />

            <aside
              ref={drawerRef}
              className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full"
              style={{ transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">{isEditMode ? "Edit Product" : "Add Product"}</h3>
                  <p className="text-sm text-muted-foreground">{isEditMode ? "Update product details" : "Fill in product details"}</p>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    resetForm();
                  }}
                  aria-label="Close drawer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Always show preview (dummy if not provided) */}
                <div className="mb-4">
                  <img src={form.image || DUMMY_IMAGE} alt="Preview" className="w-full h-44 object-cover rounded-md border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? "border-red-400" : "border-muted"}`}
                      placeholder="e.g. Shimla Apple"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
                      <input
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className={`block w-full border rounded-md p-2 ${errors.price ? "border-red-400" : "border-muted"}`}
                        placeholder="1000.00"
                      />
                      {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className={`block w-full border rounded-md p-2 ${errors.category ? "border-red-400" : "border-muted"}`}
                      >
                        <option value="">-- Select category (id) --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id})
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Grams</label>
                      <input value={form.grams} onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="750" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Price</label>
                      <input value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="800.00" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Amount</label>
                    <input value={form.discount_amount} onChange={(e) => setForm((f) => ({ ...f, discount_amount: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="200.00" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm" />
                    <p className="text-xs text-muted-foreground mt-1">If you don't upload, existing image_url will stay.</p>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => { resetForm(); setIsDrawerOpen(false); }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-chart-primary hover:bg-chart-primary/90">
                      {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        )}

        {/* ----------- View Drawer ----------- */}
        {isViewOpen && selectedProduct && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Product details">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />

            <aside ref={viewDrawerRef} tabIndex={-1} className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl md:w-96 w-full p-6">
              <div className="flex items-start justify-between border-b pb-3 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Product details</h3>
                  <p className="text-sm text-muted-foreground">Viewing product</p>
                </div>

                <button onClick={() => setIsViewOpen(false)} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <img src={resolveImage(selectedProduct)} alt={selectedProduct?.name ?? "product"} className="w-full h-44 object-cover rounded-md mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.name}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Price</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">₹ {selectedProduct.price}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Discount Price</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.discount_price ?? "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Grams</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.grams ?? "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Category</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">
                      {selectedProduct.category && typeof selectedProduct.category === "object"
                        ? ((selectedProduct.category as any).name ?? (selectedProduct.category as any).id ?? "-")
                        : (selectedProduct.category ?? "-")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-4">
                  <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ---------- Delete confirmation mini-modal ---------- */}
        {confirmDeleteId != null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
            <div className="relative bg-white rounded shadow-lg w-full max-w-sm p-4">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-semibold">Confirm delete</h4>
                <button onClick={cancelDelete} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="mt-3 text-sm">
                Are you sure you want to delete this product? This action cannot be undone.
              </div>
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








