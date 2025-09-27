
// import React, { useEffect, useMemo, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../../src/api/axios";

// type PurchaseItem = {
//   sku: string;
//   name: string;
//   qty: number;
//   unitPrice: number;
// };

// type Purchase = {
//   id: string;
//   invoiceNo: string;
//   rawDate: string | null;
//   displayDate: string;
//   customer: string;
//   phone: string;
//   items: PurchaseItem[];
//   paymentMethod: string;
//   subtotal?: number;
//   discount_value?: number;
//   gst_amount?: number;
//   total: number;
// };

// function formatCurrency(n: number) {
//   return `₹ ${n.toFixed(2)}`;
// }

// /** Map single API order -> Purchase */
// function mapApiOrder(order: any): Purchase {
//   const rawDate = order.order_time ?? order.created_at ?? order.date ?? null;
//   const displayDate =
//     order.order_time_formatted ?? (rawDate ? new Date(rawDate).toLocaleString() : "");

//   const items: PurchaseItem[] = Array.isArray(order.items)
//     ? order.items.map((it: any) => ({
//         sku: String(it.product_id ?? it.sku ?? ""),
//         name: String(it.name ?? it.title ?? "Item"),
//         qty: Number(it.qty ?? it.quantity ?? 1),
//         unitPrice: Number(it.price ?? it.unit_price ?? 0),
//       }))
//     : [];

//   const subtotal =
//     typeof order.subtotal === "string"
//       ? Number(order.subtotal)
//       : typeof order.subtotal === "number"
//       ? order.subtotal
//       : undefined;
//   const discount_value =
//     typeof order.discount_value === "string"
//       ? Number(order.discount_value)
//       : typeof order.discount_value === "number"
//       ? order.discount_value
//       : undefined;
//   const gst_amount =
//     typeof order.gst_amount === "string"
//       ? Number(order.gst_amount)
//       : typeof order.gst_amount === "number"
//       ? order.gst_amount
//       : undefined;
//   const total =
//     typeof order.total === "string"
//       ? Number(order.total)
//       : typeof order.total === "number"
//       ? order.total
//       : items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

//   return {
//     id: String(order.id ?? order.order_id ?? ""),
//     invoiceNo: String(order.id ?? order.order_id ?? ""),
//     rawDate,
//     displayDate,
//     customer: String(order.customer_name ?? order.customer ?? "Walk-in"),
//     phone: String(order.customer_phone ?? order.phone ?? "-"),
//     items,
//     paymentMethod: String(order.payment ?? order.payment_method ?? "-"),
//     subtotal,
//     discount_value,
//     gst_amount,
//     total,
//   };
// }

// export default function POSPurchases(): JSX.Element {
//   const [from, setFrom] = useState<string>("");
//   const [to, setTo] = useState<string>("");
//   const [q, setQ] = useState<string>(""); 
//   const [drawerPurchase, setDrawerPurchase] = useState<Purchase | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true); 
//   const [purchases, setPurchases] = useState<Purchase[]>([]);

//   // If backend returns totals object, store it
//   const [backendTotals, setBackendTotals] = useState<{
//     subtotal?: number;
//     discount?: number;
//     gst?: number;
//     grand_total?: number;
//     transactions?: number;
//   } | null>(null);

//   // Load purchases
//   async function loadPurchases(params?: { q?: string; from?: string; to?: string }) {
//     if (!initialLoading) setLoading(true);
//     try {
//       const queryParams: Record<string, string> = {};
//       if (params?.q) queryParams.search = params.q; // backend expects `search`
//       if (params?.from) queryParams.from = params.from;
//       if (params?.to) queryParams.to = params.to;

//       const res = await api.get("/admin/pos-orders/orders", { params: queryParams });
//       const body = res.data;
//       setBackendTotals(body?.totals ?? null);
//       const mapped: Purchase[] = [];
//       if (Array.isArray(body?.data)) {
//         mapped.push(...body.data.map(mapApiOrder));
//       } else if (Array.isArray(body?.orders)) {
//         mapped.push(...body.orders.map(mapApiOrder));
//       } else if (Array.isArray(body)) {
//         mapped.push(...body.map(mapApiOrder));
//       } else if (body?.order) {
//         mapped.push(mapApiOrder(body.order));
//       } else {
//         const maybe = mapApiOrder(body);
//         if (maybe && (maybe.id || maybe.customer)) mapped.push(maybe);
//       }

//       mapped.sort((a, b) => {
//         const aTs = a.rawDate ? new Date(a.rawDate).getTime() : new Date(a.displayDate).getTime();
//         const bTs = b.rawDate ? new Date(b.rawDate).getTime() : new Date(b.displayDate).getTime();
//         return bTs - aTs;
//       });

//       setPurchases(mapped);
//     } catch (err: any) {
//       console.error("loadPurchases error:", err);
//       toast.error("Failed to fetch purchases from API");
//       setPurchases([]);
//       setBackendTotals(null);
//     } finally {
//       setLoading(false);
//       setInitialLoading(false);
//     }
//   }

//   // initial load
//   useEffect(() => {
//     void loadPurchases();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // when user changes FROM/TO we immediately call API
//   function onChangeFrom(v: string) {
//     setFrom(v);
//     void loadPurchases({ q: q || undefined, from: v || undefined, to: to || undefined });
//   }
//   function onChangeTo(v: string) {
//     setTo(v);
//     void loadPurchases({ q: q || undefined, from: from || undefined, to: v || undefined });
//   }

//   // client-side safety filter
//   const visible = useMemo(() => {
//     const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
//     const toTs = to ? new Date(to + "T23:59:59").getTime() : null;
//     const qq = q.trim().toLowerCase();

//     return purchases.filter((p) => {
//       const dateToCheck = p.rawDate ? new Date(p.rawDate).getTime() : (p.displayDate ? new Date(p.displayDate).getTime() : NaN);
//       if (fromTs != null && !isNaN(dateToCheck) && dateToCheck < fromTs) return false;
//       if (toTs != null && !isNaN(dateToCheck) && dateToCheck > toTs) return false;
//       if (!qq) return true;
//       if ((p.id || "").toLowerCase().includes(qq)) return true;
//       if ((p.customer || "").toLowerCase().includes(qq)) return true;
//       if ((p.phone || "").toLowerCase().includes(qq)) return true;
//       if ((p.paymentMethod || "").toLowerCase().includes(qq)) return true;
//       if (p.items.some((it) => `${it.name} ${it.sku}`.toLowerCase().includes(qq))) return true;
//       return false;
//     });
//   }, [from, to, q, purchases]);

//   // totals
//   const totals = useMemo(() => {
//     if (backendTotals) {
//       return {
//         subtotal: Number(backendTotals.subtotal ?? 0),
//         discount: Number(backendTotals.discount ?? 0),
//         gst: Number(backendTotals.gst ?? 0),
//         grand: Number(backendTotals.grand_total ?? backendTotals.grand_total ?? 0),
//         transactions: Number(backendTotals.transactions ?? visible.length),
//       };
//     }

//     let subtotalSum = 0;
//     let discountSum = 0;
//     let gstSum = 0;
//     let grandSum = 0;

//     for (const p of visible) {
//       const pSubtotal = typeof p.subtotal === "number"
//         ? p.subtotal
//         : p.items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
//       subtotalSum += pSubtotal;
//       discountSum += p.discount_value ?? 0;
//       gstSum += p.gst_amount ?? 0;
//       grandSum += p.total ?? 0;
//     }

//     const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
//     return {
//       subtotal: round(subtotalSum),
//       discount: round(discountSum),
//       gst: round(gstSum),
//       grand: round(grandSum),
//       transactions: visible.length,
//     };
//   }, [visible, backendTotals]);

//   // search triggers server-side
//   async function handleSearch() {
//     await loadPurchases({ q: q || undefined, from: from || undefined, to: to || undefined });
//   }

//   function handleReset() {
//     setFrom("");
//     setTo("");
//     setQ("");
//     void loadPurchases();
//   }

//   function exportCsv() {
//     if (!visible.length) {
//       toast.error("No purchases to export");
//       return;
//     }
//     const rows: string[][] = [
//       ["Invoice", "Date", "Customer", "Phone", "Payment", "Item SKU", "Item Name", "Qty", "Unit Price", "Line Total", "Order Subtotal", "Order Discount", "Order GST", "Order Total"]
//     ];
//     visible.forEach((p) => {
//       p.items.forEach((it) => {
//         rows.push([
//           `INV-${p.id}`,
//           p.displayDate,
//           p.customer,
//           p.phone,
//           p.paymentMethod,
//           it.sku,
//           it.name,
//           String(it.qty),
//           String(it.unitPrice.toFixed(2)),
//           String((it.unitPrice * it.qty).toFixed(2)),
//           p.subtotal != null ? String(Number(p.subtotal).toFixed(2)) : "",
//           p.discount_value != null ? String(Number(p.discount_value).toFixed(2)) : "",
//           p.gst_amount != null ? String(Number(p.gst_amount).toFixed(2)) : "",
//           p.total != null ? String(Number(p.total).toFixed(2)) : "",
//         ]);
//       });
//     });
//     const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `purchases_${from || "all"}_${to || "all"}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success("CSV exported");
//   }

//   // Skeleton row for table
//   const TableSkeletonRow = ({ keyIndex = 0 }: { keyIndex?: number }) => (
//     <tr key={"skeleton-" + keyIndex} className="border-b">
//       <td className="p-3"><div className="h-4 w-4 bg-slate-200 rounded animate-pulse" /></td>
//       <td className="p-3"><div className="h-4 w-28 bg-slate-200 rounded animate-pulse" /></td>
//       <td className="p-3"><div className="h-4 w-36 bg-slate-200 rounded animate-pulse" /></td>
//       <td className="p-3"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
//       <td className="p-3"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
//       <td className="p-3"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></td>
//       <td className="p-3"><div className="h-4 w-56 bg-slate-200 rounded animate-pulse" /></td>
//       <td className="p-3 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto animate-pulse" /></td>
//     </tr>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <Toaster position="top-right" />

//       {/* Header + filters */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-xl font-bold text-slate-900">POS- Purchases / Transactions</h1>
//         </div>
//         <div className="flex gap-2 w-full md:w-auto items-center">
//           <div className="flex items-center gap-2">
//             <label className="text-sm text-slate-600">From</label>
//             <input type="date" value={from} onChange={(e) => onChangeFrom(e.target.value)} className="p-2 border rounded" />
//           </div>
//           <div className="flex items-center gap-2">
//             <label className="text-sm text-slate-600">To</label>
//             <input type="date" value={to} onChange={(e) => onChangeTo(e.target.value)} className="p-2 border rounded" />
//           </div>
//           <input
//             placeholder="Search invoice / customer / item..."
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             className="p-2 border rounded w-80"
//           />
//           <button onClick={handleSearch} className="px-4 py-2 rounded bg-indigo-600 text-white">Search</button>
//           <button onClick={handleReset} className="px-3 py-2 rounded border">Reset</button>
//           <button onClick={exportCsv} className="ml-4 px-2 py-2 rounded bg-emerald-600 text-white">Export<span>CSV</span></button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
//         <table className="w-full table-auto min-w-[900px]">
//           <thead className="bg-slate-50">
//             <tr>
//               <th className="p-3 text-left">Sno</th>
//               <th className="p-3 text-left">Invoice</th>
//               <th className="p-3 text-left">Date</th>
//               <th className="p3 text-left">Customer</th>
//               <th className="p-3 text-left">Phone</th>
//               <th className="p-3 text-left">Payment</th>
//               <th className="p-3 text-left">Items</th>
//               <th className="p-3 text-right">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading && initialLoading === false && (
//               <>
//                 <TableSkeletonRow keyIndex={1} />
//                 <TableSkeletonRow keyIndex={2} />
//                 <TableSkeletonRow keyIndex={3} />
//               </>
//             )}
//             {!loading && visible.map((p, idx) => (
//               <tr key={p.id + "-" + idx} className="border-b hover:bg-slate-50 cursor-pointer">
//                 <td className="p-3">{idx + 1}</td>
//                 <td className="p-3"><div className="font-medium">{p.id}</div></td>
//                 <td className="p-3">{p.displayDate}</td>
//                 <td className="p-3">{p.customer}</td>
//                 <td className="p-3">{p.phone}</td>
//                 <td className="p-3">{p.paymentMethod}</td>
//                 <td className="p-3">
//                   <div className="space-y-1 text-sm">
//                     {p.items.map((it) => (
//                       <div key={it.sku} className="flex items-center gap-3">
//                         <div className="font-medium">{it.name}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </td>
//                 <td className="p-3 text-right font-semibold">{formatCurrency(p.total)}</td>
//               </tr>
//             ))}
//             {!loading && !visible.length && (
//               <tr>
//                 <td colSpan={8} className="p-6 text-center text-slate-500">No purchases found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>

//         {/* Totals block (added as requested) */}
//         <div className="p-6 border-t bg-white">
//           <div className="max-w-[900px] ml-auto">
//             <div className="w-1/3 ml-auto">
//               <div className="flex justify-between py-1 text-sm">
//                 <div className="text-sm text-slate-600">Subtotal</div>
//                 <div className="font-medium">{formatCurrency(totals.subtotal)}</div>
//               </div>

//               <div className="flex justify-between py-1 text-sm">
//                 <div className="text-sm text-slate-600">Total Discount</div>
//                 <div className="font-medium">-{formatCurrency(totals.discount)}</div>
//               </div>

//               <div className="flex justify-between py-1 text-sm">
//                 <div className="text-sm text-slate-600">Total GST</div>
//                 <div className="font-medium">{formatCurrency(totals.gst)}</div>
//               </div>

//               <div className="flex justify-between pt-4 border-t text-lg font-bold">
//                 <div>Grand Total</div>
//                 <div>{formatCurrency(totals.grand)}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }



import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../src/api/axios";

type PurchaseItem = {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
};

type Purchase = {
  id: string;
  invoiceNo: string;
  rawDate: string | null;
  displayDate: string;
  customer: string;
  phone: string;
  items: PurchaseItem[];
  paymentMethod: string;
  subtotal?: number;
  discount_value?: number;
  gst_amount?: number;
  total: number;
};

function formatCurrency(n: number) {
  return `₹ ${n.toFixed(2)}`;
}

/** Map single API order -> Purchase */
function mapApiOrder(order: any): Purchase {
  const rawDate = order.order_time ?? order.created_at ?? order.date ?? null;
  const displayDate =
    order.order_time_formatted ?? (rawDate ? new Date(rawDate).toLocaleString() : "");

  const items: PurchaseItem[] = Array.isArray(order.items)
    ? order.items.map((it: any) => ({
        sku: String(it.product_id ?? it.sku ?? ""),
        name: String(it.name ?? it.title ?? "Item"),
        qty: Number(it.qty ?? it.quantity ?? 1),
        unitPrice: Number(it.price ?? it.unit_price ?? 0),
      }))
    : [];

  const subtotal =
    typeof order.subtotal === "string"
      ? Number(order.subtotal)
      : typeof order.subtotal === "number"
      ? order.subtotal
      : undefined;
  const discount_value =
    typeof order.discount_value === "string"
      ? Number(order.discount_value)
      : typeof order.discount_value === "number"
      ? order.discount_value
      : undefined;
  const gst_amount =
    typeof order.gst_amount === "string"
      ? Number(order.gst_amount)
      : typeof order.gst_amount === "number"
      ? order.gst_amount
      : undefined;
  const total =
    typeof order.total === "string"
      ? Number(order.total)
      : typeof order.total === "number"
      ? order.total
      : items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  return {
    id: String(order.id ?? order.order_id ?? ""),
    invoiceNo: String(order.id ?? order.order_id ?? ""),
    rawDate,
    displayDate,
    customer: String(order.customer_name ?? order.customer ?? "Walk-in"),
    phone: String(order.customer_phone ?? order.phone ?? "-"),
    items,
    paymentMethod: String(order.payment ?? order.payment_method ?? "-"),
    subtotal,
    discount_value,
    gst_amount,
    total,
  };
}

export default function POSPurchases(): JSX.Element {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [q, setQ] = useState<string>(""); 
  const [drawerPurchase, setDrawerPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); 
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // If backend returns totals object, store it
  const [backendTotals, setBackendTotals] = useState<{
    subtotal?: number;
    discount?: number;
    gst?: number;
    grand_total?: number;
    transactions?: number;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Load purchases
  async function loadPurchases(params?: { q?: string; from?: string; to?: string }) {
    if (!initialLoading) setLoading(true);
    try {
      const queryParams: Record<string, string> = {};
      if (params?.q) queryParams.search = params.q; // backend expects `search`
      if (params?.from) queryParams.from = params.from;
      if (params?.to) queryParams.to = params.to;

      const res = await api.get("/admin/pos-orders/orders", { params: queryParams });
      const body = res.data;
      setBackendTotals(body?.totals ?? null);
      const mapped: Purchase[] = [];
      if (Array.isArray(body?.data)) {
        mapped.push(...body.data.map(mapApiOrder));
      } else if (Array.isArray(body?.orders)) {
        mapped.push(...body.orders.map(mapApiOrder));
      } else if (Array.isArray(body)) {
        mapped.push(...body.map(mapApiOrder));
      } else if (body?.order) {
        mapped.push(mapApiOrder(body.order));
      } else {
        const maybe = mapApiOrder(body);
        if (maybe && (maybe.id || maybe.customer)) mapped.push(maybe);
      }

      mapped.sort((a, b) => {
        const aTs = a.rawDate ? new Date(a.rawDate).getTime() : new Date(a.displayDate).getTime();
        const bTs = b.rawDate ? new Date(b.rawDate).getTime() : new Date(b.displayDate).getTime();
        return bTs - aTs;
      });

      setPurchases(mapped);
    } catch (err: any) {
      console.error("loadPurchases error:", err);
      toast.error("Failed to fetch purchases from API");
      setPurchases([]);
      setBackendTotals(null);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    void loadPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when user changes FROM/TO we immediately call API
  function onChangeFrom(v: string) {
    setFrom(v);
    void loadPurchases({ q: q || undefined, from: v || undefined, to: to || undefined });
  }
  function onChangeTo(v: string) {
    setTo(v);
    void loadPurchases({ q: q || undefined, from: from || undefined, to: v || undefined });
  }

  // client-side safety filter
  const visible = useMemo(() => {
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;
    const qq = q.trim().toLowerCase();

    return purchases.filter((p) => {
      const dateToCheck = p.rawDate ? new Date(p.rawDate).getTime() : (p.displayDate ? new Date(p.displayDate).getTime() : NaN);
      if (fromTs != null && !isNaN(dateToCheck) && dateToCheck < fromTs) return false;
      if (toTs != null && !isNaN(dateToCheck) && dateToCheck > toTs) return false;
      if (!qq) return true;
      if ((p.id || "").toLowerCase().includes(qq)) return true;
      if ((p.customer || "").toLowerCase().includes(qq)) return true;
      if ((p.phone || "").toLowerCase().includes(qq)) return true;
      if ((p.paymentMethod || "").toLowerCase().includes(qq)) return true;
      if (p.items.some((it) => `${it.name} ${it.sku}`.toLowerCase().includes(qq))) return true;
      return false;
    });
  }, [from, to, q, purchases]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [from, to, q, purchases.length, itemsPerPage]);

  // Pagination derived values
  const totalItems = visible.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return visible.slice(start, end);
  }, [visible, currentPage, itemsPerPage]);

  const changePage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    // optional: scroll to top of table on page change
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

  // totals
  const totals = useMemo(() => {
    if (backendTotals) {
      return {
        subtotal: Number(backendTotals.subtotal ?? 0),
        discount: Number(backendTotals.discount ?? 0),
        gst: Number(backendTotals.gst ?? 0),
        grand: Number(backendTotals.grand_total ?? backendTotals.grand_total ?? 0),
        transactions: Number(backendTotals.transactions ?? visible.length),
      };
    }

    let subtotalSum = 0;
    let discountSum = 0;
    let gstSum = 0;
    let grandSum = 0;

    for (const p of visible) {
      const pSubtotal = typeof p.subtotal === "number"
        ? p.subtotal
        : p.items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      subtotalSum += pSubtotal;
      discountSum += p.discount_value ?? 0;
      gstSum += p.gst_amount ?? 0;
      grandSum += p.total ?? 0;
    }

    const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    return {
      subtotal: round(subtotalSum),
      discount: round(discountSum),
      gst: round(gstSum),
      grand: round(grandSum),
      transactions: visible.length,
    };
  }, [visible, backendTotals]);

  // search triggers server-side
  async function handleSearch() {
    await loadPurchases({ q: q || undefined, from: from || undefined, to: to || undefined });
  }

  function handleReset() {
    setFrom("");
    setTo("");
    setQ("");
    void loadPurchases();
  }

  function exportCsv() {
    if (!visible.length) {
      toast.error("No purchases to export");
      return;
    }
    const rows: string[][] = [
      ["Invoice", "Date", "Customer", "Phone", "Payment", "Item SKU", "Item Name", "Qty", "Unit Price", "Line Total", "Order Subtotal", "Order Discount", "Order GST", "Order Total"]
    ];
    visible.forEach((p) => {
      p.items.forEach((it) => {
        rows.push([
          `INV-${p.id}`,
          p.displayDate,
          p.customer,
          p.phone,
          p.paymentMethod,
          it.sku,
          it.name,
          String(it.qty),
          String(it.unitPrice.toFixed(2)),
          String((it.unitPrice * it.qty).toFixed(2)),
          p.subtotal != null ? String(Number(p.subtotal).toFixed(2)) : "",
          p.discount_value != null ? String(Number(p.discount_value).toFixed(2)) : "",
          p.gst_amount != null ? String(Number(p.gst_amount).toFixed(2)) : "",
          p.total != null ? String(Number(p.total).toFixed(2)) : "",
        ]);
      });
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchases_${from || "all"}_${to || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  // Skeleton row for table
  const TableSkeletonRow = ({ keyIndex = 0 }: { keyIndex?: number }) => (
    <tr key={"skeleton-" + keyIndex} className="border-b">
      <td className="p-3"><div className="h-4 w-4 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-3"><div className="h-4 w-28 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-3"><div className="h-4 w-36 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-3"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-3"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-3"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-3"><div className="h-4 w-56 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-3 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto animate-pulse" /></td>
    </tr>
  );

  // compute index range for "showing X to Y of Z" text
  const showingFrom = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      {/* Header + filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">POS - Purchases</h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">From</label>
            <input type="date" value={from} onChange={(e) => onChangeFrom(e.target.value)} className="p-2 border rounded" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">To</label>
            <input type="date" value={to} onChange={(e) => onChangeTo(e.target.value)} className="p-2 border rounded" />
          </div>

          <input
            placeholder="Search invoice / customer / item..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="p-2 border rounded w-64"
          />
          <button onClick={handleSearch} className="px-4 py-2 rounded bg-indigo-600 text-white">Search</button>
          <button onClick={handleReset} className="px-3 py-2 rounded border">Reset</button>
          <button onClick={exportCsv} className="ml-4 px-2 py-2 rounded bg-emerald-600 text-white">Export CSV</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {/* Top pagination controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">Show</div>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-2 border rounded"
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <div className="text-sm text-slate-500">rows</div>
          </div>

          <div className="flex items-center gap-2">
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

            {/* mobile simple pagination info */}
            <div className="sm:hidden text-sm text-slate-600">
              Page {currentPage} / {totalPages}
            </div>
          </div>
        </div>

        <table className="w-full table-auto min-w-[900px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Sno</th>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {initialLoading && loading && (
              <>
                <TableSkeletonRow keyIndex={1} />
                <TableSkeletonRow keyIndex={2} />
                <TableSkeletonRow keyIndex={3} />
              </>
            )}

            {!initialLoading && loading && (
              <>
                <TableSkeletonRow keyIndex={1} />
                <TableSkeletonRow keyIndex={2} />
                <TableSkeletonRow keyIndex={3} />
              </>
            )}

            {!loading && pageData.map((p, idx) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
              return (
                <tr key={p.id + "-" + idx} className="border-b hover:bg-slate-50 cursor-pointer">
                  <td className="p-3">{globalIndex}</td>
                  <td className="p-3"><div className="font-medium">{p.id}</div></td>
                  <td className="p-3">{p.displayDate}</td>
                  <td className="p-3">{p.customer}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">{p.paymentMethod}</td>
                  <td className="p-3">
                    <div className="space-y-1 text-sm">
                      {p.items.map((it) => (
                        <div key={it.sku} className="flex items-center gap-3">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-slate-500">×{it.qty}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(p.total)}</td>
                </tr>
              );
            })}

            {!loading && !pageData.length && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">No purchases found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bottom bar: showing X - Y of Z and mobile pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-t">
          <div className="text-sm text-slate-600">
            Showing <span className="font-medium">{showingFrom}</span> to <span className="font-medium">{showingTo}</span> of <span className="font-medium">{totalItems}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded bg-white border disabled:opacity-50">Prev</button>
              <div className="flex items-center gap-1">{renderPageButtons()}</div>
              <button onClick={() => changePage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded bg-white border disabled:opacity-50">Next</button>
            </div>

            <div className="sm:hidden flex items-center gap-2">
              <button onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded bg-white border disabled:opacity-50">Prev</button>
              <div className="text-sm text-slate-600">Page {currentPage} / {totalPages}</div>
              <button onClick={() => changePage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded bg-white border disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {/* Totals block */}
        <div className="p-6 border-t bg-white">
          <div className="max-w-[900px] ml-auto">
            <div className="w-full sm:w-1/3 ml-auto">
              <div className="flex justify-between py-1 text-sm">
                <div className="text-sm text-slate-600">Subtotal</div>
                <div className="font-medium">{formatCurrency(totals.subtotal)}</div>
              </div>

              <div className="flex justify-between py-1 text-sm">
                <div className="text-sm text-slate-600">Total Discount</div>
                <div className="font-medium">-{formatCurrency(totals.discount)}</div>
              </div>

              <div className="flex justify-between py-1 text-sm">
                <div className="text-sm text-slate-600">Total GST</div>
                <div className="font-medium">{formatCurrency(totals.gst)}</div>
              </div>

              <div className="flex justify-between pt-4 border-t text-lg font-bold">
                <div>Grand Total</div>
                <div>{formatCurrency(totals.grand)}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
