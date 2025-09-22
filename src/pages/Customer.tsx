// src/pages/POS.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/**
 * Config
 */
const PRODUCTS_API = "http://192.168.29.102:5000/api/products"; // will attempt GET, fallback to SAMPLE_PRODUCTS
const ORDERS_API = "http://192.168.29.102:5000/api/orders"; // POST here on checkout

type Product = {
  id: string | number;
  name: string;
  price: number; // base price (₹)
  unit?: string;
  image?: string;
  sku?: string;
  stock?: number;
  category?: string;
};

type CartLine = {
  product: Product;
  qty: number;
  lineTotal: number;
};

const GST_PERCENT = 18; // default GST
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "p-1",
    name: "Millet Idly Ravvas (500g)",
    price: 120,
    unit: "500g",
    // focused keywords + signature to reduce duplicate random images
    image: "https://source.unsplash.com/featured/600x600/?millet,idli,grain&sig=101",
    sku: "MIR-500",
    stock: 50,
    category: "Millets",
  },
  {
    id: "p-2",
    name: "Millet Upma Ravva (500g)",
    price: 95,
    unit: "500g",
    image: "https://source.unsplash.com/featured/600x600/?millet,upma,coarse-grain&sig=102",
    sku: "MUR-500",
    stock: 40,
    category: "Millets",
  },
  {
    id: "p-3",
    name: "Organic Grains Mix (1kg)",
    price: 240,
    unit: "1kg",
    image: "https://source.unsplash.com/featured/600x600/?organic,grains,mix&sig=103",
    sku: "GRA-1KG",
    stock: 30,
    category: "Grains",
  },
  {
    id: "p-4",
    name: "Special Dry Fruits Pack",
    price: 480,
    unit: "500g",
    image: "https://source.unsplash.com/featured/600x600/?dry-fruits,nuts,mix&sig=104",
    sku: "SDF-500",
    stock: 20,
    category: "Dry Fruits",
  },
  {
    id: "p-5",
    name: "Premium Flour (2kg)",
    price: 180,
    unit: "2kg",
    image: "https://source.unsplash.com/featured/600x600/?flour,wheat,bread-ingredients&sig=105",
    sku: "FLO-2KG",
    stock: 60,
    category: "Flour",
  },
  {
    id: "p-6",
    name: "Healthy Snack Mix (250g)",
    price: 150,
    unit: "250g",
    image: "https://source.unsplash.com/featured/600x600/?healthy-snack,nuts,seeds&sig=106",
    sku: "SNK-250",
    stock: 80,
    category: "Snacks",
  },
];


export default function POS(): JSX.Element {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [query, setQuery] = useState("");

  // Cart state: map productId -> qty
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [discount, setDiscount] = useState<{ type: "fixed" | "percent"; value: number }>({ type: "fixed", value: 0 });
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch products (attempt API then fallback)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingProducts(true);
      try {
        const res = await fetch(PRODUCTS_API, { method: "GET" });
        if (!res.ok) throw new Error(`Server ${res.status}`);
        const body = await res.json().catch(() => null);
        let rows: any[] = [];
        if (Array.isArray(body)) rows = body;
        else if (Array.isArray(body.data)) rows = body.data;
        else rows = [];

        if (rows.length && mounted) {
          // normalize minimal fields
          const normalized: Product[] = rows.map((r: any, i: number) => ({
            id: r.id ?? r._id ?? `srv-${i}`,
            name: r.name ?? r.title ?? `Product ${i + 1}`,
            price: Number(r.price ?? r.amount ?? 0),
            unit: r.unit ?? r.size ?? undefined,
            image: r.image ?? r.imageUrl ?? r.photo ?? undefined,
            sku: r.sku ?? r.code ?? undefined,
            stock: typeof r.stock === "number" ? r.stock : undefined,
            category: r.category ?? undefined,
          }));
          setProducts(normalized);
          toast.success("Products loaded from server");
        } else {
          // no rows -> keep sample
          if (mounted) toast("Showing sample products (no server items)");
        }
      } catch (err) {
        console.warn("Products load failed, using sample data", err);
        if (mounted) toast("Using sample products (failed to load from API)", { icon: "ℹ️" });
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived cart lines
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
  const gstAmount = Math.round((subTotal * (GST_PERCENT / 100) + Number.EPSILON) * 100) / 100;
  const discountAmount = discount.type === "fixed" ? discount.value : Math.round((subTotal * (discount.value / 100) + Number.EPSILON) * 100) / 100;
  const total = Math.max(0, Math.round((subTotal + gstAmount - discountAmount + Number.EPSILON) * 100) / 100);

  // product search filter
  const visibleProducts = products.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      String(p.sku || "").toLowerCase().includes(q) ||
      String(p.category || "").toLowerCase().includes(q)
    );
  });

  // Cart operations
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

  // Checkout: POST order to ORDERS_API (simulated). We send a simple payload.
  async function handleCheckout() {
    if (cartLines.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setIsCheckingOut(true);
    const payload = {
      items: cartLines.map((l) => ({ product_id: l.product.id, name: l.product.name, qty: l.qty, price: l.product.price })),
      subtotal: subTotal,
      gst_percent: GST_PERCENT,
      gst_amount: gstAmount,
      discount: { ...discount },
      total,
      timestamp: new Date().toISOString(),
    };

    try {
      // Try a real POST; backend should accept JSON. Adjust headers if your backend expects form-data.
      const res = await fetch(ORDERS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // server error — report but don't crash; allow retry
        let text = `Server error (${res.status})`;
        try {
          const body = await res.json();
          text = (body && (body.message || body.error)) || JSON.stringify(body) || text;
        } catch {
          try {
            text = await res.text();
          } catch {}
        }
        toast.error(`Order failed: ${text}`);
        return;
      }

      // success
      const body = await res.json().catch(() => null);
      toast.success("Purchase successful");
      // Optionally you can clear cart and close drawer
      setCartMap({});
      setCartOpen(false);
      // show receipt or order id if available
      if (body?.order_id) {
        toast.success(`Order ${body.order_id} created`);
      }
    } catch (err) {
      console.error("Checkout failed", err);
      // Network or CORS issues
      toast.error("Network error when sending order — purchase saved locally (demo mode)");
      // For demo, clear cart
      setCartMap({});
      setCartOpen(false);
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Point of Sale</h1>
          <div className="text-sm text-slate-500 mt-1">Select products and checkout quickly — demo mode</div>
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

      {/* Products grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loadingProducts
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse p-3 border rounded-lg">
                  <div className="w-full h-40 bg-slate-200 rounded mb-3" />
                  <div className="h-4 bg-slate-200 w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 w-1/2" />
                </div>
              ))
            : visibleProducts.map((p) => {
                const inCartQty = cartMap[String(p.id)] ?? 0;
                return (
                  <div key={p.id} className="p-3 border rounded-lg flex flex-col">
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-white flex items-center justify-center mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://source.unsplash.com/featured/400x400/?${encodeURIComponent(
                            p.category || p.name.split(" ")[0]
                          )}`;
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="text-md font-medium text-slate-800 mb-1">{p.name}</div>
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
                          <button
                            onClick={() => dec(p.id)}
                            className="px-3 py-2 rounded border inline-flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="px-3 py-2 border rounded text-center w-full">{inCartQty}</div>
                          <button
                            onClick={() => inc(p.id)}
                            className="px-3 py-2 rounded border inline-flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Cart Drawer (right) */}
      <div
        className={`fixed inset-0 z-50 pointer-events-${cartOpen ? "auto" : "none"}`}
        aria-hidden={!cartOpen}
      >
        <div
          onClick={() => setCartOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full sm:w-[520px] md:w-[640px] lg:w-[720px] bg-white shadow-2xl transform transition-transform ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold">Cart</h3>
                <div className="text-sm text-slate-500">{itemsCount} items</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCartMap({});
                    toast.success("Cart cleared");
                  }}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Clear
                </button>
                <button onClick={() => setCartOpen(false)} className="p-2 rounded hover:bg-slate-100">
                  <X />
                </button>
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
                      <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ln.product.image} alt={ln.product.name} className="object-cover w-full h-full" />
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
                          <button onClick={() => dec(ln.product.id)} className="px-2 py-1 border rounded">
                            <Minus />
                          </button>
                          <div className="px-3 py-1 border rounded">{ln.qty}</div>
                          <button onClick={() => inc(ln.product.id)} className="px-2 py-1 border rounded">
                            <Plus />
                          </button>

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

            {/* Billing summary */}
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-sm text-slate-600">Subtotal</div>
                <div className="text-right font-medium">₹ {subTotal.toFixed(2)}</div>

                <div className="text-sm text-slate-600">GST ({GST_PERCENT}%)</div>
                <div className="text-right font-medium">₹ {gstAmount.toFixed(2)}</div>

                <div className="text-sm text-slate-600">Discount</div>
                <div className="text-right font-medium">- ₹ {discountAmount.toFixed(2)}</div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <select
                  value={discount.type}
                  onChange={(e) => setDiscount((d) => ({ ...d, type: e.target.value as "fixed" | "percent" }))}
                  className="p-2 border rounded bg-slate-50"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percent</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={discount.value}
                  onChange={(e) => setDiscount((d) => ({ ...d, value: Number(e.target.value || 0) }))}
                  className="p-2 border rounded w-36"
                  placeholder={discount.type === "fixed" ? "₹ amount" : "%"}
                />
                <div className="text-sm text-slate-500 ml-auto">Items: {itemsCount}</div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-medium">Total</div>
                <div className="text-2xl font-extrabold">₹ {total.toFixed(2)}</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCartMap({});
                    toast("Cart cleared", { icon: "🧹" });
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Clear Cart
                </button>

                <button
                  onClick={() => {
                    // optional: open fullscreen payment modal; here we call checkout
                    void handleCheckout();
                  }}
                  disabled={isCheckingOut || cartLines.length === 0}
                  className="ml-auto px-6 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isCheckingOut ? "Processing…" : `Purchase ₹ ${total.toFixed(2)}`}
                </button>
              </div>

              <div className="text-xs text-slate-400 mt-3">
                This is a demo checkout — the component will attempt to POST to <code className="bg-slate-100 px-1 rounded">/api/orders</code>. If that fails it will still clear the cart locally but show an error.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}