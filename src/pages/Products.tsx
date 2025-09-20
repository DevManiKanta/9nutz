// // src/components/products/Products.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Plus, Package, X } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// type Product = {
//   id: number;
//   name: string;
//   price: string;
//   category: string;
//   sku?: string;
//   stock?: number;
//   description?: string;
//   image?: string;
//   active?: boolean;
// };

// const initialProducts: Product[] = [
//   { id: 1, name: "Premium Dashboard", price: "$99", category: "Software" },
//   { id: 2, name: "Analytics Tool", price: "$149", category: "Software" },
//   { id: 3, name: "Design System", price: "$79", category: "UI Kit" },
//   { id: 4, name: "API Integration", price: "$199", category: "Service" },
// ];

// const API_BASE = "http://192.168.29.102:5000/api/";

// const Products: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>(initialProducts);

//   // Add Product drawer state
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   // View Details drawer state
//   const [viewOpen, setViewOpen] = useState(false);
//   const [viewMounted, setViewMounted] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   // form state (for add)
//   const [form, setForm] = useState({
//     name: "",
//     price: "",
//     category: "",
//     sku: "",
//     stock: "0",
//     description: "",
//     image: "",
//     active: true,
//   });
//   const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

//   // submitting / loading
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const nextId = useRef(initialProducts.length + 1);
//   const firstInputRef = useRef<HTMLInputElement | null>(null);
//   const addBtnRef = useRef<HTMLButtonElement | null>(null);
//   const drawerRef = useRef<HTMLDivElement | null>(null);

//   // view drawer ref (for focus trap)
//   const viewDrawerRef = useRef<HTMLDivElement | null>(null);

//   // mount/unmount add drawer so exit animation can run
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

//   // mount/unmount view drawer similar to add drawer
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

//   // keyboard handling + focus trap for add drawer
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

//   // keyboard handling + focus trap for view drawer
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
//       const res = await fetch(`http://192.168.29.102:5000/api/products`);
//       if (!res.ok) {
//         console.error("Failed to fetch products:", res.status);
//         toast.error("Failed to load products from server");
//         return;
//       }
//       const body = await res.json();
//       if (body && Array.isArray(body.data)) {
//         setProducts(body.data);
//         const maxId = body.data.reduce((m: number, p: Product) => Math.max(m, p.id || 0), 0);
//         nextId.current = Math.max(nextId.current, maxId + 1);
//       }
//     } catch (err) {
//       toast.error("Network error while loading products");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // validation
//   const validate = () => {
//     const e: Partial<Record<keyof typeof form, string>> = {};
//     if (!form.name.trim()) e.name = "Product name is required";
//     if (!form.price.trim()) e.price = "Price is required";
//     if (form.price && !/^[\d,.₹$€£]+$/.test(form.price.trim())) e.price = "Enter a valid price";
//     if (!form.category.trim()) e.category = "Category is required";
//     if (form.stock && !/^\d+$/.test(form.stock)) e.stock = "Stock must be an integer";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const resetForm = () => {
//     setForm({
//       name: "",
//       price: "",
//       category: "",
//       sku: "",
//       stock: "0",
//       description: "",
//       image: "",
//       active: true,
//     });
//     setErrors({});
//   };

//   // handle image upload (file -> base64)
//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // optional: limit size (5MB)
//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       toast.error("Image too large (max 5MB)");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setForm((f) => ({ ...f, image: reader.result as string }));
//       setErrors((err) => ({ ...err, image: undefined }));
//     };
//     reader.readAsDataURL(file);
//   };

//   // Unified submit: validates, posts, updates UI
//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();

//     // client validation
//     if (!validate()) {
//       toast.error("Please fix the highlighted fields");
//       return;
//     }

//     // Build payload
//     const payload = {
//       name: form.name.trim(),
//       price: form.price.trim(),
//       category: form.category.trim(),
//       sku: form.sku?.trim() || undefined,
//       stock: form.stock !== undefined ? Number(form.stock) : 0,
//       image: form.image?.trim() || undefined,
//       description: form.description?.trim() || undefined,
//       active: !!form.active,
//     };

//     // LOG payload so you can inspect it in console
//     console.log("Submitting payload:", payload);

//     setIsSubmitting(true);
//     setErrors({});

//     try {
//       const res = await fetch(`http://192.168.29.102:5000/api/products`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       let body: any = null;
//       try {
//         body = await res.json();
//       } catch (err) {
//         body = null;
//       }

//       console.log("Response status:", res.status, "body:", body);

//       if (!res.ok) {
//         // If server sent field errors `{ errors: { field: msg } }`
//         if (body && body.errors && typeof body.errors === "object") {
//           setErrors(body.errors);
//           // show first message in toast if available
//           const firstKey = Object.keys(body.errors)[0];
//           if (firstKey) {
//             const msg = (body.errors as Record<string, string>)[firstKey];
//             if (msg) toast.error(msg);
//           } else {
//             toast.error("Validation error from server");
//           }
//         } else {
//           const msg = (body && body.message) || `Server error (${res.status})`;
//           toast.error(msg);
//           console.error("Server error creating product:", body || res.status);
//         }
//         return;
//       }

//       // On success expect server created product in body.data
//       if (body && body.data) {
//         setProducts((p) => [body.data, ...p]);
//         // sync nextId
//         if (body.data.id) nextId.current = Math.max(nextId.current, body.data.id + 1);
//         toast.success("Product added");
//       } else {
//         // Fallback: create optimistic local product if server didn't return product
//         const localProduct: Product = {
//           id: nextId.current++,
//           name: payload.name,
//           price: payload.price,
//           category: payload.category,
//           sku: payload.sku,
//           stock: payload.stock,
//           description: payload.description,
//           image: payload.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
//           active: payload.active,
//         };
//         setProducts((p) => [localProduct, ...p]);
//         toast.success("Product added (local)");
//         console.warn("API returned unexpected response; added optimistic local product");
//       }

//       resetForm();
//       setIsOpen(false);
//     } catch (err) {
//       console.error("Network error creating product:", err);
//       toast.error("Network error while creating product");
//     } finally {
//       setIsSubmitting(false);
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
//     // clear selection after animation
//     setTimeout(() => setSelectedProduct(null), 300);
//   };

//   return (
//     <>
//      <Toaster position="top-right" toastOptions={{ duration: 1000 }} />
//       <div className="space-y-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Products</h1>
//           </div>
//           <Button
//             ref={addBtnRef}
//             className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm"
//             onClick={() => setIsOpen(true)}
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Add Product
//           </Button>
//         </div>

//         {/* Product grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {isLoading ? (
//             <div className="col-span-full p-6 text-center text-muted-foreground">Loading products...</div>
//           ) : products.length === 0 ? (
//             <div className="col-span-full p-6 text-center text-muted-foreground">No products yet.</div>
//           ) : (
//             products.map((product) => (
//               <Card key={product.id} className="hover:shadow-xl transition-shadow transform hover:-translate-y-1">
//                 <CardHeader className="pb-3">
//                   <div className="w-full h-36 rounded-lg mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-chart-primary to-chart-accent">
//                     {product.image ? (
//                       <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
//                     <span className="text-sm text-muted-foreground">Category</span>
//                     <span className="text-sm font-medium">{product.category}</span>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-muted-foreground">Price</span>
//                     <span className="text-lg font-bold text-chart-primary">{product.price}</span>
//                   </div>

//                   <Button variant="outline" className="w-full" onClick={() => openView(product)}>
//                     View Details
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </div>

//         {/* Add Drawer */}
//         {isMounted && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Add product drawer">
//             {/* overlay (blur + dim) */}
//             <div
//               className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
//                 isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//               }`}
//               onClick={() => setIsOpen(false)}
//               aria-hidden="true"
//             />

//             {/* right drawer panel */}
//             <aside
//               ref={drawerRef}
//               className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out
//                 md:w-96 w-full
//               `}
//               style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
//             >
//               {/* header */}
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div>
//                   <h3 className="text-xl font-semibold">Add Product</h3>
//                   <p className="text-sm text-muted-foreground">Fill in the details to add a new product</p>
//                 </div>

//                 <button
//                   onClick={() => setIsOpen(false)}
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
//                         placeholder="e.g. Premium Dashboard"
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
//                         placeholder="e.g. 99"
//                       />
//                       {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">
//                         Category <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         aria-label="Category"
//                         className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-muted"}`}
//                         value={form.category}
//                         onChange={(e) => handleChange("category", e.target.value)}
//                         placeholder=""
//                       />
//                       {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">SKU</label>
//                       <input
//                         aria-label="SKU"
//                         className="block w-full border rounded-md p-2 focus:outline-none focus:ring border-muted"
//                         value={form.sku}
//                         onChange={(e) => handleChange("sku", e.target.value)}
//                         placeholder="Optional SKU"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Stock</label>
//                       <input
//                         aria-label="Stock"
//                         className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.stock ? "border-red-400" : "border-muted"}`}
//                         value={form.stock}
//                         onChange={(e) => handleChange("stock", e.target.value)}
//                         placeholder="0"
//                         inputMode="numeric"
//                       />
//                       {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Upload Image</label>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageUpload}
//                         className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-chart-primary file:text-white hover:file:bg-chart-primary/90"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Description</label>
//                     <textarea
//                       aria-label="Description"
//                       className="block w-full border rounded-md p-2 focus:outline-none focus:ring border-muted"
//                       value={form.description}
//                       onChange={(e) => handleChange("description", e.target.value)}
//                       placeholder="Short product description (optional)"
//                       rows={4}
//                     />
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <label className="inline-flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         checked={form.active}
//                         onChange={(e) => handleChange("active", e.target.checked)}
//                         className="h-4 w-4"
//                         aria-label="Active"
//                       />
//                       <span className="text-sm">Active</span>
//                     </label>

//                     <div className="flex items-center gap-3">
//                       <Button variant="ghost" onClick={() => { resetForm(); setIsOpen(false); }}>
//                         Cancel
//                       </Button>
//                       <Button type="submit" className="bg-chart-primary hover:bg-chart-primary/90" disabled={isSubmitting}>
//                         {isSubmitting ? "Adding..." : "Add Product"}
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
//               className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
//                 viewOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//               }`}
//               onClick={() => closeView()}
//               aria-hidden="true"
//             />

//             <aside
//               ref={viewDrawerRef}
//               className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out
//                 md:w-96 w-full
//               `}
//               style={{ transform: viewOpen ? "translateX(0)" : "translateX(100%)" }}
//             >
//               {/* header */}
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div>
//                   <h3 className="text-xl font-semibold">Product Details</h3>
//                   <p className="text-sm text-muted-foreground">Details for the selected product</p>
//                 </div>

//                 <button
//                   onClick={() => closeView()}
//                   aria-label="Close drawer"
//                   className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <div className="p-6">
//                 {selectedProduct?.image && (
//                   <div className="mb-4">
//                     <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-44 object-cover rounded-md border" />
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
//                     <label className="block text-sm font-medium mb-1">Category</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.category || "-"}</div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">SKU</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.sku || "-"}</div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Stock</label>
//                     <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.stock ?? "-"}</div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Description</label>
//                     <div className="rounded-md border p-2 bg-gray-50 whitespace-pre-wrap">{selectedProduct?.description || "-"}</div>
//                   </div>

//                   <div className="flex items-center justify-between mt-4">
//                     <Button variant="ghost" onClick={() => closeView()}>
//                       Close
//                     </Button>
//                     <Button onClick={() => { /* optional: edit functionality */ }}>
//                       Edit
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


// src/components/products/Products.tsx
// src/components/products/Products.tsx
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, X, RefreshCw, Trash2, Edit3 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Product = {
  id: string | number;
  name: string;
  price: string;
  category: string;
  sku?: string;
  stock?: number;
  description?: string;
  image?: string;
  active?: boolean;
};

const initialProducts: Product[] = [
  { id: 1, name: "Premium Dashboard", price: "$99", category: "Software" },
  { id: 2, name: "Analytics Tool", price: "$149", category: "Software" },
  { id: 3, name: "Design System", price: "$79", category: "UI Kit" },
  { id: 4, name: "API Integration", price: "$199", category: "Service" },
];

const API_BASE = "http://192.168.29.102:5000/api/";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

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
    price: "",
    category: "",
    sku: "",
    stock: "0",
    description: "",
    image: "",
    active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  // loading/submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nextId = useRef(initialProducts.length + 1);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const viewDrawerRef = useRef<HTMLDivElement | null>(null);

  // Helpers: normalize server product -> Product
  function normalizeProduct(raw: any): Product {
    if (!raw) {
      return {
        id: `local-${Date.now()}`,
        name: "Untitled",
        price: "",
        category: "",
      };
    }
    const id = raw.id ?? raw._id ?? raw.product_id ?? raw.productId ?? raw.uid ?? raw.uuid ?? raw._uid ?? raw.id_str ?? raw.idNumber;
    const stock = raw.stock ?? raw.qty ?? raw.quantity ?? raw.stk;
    return {
      id: id ?? raw.id ?? raw._id ?? `local-${Date.now()}`,
      name: String(raw.name ?? raw.title ?? raw.productName ?? raw.product ?? "Untitled"),
      price: String(raw.price ?? raw.cost ?? raw.amount ?? ""),
      category: String(raw.category ?? raw.cat ?? raw.type ?? ""),
      sku: raw.sku ?? raw.SKU ?? undefined,
      stock: typeof stock === "number" ? stock : stock ? Number(stock) : undefined,
      description: raw.description ?? raw.desc ?? undefined,
      image: raw.image ?? raw.photo ?? raw.imageUrl ?? raw.img ?? undefined,
      active: raw.active === undefined ? true : Boolean(raw.active),
    };
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

  // keyboard/focus traps (kept)
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
      const res = await fetch(`${API_BASE}products`);
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
        return;
      }

      // Possible shapes: { data: [...] }, { products: [...] }, array, { items: [...] }, single object
      let rows: any[] = [];
      if (Array.isArray(raw)) rows = raw;
      else if (Array.isArray(raw?.data)) rows = raw.data;
      else if (Array.isArray(raw?.products)) rows = raw.products;
      else if (Array.isArray(raw?.rows)) rows = raw.rows;
      else if (Array.isArray(raw?.items)) rows = raw.items;
      else if (raw && typeof raw === "object" && Object.keys(raw).length && raw.data && Array.isArray(raw.data)) rows = raw.data;
      else {
        // fallback: if server returned single product object, wrap it
        if (raw && typeof raw === "object" && (raw.id || raw._id || raw.name)) rows = [raw];
      }

      const normalized = rows.map(normalizeProduct);
      setProducts(normalized);
      const maxId = normalized.reduce((m: number, p: Product) => {
        const idNum = Number(p.id as any);
        return Number.isFinite(idNum) ? Math.max(m, idNum) : m;
      }, 0);
      nextId.current = Math.max(nextId.current, maxId + 1);
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

  // validation
  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price.trim()) e.price = "Price is required";
    if (form.price && !/^[\d,.₹$€£]+$/.test(form.price.trim())) e.price = "Enter a valid price";
    if (!form.category.trim()) e.category = "Category is required";
    if (form.stock && !/^\d+$/.test(form.stock)) e.stock = "Stock must be an integer";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      sku: "",
      stock: "0",
      description: "",
      image: "",
      active: true,
    });
    setErrors({});
    setIsEdit(false);
    setEditingId(null);
  };

  // handle image upload (file -> base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, image: reader.result as string }));
      setErrors((err) => ({ ...err, image: undefined }));
    };
    reader.readAsDataURL(file);
  };

  // create (POST)
  const createProduct = async (payload: Partial<Product>) => {
    const res = await fetch(`${API_BASE}products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    // prefer body.data, body.product, or body
    const createdRaw = body?.data ?? body?.product ?? body?.product ?? body ?? null;
    return normalizeProduct(createdRaw);
  };

  // update (PUT or PATCH) — try PUT, fallback to PATCH
  const updateProduct = async (id: string | number, payload: Partial<Product>) => {
    // try PUT first
    let res = await fetch(`${API_BASE}products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let body = await (async () => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    })();

    if (!res.ok) {
      // try PATCH as fallback
      try {
        res = await fetch(`${API_BASE}products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        body = await (async () => {
          try {
            return await res.json();
          } catch {
            return null;
          }
        })();
      } catch {
        /* noop */
      }
    }

    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }

    const updatedRaw = body?.data ?? body?.product ?? body ?? null;
    return normalizeProduct(updatedRaw);
  };

  // delete (DELETE)
  const deleteProduct = async (id: string | number) => {
    const res = await fetch(`${API_BASE}products/${id}`, {
      method: "DELETE",
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
      category: form.category.trim(),
      sku: form.sku?.trim() || undefined,
      stock: form.stock !== undefined ? Number(form.stock) : 0,
      image: form.image?.trim() || undefined,
      description: form.description?.trim() || undefined,
      active: !!form.active,
    };

    setIsSubmitting(true);
    try {
      if (isEdit && editingId != null) {
        // update flow
        const saved = await updateProduct(editingId, payload);
        if (saved) {
          setProducts((prev) =>
            prev.map((p) => (String(p.id) === String(editingId) ? { ...(p as Product), ...(saved as Product) } : p))
          );
          // if currently viewed, update it too
          if (selectedProduct && String(selectedProduct.id) === String(editingId)) {
            setSelectedProduct((prev) => (prev ? { ...prev, ...(saved as Product) } : prev));
          }
          toast.success("Product updated");
        } else {
          // fallback optimistic update
          setProducts((prev) => prev.map((p) => (String(p.id) === String(editingId) ? { ...(p as Product), ...payload } as Product : p)));
          toast.success("Product updated (local)");
          console.warn("Update succeeded but server returned no body; applied optimistic update.");
        }
      } else {
        // create flow
        const saved = await createProduct(payload);
        if (saved) {
          setProducts((p) => [saved as Product, ...p]);
          toast.success("Product added");
        } else {
          // fallback: create optimistic local product
          const localProduct: Product = {
            id: `local-${Date.now()}`,
            name: payload.name || "Untitled",
            price: payload.price || "",
            category: payload.category || "",
            sku: payload.sku,
            stock: payload.stock,
            description: payload.description,
            image: payload.image || undefined,
            active: payload.active,
          };
          setProducts((p) => [localProduct, ...p]);
          toast.success("Product added (local)");
          console.warn("API returned unexpected response; added optimistic local product");
        }
      }

      resetForm();
      setIsOpen(false);
    } catch (err: any) {
      console.error("Save product error:", err);
      toast.error(err?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
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
    setForm({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      sku: product.sku || "",
      stock: product.stock !== undefined ? String(product.stock) : "0",
      description: product.description || "",
      image: product.image || "",
      active: product.active ?? true,
    });
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
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">{product.category}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-lg font-bold text-chart-primary">{product.price}</span>
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
                        placeholder="e.g. Premium Dashboard"
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
                        placeholder="e.g. 99 or ₹99"
                      />
                      {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        aria-label="Category"
                        className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.category ? "border-red-400" : "border-muted"}`}
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                      />
                      {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      <input
                        aria-label="SKU"
                        className="block w-full border rounded-md p-2 focus:outline-none focus:ring border-muted"
                        value={form.sku}
                        onChange={(e) => handleChange("sku", e.target.value)}
                        placeholder="Optional SKU"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock</label>
                      <input
                        aria-label="Stock"
                        className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.stock ? "border-red-400" : "border-muted"}`}
                        value={form.stock}
                        onChange={(e) => handleChange("stock", e.target.value)}
                        placeholder="0"
                        inputMode="numeric"
                      />
                      {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-chart-primary file:text-white hover:file:bg-chart-primary/90"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      aria-label="Description"
                      className="block w-full border rounded-md p-2 focus:outline-none focus:ring border-muted"
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Short product description (optional)"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => handleChange("active", e.target.checked)}
                        className="h-4 w-4"
                        aria-label="Active"
                      />
                      <span className="text-sm">Active</span>
                    </label>

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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedProduct) startEdit(selectedProduct);
                      setViewOpen(false);
                    }}
                    title="Edit"
                    aria-label="Edit product"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => {
                      if (selectedProduct) handleDelete(selectedProduct.id);
                    }}
                    title="Delete"
                    aria-label="Delete product"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => closeView()}
                    aria-label="Close drawer"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedProduct?.image && (
                  <div className="mb-4">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-44 object-cover rounded-md border" />
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
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.category || "-"}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.sku || "-"}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <div className="rounded-md border p-2 bg-gray-50">{selectedProduct?.stock ?? "-"}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <div className="rounded-md border p-2 bg-gray-50 whitespace-pre-wrap">{selectedProduct?.description || "-"}</div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Button variant="ghost" onClick={() => closeView()}>
                      Close
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={() => { if (selectedProduct) startEdit(selectedProduct); }}>
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => { if (selectedProduct) handleDelete(selectedProduct.id); }}>
                        Delete
                      </Button>
                    </div>
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


