// src/components/products/Products.tsx
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Product = {
  id: number;
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

const API_BASE = "http://localhost:4000/api";

const imageUrls = [
   "https://www.freepnglogos.com/uploads/visa-card-logo-9.png", // Visa logo
  "https://picsum.photos/seed/mobile-phone-1/600/400",         // Modern smartphone
  "https://picsum.photos/seed/laptop-1/600/400",               // Laptop
  "https://picsum.photos/seed/tech-1/600/400",                 // Tech setup
  "https://picsum.photos/seed/computer-1/600/400",             // Desktop computer
  "https://picsum.photos/seed/device-1/600/400"             
];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // drawer state
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // form state
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

  // submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nextId = useRef(initialProducts.length + 1);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // mount/unmount drawer so exit animation can run
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

  // keyboard handling + focus trap
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

  // --------- Fetch initial products from API ----------
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) {
        console.error("Failed to fetch products:", res.status);
        toast.error("Failed to load products from server");
        return;
      }
      const body = await res.json();
      if (body && Array.isArray(body.data)) {
        setProducts(body.data);
        const maxId = body.data.reduce((m: number, p: Product) => Math.max(m, p.id || 0), 0);
        nextId.current = Math.max(nextId.current, maxId + 1);
      }
    } catch (err) {
      console.error("Network error fetching products:", err);
      toast.error("Network error while loading products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
  };

  // Unified submit: validates, posts, updates UI
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // client validation
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    // Build payload
    const payload = {
      name: form.name.trim(),
      price: form.price.trim(),
      category: form.category.trim(),
      sku: form.sku?.trim() || undefined,
      stock: form.stock !== undefined ? Number(form.stock) : 0,
      image: form.image?.trim() || undefined,
      description: form.description?.trim() || undefined,
      active: !!form.active,
    };

    // LOG payload so you can inspect it in console
    console.log("Submitting payload:", payload);

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch (err) {
        body = null;
      }

      console.log("Response status:", res.status, "body:", body);

      if (!res.ok) {
        // If server sent field errors `{ errors: { field: msg } }`
        if (body && body.errors && typeof body.errors === "object") {
          setErrors(body.errors);
          // show first message in toast if available
          const firstKey = Object.keys(body.errors)[0];
          if (firstKey) {
            const msg = (body.errors as Record<string, string>)[firstKey];
            if (msg) toast.error(msg);
          } else {
            toast.error("Validation error from server");
          }
        } else {
          const msg = (body && body.message) || `Server error (${res.status})`;
          toast.error(msg);
          console.error("Server error creating product:", body || res.status);
        }
        return;
      }

      // On success expect server created product in body.data
      if (body && body.data) {
        setProducts((p) => [body.data, ...p]);
        // sync nextId
        if (body.data.id) nextId.current = Math.max(nextId.current, body.data.id + 1);
        toast.success("Product added");
      } else {
        // Fallback: create optimistic local product if server didn't return product
        const localProduct: Product = {
          id: nextId.current++,
          name: payload.name,
          price: payload.price,
          category: payload.category,
          sku: payload.sku,
          stock: payload.stock,
          description: payload.description,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
          active: payload.active,
        };
        setProducts((p) => [localProduct, ...p]);
        toast.success("Product added (local)");
        console.warn("API returned unexpected response; added optimistic local product");
      }

      resetForm();
      setIsOpen(false);
    } catch (err) {
      console.error("Network error creating product:", err);
      toast.error("Network error while creating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  return (
    <>
      {/* Toaster: keep in this component if not mounted globally */}
      <Toaster position="top-right" />

      <div className="space-y-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>

          {/* IMPORTANT: this button only opens the drawer (DO NOT call submit here) */}
          <Button
            ref={addBtnRef}
            className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full p-6 text-center text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full p-6 text-center text-muted-foreground">No products yet.</div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-shadow transform hover:-translate-y-1">
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

                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Drawer */}
        {isMounted && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Add product drawer">
            {/* overlay (blur + dim) */}
            <div
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* right drawer panel */}
            <aside
              ref={drawerRef}
              className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out
                md:w-96 w-full
              `}
              style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              {/* header */}
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">Add Product</h3>
                  <p className="text-sm text-muted-foreground">Fill in the details to add a new product</p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
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

                {/* form submit now calls handleSubmit */}
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
                        placeholder="e.g. $99"
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
                        placeholder="e.g. Software"
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
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <input
                        aria-label="Image URL"
                        className="block w-full border rounded-md p-2 focus:outline-none focus:ring border-muted"
                        value={form.image}
                        onChange={(e) => handleChange("image", e.target.value)}
                        placeholder="Optional image URL"
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
                      <Button variant="ghost" onClick={() => { resetForm(); setIsOpen(false); }}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-chart-primary hover:bg-chart-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Product"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
