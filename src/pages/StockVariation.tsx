// import React, { useMemo, useState } from "react";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
//   BarChart,
//   Bar,
// } from "recharts";

// // StockVariation
// // - responsive, self-contained React component
// // - shows stock levels over time (area chart) and per-category variation (bar chart)
// // - includes date range, category filter and a compact table for details
// // - Tailwind CSS classes for responsiveness

// type StockRecord = {
//   sku: string;
//   category: string;
//   date: string; // ISO date
//   stock: number;
// };

// const SAMPLE: StockRecord[] = [
//   { sku: "SKU-001", category: "Beverages", date: "2025-09-08", stock: 120 },
//   { sku: "SKU-001", category: "Beverages", date: "2025-09-09", stock: 110 },
//   { sku: "SKU-001", category: "Beverages", date: "2025-09-10", stock: 140 },
//   { sku: "SKU-002", category: "Snacks", date: "2025-09-08", stock: 80 },
//   { sku: "SKU-002", category: "Snacks", date: "2025-09-09", stock: 60 },
//   { sku: "SKU-002", category: "Snacks", date: "2025-09-10", stock: 70 },
//   { sku: "SKU-003", category: "Dairy", date: "2025-09-08", stock: 50 },
//   { sku: "SKU-003", category: "Dairy", date: "2025-09-09", stock: 40 },
//   { sku: "SKU-003", category: "Dairy", date: "2025-09-10", stock: 30 },
//   { sku: "SKU-004", category: "Household", date: "2025-09-10", stock: 200 },
// ];

// export default function StockVariation({ data }: { data?: StockRecord[] }) {
//   const [from, setFrom] = useState<string>("2025-09-08");
//   const [to, setTo] = useState<string>("2025-09-10");
//   const [category, setCategory] = useState<string>("All");

//   const input = data ?? SAMPLE;

//   // list of categories
//   const categories = useMemo(() => {
//     const s = new Set(input.map((r) => r.category));
//     return ["All", ...Array.from(s)];
//   }, [input]);

//   // Filter records by date range & category
//   const filtered = useMemo(() => {
//     const fromTs = new Date(from).getTime();
//     const toTs = new Date(to).getTime();
//     return input.filter((r) => {
//       const t = new Date(r.date).getTime();
//       if (isNaN(t)) return false;
//       if (t < fromTs || t > toTs) return false;
//       if (category !== "All" && r.category !== category) return false;
//       return true;
//     });
//   }, [input, from, to, category]);

//   // Prepare time-series aggregated by date (sum of stocks across SKUs)
//   const timeSeries = useMemo(() => {
//     const map = new Map<string, number>();
//     filtered.forEach((r) => {
//       map.set(r.date, (map.get(r.date) ?? 0) + r.stock);
//     });
//     const arr = Array.from(map.entries())
//       .map(([date, stock]) => ({ date, stock }))
//       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
//     return arr;
//   }, [filtered]);

//   // Category variation: total stock per category in filtered range
//   const categoryAgg = useMemo(() => {
//     const m = new Map<string, number>();
//     filtered.forEach((r) => m.set(r.category, (m.get(r.category) ?? 0) + r.stock));
//     return Array.from(m.entries()).map(([category, stock]) => ({ category, stock }));
//   }, [filtered]);

//   // Table: latest stock per SKU (most recent date in range)
//   const latestPerSku = useMemo(() => {
//     const m = new Map<string, { date: string; stock: number; category: string }>();
//     filtered.forEach((r) => {
//       const cur = m.get(r.sku);
//       if (!cur || new Date(r.date).getTime() > new Date(cur.date).getTime()) {
//         m.set(r.sku, { date: r.date, stock: r.stock, category: r.category });
//       }
//     });
//     return Array.from(m.entries()).map(([sku, v]) => ({ sku, ...v }));
//   }, [filtered]);
//   return (
//     <div className="bg-white rounded-lg shadow p-4 w-full">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
//         <div>
//           <h3 className="text-lg font-semibold">Stock Variation</h3>
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           <label className="text-xs text-slate-600">From</label>
//           <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border p-1 rounded text-sm" />
//           <label className="text-xs text-slate-600">To</label>
//           <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border p-1 rounded text-sm" />

//           <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded text-sm">
//             {categories.map((c) => (
//               <option key={c} value={c}>
//                 {c}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <div className="lg:col-span-2 h-64">
//           {timeSeries.length === 0 ? (
//             <div className="h-full flex items-center justify-center text-slate-400">No data in range</div>
//           ) : (
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
//                 <defs>
//                   <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#34D399" stopOpacity={0.8} />
//                     <stop offset="95%" stopColor="#34D399" stopOpacity={0.08} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip formatter={(v: number) => `${v}`} />
//                 <Area type="monotone" dataKey="stock" stroke="#059669" fillOpacity={1} fill="url(#colorStock)" />
//               </AreaChart>
//             </ResponsiveContainer>
//           )}
//         </div>

//         <div className="h-64">
//           {categoryAgg.length === 0 ? (
//             <div className="h-full flex items-center justify-center text-slate-400">No categories</div>
//           ) : (
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={categoryAgg} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" />
//                 <YAxis dataKey="category" type="category" />
//                 <Tooltip formatter={(v: number) => `${v}`} />
//                 <Bar dataKey="stock" name="Stock" fill="#2563EB" />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>

//       <div className="mt-4">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left text-xs text-slate-500 border-b">
//                 <th className="p-2">SKU</th>
//                 <th className="p-2">Category</th>
//                 <th className="p-2">Latest Date</th>
//                 <th className="p-2 text-right">Stock</th>
//               </tr>
//             </thead>
//             <tbody>
//               {latestPerSku.length === 0 ? (
//                 <tr>
//                   <td colSpan={4} className="p-3 text-center text-slate-500">No SKUs found</td>
//                 </tr>
//               ) : (
//                 latestPerSku.map((r) => (
//                   <tr key={r.sku} className="border-b">
//                     <td className="p-2">{r.sku}</td>
//                     <td className="p-2">{r.category}</td>
//                     <td className="p-2">{r.date}</td>
//                     <td className="p-2 text-right font-semibold">{r.stock}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type ExpenseRecord = {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  mode: "Cash" | "UPI" | "Card" | "Bank";
  vendor?: string;
  note?: string;
};

const SAMPLE_EXPENSES: ExpenseRecord[] = [
  { id: "e1", date: "2025-09-08", category: "Fuel", amount: 3200, mode: "Cash", vendor: "HPCL", note: "Van #2" },
  { id: "e2", date: "2025-09-08", category: "Snacks", amount: 450, mode: "UPI", vendor: "Local Store" },
  { id: "e3", date: "2025-09-09", category: "Maintenance", amount: 5200, mode: "Bank", vendor: "Garage" },
  { id: "e4", date: "2025-09-09", category: "Fuel", amount: 2800, mode: "Card", vendor: "BPCL" },
  { id: "e5", date: "2025-09-10", category: "Rent", amount: 25000, mode: "Bank", vendor: "Landlord" },
  { id: "e6", date: "2025-09-10", category: "Utilities", amount: 3800, mode: "UPI", vendor: "TSNPDCL" },
  { id: "e7", date: "2025-09-10", category: "Fuel", amount: 3100, mode: "Cash", vendor: "HPCL" },
  { id: "e8", date: "2025-09-11", category: "Salaries", amount: 72000, mode: "Bank", vendor: "Payroll" },
  { id: "e9", date: "2025-09-11", category: "Misc", amount: 900, mode: "UPI", note: "Office supplies" },
];

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function StockVariation({ data }: { data?: ExpenseRecord[] }) {
  // data source (mutable local state so added expenses reflect immediately)
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(data ?? SAMPLE_EXPENSES);

  // filters
  const [from, setFrom] = useState<string>("2025-09-08");
  const [to, setTo] = useState<string>("2025-09-11");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [modeFilter, setModeFilter] = useState<string>("All");

  // form state for adding expense
  const [form, setForm] = useState<{
    date: string;
    category: string;
    newCategory?: string;
    amount: string;
    mode: string;
    vendor: string;
    note: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    category: "",
    newCategory: "",
    amount: "",
    mode: "Cash",
    vendor: "",
    note: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});

  // derived lists
  const categories = useMemo(() => {
    const setC = new Set(expenses.map((e) => e.category));
    return ["All", ...Array.from(setC).sort()];
  }, [expenses]);

  const modes = ["All", "Cash", "UPI", "Card", "Bank"];

  // helper to update form fields
  const updateForm = (k: string, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    setFormErrors((e) => ({ ...e, [k]: undefined }));
  };

  // add new expense handler
  const handleAddExpense = (e?: React.FormEvent) => {
    e?.preventDefault();
    const errors: Partial<Record<string, string>> = {};

    const date = form.date?.trim();
    const category = form.category === "___NEW___" ? (form.newCategory || "").trim() : form.category.trim();
    const amountNum = Number(form.amount);

    if (!date) errors.date = "Date required";
    if (!category) errors.category = "Category required";
    if (!form.amount) errors.amount = "Amount required";
    else if (Number.isNaN(amountNum) || amountNum <= 0) errors.amount = "Enter positive number";

    if (!form.mode) errors.mode = "Mode required";

    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const newItem: ExpenseRecord = {
      id: `x${Date.now()}`,
      date,
      category,
      amount: amountNum,
      mode: form.mode as ExpenseRecord["mode"],
      vendor: form.vendor?.trim() || undefined,
      note: form.note?.trim() || undefined,
    };

    setExpenses((prev) => [newItem, ...prev]);
    // clear form (keep mode)
    setForm({
      date: new Date().toISOString().slice(0, 10),
      category: "",
      newCategory: "",
      amount: "",
      mode: form.mode,
      vendor: "",
      note: "",
    });
    // if user added a brand-new category, make it selected in filters
    setCategoryFilter("All");
    setModeFilter("All");
  };

  // filtered view
  const filtered = useMemo(() => {
    const fromTs = new Date(from).getTime();
    const toTs = new Date(to).getTime();
    return expenses.filter((r) => {
      const t = new Date(r.date).getTime();
      if (isNaN(t) || t < fromTs || t > toTs) return false;
      if (categoryFilter !== "All" && r.category !== categoryFilter) return false;
      if (modeFilter !== "All" && r.mode !== modeFilter) return false;
      return true;
    });
  }, [expenses, from, to, categoryFilter, modeFilter]);

  // timeseries (sum by date)
  const timeSeries = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.date, (map.get(r.date) ?? 0) + r.amount));
    return Array.from(map.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filtered]);

  // category totals
  const categoryAgg = useMemo(() => {
    const m = new Map<string, number>();
    filtered.forEach((r) => m.set(r.category, (m.get(r.category) ?? 0) + r.amount));
    return Array.from(m.entries()).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
  }, [filtered]);

  // grouped by date for table
  const byDate = useMemo(() => {
    const m = new Map<string, ExpenseRecord[]>();
    filtered.forEach((r) => m.set(r.date, [...(m.get(r.date) ?? []), r]));
    return Array.from(m.entries())
      .map(([date, rows]) => ({
        date,
        rows: rows.sort((a, b) => a.category.localeCompare(b.category)),
        total: rows.reduce((s, r) => s + r.amount, 0),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filtered]);

  const grandTotal = useMemo(() => filtered.reduce((s, r) => s + r.amount, 0), [filtered]);

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full space-y-6">
      {/* Add expense form */}
      <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Date</label>
          <input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} className="border rounded p-2" />
          {formErrors.date && <p className="text-xs text-red-600 mt-1">{formErrors.date}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Category</label>
          <div className="flex gap-2">
            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              className="border rounded p-2 flex-1"
            >
              <option value="">Select category</option>
              {Array.from(new Set(expenses.map((c) => c.category)))
                .sort()
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              <option value="___NEW___">-- Add new category --</option>
            </select>
            {form.category === "___NEW___" && (
              <input
                placeholder="New category"
                value={form.newCategory}
                onChange={(e) => updateForm("newCategory", e.target.value)}
                className="border rounded p-2 w-48"
              />
            )}
          </div>
          {formErrors.category && <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Amount</label>
          <input
            placeholder="0"
            value={form.amount}
            onChange={(e) => updateForm("amount", e.target.value)}
            className="border rounded p-2"
            inputMode="decimal"
          />
          {formErrors.amount && <p className="text-xs text-red-600 mt-1">{formErrors.amount}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Mode</label>
          <select value={form.mode} onChange={(e) => updateForm("mode", e.target.value)} className="border rounded p-2">
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Bank">Bank</option>
          </select>
          {formErrors.mode && <p className="text-xs text-red-600 mt-1">{formErrors.mode}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Vendor</label>
          <input value={form.vendor} onChange={(e) => updateForm("vendor", e.target.value)} className="border rounded p-2" />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Note</label>
          <input value={form.note} onChange={(e) => updateForm("note", e.target.value)} className="border rounded p-2" />
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded">
            Add Expense
          </button>
          <button
            type="button"
            onClick={() =>
              setForm({
                date: new Date().toISOString().slice(0, 10),
                category: "",
                newCategory: "",
                amount: "",
                mode: "Cash",
                vendor: "",
                note: "",
              })
            }
            className="border px-3 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Filters & header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Expense Summary</h3>
          <p className="text-xs text-slate-500">
            Showing <span className="font-medium">{filtered.length}</span> txn(s) • Grand total:{" "}
            <span className="font-medium">{formatINR(grandTotal)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-slate-600">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border p-1 rounded text-sm" />
          <label className="text-xs text-slate-600">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border p-1 rounded text-sm" />

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border p-2 rounded text-sm">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="border p-2 rounded text-sm">
            {modes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64">
          {timeSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">No data in range</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Area type="monotone" dataKey="total" stroke="#D97706" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="h-64">
          {categoryAgg.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">No categories</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAgg} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="total" name="Amount" fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table grouped by date */}
      <div className="mt-4">
        <div className="overflow-x-auto">
          {byDate.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No expenses found for the selected filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="p-2">Date</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Mode</th>
                  <th className="p-2">Vendor</th>
                  <th className="p-2">Note</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {byDate.map(({ date, rows, total }) => (
                  <React.Fragment key={date}>
                    {rows.map((r, idx) => (
                      <tr key={r.id} className="border-b">
                        <td className="p-2 align-top">{idx === 0 ? date : ""}</td>
                        <td className="p-2">{r.category}</td>
                        <td className="p-2">{r.mode}</td>
                        <td className="p-2">{r.vendor ?? "-"}</td>
                        <td className="p-2">{r.note ?? "-"}</td>
                        <td className="p-2 text-right font-medium">{r.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50">
                      <td className="p-2 text-right font-semibold" colSpan={5}>
                        Total for {date}
                      </td>
                      <td className="p-2 text-right font-semibold">{formatINR(total)}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


