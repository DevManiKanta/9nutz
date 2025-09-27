

// import React, { useEffect, useRef, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Plus, Package, X, RefreshCw, Trash2, Edit3 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../api/axios";

// type Product = {
//   id: string | number;
//   name: string;
//   price: string;
//   grams?: string;
//   discount_amount?: string;
//   discount_price?: string;
//   image_url?: string;
//   category?: string; 
//   image?: string;
//   discountPrice?: string;
//   gram?: string;
// };

// type CategoryItem = {
//   id: string;
//   name?: string;
// };

// const Products: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<CategoryItem[]>([]);

//   // Drawer and view state
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);

//   const [viewOpen, setViewOpen] = useState(false);
//   const [viewMounted, setViewMounted] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   // form state
//   const [form, setForm] = useState({
//     name: "",
//     grams: "",
//     category: "",
//     price: "",
//     discount_amount: "",
//     discount_price: "",
//     image: "",
//   });
//   const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const firstInputRef = useRef<HTMLInputElement | null>(null);
//   const addBtnRef = useRef<HTMLButtonElement | null>(null);
//   const drawerRef = useRef<HTMLDivElement | null>(null);
//   const viewDrawerRef = useRef<HTMLDivElement | null>(null);

//   // ---------------- Image helpers ----------------
//   const resolveImage = (p: Product | { image?: string; image_url?: string } | string | undefined) => {
//     let rawUrl: string | undefined;
//     if (!p) rawUrl = undefined;
//     else if (typeof p === "string") rawUrl = p;
//     else rawUrl = (p as any).image_url ?? (p as any).image;

//     if (!rawUrl) {
//       return "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
//     }
//     if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
//     try {
//       const base = (api as any)?.defaults?.baseURL ?? window.location.origin;
//       const baseClean = base.endsWith("/") ? base : base + "/";
//       return new URL(rawUrl.replace(/^\/+/, ""), baseClean).toString();
//     } catch (err) {
//       console.warn("resolveImage: could not resolve relative url, returning raw:", rawUrl, err);
//       return rawUrl;
//     }
//   };

//   // ---------- Helpers ----------
//   const addCategoryFromRaw = (rawCategory: any) => {
//     if (!rawCategory) return;
//     let id: string | null = null;
//     let name: string | null = null;

//     if (typeof rawCategory === "object") {
//       id = String(rawCategory.id ?? rawCategory._id ?? rawCategory.category_id ?? rawCategory.categoryId ?? null);
//       name = String(rawCategory.name ?? rawCategory.title ?? rawCategory.category_name ?? rawCategory.label ?? "");
//     } else if (rawCategory !== null && rawCategory !== undefined) {
//       id = String(rawCategory);
//     }

//     if (!id) return;
//     setCategories((prev) => {
//       if (prev.some((c) => String(c.id) === String(id))) return prev;
//       return [...prev, { id, name: name ?? id }];
//     });
//   };

//   function normalizeProduct(raw: any): Product {
//     if (!raw) {
//       return { id: `local-${Date.now()}`, name: "Untitled", price: "" };
//     }

//     const id =
//       raw.id ??
//       raw._id ??
//       raw.product_id ??
//       raw.productId ??
//       raw.uid ??
//       raw.uuid ??
//       raw.id_str ??
//       raw.idNumber ??
//       `local-${Date.now()}`;

//     // extract category id safely (handles when category is an object or a simple id)
//     let categoryId = "";
//     const rawCategory = raw.category ?? raw.cat ?? raw.type ?? raw.category_id ?? raw.categoryId ?? null;
//     if (rawCategory != null) {
//       if (typeof rawCategory === "object") {
//         categoryId = String(
//           rawCategory.id ?? rawCategory._id ?? rawCategory.category_id ?? rawCategory.categoryId ?? ""
//         );
//       } else {
//         categoryId = String(rawCategory);
//       }
//     }

//     if (rawCategory) addCategoryFromRaw(rawCategory);

//     const product: Product = {
//       id,
//       name: String(raw.name ?? raw.title ?? raw.productName ?? "Untitled"),
//       price: String(raw.price ?? raw.amount ?? raw.cost ?? ""),
//       grams: raw.grams ?? raw.gram ?? raw.weight ?? raw.size ?? "",
//       discount_amount:
//         raw.discount_amount ?? raw.discountAmount ?? raw.discount_amount_formatted ?? raw.discount_amount_str ?? undefined,
//       discount_price:
//         raw.discount_price ?? raw.discountPrice ?? raw.discount_price_formatted ?? undefined,
//       image_url: raw.image_url ?? raw.imageUrl ?? undefined,
//       category: categoryId,
//       image: raw.image ?? undefined,
//       discountPrice: raw.discount_price ?? raw.discountPrice ?? undefined,
//       gram: raw.grams ?? raw.gram ?? undefined,
//     };

//     return product;
//   }

//   // ----------------- categories fetch -----------------
//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/admin/categories/show");
//       const body = res?.data ?? res;
//       // detect array in common shapes
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else if (Array.isArray(body.categories)) rows = body.categories;
//       else if (Array.isArray(body.rows)) rows = body.rows;
//       else {
//         const arr = Object.values(body || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr as any[];
//       }

//       // normalize category entries
//       const cats = rows.map((r) => {
//         const id = String(r.id ?? r._id ?? r.category_id ?? r.categoryId ?? r.id?.toString?.() ?? "");
//         const name = String(r.name ?? r.title ?? r.label ?? id ?? "");
//         return { id, name };
//       }).filter((c) => c.id);

//       // replace state (dedupe)
//       const dedup: Record<string, CategoryItem> = {};
//       cats.forEach((c) => {
//         dedup[String(c.id)] = c;
//       });
//       // keep any previously discovered categories too
//       categories.forEach((c) => (dedup[String(c.id)] = c));
//       setCategories(Object.values(dedup));
//     } catch (err: any) {
//       console.warn("fetchCategories failed:", err);
//       // don't block UI; categories can be empty
//     }
//   };

//   // ---------------- API calls ----------------
//   const fetchProducts = async () => {
//     setIsLoading(true);
//     try {
//       const res = await api.get("/admin/products/show");
//       const body = res.data;
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else if (Array.isArray(body.products)) rows = body.products;
//       else if (Array.isArray(body.rows)) rows = body.rows;
//       else if (Array.isArray(body.items)) rows = body.items;
//       else if (body && typeof body === "object" && (body.id || body._id || body.name)) rows = [body];

//       const normalized = rows.map((r) => normalizeProduct(r));
//       setProducts(normalized);

//       // attempt to fetch categories too if none loaded
//       if (normalized.length && categories.length === 0) {
//         // collect any categories embedded inside products
//         normalized.forEach((p) => { if (p.category) addCategoryFromRaw({ id: p.category, name: undefined }); });
//         // also try an explicit categories API call
//         void fetchCategories();
//       }
//     } catch (err: any) {
//       console.error("fetchProducts error:", err);
//       toast.error("Failed to load products");
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createProduct = async (payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name) fd.append("name", String(payload.name));
//     if (payload.price) fd.append("price", String(payload.price));
//     if (payload.discount_price) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams) fd.append("grams", String(payload.grams));
//     if (payload.category) fd.append("category", String(payload.category)); // send category id
//     if (file) fd.append("image", file);
//     const res = await api.post("/admin/products/add", fd, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     const created = res.data?.data ?? res.data?.product ?? res.data;
//     return normalizeProduct(created);
//   };

//   const updateProductApi = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name !== undefined) fd.append("name", String(payload.name));
//     if (payload.price !== undefined) fd.append("price", String(payload.price));
//     if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined) fd.append("category", String(payload.category)); // category id
//     if (file) fd.append("image", file);

//     const res = await api.post(`/admin/products/update/${id}`, fd, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     const updated = res.data?.data ?? res.data?.product ?? res.data;
//     return normalizeProduct(updated);
//   };

//   const deleteProductApi = async (id: string | number) => {
//     await api.delete(`/admin/products/delete/${id}`);
//     return true;
//   };

//   // mount effects for drawers
//   useEffect(() => {
//     if (isOpen) {
//       setIsMounted(true);
//       setTimeout(() => firstInputRef.current?.focus(), 120);
//       document.body.style.overflow = "hidden";
//       // ensure categories are loaded when opening form
//       void fetchCategories();
//     } else {
//       const t = setTimeout(() => setIsMounted(false), 300);
//       const r = setTimeout(() => addBtnRef.current?.focus(), 300);
//       document.body.style.overflow = "";
//       return () => {
//         clearTimeout(t);
//         clearTimeout(r);
//       };
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen]);

//   useEffect(() => {
//     if (viewOpen) {
//       setViewMounted(true);
//       document.body.style.overflow = "hidden";
//     } else {
//       const t = setTimeout(() => setViewMounted(false), 300);
//       document.body.style.overflow = "";
//       return () => clearTimeout(t);
//     }
//   }, [viewOpen]);

//   // keyboard traps (kept)
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setIsOpen(false);
//       if (e.key === "Tab" && isOpen && drawerRef.current) {
//         const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
//           'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
//         );
//         if (!focusable.length) return;
//         const first = focusable[0];
//         const last = focusable[focusable.length - 1];
//         if (e.shiftKey && document.activeElement === first) {
//           e.preventDefault();
//           last.focus();
//         } else if (!e.shiftKey && document.activeElement === last) {
//           e.preventDefault();
//           first.focus();
//         }
//       }
//     };
//     if (isOpen) window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [isOpen]);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setViewOpen(false);
//       if (e.key === "Tab" && viewOpen && viewDrawerRef.current) {
//         const focusable = viewDrawerRef.current.querySelectorAll<HTMLElement>(
//           'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
//         );
//         if (!focusable.length) return;
//         const first = focusable[0];
//         const last = focusable[focusable.length - 1];
//         if (e.shiftKey && document.activeElement === first) {
//           e.preventDefault();
//           last.focus();
//         } else if (!e.shiftKey && document.activeElement === last) {
//           e.preventDefault();
//           first.focus();
//         }
//       }
//     };
//     if (viewOpen) window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [viewOpen]);

//   // fetch products on mount
//   useEffect(() => {
//     void fetchProducts();
//     void fetchCategories(); // also fetch categories proactively
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Form helpers & handlers
//   const validate = () => {
//     const e: Partial<Record<keyof typeof form, string>> = {};
//     if (!form.name.trim()) e.name = "Product name is required";
//     if (!form.price.trim()) e.price = "Price is required";
//     if (!form.category.trim()) e.category = "Category is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const resetForm = () => {
//     setForm({
//       name: "",
//       grams: "",
//       category: "",
//       price: "",
//       discount_amount: "",
//       discount_price: "",
//       image: "",
//     });
//     setImageFile(null);
//     setErrors({});
//     setIsEdit(false);
//     setEditingId(null);
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       toast.error("Image too large (max 5MB)");
//       return;
//     }
//     setImageFile(file);
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setForm((f) => ({ ...f, image: reader.result as string }));
//       setErrors((err) => ({ ...err, image: undefined }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     if (!validate()) {
//       toast.error("Please fix the highlighted fields");
//       return;
//     }

//     const payload: Partial<Product> = {
//       name: form.name.trim(),
//       price: form.price.trim(),
//       discount_price: form.discount_price?.trim() || undefined,
//       discount_amount: form.discount_amount?.trim() || undefined,
//       grams: form.grams?.trim() || undefined,
//       category: form.category.trim() || undefined, // send id
//       image_url: form.image?.trim() || undefined,
//     };

//     setIsSubmitting(true);
//     try {
//       if (isEdit && editingId != null) {
//         const saved = await updateProductApi(editingId, payload, imageFile);
//         if (saved) {
//           setProducts((prev) => prev.map((p) => (String(p.id) === String(editingId) ? { ...(p as Product), ...(saved as Product) } : p)));
//           if (selectedProduct && String(selectedProduct.id) === String(editingId)) {
//             setSelectedProduct((prev) => (prev ? { ...prev, ...(saved as Product) } : prev));
//           }
//           toast.success("Product updated");
//         } else {
//           toast.success("Product updated");
//         }
//       } else {
//         const saved = await createProduct(payload, imageFile);
//         if (saved) {
//           setProducts((p) => [saved as Product, ...p]);
//           toast.success("Product added");
//         } else {
//           toast.success("Product added");
//         }
//       }

//       resetForm();
//       setIsOpen(false);
//     } catch (err: any) {
//       console.error("Save product error:", err);
//       toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to save product");
//     } finally {
//       setIsSubmitting(false);
//       setImageFile(null);
//     }
//   };

//   const handleChange = (key: keyof typeof form, value: string | boolean) => {
//     setForm((f) => ({ ...f, [key]: value as string }));
//     setErrors((err) => ({ ...err, [key]: undefined }));
//   };

//   const openView = (product: Product) => {
//     setSelectedProduct(product);
//     setViewOpen(true);
//   };

//   const closeView = () => {
//     setViewOpen(false);
//     setTimeout(() => setSelectedProduct(null), 300);
//   };

//   const startEdit = (product: Product) => {
//     setIsEdit(true);
//     setEditingId(product.id);

//     const categoryVal = product.category ? String(product.category) : "";

//     setForm({
//       name: product.name || "",
//       grams: product.grams ?? product.gram ?? "",
//       category: categoryVal,
//       price: product.price ?? "",
//       discount_amount: product.discount_amount ?? "",
//       discount_price: product.discount_price ?? product.discountPrice ?? "",
//       image: product.image_url ?? product.image ?? "",
//     });
//     setImageFile(null);
//     // ensure categories available when editing
//     void fetchCategories();
//     setIsOpen(true);
//   };

//   const handleDelete = async (id: string | number) => {
//     const yes = window.confirm("Delete this product? This action cannot be undone.");
//     if (!yes) return;
//     try {
//       await deleteProductApi(id);
//       setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
//       toast.success("Product deleted");
//       if (selectedProduct?.id && String(selectedProduct.id) === String(id)) closeView();
//     } catch (err: any) {
//       console.error("Delete error:", err);
//       toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to delete product");
//     }
//   };

//   const handleRefresh = async () => {
//     await fetchProducts();
//     toast.success("Refreshed");
//   };

//   // ---------- Render ----------
//   return (
//     <>
//       <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
//       <div className="space-y-8 p-6 max-w-7xl mx-auto">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Products</h1>
//           </div>
//           <div className="flex items-center gap-3">
//             <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products">
//               <RefreshCw className="h-4 w-4" />
//             </Button>
//             <Button
//               ref={addBtnRef}
//               className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm"
//               onClick={() => {
//                 resetForm();
//                 void fetchCategories(); // ensure categories before showing
//                 setIsOpen(true);
//               }}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Add Product
//             </Button>
//           </div>
//         </div>

//         {/* Product grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {isLoading ? (
//             <div className="col-span-full p-6 text-center text-muted-foreground">Loading products...</div>
//           ) : products.length === 0 ? (
//             <div className="col-span-full p-6 text-center text-muted-foreground">No products yet.</div>
//           ) : (
//             products.map((product) => (
//               <Card key={String(product.id)} className="hover:shadow-xl transition-shadow transform hover:-translate-y-1">
//                 <CardHeader className="pb-3">
//                   <div className="w-full h-36 rounded-lg mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-chart-primary to-chart-accent">
//                     <img
//                       src={resolveImage(product)}
//                       alt={product.name}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
//                       }}
//                     />
//                   </div>
//                   <CardTitle className="text-lg">{product.name}</CardTitle>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-muted-foreground">Grams</span>
//                     <span className="text-sm font-medium">{product.grams ?? "-"}</span>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div>
//                       <span className="text-sm text-muted-foreground">Price</span>
//                       <div className="text-lg font-bold text-chart-primary">{product.price}</div>
//                     </div>

//                     <div className="text-right">
//                       <span className="text-sm text-muted-foreground block">Discount</span>
//                       <div className="text-sm font-semibold text-rose-600">{product.discount_price ?? "-"}</div>
//                       {product.discount_amount && <div className="text-xs text-muted-foreground">Saved: {product.discount_amount}</div>}
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button variant="outline" className="flex-1" onClick={() => openView(product)}>
//                       View Details
//                     </Button>

//                     <Button variant="ghost" onClick={() => startEdit(product)} title="Edit" aria-label={`Edit ${product.name}`}>
//                       <Edit3 className="h-4 w-4" />
//                     </Button>

//                     <Button variant="destructive" onClick={() => handleDelete(product.id)} title="Delete" aria-label={`Delete ${product.name}`}>
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </div>

//         {/* Add / Edit Drawer */}
//         {isMounted && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit product drawer" : "Add product drawer"}>
//             <div
//               className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
//               onClick={() => {
//                 setIsOpen(false);
//                 resetForm();
//               }}
//               aria-hidden="true"
//             />

//             <aside
//               ref={drawerRef}
//               className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full`}
//               style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
//             >
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div>
//                   <h3 className="text-xl font-semibold">{isEdit ? "Edit Product" : "Add Product"}</h3>
//                   <p className="text-sm text-muted-foreground">{isEdit ? "Update product details." : "Fill in the details to add a new product"}</p>
//                 </div>

//                 <button
//                   onClick={() => {
//                     setIsOpen(false);
//                     resetForm();
//                   }}
//                   aria-label="Close drawer"
//                   className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <div className="p-6">
//                 {form.image && (
//                   <div className="mb-4">
//                     <img src={form.image} alt="Preview" className="w-full h-44 object-cover rounded-md border" />
//                   </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">
//                         Product Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         ref={firstInputRef}
//                         aria-label="Product name"
//                         className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? "border-red-400" : "border-muted"}`}
//                         value={form.name}
//                         onChange={(e) => handleChange("name", e.target.value)}
//                         placeholder="e.g. MILLET IDLY RAVVAS"
//                       />
//                       {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">
//                         Price <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         aria-label="Price"
//                         className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.price ? "border-red-400" : "border-muted"}`}
//                         value={form.price}
//                         onChange={(e) => handleChange("price", e.target.value)}
//                         placeholder="e.g. 1000.00"
//                       />
//                       {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">
//                         Category <span className="text-red-500">*</span>
//                       </label>

//                       {/* dropdown uses category id as value */}
//                       {categories.length > 0 ? (
//                         <select
//                           aria-label="Category"
//                           value={form.category}
//                           onChange={(e) => handleChange("category", e.target.value)}
//                           className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-muted"}`}
//                         >
//                           <option value="">-- Select category --</option>
//                           {categories.map((c) => (
//                             <option key={c.id} value={c.id}>
//                               {c.name ?? c.id}
//                             </option>
//                           ))}
//                         </select>
//                       ) : (
//                         <input
//                           aria-label="Category"
//                           className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-muted"}`}
//                           value={form.category}
//                           onChange={(e) => handleChange("category", e.target.value)}
//                           placeholder="Enter category id"
//                         />
//                       )}

//                       {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Grams</label>
//                       <input
//                         aria-label="Grams"
//                         className="block w-full border rounded-md p-2 focus:outline-none focus:ring border-muted"
//                         value={form.grams}
//                         onChange={(e) => handleChange("grams", e.target.value)}
//                         placeholder="e.g. 750"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Discount Amount</label>
//                       <input
//                         aria-label="Discount Amount"
//                         className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.discount_amount ? "border-red-400" : "border-muted"}`}
//                         value={form.discount_amount}
//                         onChange={(e) => handleChange("discount_amount", e.target.value)}
//                         placeholder="e.g. 200.00"
//                       />
//                       {errors.discount_amount && <p className="text-xs text-red-500 mt-1">{errors.discount_amount}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Discount Price</label>
//                       <input
//                         aria-label="Discount Price"
//                         className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.discount_price ? "border-red-400" : "border-muted"}`}
//                         value={form.discount_price}
//                         onChange={(e) => handleChange("discount_price", e.target.value)}
//                         placeholder="e.g. 800.00"
//                       />
//                       {errors.discount_price && <p className="text-xs text-red-500 mt-1">{errors.discount_price}</p>}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Upload Image</label>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-chart-primary file:text-white hover:file:bg-chart-primary/90"
//                     />
//                     <p className="text-xs text-muted-foreground mt-2">If you don't upload an image, the product's existing image_url will stay as-is.</p>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div />
//                     <div className="flex items-center gap-3">
//                       <Button
//                         variant="ghost"
//                         onClick={() => {
//                           resetForm();
//                           setIsOpen(false);
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                       <Button type="submit" className="bg-chart-primary hover:bg-chart-primary/90" disabled={isSubmitting}>
//                         {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Product"}
//                       </Button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </aside>
//           </div>
//         )}

//         {/* View Details Drawer */}
//         {viewMounted && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="View product details drawer">
//             <div
//               className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${viewOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
//               onClick={() => closeView()}
//               aria-hidden="true"
//             />

//             <aside
//               ref={viewDrawerRef}
//               className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full`}
//               style={{ transform: viewOpen ? "translateX(0)" : "translateX(100%)" }}
//             >
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div>
//                   <h3 className="text-xl font-semibold">Product Details</h3>
//                   <p className="text-sm text-muted-foreground">Details for the selected product</p>
//                 </div>
//               </div>

//               <div className="p-6">
//                 {selectedProduct?.image_url ? (
//                   <div className="mb-4">
//                     <img
//                       src={resolveImage(selectedProduct)}
//                       alt={selectedProduct.name}
//                       className="w-full h-44 object-cover rounded-md border"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
//                       }}
//                     />
//                   </div>
//                 ) : null}

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Product Name</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.name || "-"}</div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Price</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.price || "-"}</div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Discount Price</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.discount_price || "-"}</div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Discount Amount</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.discount_amount || "-"}</div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Grams</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.grams || "-"}</div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Category ID</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.category || "-"}</div>
//                   </div>

//                   <div className="flex items-center justify-between mt-4">
//                     <Button variant="ghost" onClick={() => closeView()}>
//                       Close
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </aside>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Products;



import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, X, RefreshCw, Trash2, Edit3 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";

type Product = {
  id: string | number;
  name: string;
  price: string;
  grams?: string;
  discount_amount?: string;
  discount_price?: string;
  image_url?: string;
  category?: string; 
  image?: string;
  discountPrice?: string;
  gram?: string;
};

type CategoryItem = {
  id: string;
  name?: string;
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Drawer and view state
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewMounted, setViewMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    grams: "",
    category: "",
    price: "",
    discount_amount: "",
    discount_price: "",
    image: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const viewDrawerRef = useRef<HTMLDivElement | null>(null);

  // ---------------- Image helpers ----------------
  const resolveImage = (p: Product | { image?: string; image_url?: string } | string | undefined) => {
    let rawUrl: string | undefined;
    if (!p) rawUrl = undefined;
    else if (typeof p === "string") rawUrl = p;
    else rawUrl = (p as any).image_url ?? (p as any).image;

    if (!rawUrl) {
      return "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
    }
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    try {
      const base = (api as any)?.defaults?.baseURL ?? window.location.origin;
      const baseClean = base.endsWith("/") ? base : base + "/";
      return new URL(rawUrl.replace(/^\/+/, ""), baseClean).toString();
    } catch (err) {
      console.warn("resolveImage: could not resolve relative url, returning raw:", rawUrl, err);
      return rawUrl;
    }
  };

  // ---------- Helpers ----------
  const addCategoryFromRaw = (rawCategory: any) => {
    if (!rawCategory) return;
    let id: string | null = null;
    let name: string | null = null;

    if (typeof rawCategory === "object") {
      id = String(rawCategory.id ?? rawCategory._id ?? rawCategory.category_id ?? rawCategory.categoryId ?? null);
      name = String(rawCategory.name ?? rawCategory.title ?? rawCategory.category_name ?? rawCategory.label ?? "");
    } else if (rawCategory !== null && rawCategory !== undefined) {
      id = String(rawCategory);
    }

    if (!id) return;
    setCategories((prev) => {
      if (prev.some((c) => String(c.id) === String(id))) return prev;
      return [...prev, { id, name: name ?? id }];
    });
  };

  function normalizeProduct(raw: any): Product {
    if (!raw) {
      return { id: `local-${Date.now()}`, name: "Untitled", price: "" };
    }

    const id =
      raw.id ??
      raw._id ??
      raw.product_id ??
      raw.productId ??
      raw.uid ??
      raw.uuid ??
      raw.id_str ??
      raw.idNumber ??
      `local-${Date.now()}`;

    // extract category id safely (handles when category is an object or a simple id)
    let categoryId = "";
    const rawCategory = raw.category ?? raw.cat ?? raw.type ?? raw.category_id ?? raw.categoryId ?? null;
    if (rawCategory != null) {
      if (typeof rawCategory === "object") {
        categoryId = String(
          rawCategory.id ?? rawCategory._id ?? rawCategory.category_id ?? rawCategory.categoryId ?? ""
        );
      } else {
        categoryId = String(rawCategory);
      }
    }

    if (rawCategory) addCategoryFromRaw(rawCategory);

    const product: Product = {
      id,
      name: String(raw.name ?? raw.title ?? raw.productName ?? "Untitled"),
      price: String(raw.price ?? raw.amount ?? raw.cost ?? ""),
      grams: raw.grams ?? raw.gram ?? raw.weight ?? raw.size ?? "",
      discount_amount:
        raw.discount_amount ?? raw.discountAmount ?? raw.discount_amount_formatted ?? raw.discount_amount_str ?? undefined,
      discount_price:
        raw.discount_price ?? raw.discountPrice ?? raw.discount_price_formatted ?? undefined,
      image_url: raw.image_url ?? raw.imageUrl ?? undefined,
      category: categoryId,
      image: raw.image ?? undefined,
      discountPrice: raw.discount_price ?? raw.discountPrice ?? undefined,
      gram: raw.grams ?? raw.gram ?? undefined,
    };

    return product;
  }

  // ----------------- categories fetch -----------------
  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories/show");
      const body = res?.data ?? res;
      // detect array in common shapes
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.categories)) rows = body.categories;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else {
        const arr = Object.values(body || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      // normalize category entries
      const cats = rows.map((r) => {
        const id = String(r.id ?? r._id ?? r.category_id ?? r.categoryId ?? r.id?.toString?.() ?? "");
        const name = String(r.name ?? r.title ?? r.label ?? id ?? "");
        return { id, name };
      }).filter((c) => c.id);

      // replace state (dedupe)
      const dedup: Record<string, CategoryItem> = {};
      cats.forEach((c) => {
        dedup[String(c.id)] = c;
      });
      // keep any previously discovered categories too
      categories.forEach((c) => (dedup[String(c.id)] = c));
      setCategories(Object.values(dedup));
    } catch (err: any) {
      console.warn("fetchCategories failed:", err);
      // don't block UI; categories can be empty
    }
  };

  // ---------------- API calls ----------------
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/products/show");
      const body = res.data;
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.products)) rows = body.products;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else if (Array.isArray(body.items)) rows = body.items;
      else if (body && typeof body === "object" && (body.id || body._id || body.name)) rows = [body];

      const normalized = rows.map((r) => normalizeProduct(r));
      setProducts(normalized);

      // attempt to fetch categories too if none loaded
      if (normalized.length && categories.length === 0) {
        // collect any categories embedded inside products
        normalized.forEach((p) => { if (p.category) addCategoryFromRaw({ id: p.category, name: undefined }); });
        // also try an explicit categories API call
        void fetchCategories();
      }
    } catch (err: any) {
      console.error("fetchProducts error:", err);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name) fd.append("name", String(payload.name));
    if (payload.price) fd.append("price", String(payload.price));
    if (payload.discount_price) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams) fd.append("grams", String(payload.grams));
    if (payload.category) fd.append("category", String(payload.category)); // send category id
    if (file) fd.append("image", file);
    const res = await api.post("/admin/products/add", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const created = res.data?.data ?? res.data?.product ?? res.data;
    return normalizeProduct(created);
  };

  const updateProductApi = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined) fd.append("category", String(payload.category)); // category id
    if (file) fd.append("image", file);

    const res = await api.post(`/admin/products/update/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const updated = res.data?.data ?? res.data?.product ?? res.data;
    return normalizeProduct(updated);
  };

  const deleteProductApi = async (id: string | number) => {
    await api.delete(`/admin/products/delete/${id}`);
    return true;
  };

  // mount effects for drawers
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
      // ensure categories are loaded when opening form
      void fetchCategories();
    } else {
      const t = setTimeout(() => setIsMounted(false), 300);
      const r = setTimeout(() => addBtnRef.current?.focus(), 300);
      document.body.style.overflow = "";
      return () => {
        clearTimeout(t);
        clearTimeout(r);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (viewOpen) {
      setViewMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setViewMounted(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
  }, [viewOpen]);

  // keyboard traps (kept)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "Tab" && isOpen && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewOpen(false);
      if (e.key === "Tab" && viewOpen && viewDrawerRef.current) {
        const focusable = viewDrawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    if (viewOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewOpen]);

  // fetch products on mount
  useEffect(() => {
    void fetchProducts();
    void fetchCategories(); // also fetch categories proactively
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form helpers & handlers
  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price.trim()) e.price = "Price is required";
    if (!form.category.trim()) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      grams: "",
      category: "",
      price: "",
      discount_amount: "",
      discount_price: "",
      image: "",
    });
    setImageFile(null);
    setErrors({});
    setIsEdit(false);
    setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, image: reader.result as string }));
      setErrors((err) => ({ ...err, image: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload: Partial<Product> = {
      name: form.name.trim(),
      price: form.price.trim(),
      discount_price: form.discount_price?.trim() || undefined,
      discount_amount: form.discount_amount?.trim() || undefined,
      grams: form.grams?.trim() || undefined,
      category: form.category.trim() || undefined, // send id
      image_url: form.image?.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEdit && editingId != null) {
        const saved = await updateProductApi(editingId, payload, imageFile);
        if (saved) {
          setProducts((prev) => prev.map((p) => (String(p.id) === String(editingId) ? { ...(p as Product), ...(saved as Product) } : p)));
          if (selectedProduct && String(selectedProduct.id) === String(editingId)) {
            setSelectedProduct((prev) => (prev ? { ...prev, ...(saved as Product) } : prev));
          }
          toast.success("Product updated");
        } else {
          toast.success("Product updated");
        }
      } else {
        const saved = await createProduct(payload, imageFile);
        if (saved) {
          setProducts((p) => [saved as Product, ...p]);
          toast.success("Product added");
        } else {
          toast.success("Product added");
        }
      }

      resetForm();
      setIsOpen(false);
    } catch (err: any) {
      console.error("Save product error:", err);
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to save product");
    } finally {
      setIsSubmitting(false);
      setImageFile(null);
    }
  };

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value as string }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const openView = (product: Product) => {
    setSelectedProduct(product);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const startEdit = (product: Product) => {
    setIsEdit(true);
    setEditingId(product.id);

    const categoryVal = product.category ? String(product.category) : "";

    setForm({
      name: product.name || "",
      grams: product.grams ?? product.gram ?? "",
      category: categoryVal,
      price: product.price ?? "",
      discount_amount: product.discount_amount ?? "",
      discount_price: product.discount_price ?? product.discountPrice ?? "",
      image: product.image_url ?? product.image ?? "",
    });
    setImageFile(null);
    // ensure categories available when editing
    void fetchCategories();
    setIsOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    const yes = window.confirm("Delete this product? This action cannot be undone.");
    if (!yes) return;
    try {
      await deleteProductApi(id);
      setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
      toast.success("Product deleted");
      if (selectedProduct?.id && String(selectedProduct.id) === String(id)) closeView();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to delete product");
    }
  };

  const handleRefresh = async () => {
    await fetchProducts();
    toast.success("Refreshed");
  };

  // -----------------------
  // Search & Pagination (ADDED)
  // -----------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // adjust if you want different page size

  // clamp currentPage when products or searchTerm change
  useEffect(() => {
    const filtered = getFiltered(products, searchTerm);
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [products, searchTerm]);

  function getFiltered(list: Product[], term: string) {
    const q = term.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const pid = String(p.id ?? "").toLowerCase();
      const name = String(p.name ?? "").toLowerCase();
      const price = String(p.price ?? "").toLowerCase();
      const grams = String(p.grams ?? p.gram ?? "").toLowerCase();
      const cat = String(p.category ?? "").toLowerCase();
      const note = `${pid} ${name} ${price} ${grams} ${cat}`.toLowerCase();
      return note.includes(q);
    });
  }

  const filteredProducts = getFiltered(products, searchTerm);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // -----------------------

  // ---------- Render ----------
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              ref={addBtnRef}
              className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm"
              onClick={() => {
                resetForm();
                void fetchCategories(); // ensure categories before showing
                setIsOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search bar (ADDED) */}
        <div className="flex items-center justify-between gap-4">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products by id, name, price, grams or category"
            className="w-full md:w-1/2 border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
          />
          <div className="text-sm text-slate-600 hidden md:block">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full p-6 text-center text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full p-6 text-center text-muted-foreground">No products yet.</div>
          ) : (
            paginatedProducts.map((product) => (
              <Card key={String(product.id)} className="hover:shadow-xl transition-shadow transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="w-full h-36 rounded-lg mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-chart-primary to-chart-accent">
                    <img
                      src={resolveImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
                      }}
                    />
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Grams</span>
                    <span className="text-sm font-medium">{product.grams ?? "-"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">Price</span>
                      <div className="text-lg font-bold text-chart-primary">{product.price}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-muted-foreground block">Discount</span>
                      <div className="text-sm font-semibold text-rose-600">{product.discount_price ?? "-"}</div>
                      {product.discount_amount && <div className="text-xs text-muted-foreground">Saved: {product.discount_amount}</div>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => openView(product)}>
                      View Details
                    </Button>

                    <Button variant="ghost" onClick={() => startEdit(product)} title="Edit" aria-label={`Edit ${product.name}`}>
                      <Edit3 className="h-4 w-4" />
                    </Button>

                    <Button variant="destructive" onClick={() => handleDelete(product.id)} title="Delete" aria-label={`Delete ${product.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination controls (ADDED) */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Showing {filteredProducts.length === 0 ? 0 : ( (currentPage - 1) * itemsPerPage + 1 )} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

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

        {/* Add / Edit Drawer */}
        {isMounted && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit product drawer" : "Add product drawer"}>
            <div
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              aria-hidden="true"
            />

            <aside
              ref={drawerRef}
              className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full`}
              style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">{isEdit ? "Edit Product" : "Add Product"}</h3>
                  <p className="text-sm text-muted-foreground">{isEdit ? "Update product details." : "Fill in the details to add a new product"}</p>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  aria-label="Close drawer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {form.image && (
                  <div className="mb-4">
                    <img src={form.image} alt="Preview" className="w-full h-44 object-cover rounded-md border" />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={firstInputRef}
                        aria-label="Product name"
                        className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? "border-red-400" : "border-muted"}`}
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g. MILLET IDLY RAVVAS"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        aria-label="Price"
                        className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.price ? "border-red-400" : "border-muted"}`}
                        value={form.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        placeholder="e.g. 1000.00"
                      />
                      {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>

                      {/* dropdown uses category id as value */}
                      {categories.length > 0 ? (
                        <select
                          aria-label="Category"
                          value={form.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-muted"}`}
                        >
                          <option value="">-- Select category --</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name ?? c.id}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          aria-label="Category"
                          className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-muted"}`}
                          value={form.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                          placeholder="Enter category id"
                        />
                      )}

                      {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Grams</label>
                      <input
                        aria-label="Grams"
                        className="block w-full border rounded-md p-2 focus:outline-none focus:ring border-muted"
                        value={form.grams}
                        onChange={(e) => handleChange("grams", e.target.value)}
                        placeholder="e.g. 750"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Amount</label>
                      <input
                        aria-label="Discount Amount"
                        className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.discount_amount ? "border-red-400" : "border-muted"}`}
                        value={form.discount_amount}
                        onChange={(e) => handleChange("discount_amount", e.target.value)}
                        placeholder="e.g. 200.00"
                      />
                      {errors.discount_amount && <p className="text-xs text-red-500 mt-1">{errors.discount_amount}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Price</label>
                      <input
                        aria-label="Discount Price"
                        className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.discount_price ? "border-red-400" : "border-muted"}`}
                        value={form.discount_price}
                        onChange={(e) => handleChange("discount_price", e.target.value)}
                        placeholder="e.g. 800.00"
                      />
                      {errors.discount_price && <p className="text-xs text-red-500 mt-1">{errors.discount_price}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-chart-primary file:text-white hover:file:bg-chart-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-2">If you don't upload an image, the product's existing image_url will stay as-is.</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div />
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          resetForm();
                          setIsOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-chart-primary hover:bg-chart-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Product"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        )}

        {/* View Details Drawer */}
        {viewMounted && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="View product details drawer">
            <div
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${viewOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
              onClick={() => closeView()}
              aria-hidden="true"
            />

            <aside
              ref={viewDrawerRef}
              className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full`}
              style={{ transform: viewOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">Product Details</h3>
                  <p className="text-sm text-muted-foreground">Details for the selected product</p>
                </div>
              </div>

              <div className="p-6">
                {selectedProduct?.image_url ? (
                  <div className="mb-4">
                    <img
                      src={resolveImage(selectedProduct)}
                      alt={selectedProduct.name}
                      className="w-full h-44 object-cover rounded-md border"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
                      }}
                    />
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.name || "-"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.price || "-"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Price</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.discount_price || "-"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Amount</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.discount_amount || "-"}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Grams</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.grams || "-"}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Category ID</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.category || "-"}</div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Button variant="ghost" onClick={() => closeView()}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;



