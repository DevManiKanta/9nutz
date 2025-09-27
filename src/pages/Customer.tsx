
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Search, ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from '../api/axios'

// type Product = {
//   id: string | number;
//   name: string;
//   price: number;
//   unit?: string;
//   image?: string;
//   image_url?: string;
//   sku?: string;
//   stock?: number;
//   category?: any;
// };

// type CartLine = {
//   product: Product;
//   qty: number;
//   lineTotal: number;
// };

// const SAMPLE_PRODUCTS: Product[] = [
//   { id: "p-1", name: "Millet Idly Ravvas (500g)", price: 120, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,idli,grain&sig=101", sku: "MIR-500", stock: 50, category: "Millets" },
//   { id: "p-2", name: "Millet Upma Ravva (500g)", price: 95, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,upma,coarse-grain&sig=102", sku: "MUR-500", stock: 40, category: "Millets" },
//   { id: "p-3", name: "Organic Grains Mix (1kg)", price: 240, unit: "1kg", image: "https://source.unsplash.com/featured/600x600/?organic,grains,mix&sig=103", sku: "GRA-1KG", stock: 30, category: "Grains" },
//   { id: "p-4", name: "Special Dry Fruits Pack", price: 480, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?dry-fruits,nuts,mix&sig=104", sku: "SDF-500", stock: 20, category: "Dry Fruits" },
//   { id: "p-5", name: "Premium Flour (2kg)", price: 180, unit: "2kg", image: "https://source.unsplash.com/featured/600x600/?flour,wheat,bread-ingredients&sig=105", sku: "FLO-2KG", stock: 60, category: "Flour" },
//   { id: "p-6", name: "Healthy Snack Mix (250g)", price: 150, unit: "250g", image: "https://source.unsplash.com/featured/600x600/?healthy-snack,nuts,seeds&sig=106", sku: "SNK-250", stock: 80, category: "Snacks" },
// ];

// export default function POS(): JSX.Element {
//   const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [query, setQuery] = useState("");
//   const [cartMap, setCartMap] = useState<Record<string, number>>({});
//   const [cartOpen, setCartOpen] = useState(false);
//   const [discount, setDiscount] = useState<{ type: "fixed" | "percent"; value: number }>({ type: "fixed", value: 0 });
//   const [isCheckingOut, setIsCheckingOut] = useState(false);
//   const [gstPercent, setGstPercent] = useState<number>(18);
//   const [adminEditProduct, setAdminEditProduct] = useState<Product | null>(null);
//   const [adminModalOpen, setAdminModalOpen] = useState(false);
//   const [adminName, setAdminName] = useState("");
//   const [adminPrice, setAdminPrice] = useState<string>("");
//   const [adminImageFile, setAdminImageFile] = useState<File | null>(null);
//   const [adminPreview, setAdminPreview] = useState<string>("");
//   const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name?: string } | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const imageInputRef = useRef<HTMLInputElement | null>(null);

//   // New: customer details for checkout
//   const [customerName, setCustomerName] = useState<string>("");
//   const [customerPhone, setCustomerPhone] = useState<string>("");

//   // New: payment method (only allowed: "card" | "upi" | "cash")
//   type PaymentMethod = "card" | "upi" | "cash" | "";
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");

//   // Helper: normalize raw server product -> Product
//   const normalizeServerProduct = (r: any, fallbackIndex = 0): Product => {
//     return {
//       id: r.id ?? r._id ?? r.product_id ?? `srv-${fallbackIndex}`,
//       name: r.name ?? r.title ?? `Product ${fallbackIndex + 1}`,
//       price: Number(r.price ?? r.amount ?? 0),
//       unit: r.grams ?? r.unit ?? r.size ?? undefined,
//       image: r.image ?? r.image_url ?? r.imageUrl ?? undefined,
//       image_url: r.image_url ?? undefined,
//       sku: r.sku ?? r.code ?? undefined,
//       stock: typeof r.stock === "number" ? r.stock : undefined,
//       category: r.category && typeof r.category === "object" ? r.category.name ?? r.category : r.category,
//     };
//   };

//   // Load products from API (uses axios instance)
//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoadingProducts(true);
//       try {
//         const res = await api.get("/admin/products/show");
//         const body = res.data;
//         let rows: any[] = [];
//         if (Array.isArray(body)) rows = body;
//         else if (Array.isArray(body.data)) rows = body.data;
//         else if (Array.isArray(body.products)) rows = body.products;
//         else if (Array.isArray(body.rows)) rows = body.rows;
//         else rows = [];

//         if (mounted && rows.length) {
//           const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
//           setProducts(normalized);
//         } else if (mounted) {
//           toast("Showing sample products (no server items)");
//         }
//       } catch (err) {
//         console.error("Failed to load products", err);
//         if (mounted) toast("Using sample products (failed to load from API)", { icon: "ℹ️" });
//       } finally {
//         if (mounted) setLoadingProducts(false);
//       }
//     };
//     void load();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const cartLines: CartLine[] = useMemo(() => {
//     const arr: CartLine[] = [];
//     for (const pid of Object.keys(cartMap)) {
//       const qty = cartMap[pid];
//       const prod = products.find((p) => String(p.id) === pid);
//       if (!prod) continue;
//       const lineTotal = Math.round((prod.price * qty + Number.EPSILON) * 100) / 100;
//       arr.push({ product: prod, qty, lineTotal });
//     }
//     return arr;
//   }, [cartMap, products]);

//   const itemsCount = cartLines.reduce((s, l) => s + l.qty, 0);
//   const subTotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
//   const gstAmount = Math.round((subTotal * (gstPercent / 100) + Number.EPSILON) * 100) / 100;
//   const discountAmount = discount.type === "fixed" ? discount.value : Math.round((subTotal * (discount.value / 100) + Number.EPSILON) * 100) / 100;
//   const total = Math.max(0, Math.round((subTotal + gstAmount - discountAmount + Number.EPSILON) * 100) / 100);

//   const visibleProducts = products.filter((p) => {
//     if (!query) return true;
//     const q = query.toLowerCase();
//     return p.name.toLowerCase().includes(q) || String(p.sku || "").toLowerCase().includes(q) || String(p.category || "").toLowerCase().includes(q);
//   });

//   // Add to cart — DO NOT open cart automatically (user requested)
//   function addToCart(product: Product, qty = 1) {
//     setCartMap((m) => {
//       const key = String(product.id);
//       const nextQty = (m[key] ?? 0) + qty;
//       return { ...m, [key]: nextQty };
//     });
//     toast.success(`${product.name} added to cart`);
//   }

//   function setQty(productId: string | number, qty: number) {
//     const key = String(productId);
//     setCartMap((m) => {
//       if (qty <= 0) {
//         const copy = { ...m };
//         delete copy[key];
//         return copy;
//       }
//       return { ...m, [key]: qty };
//     });
//   }
//   function inc(productId: string | number) {
//     const key = String(productId);
//     setCartMap((m) => ({ ...m, [key]: (m[key] ?? 0) + 1 }));
//   }
//   function dec(productId: string | number) {
//     const key = String(productId);
//     setCartMap((m) => {
//       const next = (m[key] ?? 0) - 1;
//       if (next <= 0) {
//         const copy = { ...m };
//         delete copy[key];
//         return copy;
//       }
//       return { ...m, [key]: next };
//     });
//   }

//   function removeLine(productId: string | number) {
//     const key = String(productId);
//     setCartMap((m) => {
//       const copy = { ...m };
//       delete copy[key];
//       return copy;
//     });
//   }

//   // Simple phone validator (digits only, at least 10)
//   const validPhone = (p: string) => {
//     const cleaned = p.replace(/\D/g, "");
//     return cleaned.length >= 10;
//   };
//   const validName = (n: string) => n.trim().length > 0;

//   async function handleCheckout() {
//     if (cartLines.length === 0) { toast.error("Cart is empty"); return; }
//     if (!validName(customerName)) { toast.error("Enter customer name"); return; }
//     if (!validPhone(customerPhone)) { toast.error("Enter valid phone number (min 10 digits)"); return; }
//     if (!paymentMethod) { toast.error("Select payment method"); return; }

//     setIsCheckingOut(true);

//     const payload = {
//       name: customerName.trim(),
//       phone: customerPhone.replace(/\D/g, ""),
//       payment: paymentMethod, 
//       items: cartLines.map(l => ({
//         product_id: typeof l.product.id === "string" && /^\d+$/.test(l.product.id) ? Number(l.product.id) : l.product.id,
//         name: l.product.name,
//         qty: l.qty,
//         price: l.product.price
//       })),
//       subtotal: subTotal,
//       gst_percent: gstPercent,
//       gst_amount: gstAmount,
//       discount_type: discount.type,
//       discount_value: discount.value,
//       total,
//     };
//     console.log("PAYLOAD", payload);
//     try {
//       const res = await api.post("admin/pos-orders/create", payload, {
//         headers: { "Content-Type": "application/json" }
//       });
//       const body = res.data;
//       toast.success("Purchase successful");
//       setCartMap({});
//       setCartOpen(false);
//       setCustomerName("");
//       setCustomerPhone("");
//       setPaymentMethod(""); // reset after successful purchase
//       if (body?.order_id) toast.success(`Order ${body.order_id} created`);
//     } catch (err: any) {
//       console.error("Checkout error", err);
//       toast.error("Network/server error while creating order");
//     } finally {
//       setIsCheckingOut(false);
//     }
//   }

//   // PRODUCTS CRUD via api instance (unchanged)
//   async function apiCreateProduct(name: string, price: number, file?: File | null) {
//     const fd = new FormData();
//     fd.append("name", name);
//     fd.append("price", String(price));
//     if (file) fd.append("image", file);

//     const res = await api.post("/admin/products/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
//     const body = res.data;
//     const raw = body?.data ?? body?.product ?? body ?? null;
//     return {
//       id: raw?.id ?? raw?._id ?? `srv-${Date.now()}`,
//       name: raw?.name ?? name,
//       price: Number(raw?.price ?? price ?? 0),
//       image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
//       image_url: raw?.image_url ?? undefined,
//       category: raw?.category ?? raw?.category?.name ?? undefined,
//     } as Product;
//   }

//   async function apiUpdateProduct(id: string | number, name: string, price: number, file?: File | null) {
//     const fd = new FormData();
//     fd.append("name", name);
//     fd.append("price", String(price));
//     if (file) fd.append("image", file);

//     const res = await api.post(`/admin/products/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//     const body = res.data;
//     const raw = body?.data ?? body?.product ?? body ?? null;
//     return {
//       id: raw?.id ?? id,
//       name: raw?.name ?? name,
//       price: Number(raw?.price ?? price ?? 0),
//       image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
//       image_url: raw?.image_url ?? undefined,
//       category: raw?.category ?? raw?.category?.name ?? undefined,
//     } as Product;
//   }

//   async function apiDeleteProduct(id: string | number) {
//     const res = await api.delete(`/admin/products/delete/${id}`);
//     return res.status >= 200 && res.status < 300;
//   }

//   // Admin modal helpers (unchanged)
//   function openAdminCreate() {
//     setAdminEditProduct(null);
//     setAdminName("");
//     setAdminPrice("");
//     setAdminImageFile(null);
//     setAdminPreview("");
//     setAdminModalOpen(true);
//   }

//   function openAdminEdit(p: Product) {
//     setAdminEditProduct(p);
//     setAdminName(p.name ?? "");
//     setAdminPrice(String(p.price ?? ""));
//     setAdminImageFile(null);
//     setAdminPreview(p.image_url ?? p.image ?? "");
//     setAdminModalOpen(true);
//   }

//   function onAdminImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) return;
//     setAdminImageFile(f);
//     const r = new FileReader();
//     r.onload = () => setAdminPreview(String(r.result ?? ""));
//     r.readAsDataURL(f);
//   }

//   async function submitAdminForm(e?: React.FormEvent) {
//     e?.preventDefault();
//     const name = adminName.trim();
//     const price = Number(adminPrice || 0);
//     if (!name) {
//       toast.error("Name required");
//       return;
//     }
//     if (Number.isNaN(price)) {
//       toast.error("Price invalid");
//       return;
//     }
//     try {
//       if (adminEditProduct) {
//         const optimistic = products.map((p) => (String(p.id) === String(adminEditProduct.id) ? { ...p, name, price, image: adminPreview || p.image, image_url: adminPreview || p.image_url } : p));
//         setProducts(optimistic);
//         setAdminModalOpen(false);
//         const updated = await apiUpdateProduct(adminEditProduct.id, name, price, adminImageFile);
//         setProducts((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
//         toast.success("Product updated");
//       } else {
//         const tmpId = `tmp-${Date.now()}`;
//         const optimistic: Product = { id: tmpId, name, price, image: adminPreview || undefined, image_url: adminPreview || undefined };
//         setProducts((prev) => [optimistic, ...prev]);
//         setAdminModalOpen(false);
//         const created = await apiCreateProduct(name, price, adminImageFile);
//         setProducts((prev) => [created, ...prev.filter((p) => p.id !== tmpId)]);
//         toast.success("Product created");
//       }
//     } catch (err: any) {
//       console.error("Save product failed", err);
//       toast.error(err?.message || "Save failed");
//       try { await refreshProducts(); } catch {}
//     } finally {
//       setAdminImageFile(null);
//       setAdminPreview("");
//     }
//   }

//   function requestDelete(id: string | number, name?: string) {
//     setDeleteTarget({ id, name });
//   }

//   async function confirmDelete() {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     const id = deleteTarget.id;
//     const prev = products;
//     setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
//     try {
//       await apiDeleteProduct(id);
//       toast.success("Product deleted");
//     } catch (err: any) {
//       console.error("Delete failed", err);
//       toast.error(err?.message || "Delete failed");
//       setProducts(prev);
//     } finally {
//       setDeleteLoading(false);
//       setDeleteTarget(null);
//     }
//   }

//   // Refresh products using axios
//   async function refreshProducts() {
//     setLoadingProducts(true);
//     try {
//       const res = await api.get("/admin/products/show");
//       const body = res.data;
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else rows = [];
//       if (rows.length) {
//         const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
//         setProducts(normalized);
//         toast.success("Products refreshed");
//       } else {
//         toast("No products returned");
//       }
//     } catch (err) {
//       console.error("Refresh failed", err);
//       toast.error("Refresh failed");
//     } finally {
//       setLoadingProducts(false);
//     }
//   }

//   // utility: fallback image generation
//   const fallbackFor = (p: Product) => {
//     const seed = encodeURIComponent(p.category || p.name.split(" ")[0] || "product");
//     return `https://source.unsplash.com/featured/400x400/?${seed}`;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <Toaster position="top-right" />
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900">Point of Sale</h1>
//         </div>
//         <div className="w-full md:w-auto flex items-center gap-3">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//             <input
//               type="search"
//               placeholder="Search products, SKU or category..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="pl-9 pr-4 py-2 rounded-full border w-[360px] focus:ring-2 focus:ring-indigo-300"
//             />
//           </div>
//           <button
//             onClick={() => setCartOpen((s) => !s)}
//             className="relative inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow"
//             title="Open cart"
//             aria-label="Open cart"
//           >
//             <ShoppingCart className="w-5 h-5" />
//             <span>Cart</span>
//             <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold bg-white text-indigo-600 rounded-full">
//               {itemsCount}
//             </span>
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <div className="text-lg font-medium">Products</div>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {loadingProducts
//             ? Array.from({ length: 8 }).map((_, i) => (
//                 <div key={i} className="animate-pulse p-3 border rounded-lg">
//                   <div className="w-full h-40 bg-slate-200 rounded mb-3" />
//                   <div className="h-4 bg-slate-200 w-3/4 mb-2" />
//                   <div className="h-4 bg-slate-200 w-1/2" />
//                 </div>
//               ))
//             : visibleProducts.map((p) => {
//                 const inCartQty = cartMap[String(p.id)] ?? 0;
//                 const imageSrc = p.image_url ?? p.image ?? fallbackFor(p);
//                 return (
//                   <div key={p.id} className="p-3 border rounded-lg flex flex-col">
//                     <div className="w-full h-40 rounded-lg overflow-hidden bg-white flex items-center justify-center mb-3">
//                       <img
//                         src={imageSrc}
//                         alt={p.name}
//                         className="object-cover w-full h-full"
//                         onError={(e) => {
//                           (e.currentTarget as HTMLImageElement).src = fallbackFor(p);
//                         }}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <div className="text-md font-medium text-slate-800 mb-1 line-clamp-2">{p.name}</div>
//                       <div className="text-sm text-slate-500 mb-2">{p.unit ?? p.sku ?? p.category}</div>
//                       <div className="text-lg font-semibold text-slate-900 mb-3">₹ {p.price.toFixed(2)}</div>
//                     </div>

//                     <div className="flex items-center justify-between gap-3 mt-auto">
//                       {inCartQty === 0 ? (
//                         <button
//                           onClick={() => addToCart(p, 1)}
//                           className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
//                         >
//                           <Plus className="w-4 h-4" />
//                           Add
//                         </button>
//                       ) : (
//                         <div className="flex items-center gap-2 w-full">
//                           <button onClick={() => dec(p.id)} className="px-3 py-2 rounded border inline-flex items-center justify-center">
//                             <Minus className="w-4 h-4" />
//                           </button>
//                           <div className="px-3 py-2 border rounded text-center w-full">{inCartQty}</div>
//                           <button onClick={() => inc(p.id)} className="px-3 py-2 rounded border inline-flex items-center justify-center">
//                             <Plus className="w-4 h-4" />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//         </div>
//       </div>

//       {/* Cart drawer */}
//       <div className={`fixed inset-0 z-50 ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!cartOpen}>
//         <div onClick={() => setCartOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`} />
//         <aside className={`absolute right-0 top-0 h-full w-full sm:w-[520px] md:w-[640px] lg:w-[720px] bg-white shadow-2xl transform transition-transform ${cartOpen ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-modal="true">
//           <div className="p-6 h-full flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h3 className="text-2xl font-semibold">Cart</h3>
//                 <div className="text-sm text-slate-500">{itemsCount} items</div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => setCartOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
//               </div>
//             </div>
//             <div className="flex-1 overflow-auto">
//               {cartLines.length === 0 ? (
//                 <div className="h-full grid place-items-center text-slate-400">
//                   <div className="text-center">
//                     <div className="w-28 h-28 rounded-full bg-slate-100 grid place-items-center mb-4">
//                       <ShoppingCart />
//                     </div>
//                     <div>No items in cart</div>
//                     <div className="text-sm text-slate-400">Add items from the product list</div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {cartLines.map((ln) => (
//                     <div key={String(ln.product.id)} className="flex items-center gap-4 p-3 border rounded-lg">
//                       <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-slate-50">
//                         <img
//                           src={ln.product.image_url ?? ln.product.image ?? fallbackFor(ln.product)}
//                           alt={ln.product.name}
//                           className="object-cover w-full h-full"
//                           onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).src = fallbackFor(ln.product);
//                           }}
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between gap-2">
//                           <div>
//                             <div className="font-medium text-slate-800">{ln.product.name}</div>
//                             <div className="text-sm text-slate-500">{ln.product.unit ?? ln.product.sku}</div>
//                           </div>

//                           <div className="text-right">
//                             <div className="font-semibold">₹ {(ln.product.price * ln.qty).toFixed(2)}</div>
//                             <div className="text-xs text-slate-500">₹ {ln.product.price.toFixed(2)} x {ln.qty}</div>
//                           </div>
//                         </div>
//                         <div className="mt-3 flex items-center gap-2">
//                           <button onClick={() => dec(ln.product.id)} className="px-2 py-1 border rounded"><Minus /></button>
//                           <div className="px-3 py-1 border rounded">{ln.qty}</div>
//                           <button onClick={() => inc(ln.product.id)} className="px-2 py-1 border rounded"><Plus /></button>
//                           <button onClick={() => removeLine(ln.product.id)} className="ml-auto px-3 py-1 rounded border text-sm inline-flex items-center gap-2">
//                             <Trash2 className="w-4 h-4" /> Remove
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <div className="mt-4 border-t pt-4">
//               <div className="grid grid-cols-2 gap-2 mb-2">
//                 <div className="text-sm text-slate-600">Subtotal</div>
//                 <div className="text-right font-medium">₹ {subTotal.toFixed(2)}</div>

//                 <div className="text-sm text-slate-600">GST ({gstPercent}%)</div>
//                 <div className="text-right font-medium">₹ {gstAmount.toFixed(2)}</div>

//                 <div className="text-sm text-slate-600">Discount</div>
//                 <div className="text-right font-medium">- ₹ {discountAmount.toFixed(2)}</div>
//               </div>

//               {/* Discount controls + GST below them */}
//               <div className="flex items-center gap-2 mb-3">
//                 <select value={discount.type} onChange={(e) => setDiscount((d) => ({ ...d, type: e.target.value as "fixed" | "percent" }))} className="p-2 border rounded bg-slate-50">
//                   <option value="fixed">Fixed</option>
//                   <option value="percent">Percent</option>
//                 </select>
//                 <input type="number" min={0} value={discount.value} onChange={(e) => setDiscount((d) => ({ ...d, value: Number(e.target.value || 0) }))} className="p-2 border rounded w-36" placeholder={discount.type === "fixed" ? "₹ amount" : "%"} />
//                 <div className="ml-auto text-sm text-slate-600">Adjust discount</div>
//               </div>

//               {/* GST dropdown moved here (below discount controls) */}
//               <div className="mb-4 flex items-center gap-2">
//                 <div className="text-sm text-slate-600">GST %</div>
//                 <select value={gstPercent} onChange={(e) => setGstPercent(Number(e.target.value))} className="p-2 border rounded bg-slate-50">
//                   <option value={0}>0</option>
//                   <option value={0.25}>0.25</option>
//                   <option value={3}>3</option>
//                   <option value={5}>5</option>
//                   <option value={12}>12</option>
//                   <option value={18}>18</option>
//                   <option value={28}>28</option>
//                 </select>
//                 <div className="ml-auto text-sm text-slate-500">Tax applied to subtotal</div>
//               </div>
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-lg font-medium">Total</div>
//                 <div className="text-2xl font-extrabold">₹ {total.toFixed(2)}</div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
//                 <div>
//                   <label className="text-sm text-slate-600 block mb-1">Customer name</label>
//                   <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="w-full p-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="text-sm text-slate-600 block mb-1">Phone number</label>
//                   <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="10+ digits" className="w-full p-2 border rounded" inputMode="tel" />
//                 </div>
//               </div>
//                <div>
//                   <label className="text text-slate-500 block">Payment</label>
//                   <select
//                     value={paymentMethod}
//                     onChange={(e) => {
//                       const val = e.target.value as PaymentMethod;
//                       if (val === "card" || val === "upi" || val === "cash" || val === "") {
//                         setPaymentMethod(val);
//                       } else {
//                         setPaymentMethod("");
//                       }
//                     }}
//                     className="p-2 border rounded bg-white"
//                     aria-label="Select payment method"
//                   >
//                     <option value="">Select payment</option>
//                     <option value="card">Card</option>
//                     <option value="upi">UPI</option>
//                     <option value="cash">Cash</option>
//                   </select>
//                 </div>
//               <div className="flex gap-3">
//                 {/* If you still want a visible clear cart, we can keep it as a small icon. For now, per your request, Clear Cart button is replaced by Payment dropdown above. */}
//                 <button
//                   onClick={() => void handleCheckout()}
//                   disabled={
//                     isCheckingOut ||
//                     cartLines.length === 0 ||
//                     !validName(customerName) ||
//                     !validPhone(customerPhone) ||
//                     !paymentMethod // ensure payment selected
//                   }
//                   className="ml-auto px-6 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
//                 >
//                   {isCheckingOut ? "Processing…" : `Purchase ₹ ${total.toFixed(2)}`}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </aside>
//       </div>

//       {/* Admin modal */}
//       {adminModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setAdminModalOpen(false)} />
//           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-medium">{adminEditProduct ? "Edit Product" : "Add Product"}</h3>
//               <button onClick={() => setAdminModalOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
//             </div>

//             <form onSubmit={submitAdminForm} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Name</label>
//                 <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-2 border rounded" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Price</label>
//                 <input value={adminPrice} onChange={(e) => setAdminPrice(e.target.value)} className="w-full p-2 border rounded" type="number" step="0.01" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Image</label>
//                 <input ref={imageInputRef} type="file" accept="image/*" onChange={onAdminImageChange} className="w-full text-sm" />
//                 {adminPreview && <div className="mt-2 w-full h-40 rounded overflow-hidden"><img src={adminPreview} alt="preview" className="w-full h-full object-cover" /></div>}
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button type="button" onClick={() => setAdminModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
//                 <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">{adminEditProduct ? "Save" : "Add"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete confirm */}
//       {deleteTarget && (
//         <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
//           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5 z-10">
//             <h3 className="text-lg font-medium">Confirm deletion</h3>
//             <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete <strong>{deleteTarget.name ?? "this product"}</strong>? This action cannot be undone.</p>
//             <div className="mt-4 flex justify-end gap-2">
//               <button className="px-3 py-1 rounded border" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
//               <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Yes, delete"}</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from '../api/axios'

type Product = {
  id: string | number;
  name: string;
  price: number;
  unit?: string;
  image?: string;
  image_url?: string;
  sku?: string;
  stock?: number;
  category?: any;
};

type CartLine = {
  product: Product;
  qty: number;
  lineTotal: number;
};

const SAMPLE_PRODUCTS: Product[] = [
  { id: "p-1", name: "Millet Idly Ravvas (500g)", price: 120, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,idli,grain&sig=101", sku: "MIR-500", stock: 50, category: "Millets" },
  { id: "p-2", name: "Millet Upma Ravva (500g)", price: 95, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,upma,coarse-grain&sig=102", sku: "MUR-500", stock: 40, category: "Millets" },
  { id: "p-3", name: "Organic Grains Mix (1kg)", price: 240, unit: "1kg", image: "https://source.unsplash.com/featured/600x600/?organic,grains,mix&sig=103", sku: "GRA-1KG", stock: 30, category: "Grains" },
  { id: "p-4", name: "Special Dry Fruits Pack", price: 480, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?dry-fruits,nuts,mix&sig=104", sku: "SDF-500", stock: 20, category: "Dry Fruits" },
  { id: "p-5", name: "Premium Flour (2kg)", price: 180, unit: "2kg", image: "https://source.unsplash.com/featured/600x600/?flour,wheat,bread-ingredients&sig=105", sku: "FLO-2KG", stock: 60, category: "Flour" },
  { id: "p-6", name: "Healthy Snack Mix (250g)", price: 150, unit: "250g", image: "https://source.unsplash.com/featured/600x600/?healthy-snack,nuts,seeds&sig=106", sku: "SNK-250", stock: 80, category: "Snacks" },
];

export default function POS(): JSX.Element {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [query, setQuery] = useState("");
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [discount, setDiscount] = useState<{ type: "fixed" | "percent"; value: number }>({ type: "fixed", value: 0 });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [adminEditProduct, setAdminEditProduct] = useState<Product | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminPrice, setAdminPrice] = useState<string>("");
  const [adminImageFile, setAdminImageFile] = useState<File | null>(null);
  const [adminPreview, setAdminPreview] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name?: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // New: customer details for checkout
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // New: payment method (only allowed: "card" | "upi" | "cash")
  type PaymentMethod = "card" | "upi" | "cash" | "";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);

  // Helper: normalize raw server product -> Product
  const normalizeServerProduct = (r: any, fallbackIndex = 0): Product => {
    return {
      id: r.id ?? r._id ?? r.product_id ?? `srv-${fallbackIndex}`,
      name: r.name ?? r.title ?? `Product ${fallbackIndex + 1}`,
      price: Number(r.price ?? r.amount ?? 0),
      unit: r.grams ?? r.unit ?? r.size ?? undefined,
      image: r.image ?? r.image_url ?? r.imageUrl ?? undefined,
      image_url: r.image_url ?? undefined,
      sku: r.sku ?? r.code ?? undefined,
      stock: typeof r.stock === "number" ? r.stock : undefined,
      category: r.category && typeof r.category === "object" ? r.category.name ?? r.category : r.category,
    };
  };

  // Load products from API (uses axios instance)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get("/admin/products/show");
        const body = res.data;
        let rows: any[] = [];
        if (Array.isArray(body)) rows = body;
        else if (Array.isArray(body.data)) rows = body.data;
        else if (Array.isArray(body.products)) rows = body.products;
        else if (Array.isArray(body.rows)) rows = body.rows;
        else rows = [];

        if (mounted && rows.length) {
          const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
          setProducts(normalized);
        } else if (mounted) {
          toast("Showing sample products (no server items)");
        }
      } catch (err) {
        console.error("Failed to load products", err);
        if (mounted) toast("Using sample products (failed to load from API)", { icon: "ℹ️" });
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const cartLines: CartLine[] = useMemo(() => {
    const arr: CartLine[] = [];
    for (const pid of Object.keys(cartMap)) {
      const qty = cartMap[pid];
      const prod = products.find((p) => String(p.id) === pid);
      if (!prod) continue;
      const lineTotal = Math.round((prod.price * qty + Number.EPSILON) * 100) / 100;
      arr.push({ product: prod, qty, lineTotal });
    }
    return arr;
  }, [cartMap, products]);

  const itemsCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const subTotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
  const gstAmount = Math.round((subTotal * (gstPercent / 100) + Number.EPSILON) * 100) / 100;
  const discountAmount = discount.type === "fixed" ? discount.value : Math.round((subTotal * (discount.value / 100) + Number.EPSILON) * 100) / 100;
  const total = Math.max(0, Math.round((subTotal + gstAmount - discountAmount + Number.EPSILON) * 100) / 100);

  // Filtered products by query
  const visibleProducts = useMemo(() => {
    if (!query) return products;
    const q = query.toLowerCase();
    return products.filter((p) => {
      return p.name.toLowerCase().includes(q) || String(p.sku || "").toLowerCase().includes(q) || String(p.category || "").toLowerCase().includes(q);
    });
  }, [products, query]);

  // Reset to page 1 when query or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, itemsPerPage, products.length]);

  // Pagination helpers
  const totalItems = visibleProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return visibleProducts.slice(start, start + itemsPerPage);
  }, [visibleProducts, currentPage, itemsPerPage]);

  const changePage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageButtons = () => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => changePage(page)}
            className={`px-3 py-1 rounded ${page === currentPage ? "bg-indigo-600 text-white" : "bg-white border"}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        );
      });
    }

    const pages: (number | string)[] = [];
    const left = Math.max(1, currentPage - 2);
    const right = Math.min(totalPages, currentPage + 2);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }

    for (let p = left; p <= right; p++) pages.push(p);

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((p, idx) =>
      p === "..." ? (
        <span key={`e-${idx}`} className="px-2 text-sm text-slate-500">…</span>
      ) : (
        <button
          key={p}
          onClick={() => changePage(Number(p))}
          className={`px-3 py-1 rounded ${p === currentPage ? "bg-indigo-600 text-white" : "bg-white border"}`}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </button>
      )
    );
  };

  // Add to cart
  function addToCart(product: Product, qty = 1) {
    setCartMap((m) => {
      const key = String(product.id);
      const nextQty = (m[key] ?? 0) + qty;
      return { ...m, [key]: nextQty };
    });
    toast.success(`${product.name} added to cart`);
  }

  function setQty(productId: string | number, qty: number) {
    const key = String(productId);
    setCartMap((m) => {
      if (qty <= 0) {
        const copy = { ...m };
        delete copy[key];
        return copy;
      }
      return { ...m, [key]: qty };
    });
  }
  function inc(productId: string | number) {
    const key = String(productId);
    setCartMap((m) => ({ ...m, [key]: (m[key] ?? 0) + 1 }));
  }
  function dec(productId: string | number) {
    const key = String(productId);
    setCartMap((m) => {
      const next = (m[key] ?? 0) - 1;
      if (next <= 0) {
        const copy = { ...m };
        delete copy[key];
        return copy;
      }
      return { ...m, [key]: next };
    });
  }

  function removeLine(productId: string | number) {
    const key = String(productId);
    setCartMap((m) => {
      const copy = { ...m };
      delete copy[key];
      return copy;
    });
  }

  // Simple phone validator (digits only, at least 10)
  const validPhone = (p: string) => {
    const cleaned = p.replace(/\D/g, "");
    return cleaned.length >= 10;
  };
  const validName = (n: string) => n.trim().length > 0;

  async function handleCheckout() {
    if (cartLines.length === 0) { toast.error("Cart is empty"); return; }
    if (!validName(customerName)) { toast.error("Enter customer name"); return; }
    if (!validPhone(customerPhone)) { toast.error("Enter valid phone number (min 10 digits)"); return; }
    if (!paymentMethod) { toast.error("Select payment method"); return; }

    setIsCheckingOut(true);

    const payload = {
      name: customerName.trim(),
      phone: customerPhone.replace(/\D/g, ""),
      payment: paymentMethod,
      items: cartLines.map(l => ({
        product_id: typeof l.product.id === "string" && /^\d+$/.test(String(l.product.id)) ? Number(l.product.id) : l.product.id,
        name: l.product.name,
        qty: l.qty,
        price: l.product.price
      })),
      subtotal: subTotal,
      gst_percent: gstPercent,
      gst_amount: gstAmount,
      discount_type: discount.type,
      discount_value: discount.value,
      total,
    };
    console.log("PAYLOAD", payload);
    try {
      const res = await api.post("admin/pos-orders/create", payload, {
        headers: { "Content-Type": "application/json" }
      });
      const body = res.data;
      toast.success("Purchase successful");
      setCartMap({});
      setCartOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod(""); // reset after successful purchase
      if (body?.order_id) toast.success(`Order ${body.order_id} created`);
    } catch (err: any) {
      console.error("Checkout error", err);
      toast.error("Network/server error while creating order");
    } finally {
      setIsCheckingOut(false);
    }
  }

  // PRODUCTS CRUD via api instance (unchanged)
  async function apiCreateProduct(name: string, price: number, file?: File | null) {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(price));
    if (file) fd.append("image", file);

    const res = await api.post("/admin/products/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
    const body = res.data;
    const raw = body?.data ?? body?.product ?? body ?? null;
    return {
      id: raw?.id ?? raw?._id ?? `srv-${Date.now()}`,
      name: raw?.name ?? name,
      price: Number(raw?.price ?? price ?? 0),
      image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
      image_url: raw?.image_url ?? undefined,
      category: raw?.category ?? raw?.category?.name ?? undefined,
    } as Product;
  }

  async function apiUpdateProduct(id: string | number, name: string, price: number, file?: File | null) {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(price));
    if (file) fd.append("image", file);

    const res = await api.post(`/admin/products/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    const body = res.data;
    const raw = body?.data ?? body?.product ?? body ?? null;
    return {
      id: raw?.id ?? id,
      name: raw?.name ?? name,
      price: Number(raw?.price ?? price ?? 0),
      image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
      image_url: raw?.image_url ?? undefined,
      category: raw?.category ?? raw?.category?.name ?? undefined,
    } as Product;
  }

  async function apiDeleteProduct(id: string | number) {
    const res = await api.delete(`/admin/products/delete/${id}`);
    return res.status >= 200 && res.status < 300;
  }

  // Admin modal helpers (unchanged)
  function openAdminCreate() {
    setAdminEditProduct(null);
    setAdminName("");
    setAdminPrice("");
    setAdminImageFile(null);
    setAdminPreview("");
    setAdminModalOpen(true);
  }

  function openAdminEdit(p: Product) {
    setAdminEditProduct(p);
    setAdminName(p.name ?? "");
    setAdminPrice(String(p.price ?? ""));
    setAdminImageFile(null);
    setAdminPreview(p.image_url ?? p.image ?? "");
    setAdminModalOpen(true);
  }

  function onAdminImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setAdminImageFile(f);
    const r = new FileReader();
    r.onload = () => setAdminPreview(String(r.result ?? ""));
    r.readAsDataURL(f);
  }

  async function submitAdminForm(e?: React.FormEvent) {
    e?.preventDefault();
    const name = adminName.trim();
    const price = Number(adminPrice || 0);
    if (!name) {
      toast.error("Name required");
      return;
    }
    if (Number.isNaN(price)) {
      toast.error("Price invalid");
      return;
    }
    try {
      if (adminEditProduct) {
        const optimistic = products.map((p) => (String(p.id) === String(adminEditProduct.id) ? { ...p, name, price, image: adminPreview || p.image, image_url: adminPreview || p.image_url } : p));
        setProducts(optimistic);
        setAdminModalOpen(false);
        const updated = await apiUpdateProduct(adminEditProduct.id, name, price, adminImageFile);
        setProducts((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
        toast.success("Product updated");
      } else {
        const tmpId = `tmp-${Date.now()}`;
        const optimistic: Product = { id: tmpId, name, price, image: adminPreview || undefined, image_url: adminPreview || undefined };
        setProducts((prev) => [optimistic, ...prev]);
        setAdminModalOpen(false);
        const created = await apiCreateProduct(name, price, adminImageFile);
        setProducts((prev) => [created, ...prev.filter((p) => p.id !== tmpId)]);
        toast.success("Product created");
      }
    } catch (err: any) {
      console.error("Save product failed", err);
      toast.error(err?.message || "Save failed");
      try { await refreshProducts(); } catch {}
    } finally {
      setAdminImageFile(null);
      setAdminPreview("");
    }
  }

  function requestDelete(id: string | number, name?: string) {
    setDeleteTarget({ id, name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const id = deleteTarget.id;
    const prev = products;
    setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
    try {
      await apiDeleteProduct(id);
      toast.success("Product deleted");
    } catch (err: any) {
      console.error("Delete failed", err);
      toast.error(err?.message || "Delete failed");
      setProducts(prev);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  // Refresh products using axios
  async function refreshProducts() {
    setLoadingProducts(true);
    try {
      const res = await api.get("/admin/products/show");
      const body = res.data;
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else rows = [];
      if (rows.length) {
        const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
        setProducts(normalized);
        toast.success("Products refreshed");
      } else {
        toast("No products returned");
      }
    } catch (err) {
      console.error("Refresh failed", err);
      toast.error("Refresh failed");
    } finally {
      setLoadingProducts(false);
    }
  }

  // utility: fallback image generation
  const fallbackFor = (p: Product) => {
    const seed = encodeURIComponent(p.category || p.name.split(" ")[0] || "product");
    return `https://source.unsplash.com/featured/400x400/?${seed}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Point of Sale</h1>
        </div>
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search products, SKU or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full border w-[360px] focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            onClick={() => setCartOpen((s) => !s)}
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            title="Open cart"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold bg-white text-indigo-600 rounded-full">
              {itemsCount}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium">Products</div>

          {/* Pagination controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); }}
                className="rounded-md border px-2 py-1"
              >
                {[4, 8, 12, 24].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 rounded bg-white border disabled:opacity-50"
                aria-label="Previous page"
              >
                Prev
              </button>

              <div className="flex items-center gap-1">{renderPageButtons()}</div>

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 rounded bg-white border disabled:opacity-50"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3 text-sm text-slate-600">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems || 0)}</span> to{" "}
          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loadingProducts
            ? Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={i} className="animate-pulse p-3 border rounded-lg">
                  <div className="w-full h-40 bg-slate-200 rounded mb-3" />
                  <div className="h-4 bg-slate-200 w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 w-1/2" />
                </div>
              ))
            : pageData.length === 0
            ? (
              <div className="col-span-full py-8 text-center text-slate-500">
                No products found.
              </div>
            )
            : pageData.map((p) => {
                const inCartQty = cartMap[String(p.id)] ?? 0;
                const imageSrc = p.image_url ?? p.image ?? fallbackFor(p);
                return (
                  <div key={p.id} className="p-3 border rounded-lg flex flex-col">
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-white flex items-center justify-center mb-3">
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackFor(p);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-md font-medium text-slate-800 mb-1 line-clamp-2">{p.name}</div>
                      <div className="text-sm text-slate-500 mb-2">{p.unit ?? p.sku ?? p.category}</div>
                      <div className="text-lg font-semibold text-slate-900 mb-3">₹ {p.price.toFixed(2)}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-auto">
                      {inCartQty === 0 ? (
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <button onClick={() => dec(p.id)} className="px-3 py-2 rounded border inline-flex items-center justify-center">
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="px-3 py-2 border rounded text-center w-full">{inCartQty}</div>
                          <button onClick={() => inc(p.id)} className="px-3 py-2 rounded border inline-flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Mobile pagination (bottom) */}
        <div className="mt-6 flex items-center justify-between sm:hidden">
          <div className="text-sm text-slate-600">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded bg-white border disabled:opacity-50">Prev</button>
            <button onClick={() => changePage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded bg-white border disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Cart drawer */}
      <div className={`fixed inset-0 z-50 ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!cartOpen}>
        <div onClick={() => setCartOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute right-0 top-0 h-full w-full sm:w-[520px] md:w-[640px] lg:w-[720px] bg-white shadow-2xl transform transition-transform ${cartOpen ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-modal="true">
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold">Cart</h3>
                <div className="text-sm text-slate-500">{itemsCount} items</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCartOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {cartLines.length === 0 ? (
                <div className="h-full grid place-items-center text-slate-400">
                  <div className="text-center">
                    <div className="w-28 h-28 rounded-full bg-slate-100 grid place-items-center mb-4">
                      <ShoppingCart />
                    </div>
                    <div>No items in cart</div>
                    <div className="text-sm text-slate-400">Add items from the product list</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartLines.map((ln) => (
                    <div key={String(ln.product.id)} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-slate-50">
                        <img
                          src={ln.product.image_url ?? ln.product.image ?? fallbackFor(ln.product)}
                          alt={ln.product.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackFor(ln.product);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-slate-800">{ln.product.name}</div>
                            <div className="text-sm text-slate-500">{ln.product.unit ?? ln.product.sku}</div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">₹ {(ln.product.price * ln.qty).toFixed(2)}</div>
                            <div className="text-xs text-slate-500">₹ {ln.product.price.toFixed(2)} x {ln.qty}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button onClick={() => dec(ln.product.id)} className="px-2 py-1 border rounded"><Minus /></button>
                          <div className="px-3 py-1 border rounded">{ln.qty}</div>
                          <button onClick={() => inc(ln.product.id)} className="px-2 py-1 border rounded"><Plus /></button>
                          <button onClick={() => removeLine(ln.product.id)} className="ml-auto px-3 py-1 rounded border text-sm inline-flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-sm text-slate-600">Subtotal</div>
                <div className="text-right font-medium">₹ {subTotal.toFixed(2)}</div>

                <div className="text-sm text-slate-600">GST ({gstPercent}%)</div>
                <div className="text-right font-medium">₹ {gstAmount.toFixed(2)}</div>

                <div className="text-sm text-slate-600">Discount</div>
                <div className="text-right font-medium">- ₹ {discountAmount.toFixed(2)}</div>
              </div>

              {/* Discount controls + GST below them */}
              <div className="flex items-center gap-2 mb-3">
                <select value={discount.type} onChange={(e) => setDiscount((d) => ({ ...d, type: e.target.value as "fixed" | "percent" }))} className="p-2 border rounded bg-slate-50">
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percent</option>
                </select>
                <input type="number" min={0} value={discount.value} onChange={(e) => setDiscount((d) => ({ ...d, value: Number(e.target.value || 0) }))} className="p-2 border rounded w-36" placeholder={discount.type === "fixed" ? "₹ amount" : "%"} />
                <div className="ml-auto text-sm text-slate-600">Adjust discount</div>
              </div>

              {/* GST dropdown moved here (below discount controls) */}
              <div className="mb-4 flex items-center gap-2">
                <div className="text-sm text-slate-600">GST %</div>
                <select value={gstPercent} onChange={(e) => setGstPercent(Number(e.target.value))} className="p-2 border rounded bg-slate-50">
                  <option value={0}>0</option>
                  <option value={0.25}>0.25</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={28}>28</option>
                </select>
                <div className="ml-auto text-sm text-slate-500">Tax applied to subtotal</div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-medium">Total</div>
                <div className="text-2xl font-extrabold">₹ {total.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Customer name</label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Phone number</label>
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="10+ digits" className="w-full p-2 border rounded" inputMode="tel" />
                </div>
              </div>
               <div>
                  <label className="text text-slate-500 block">Payment</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const val = e.target.value as PaymentMethod;
                      if (val === "card" || val === "upi" || val === "cash" || val === "") {
                        setPaymentMethod(val);
                      } else {
                        setPaymentMethod("");
                      }
                    }}
                    className="p-2 border rounded bg-white"
                    aria-label="Select payment method"
                  >
                    <option value="">Select payment</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              <div className="flex gap-3">
                <button
                  onClick={() => void handleCheckout()}
                  disabled={
                    isCheckingOut ||
                    cartLines.length === 0 ||
                    !validName(customerName) ||
                    !validPhone(customerPhone) ||
                    !paymentMethod
                  }
                  className="ml-auto px-6 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isCheckingOut ? "Processing…" : `Purchase ₹ ${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Admin modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAdminModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{adminEditProduct ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setAdminModalOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
            </div>

            <form onSubmit={submitAdminForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input value={adminPrice} onChange={(e) => setAdminPrice(e.target.value)} className="w-full p-2 border rounded" type="number" step="0.01" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={onAdminImageChange} className="w-full text-sm" />
                {adminPreview && <div className="mt-2 w-full h-40 rounded overflow-hidden"><img src={adminPreview} alt="preview" className="w-full h-full object-cover" /></div>}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setAdminModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">{adminEditProduct ? "Save" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5 z-10">
            <h3 className="text-lg font-medium">Confirm deletion</h3>
            <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete <strong>{deleteTarget.name ?? "this product"}</strong>? This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Yes, delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


