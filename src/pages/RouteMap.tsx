import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

type PurchaseItem = {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number; // price per unit before discount & tax
  discountPerUnit?: number; // discount amount per unit
  gstPercent?: number; // e.g. 5 or 18
};

type Purchase = {
  id: string;
  invoiceNo: string;
  date: string; // ISO date string
  customer?: string;
  items: PurchaseItem[];
  paymentMethod?: string;
  note?: string;
};

const SAMPLE_PURCHASES: Purchase[] = [
  {
    id: "T-1001",
    invoiceNo: "INV-1001",
    date: "2025-09-10T11:15:00.000Z",
    customer: "Retail - Walkin",
    paymentMethod: "Cash",
    items: [
      { sku: "MIR-500", name: "MILLET IDLY RAVVAS", qty: 2, unit: "500g", unitPrice: 120, discountPerUnit: 5, gstPercent: 5 },
      { sku: "GRA-1KG", name: "GRAINS", qty: 1, unit: "1kg", unitPrice: 240, gstPercent: 5 },
    ],
  },
  {
    id: "T-1002",
    invoiceNo: "INV-1002",
    date: "2025-09-10T14:40:00.000Z",
    customer: "Kirana - Sharma",
    paymentMethod: "UPI",
    items: [
      { sku: "MUR-500", name: "MILLET UPMA RAVVA", qty: 3, unit: "500g", unitPrice: 95, discountPerUnit: 0, gstPercent: 5 },
      { sku: "SNK-250", name: "Healthy Snack Mix", qty: 2, unit: "250g", unitPrice: 150, gstPercent: 12 },
    ],
  },
  {
    id: "T-1003",
    invoiceNo: "INV-1003",
    date: "2025-09-11T09:20:00.000Z",
    customer: "Retail - Walkin",
    paymentMethod: "Card",
    items: [
      { sku: "SDF-500", name: "SPECIAL DRY FRUITS", qty: 1, unit: "500g", unitPrice: 480, discountPerUnit: 20, gstPercent: 12 },
      { sku: "FLO-2KG", name: "FLOUR", qty: 2, unit: "2kg", unitPrice: 180, gstPercent: 5 },
    ],
  },
  {
    id: "T-1004",
    invoiceNo: "INV-1004",
    date: "2025-09-12T12:00:00.000Z",
    customer: "Wholesale - Annapurna",
    paymentMethod: "Credit",
    items: [
      { sku: "GRA-1KG", name: "GRAINS", qty: 10, unit: "1kg", unitPrice: 240, discountPerUnit: 10, gstPercent: 5 },
    ],
  },
  {
    id: "T-1005",
    invoiceNo: "INV-1005",
    date: "2025-09-12T16:45:00.000Z",
    customer: "Retail - Walkin",
    paymentMethod: "Cash",
    items: [
      { sku: "MIR-500", name: "MILLET IDLY RAVVAS", qty: 1, unit: "500g", unitPrice: 120, gstPercent: 5 },
      { sku: "FLO-2KG", name: "FLOUR", qty: 1, unit: "2kg", unitPrice: 180, discountPerUnit: 10, gstPercent: 5 },
    ],
  },
];

function formatCurrency(n: number) {
  return `₹ ${n.toFixed(2)}`;
}

export default function POSPurchases(): JSX.Element {
  // filters & UI
  const [from, setFrom] = useState<string>("2025-09-10");
  const [to, setTo] = useState<string>("2025-09-12");
  const [q, setQ] = useState<string>("");
  const [drawerPurchase, setDrawerPurchase] = useState<Purchase | null>(null);

  // filter purchases by date range and search
  const visible = useMemo(() => {
    const fromTs = new Date(from + "T00:00:00").getTime();
    const toTs = new Date(to + "T23:59:59").getTime();
    const qq = q.trim().toLowerCase();

    return SAMPLE_PURCHASES.filter((p) => {
      const t = new Date(p.date).getTime();
      if (isNaN(fromTs) || isNaN(toTs)) return true;
      if (t < fromTs || t > toTs) return false;
      if (!qq) return true;
      // search in invoice, customer, item names and skus
      if (p.invoiceNo.toLowerCase().includes(qq)) return true;
      if ((p.customer || "").toLowerCase().includes(qq)) return true;
      if ((p.paymentMethod || "").toLowerCase().includes(qq)) return true;
      if (p.items.some((it) => `${it.name} ${it.sku}`.toLowerCase().includes(qq))) return true;
      return false;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [from, to, q]);

  // compute totals for visible rows
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;
    let grandTotal = 0;

    for (const p of visible) {
      for (const it of p.items) {
        const priceBeforeDiscount = it.unitPrice * it.qty;
        const discount = (it.discountPerUnit || 0) * it.qty;
        const taxable = priceBeforeDiscount - discount;
        const gst = taxable * ((it.gstPercent || 0) / 100);
        const lineTotal = taxable + gst;

        subtotal += priceBeforeDiscount;
        totalDiscount += discount;
        totalGst += gst;
        grandTotal += lineTotal;
      }
    }

    return { subtotal, totalDiscount, totalGst, grandTotal };
  }, [visible]);

  function exportCsv() {
    if (!visible.length) {
      toast.error("No purchases to export");
      return;
    }
    const rows: string[][] = [
      [
        "S.No",
        "Invoice",
        "Date",
        "Customer",
        "Payment",
        "Item SKU",
        "Item Name",
        "Qty",
        "Unit",
        "Unit Price",
        "Discount/unit",
        "GST%",
        "Line Subtotal",
        "Line GST",
        "Line Total",
      ],
    ];
    visible.forEach((p, idx) => {
      p.items.forEach((it) => {
        const priceBeforeDiscount = it.unitPrice * it.qty;
        const discount = (it.discountPerUnit || 0) * it.qty;
        const taxable = priceBeforeDiscount - discount;
        const gst = taxable * ((it.gstPercent || 0) / 100);
        const lineTotal = taxable + gst;
        rows.push([
          String(idx + 1),
          p.invoiceNo,
          new Date(p.date).toLocaleString(),
          p.customer || "-",
          p.paymentMethod || "-",
          it.sku,
          it.name,
          String(it.qty),
          it.unit,
          String(it.unitPrice),
          String(it.discountPerUnit ?? 0),
          String(it.gstPercent ?? 0),
          (taxable).toFixed(2),
          gst.toFixed(2),
          lineTotal.toFixed(2),
        ]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchases_${from || "all"}_${to || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">POS — Purchases / Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">All purchases you made are listed below. Click any row to view full billing details.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={exportCsv} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="p-2 border rounded" />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="p-2 border rounded" />
        </div>

        <div className="flex-1">
          <input
            placeholder="Search invoice / customer / item..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold">{visible.length}</span> transactions
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full table-auto min-w-[900px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((p, idx) => {
              // compute purchase totals
              let purchaseTotal = 0;
              p.items.forEach((it) => {
                const priceBefore = it.unitPrice * it.qty;
                const discount = (it.discountPerUnit || 0) * it.qty;
                const taxable = priceBefore - discount;
                const gst = taxable * ((it.gstPercent || 0) / 100);
                purchaseTotal += taxable + gst;
              });
              return (
                <tr
                  key={p.id}
                  className="border-b hover:bg-slate-50 cursor-pointer"
                  onClick={() => setDrawerPurchase(p)}
                >
                  <td className="p-3 align-top w-12">{idx + 1}</td>
                  <td className="p-3 align-top">
                    <div className="font-medium">{p.invoiceNo}</div>
                    <div className="text-xs text-slate-400">{p.id}</div>
                  </td>
                  <td className="p-3 align-top">{new Date(p.date).toLocaleString()}</td>
                  <td className="p-3 align-top">{p.customer || "Walk-in"}</td>
                  <td className="p-3 align-top">{p.paymentMethod || "-"}</td>
                  <td className="p-3 align-top">
                    <div className="space-y-1 text-sm">
                      {p.items.map((it) => (
                        <div key={it.sku} className="flex items-center gap-3">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-slate-500">• {it.qty} × {it.unitPrice}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 align-top text-right font-semibold">{formatCurrency(purchaseTotal)}</td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="bg-slate-50">
              <td colSpan={6} className="p-3 text-right font-medium">Subtotal</td>
              <td className="p-3 text-right">{formatCurrency(totals.subtotal)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={6} className="p-3 text-right font-medium">Total Discount</td>
              <td className="p-3 text-right">-{formatCurrency(totals.totalDiscount)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={6} className="p-3 text-right font-medium">Total GST</td>
              <td className="p-3 text-right">{formatCurrency(totals.totalGst)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={6} className="p-3 text-right font-bold">Grand Total</td>
              <td className="p-3 text-right font-bold">{formatCurrency(totals.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Drawer: purchase details */}
      {drawerPurchase && (
        <div className="fixed inset-0 z-50 flex">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerPurchase(null)} />

          <aside className="ml-auto w-full sm:w-[560px] bg-white h-full shadow-2xl overflow-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Invoice: {drawerPurchase.invoiceNo}</h2>
                <div className="text-sm text-slate-500">{drawerPurchase.customer || "Walk-in"}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(drawerPurchase.date).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={() => setDrawerPurchase(null)} className="px-3 py-2 rounded bg-slate-100">Close</button>
              </div>
            </div>

            <div className="mb-4">
              <table className="w-full text-left table-auto">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Unit</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Discount</th>
                    <th className="p-2 text-right">GST</th>
                    <th className="p-2 text-right">Line Total</th>
                  </tr>
                </thead>

                <tbody>
                  {drawerPurchase.items.map((it) => {
                    const priceBefore = it.unitPrice * it.qty;
                    const discount = (it.discountPerUnit || 0) * it.qty;
                    const taxable = priceBefore - discount;
                    const gst = taxable * ((it.gstPercent || 0) / 100);
                    const lineTotal = taxable + gst;
                    return (
                      <tr key={it.sku} className="border-b">
                        <td className="p-2">{it.sku}</td>
                        <td className="p-2">{it.name}</td>
                        <td className="p-2 text-right">{it.qty}</td>
                        <td className="p-2 text-right">{it.unit}</td>
                        <td className="p-2 text-right">{formatCurrency(it.unitPrice)}</td>
                        <td className="p-2 text-right">-{formatCurrency(it.discountPerUnit ?? 0)}</td>
                        <td className="p-2 text-right">{it.gstPercent ?? 0}%</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* billing summary */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <div className="text-sm text-slate-600">Subtotal</div>
                <div className="font-medium">
                  {formatCurrency(
                    drawerPurchase.items.reduce((s, it) => s + it.unitPrice * it.qty, 0)
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="text-sm text-slate-600">Total Discount</div>
                <div className="font-medium">
                  -{formatCurrency(drawerPurchase.items.reduce((s, it) => s + (it.discountPerUnit || 0) * it.qty, 0))}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="text-sm text-slate-600">Total GST</div>
                <div className="font-medium">
                  {formatCurrency(
                    drawerPurchase.items.reduce((s, it) => {
                      const priceBefore = it.unitPrice * it.qty;
                      const discount = (it.discountPerUnit || 0) * it.qty;
                      const taxable = priceBefore - discount;
                      return s + taxable * ((it.gstPercent || 0) / 100);
                    }, 0)
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t text-lg font-bold">
                <div>Grand Total</div>
                <div>
                  {formatCurrency(
                    drawerPurchase.items.reduce((s, it) => {
                      const priceBefore = it.unitPrice * it.qty;
                      const discount = (it.discountPerUnit || 0) * it.qty;
                      const taxable = priceBefore - discount;
                      const gst = taxable * ((it.gstPercent || 0) / 100);
                      return s + taxable + gst;
                    }, 0)
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 rounded bg-indigo-600 text-white">Make Payment</button>
                <button className="px-4 py-2 rounded border">Print Invoice</button>
                <button className="px-4 py-2 rounded bg-rose-500 text-white">Refund</button>
              </div>
            </div>

            {drawerPurchase.note && (
              <div className="mt-6 text-sm text-slate-600">
                <strong>Note:</strong> {drawerPurchase.note}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
