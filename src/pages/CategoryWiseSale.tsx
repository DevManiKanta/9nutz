// import React, { useMemo, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { DownloadCloud } from "lucide-react";

// type SaleRecord = {
//   dc: string;
//   category: string;
//   date: string; // YYYY-MM-DD
//   amount: number;
// };

// /**
//  * Static sample dataset — replace with API data as needed.
//  * Ensure dates are in YYYY-MM-DD format for reliable comparisons.
//  */
// const SAMPLE_DATA: SaleRecord[] = [
//   { dc: "DC-01", category: "Beverages", date: "2025-09-10", amount: 1200 },
//   { dc: "DC-01", category: "Snacks", date: "2025-09-10", amount: 900 },
//   { dc: "DC-01", category: "Dairy", date: "2025-09-10", amount: 600 },
//   { dc: "DC-02", category: "Beverages", date: "2025-09-10", amount: 500 },
//   { dc: "DC-01", category: "Beverages", date: "2025-09-11", amount: 1000 },
//   { dc: "DC-01", category: "Snacks", date: "2025-09-11", amount: 700 },
//   { dc: "DC-02", category: "Dairy", date: "2025-09-11", amount: 200 },
//   { dc: "DC-01", category: "Beverages", date: "2025-09-12", amount: 1500 },
//   { dc: "DC-01", category: "Snacks", date: "2025-09-12", amount: 1100 },
//   { dc: "DC-01", category: "Dairy", date: "2025-09-12", amount: 400 },
//   { dc: "DC-01", category: "Household", date: "2025-09-12", amount: 800 },
// ];

// const DC_OPTIONS = ["DC-01", "DC-02", "DC-03"];

// export default function CategoryWiseSale(): JSX.Element {
//   // form state
//   const [dc, setDc] = useState<string>("");
//   const [from, setFrom] = useState<string>("2025-09-10");
//   const [to, setTo] = useState<string>("2025-09-12");
//   const [errors, setErrors] = useState<{ dc?: string; date?: string }>({});
//   const [submitted, setSubmitted] = useState(false);

//   // results state (after submit)
//   const [results, setResults] = useState<SaleRecord[]>([]);

//   // validation
//   function validateForm() {
//     const e: { dc?: string; date?: string } = {};
//     if (!dc) e.dc = "Please select DC";
//     const fromTs = Date.parse(from);
//     const toTs = Date.parse(to);
//     if (isNaN(fromTs) || isNaN(toTs) || fromTs > toTs) {
//       e.date = "Invalid date range";
//     }
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   }

//   // handle submit: filter SAMPLE_DATA by DC + date range and show aggregated results
//   function handleSubmit(e?: React.FormEvent) {
//     e?.preventDefault();
//     setSubmitted(false);
//     if (!validateForm()) return;

//     const fromTs = new Date(from).setHours(0, 0, 0, 0);
//     const toTs = new Date(to).setHours(23, 59, 59, 999);

//     const filtered = SAMPLE_DATA.filter((r) => {
//       if (dc && r.dc !== dc) return false;
//       const t = new Date(r.date).getTime();
//       return t >= fromTs && t <= toTs;
//     });

//     // sort by category name for consistent view
//     filtered.sort((a, b) => a.category.localeCompare(b.category) || a.date.localeCompare(b.date));
//     setResults(filtered);
//     setSubmitted(true);
//   }

//   // aggregated data for chart & summary: sum amounts by category
//   const aggregated = useMemo(() => {
//     const map = new Map<string, number>();
//     for (const r of results) {
//       map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
//     }
//     const arr = Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
//     arr.sort((a, b) => b.amount - a.amount);
//     return arr;
//   }, [results]);

//   const total = aggregated.reduce((s, it) => s + it.amount, 0);

//   // export CSV of the filtered results (not aggregated)
//   function exportCsv() {
//     if (results.length === 0) return;
//     const headers = ["DC", "Date", "Category", "Amount"];
//     const lines = results.map((r) => [r.dc, r.date, `"${r.category.replace(/"/g, '""')}"`, r.amount].join(","));
//     const csv = [headers.join(","), ...lines].join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `category_wise_sales_${dc || "all"}_${from}_${to}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-slate-800">Category Wise Sales</h1>
//           <div className="text-sm text-slate-500 mt-1">
//             <a href="/" className="text-sky-500 hover:underline">
//               Home
//             </a>{" "}
//             <span className="mx-2">-</span> Category Wise Sales
//           </div>
//         </div>

//         {/* Export top-right */}
//         <div className="ml-auto">
//           <button
//             onClick={exportCsv}
//             disabled={results.length === 0}
//             className={`px-4 py-2 rounded-md shadow ${
//               results.length === 0
//                 ? "bg-indigo-100 text-indigo-400 cursor-not-allowed border"
//                 : "bg-indigo-600 text-white hover:bg-indigo-700"
//             }`}
//             aria-disabled={results.length === 0}
//             title={results.length === 0 ? "No data to export" : "Export CSV"}
//           >
//             <div className="flex items-center gap-2">
//               <DownloadCloud className="w-4 h-4" />
//               <span>Export</span>
//             </div>
//           </button>
//         </div>
//       </div>

//       {/* Form card */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
//           {/* Select DC */}
//           <div className="md:col-span-3">
//             <label className="block text-sm text-slate-700 mb-2">
//               Select DC <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={dc}
//               onChange={(e) => {
//                 setDc(e.target.value);
//                 setErrors((p) => ({ ...p, dc: undefined }));
//               }}
//               className={`w-full p-3 border rounded bg-white focus:outline-none ${
//                 errors.dc ? "border-red-400" : "border-slate-200"
//               }`}
//             >
//               <option value="">Select DC</option>
//               {DC_OPTIONS.map((d) => (
//                 <option key={d} value={d}>
//                   {d}
//                 </option>
//               ))}
//             </select>
//             {errors.dc && <p className="text-red-600 text-sm mt-1">{errors.dc}</p>}
//           </div>

//           {/* Start Date */}
//           <div className="md:col-span-3">
//             <label className="block text-sm text-slate-700 mb-2">Start Date</label>
//             <input
//               type="date"
//               value={from}
//               onChange={(e) => {
//                 setFrom(e.target.value);
//                 setErrors((p) => ({ ...p, date: undefined }));
//               }}
//               className="w-full p-3 border rounded bg-white focus:outline-none border-slate-200"
//             />
//           </div>

//           {/* End Date */}
//           <div className="md:col-span-3">
//             <label className="block text-sm text-slate-700 mb-2">End Date</label>
//             <input
//               type="date"
//               value={to}
//               onChange={(e) => {
//                 setTo(e.target.value);
//                 setErrors((p) => ({ ...p, date: undefined }));
//               }}
//               className="w-full p-3 border rounded bg-white focus:outline-none border-slate-200"
//             />
//             {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
//           </div>

//           {/* Submit button aligned right */}
//           <div className="md:col-span-3 flex justify-start md:justify-end">
//             <button
//               type="submit"
//               className="px-6 py-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow"
//             >
//               Submit
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Results area */}
//       <div className="bg-white rounded-lg shadow p-6 min-h-[360px]">
//         {!submitted ? (
//           <div className="text-slate-500 text-lg">Click Submit to fetch ..</div>
//         ) : results.length === 0 ? (
//           <div className="text-slate-500 text-lg">No data found for selected DC / date range.</div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Chart */}
//             <div className="lg:col-span-2 h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={aggregatedChartData(aggregated)}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="category" />
//                   <YAxis />
//                   <Tooltip formatter={(value: number) => `₹ ${value}`} />
//                   <Legend />
//                   <Bar dataKey="amount" name="Sales (₹)" fill="#6d28d9" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Summary */}
//             <div className="lg:col-span-1 bg-slate-50 p-4 rounded">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-sm text-slate-600">Total</div>
//                 <div className="text-xl font-semibold">₹ {total}</div>
//               </div>

//               <div className="space-y-3">
//                 {aggregated.map((row) => (
//                   <div key={row.category} className="flex items-center justify-between">
//                     <div>
//                       <div className="font-medium">{row.category}</div>
//                       <div className="text-xs text-slate-500">
//                         {total > 0 ? Math.round((row.amount / total) * 100) : 0}% of total
//                       </div>
//                     </div>
//                     <div className="font-semibold">₹ {row.amount}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="text-xs text-slate-400 mt-3">* This view uses static sample data — wire to your API to fetch live data.</div>
//     </div>
//   );

//   // helper to convert aggregated array into chart-friendly data (keeps same)
//   function aggregatedChartData(agg: { category: string; amount: number }[]) {
//     // recharts accepts array of { category, amount }
//     return agg.map((x) => ({ category: x.category, amount: x.amount }));
//   }
// }

import React, { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/**
 * Replace with your real endpoint
 */
const API_CATEGORIES = "http://192.168.29.102:5000/api/categories";

/**
 * Developer-provided sample image (keeps UI looking good offline)
 * Path you provided: /mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png
 */
const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";

type CategoryItem = {
  id: string | number;
  category: string;
  image?: string;
  createdAt?: string;
  productCount?: number;
};

const SAMPLE_CATEGORIES: CategoryItem[] = [
  {
    id: "c-1",
    category: "MILLET IDLY RAVVAS",
    image: "https://source.unsplash.com/featured/600x600/?millet,idli",
    productCount: 5,
    createdAt: "2025-09-01",
  },
  {
    id: "c-2",
    category: "MILLET UPMA RAVVA",
    image: "https://source.unsplash.com/featured/600x600/?millet,upma",
    productCount: 4,
    createdAt: "2025-09-02",
  },
  {
    id: "c-3",
    category: "GRAINS",
    image: "https://source.unsplash.com/featured/600x600/?grains,cereal",
    productCount: 5,
    createdAt: "2025-09-03",
  },
  {
    id: "c-4",
    category: "SPECIAL DRY FRUITS",
    image: "https://source.unsplash.com/featured/600x600/?dry-fruits,nuts",
    productCount: 6,
    createdAt: "2025-09-04",
  },
  {
    id: "c-5",
    category: "FLOUR",
    image: "https://source.unsplash.com/featured/600x600/?flour,wheat",
    productCount: 5,
    createdAt: "2025-09-05",
  },
];


function unsplashForCategory(cat?: string, size = "600x400") {
  const keyword = (cat || "grocery").split(" ").slice(0, 3).join(",");
  return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
}

export default function CategoriesShowcase(): JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>(SAMPLE_CATEGORIES);
  const [loading, setLoading] = useState(false);

  // Drawer + create category state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ category: string; image?: string }>({ category: "", image: "" });
  const [fileInputValue, setFileInputValue] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories from API and normalize them.
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_CATEGORIES, { method: "GET" });
      if (!res.ok) {
        toast.error(`Failed to fetch categories (${res.status}) — showing sample data.`);
        setLoading(false);
        return;
      }
      const body = await res.json().catch(() => null);
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else if (body && Array.isArray(body.categories)) rows = body.categories;
      else rows = [];

      if (rows.length) {
        const normalized: CategoryItem[] = rows.map((r: any, i: number) => ({
          id: r.id ?? r._id ?? `srv-${i}`,
          category: (r.category ?? r.name ?? r.title ?? `Category ${i + 1}`).toString(),
          image:
            r.image ??
            r.imageUrl ??
            r.photo ??
            (r.category ? unsplashForCategory(r.category, "600x400") : undefined),
          createdAt: r.createdAt ?? r.created_at ?? undefined,
          productCount: r.productCount ?? r.count ?? 0,
        }));
        setCategories(normalized);
      } else {
        toast.success("No categories returned from server — showing sample data.");
      }
    } catch (err) {
      console.error("fetchCategories error:", err);
      toast.error("Network error while loading categories — showing sample data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle image file selection (preview only). For now we will convert to data URL and use optimistic UI.
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      if (fileRef.current) fileRef.current.value = "";
      setFileInputValue("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCatForm((p) => ({ ...p, image: String(reader.result) }));
    };
    reader.readAsDataURL(file);
    setFileInputValue(e.target.value || "");
  };

  // Simple create category (optimistic). If you have an endpoint to POST, update createCategory to call it.
  const submitCategory = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!catForm.category.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    setSubmitting(true);
    const tmpId = `tmp-${Date.now()}`;
    const optimistic: CategoryItem = {
      id: tmpId,
      category: catForm.category.trim().toUpperCase(),
      image: catForm.image || unsplashForCategory(catForm.category, "600x400") || SAMPLE_IMG,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCategories((p) => [optimistic, ...p]);
    setDrawerOpen(false);
    try {
      // If you have a POST API, call it here and replace optimistic with server response.
      toast.success("Category added (local). If you want server persistence, wire the POST API in submitCategory.");
    } catch (err) {
      console.error("submitCategory error:", err);
      setCategories((p) => p.filter((x) => x.id !== tmpId));
      toast.error("Failed to add category");
    } finally {
      setSubmitting(false);
      setCatForm({ category: "", image: "" });
      setFileInputValue("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
          <div className="text-sm text-slate-500 mt-1">Showing product categories — images auto-chosen when server doesn't provide one.</div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow"
            title="Add Category"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Categories grid: removed slider and use flex-wrap so cards wrap into rows */}
      <div className="mb-6">
        {loading ? (
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 animate-pulse">
                <div className="w-full h-40 rounded-full bg-slate-200 mb-3" />
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-1/3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-slate-500">No categories yet.</div>
        ) : (
          // flex-wrap container
          <div className="flex flex-wrap gap-8">
            {categories.map((c) => (
              <div
                key={String(c.id)}
                className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col items-center text-center"
              >
                <div
                  className="w-36 h-36 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center"
                  style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                >
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={c.category}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = unsplashForCategory(c.category, "600x400");
                      }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={unsplashForCategory(c.category, "600x400")} alt={c.category} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="mt-4 px-2">
                  <div className="text-green-800 font-semibold text-lg leading-tight">{c.category}</div>
                  <div className="text-sm text-slate-500 mt-1">{(typeof c.productCount === "number" ? c.productCount : 0) + " Products"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 mt-3">* Images come from server when available, otherwise from Unsplash by category keyword.</div>

      {/* Drawer for Add Category */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-gray-100 p-2">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Add Category</h2>
                <p className="text-sm text-gray-500">Add a name and optional image (local preview only).</p>
              </div>
            </div>

            <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={submitCategory}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Name (Category)
                </label>
                <input
                  id="category"
                  value={catForm.category}
                  onChange={(e) => setCatForm((s) => ({ ...s, category: e.target.value }))}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Beverages"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image (optional)</label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
                    {catForm.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={catForm.image} alt={catForm.category || "preview"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-slate-400">No image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="block w-full text-sm text-gray-500"
                      value={fileInputValue}
                    />
                    <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best for this layout.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                onClick={() => {
                  setCatForm({ category: "", image: "" });
                  if (fileRef.current) fileRef.current.value = "";
                  setFileInputValue("");
                }}
              >
                Reset
              </button>

              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}

