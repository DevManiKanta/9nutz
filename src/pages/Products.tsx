

// import React, { useEffect, useRef, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Plus, Package, X, RefreshCw, Trash2, Edit3 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// type Product = {
//   id: string | number;
//   name: string;
//   price: string; // original price
//   grams?: string;
//   discount_amount?: string; // e.g. "200.00"
//   discount_price?: string; // e.g. "800.00"
//   image_url?: string; // full URL for image
//   // legacy/compat
//   category?: string;
//   image?: string;
//   discountPrice?: string; // kept for compatibility with existing code paths
//   gram?: string;
// };

// const API_BASE = "http://192.168.1.6:8000/api"; // your base url

// const Products: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   // Add/Edit Drawer state
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);
//   // View Details drawer state
//   const [viewOpen, setViewOpen] = useState(false);
//   const [viewMounted, setViewMounted] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   // form state (for add/edit)
//   const [form, setForm] = useState({
//     name: "",
//     grams: "",
//     category: "",
//     price: "",
//     discount_amount: "",
//     discount_price: "",
//     image: "", // preview data-url or existing image_url
//   });
//   const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
//   // actual file object for upload (optional)
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   // loading/submitting
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const firstInputRef = useRef<HTMLInputElement | null>(null);
//   const addBtnRef = useRef<HTMLButtonElement | null>(null);
//   const drawerRef = useRef<HTMLDivElement | null>(null);
//   const viewDrawerRef = useRef<HTMLDivElement | null>(null);

//   // ---------------- Token helper ----------------
//   const getToken = (): string | null => {
//     try {
//       return localStorage.getItem("token");
//     } catch (err) {
//       console.warn("Unable to read token from localStorage", err);
//       return null;
//     }
//   };

//   // normalization helper (map API shape to Product)
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
//       raw.idNumber;

//     // prefer explicit API fields you showed: name, price, grams, discount_amount, discount_price, image_url
//     const product: Product = {
//       id: id ?? `local-${Date.now()}`,
//       name: String(raw.name ?? raw.title ?? raw.productName ?? "Untitled"),
//       price: String(raw.price ?? raw.amount ?? raw.cost ?? ""),
//       grams: raw.grams ?? raw.gram ?? raw.weight ?? raw.size ?? "",
//       discount_amount:
//         raw.discount_amount ??
//         raw.discountAmount ??
//         raw.discount_amount_formatted ??
//         raw.discount_amount_str ??
//         raw.discount_amount ??
//         undefined,
//       discount_price:
//         raw.discount_price ??
//         raw.discountPrice ??
//         raw.discount_price_formatted ??
//         raw.discount_price ??
//         undefined,
//       image_url: raw.image_url ?? raw.imageUrl ?? raw.image ?? raw.photo ?? undefined,
//       // keep old keys too for compatibility with UI code that referenced them
//       category: String(raw.category ?? raw.cat ?? raw.type ?? raw.category_id ?? ""),
//       image: raw.image ?? raw.image_url ?? undefined,
//       discountPrice: raw.discount_price ?? raw.discountPrice ?? undefined,
//       gram: raw.grams ?? raw.gram ?? undefined,
//     };

//     return product;
//   }

//   // Drawer mount/unmount
//   useEffect(() => {
//     if (isOpen) {
//       setIsMounted(true);
//       setTimeout(() => firstInputRef.current?.focus(), 120);
//       document.body.style.overflow = "hidden";
//     } else {
//       const t = setTimeout(() => setIsMounted(false), 300);
//       const r = setTimeout(() => addBtnRef.current?.focus(), 300);
//       document.body.style.overflow = "";
//       return () => {
//         clearTimeout(t);
//         clearTimeout(r);
//       };
//     }
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

//   // keyboard/focus traps
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

//   // --------- Fetch initial products from API ----------
//   const fetchProducts = async () => {
//     setIsLoading(true);
//     try {
//       const token = getToken();
//       if (!token) {
//         toast.error("Missing auth token. Please login.");
//         setIsLoading(false);
//         return;
//       }

//       const res = await fetch(`${API_BASE}/admin/products/show`, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const raw = await (async () => {
//         try {
//           return await res.json();
//         } catch {
//           return null;
//         }
//       })();

//       if (!res.ok) {
//         console.error("Failed to fetch products:", res.status, raw);
//         toast.error(`Failed to load products (${res.status})`);
//         return;
//       }

//       // server might return array or { data: [...] } etc.
//       let rows: any[] = [];
//       if (Array.isArray(raw)) rows = raw;
//       else if (Array.isArray(raw.data)) rows = raw.data;
//       else if (Array.isArray(raw.products)) rows = raw.products;
//       else if (Array.isArray(raw.rows)) rows = raw.rows;
//       else if (Array.isArray(raw.items)) rows = raw.items;
//       else if (raw && typeof raw === "object" && Object.keys(raw).length && raw.data && Array.isArray(raw.data)) rows = raw.data;
//       else {
//         if (raw && typeof raw === "object" && (raw.id || raw._id || raw.name)) rows = [raw];
//       }

//       const normalized = rows.map(normalizeProduct);
//       setProducts(normalized);
//     } catch (err) {
//       console.error("Network error fetching products:", err);
//       toast.error("Network error while loading products");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     void fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Validation adjusted to new field names
//   const validate = () => {
//     const e: Partial<Record<keyof typeof form, string>> = {};
//     if (!form.name.trim()) e.name = "Product name is required";
//     if (!form.price.trim()) e.price = "Price is required";
//     if (form.price && !/^[\d,.₹$€£]+$/.test(form.price.trim())) e.price = "Enter a valid price";
//     if (!form.category.trim()) e.category = "Category is required";
//     if (form.category && isNaN(Number(form.category))) e.category = "Category must be a number (category id)";
//     if (form.discount_price && !/^[\d,.₹$€£]+$/.test(form.discount_price.trim())) {
//       e.discount_price = "Enter a valid discount price";
//     }
//     if (form.discount_amount && !/^[\d,.₹$€£]+$/.test(form.discount_amount.trim())) {
//       e.discount_amount = "Enter a valid discount amount";
//     }
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

//   // create product (POST /admin/products/add) — send FormData
//   const createProduct = async (payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name) fd.append("name", String(payload.name));
//     if (payload.price) fd.append("price", String(payload.price));
//     if (payload.discount_price) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams) fd.append("grams", String(payload.grams));
//     if (payload.category) fd.append("category", String(payload.category));
//     if (file) fd.append("image", file);

//     const token = getToken();
//     if (!token) throw new Error("Missing auth token (please login)");

//     const res = await fetch(`${API_BASE}/admin/products/add`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: fd,
//     });

//     const body = await (async () => {
//       try {
//         return await res.json();
//       } catch {
//         return null;
//       }
//     })();

//     if (!res.ok) {
//       const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
//       throw new Error(msg);
//     }
//     const createdRaw = body?.data ?? body?.product ?? body ?? null;
//     return normalizeProduct(createdRaw);
//   };

//   // update product (POST /admin/products/update/:id)
//   const updateProduct = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name !== undefined) fd.append("name", String(payload.name));
//     if (payload.price !== undefined) fd.append("price", String(payload.price));
//     if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined) fd.append("category", String(payload.category));
//     if (file) fd.append("image", file);

//     const token = getToken();
//     if (!token) throw new Error("Missing auth token (please login)");

//     const res = await fetch(`${API_BASE}/admin/products/update/${id}`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: fd,
//     });

//     const body = await (async () => {
//       try {
//         return await res.json();
//       } catch {
//         return null;
//       }
//     })();

//     if (!res.ok) {
//       const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
//       throw new Error(msg);
//     }
//     const updatedRaw = body?.data ?? body?.product ?? body ?? null;
//     return normalizeProduct(updatedRaw);
//   };

//   // delete (DELETE /admin/products/delete/:id)
//   const deleteProduct = async (id: string | number) => {
//     const token = getToken();
//     if (!token) throw new Error("Missing auth token (please login)");

//     const res = await fetch(`${API_BASE}/admin/products/delete/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//     });
//     let body = null;
//     try {
//       body = await res.json();
//     } catch {
//       body = null;
//     }
//     if (!res.ok) {
//       const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
//       throw new Error(msg);
//     }
//     return true;
//   };

//   // Unified submit: handles create + update
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
//       // category kept as string id
//       category: form.category.trim() || undefined,
//       image_url: form.image?.trim() || undefined,
//     };

//     setIsSubmitting(true);
//     try {
//       if (isEdit && editingId != null) {
//         const saved = await updateProduct(editingId, payload, imageFile);
//         if (saved) {
//           setProducts((prev) =>
//             prev.map((p) => (String(p.id) === String(editingId) ? { ...(p as Product), ...(saved as Product) } : p))
//           );
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

//       // cleanup
//       resetForm();
//       setIsOpen(false);
//     } catch (err: any) {
//       console.error("Save product error:", err);
//       toast.error(err?.message || "Failed to save product");
//     } finally {
//       setIsSubmitting(false);
//       setImageFile(null);
//     }
//   };

//   const handleChange = (key: keyof typeof form, value: string | boolean) => {
//     setForm((f) => ({ ...f, [key]: value }));
//     setErrors((err) => ({ ...err, [key]: undefined }));
//   };

//   // Open view drawer for a specific product
//   const openView = (product: Product) => {
//     setSelectedProduct(product);
//     setViewOpen(true);
//   };

//   // Close view drawer
//   const closeView = () => {
//     setViewOpen(false);
//     setTimeout(() => setSelectedProduct(null), 300);
//   };

//   // Start editing a product: populate form and open add drawer in edit mode
//   const startEdit = (product: Product) => {
//     setIsEdit(true);
//     setEditingId(product.id);
//     setForm({
//       name: product.name || "",
//       grams: product.grams ?? product.gram ?? "",
//       category: product.category ?? "",
//       price: product.price ?? "",
//       discount_amount: product.discount_amount ?? "",
//       discount_price: product.discount_price ?? product.discountPrice ?? "",
//       image: product.image_url ?? product.image ?? "",
//     });
//     setImageFile(null); // if user wants to change image, they'll upload a new file
//     setIsOpen(true);
//   };

//   // Delete product with confirmation
//   const handleDelete = async (id: string | number) => {
//     const yes = window.confirm("Delete this product? This action cannot be undone.");
//     if (!yes) return;
//     try {
//       await deleteProduct(id);
//       setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
//       toast.success("Product deleted");
//       if (selectedProduct?.id && String(selectedProduct.id) === String(id)) closeView();
//     } catch (err: any) {
//       console.error("Delete error:", err);
//       toast.error(err?.message || "Failed to delete product");
//     }
//   };

//   // Refresh list
//   const handleRefresh = async () => {
//     await fetchProducts();
//     toast.success("Refreshed");
//   };

//   return (
//     <>
//       <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
//       <div className="space-y-8">
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
//                     {product.image_url ? (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={product.image_url}
//                         alt={product.name}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           (e.currentTarget as HTMLImageElement).src =
//                             "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
//                         }}
//                       />
//                     ) : product.image ? (
//                       // fallback
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={product.image}
//                         alt={product.name}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           (e.currentTarget as HTMLImageElement).src =
//                             "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
//                         }}
//                       />
//                     ) : (
//                       <div className="flex items-center justify-center w-full h-full">
//                         <Package className="h-10 w-10 text-white opacity-90" />
//                       </div>
//                     )}
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
//                       <div className="text-sm font-semibold text-rose-600">
//                         {product.discount_price ?? "-"}
//                       </div>
//                       {product.discount_amount && (
//                         <div className="text-xs text-muted-foreground">Saved: {product.discount_amount}</div>
//                       )}
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
//             {/* overlay */}
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
//               {/* header */}
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

//               {/* body */}
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
//                         Category (id) <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         aria-label="Category"
//                         className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-muted"}`}
//                         value={form.category}
//                         onChange={(e) => handleChange("category", e.target.value)}
//                         placeholder="e.g. 6"
//                       />
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
//                     <div /> {/* kept layout symmetric with buttons on right */}
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
//             {/* overlay */}
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
//               {/* header */}
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div>
//                   <h3 className="text-xl font-semibold">Product Details</h3>
//                   <p className="text-sm text-muted-foreground">Details for the selected product</p>
//                 </div>
//               </div>

//               <div className="p-6">
//                 {selectedProduct?.image_url && (
//                   <div className="mb-4">
//                     <img
//                       src={selectedProduct.image_url}
//                       alt={selectedProduct.name}
//                       className="w-full h-44 object-cover rounded-md border"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
//                       }}
//                     />
//                   </div>
//                 )}

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

type Product = {
  id: string | number;
  name: string;
  price: string;
  grams?: string;
  discount_amount?: string;
  discount_price?: string;
  image_url?: string;
  // stored category id as string
  category?: string;
  image?: string;
  discountPrice?: string;
  gram?: string;
};

type CategoryItem = {
  id: string;
  name: string;
};

const API_BASE = "http://192.168.1.6:8000/api"; // your base url

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Add/Edit Drawer state
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  // View Details drawer state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMounted, setViewMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // form state (for add/edit)
  const [form, setForm] = useState({
    name: "",
    grams: "",
    category: "",
    price: "",
    discount_amount: "",
    discount_price: "",
    image: "", // preview data-url or existing image_url
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  // actual file object for upload (optional)
  const [imageFile, setImageFile] = useState<File | null>(null);
  // loading/submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const viewDrawerRef = useRef<HTMLDivElement | null>(null);

  // ---------------- Token helper ----------------
  const getToken = (): string | null => {
    try {
      return localStorage.getItem("token");
    } catch (err) {
      console.warn("Unable to read token from localStorage", err);
      return null;
    }
  };

  // safe helper: add category to categories list (dedupe by id)
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

  // normalization helper (map API shape to Product)
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

    // If server provided category object, push it to categories list
    if (rawCategory) addCategoryFromRaw(rawCategory);

    const product: Product = {
      id,
      name: String(raw.name ?? raw.title ?? raw.productName ?? "Untitled"),
      price: String(raw.price ?? raw.amount ?? raw.cost ?? ""),
      grams: raw.grams ?? raw.gram ?? raw.weight ?? raw.size ?? "",
      discount_amount:
        raw.discount_amount ??
        raw.discountAmount ??
        raw.discount_amount_formatted ??
        raw.discount_amount_str ??
        undefined,
      discount_price:
        raw.discount_price ?? raw.discountPrice ?? raw.discount_price_formatted ?? undefined,
      image_url: raw.image_url ?? raw.imageUrl ?? raw.image ?? raw.photo ?? undefined,
      category: categoryId,
      image: raw.image ?? raw.image_url ?? undefined,
      discountPrice: raw.discount_price ?? raw.discountPrice ?? undefined,
      gram: raw.grams ?? raw.gram ?? undefined,
    };

    return product;
  }

  // Drawer mount/unmount
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setIsMounted(false), 300);
      const r = setTimeout(() => addBtnRef.current?.focus(), 300);
      document.body.style.overflow = "";
      return () => {
        clearTimeout(t);
        clearTimeout(r);
      };
    }
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

  // keyboard/focus traps (unchanged)
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

  // --------- Fetch initial products from API ----------
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Missing auth token. Please login.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/admin/products/show`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = await (async () => {
        try {
          return await res.json();
        } catch {
          return null;
        }
      })();

      if (!res.ok) {
        console.error("Failed to fetch products:", res.status, raw);
        toast.error(`Failed to load products (${res.status})`);
        setIsLoading(false);
        return;
      }

      // server might return array or { data: [...] } etc.
      let rows: any[] = [];
      if (Array.isArray(raw)) rows = raw;
      else if (Array.isArray(raw.data)) rows = raw.data;
      else if (Array.isArray(raw.products)) rows = raw.products;
      else if (Array.isArray(raw.rows)) rows = raw.rows;
      else if (Array.isArray(raw.items)) rows = raw.items;
      else if (raw && typeof raw === "object" && (raw.id || raw._id || raw.name)) rows = [raw];

      const normalized = rows.map((r) => normalizeProduct(r));
      setProducts(normalized);
    } catch (err) {
      console.error("Network error fetching products:", err);
      toast.error("Network error while loading products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation adjusted to new field names
  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price.trim()) e.price = "Price is required";
    if (form.price && !/^[\d,.₹$€£]+$/.test(form.price.trim())) e.price = "Enter a valid price";

    // Validate category: if categories list exists, ensure a selected id is present. Otherwise require non-empty.
    if (!form.category.trim()) e.category = "Category is required";
    if (form.category && isNaN(Number(form.category))) {
      // allow numeric ids only
      e.category = "Category must be a number (category id)";
    }

    if (form.discount_price && !/^[\d,.₹$€£]+$/.test(form.discount_price.trim())) {
      e.discount_price = "Enter a valid discount price";
    }
    if (form.discount_amount && !/^[\d,.₹$€£]+$/.test(form.discount_amount.trim())) {
      e.discount_amount = "Enter a valid discount amount";
    }
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

  // create product (POST /admin/products/add) — send FormData
  const createProduct = async (payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name) fd.append("name", String(payload.name));
    if (payload.price) fd.append("price", String(payload.price));
    if (payload.discount_price) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams) fd.append("grams", String(payload.grams));
    if (payload.category) fd.append("category", String(payload.category));
    if (file) fd.append("image", file);

    const token = getToken();
    if (!token) throw new Error("Missing auth token (please login)");

    const res = await fetch(`${API_BASE}/admin/products/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });

    const body = await (async () => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    })();

    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }
    const createdRaw = body?.data ?? body?.product ?? body ?? null;
    return normalizeProduct(createdRaw);
  };

  // update product (POST /admin/products/update/:id)
  const updateProduct = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined) fd.append("category", String(payload.category));
    if (file) fd.append("image", file);

    const token = getToken();
    if (!token) throw new Error("Missing auth token (please login)");

    const res = await fetch(`${API_BASE}/admin/products/update/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });

    const body = await (async () => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    })();

    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }
    const updatedRaw = body?.data ?? body?.product ?? body ?? null;
    return normalizeProduct(updatedRaw);
  };

  // delete (DELETE /admin/products/delete/:id)
  const deleteProduct = async (id: string | number) => {
    const token = getToken();
    if (!token) throw new Error("Missing auth token (please login)");

    const res = await fetch(`${API_BASE}/admin/products/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }
    return true;
  };

  // Unified submit: handles create + update
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
      // category kept as string id
      category: form.category.trim() || undefined,
      image_url: form.image?.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEdit && editingId != null) {
        const saved = await updateProduct(editingId, payload, imageFile);
        if (saved) {
          setProducts((prev) =>
            prev.map((p) => (String(p.id) === String(editingId) ? { ...(p as Product), ...(saved as Product) } : p))
          );
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

      // cleanup
      resetForm();
      setIsOpen(false);
    } catch (err: any) {
      console.error("Save product error:", err);
      toast.error(err?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
      setImageFile(null);
    }
  };

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  // Open view drawer for a specific product
  const openView = (product: Product) => {
    setSelectedProduct(product);
    setViewOpen(true);
  };

  // Close view drawer
  const closeView = () => {
    setViewOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // Start editing a product: populate form and open add drawer in edit mode
  const startEdit = (product: Product) => {
    setIsEdit(true);
    setEditingId(product.id);

    // Ensure category is a string id. product.category should already be normalized to id.
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
    setIsOpen(true);
  };

  // Delete product with confirmation
  const handleDelete = async (id: string | number) => {
    const yes = window.confirm("Delete this product? This action cannot be undone.");
    if (!yes) return;
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
      toast.success("Product deleted");
      if (selectedProduct?.id && String(selectedProduct.id) === String(id)) closeView();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.message || "Failed to delete product");
    }
  };

  // Refresh list
  const handleRefresh = async () => {
    await fetchProducts();
    toast.success("Refreshed");
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <div className="space-y-8">
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
                setIsOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full p-6 text-center text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full p-6 text-center text-muted-foreground">No products yet.</div>
          ) : (
            products.map((product) => (
              <Card key={String(product.id)} className="hover:shadow-xl transition-shadow transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="w-full h-36 rounded-lg mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-chart-primary to-chart-accent">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
                        }}
                      />
                    ) : product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Package className="h-10 w-10 text-white opacity-90" />
                      </div>
                    )}
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
                      {product.discount_amount && (
                        <div className="text-xs text-muted-foreground">Saved: {product.discount_amount}</div>
                      )}
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

        {/* Add / Edit Drawer */}
        {isMounted && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit product drawer" : "Add product drawer"}>
            {/* overlay */}
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
              {/* header */}
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

              {/* body */}
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
                          placeholder="e.g. 6"
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
                    <div /> {/* kept layout symmetric with buttons on right */}
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
            {/* overlay */}
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
              {/* header */}
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">Product Details</h3>
                  <p className="text-sm text-muted-foreground">Details for the selected product</p>
                </div>
              </div>

              <div className="p-6">
                {selectedProduct?.image_url && (
                  <div className="mb-4">
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-44 object-cover rounded-md border"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://source.unsplash.com/featured/600x600/?grocery,food&sig=999";
                      }}
                    />
                  </div>
                )}

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








