

import React, { useEffect, useRef, useState } from "react";
import { Plus, X, Edit2, Trash2, Search as SearchIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../src/api/axios";
import { Button } from "@/components/ui/button";

const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const SEARCH_DEBOUNCE_MS = 400;

type CategoryItem = {
  id: string | number;
  category: string;
  image_url?: string;
  image?: string;
  createdAt?: string | null;
  productCount?: number;
};

function unsplashForCategory(cat?: string, size = "600x400") {
  const keyword = (cat || "grocery").split(" ").slice(0, 3).join(",");
  return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
}

function readPagination(metaLike: any) {
  const out = {
    total: Number(metaLike?.total ?? metaLike?.count ?? metaLike?.records ?? metaLike?.totalRecords ?? 0),
    per_page: Number(metaLike?.per_page ?? metaLike?.perPage ?? metaLike?.limit ?? metaLike?.pageSize ?? 10),
    current_page: Number(metaLike?.current_page ?? metaLike?.page ?? metaLike?.currentPage ?? 1),
    last_page: Number(metaLike?.last_page ?? metaLike?.total_pages ?? Math.ceil((metaLike?.total ?? 0) / (metaLike?.per_page ?? 10))),
  };
  out.per_page = out.per_page > 0 ? out.per_page : 10;
  out.current_page = out.current_page >= 1 ? out.current_page : 1;
  out.last_page = out.last_page >= 1 ? out.last_page : 1;
  return out;
}

export default function CategoriesShowcase(): JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ category: string; imagePreview?: string }>({ category: "", imagePreview: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const searchTimer = useRef<number | null>(null);

  // normalize single server row into CategoryItem
  const normalizeRow = (r: any, i = 0): CategoryItem => {
    const rawCount = r.products_count ?? r.count ?? r.productsCount ?? 0;
    const parsedCount = typeof rawCount === "string" ? Number(rawCount || 0) : Number(rawCount ?? 0);

    const tryTrim = (v: any) => (v === undefined || v === null ? "" : String(v).trim());

    // prefer image_url -> imageUrl -> image and make absolute if needed
    let resolvedImage: string | undefined = undefined;
    const candImageUrl = tryTrim(r.image_url ?? r.imageUrl ?? "");
    if (candImageUrl) resolvedImage = candImageUrl;
    else {
      const cand = tryTrim(r.image ?? r.photo ?? r.thumbnail ?? "");
      if (cand) {
        if (/^https?:\/\//i.test(cand)) resolvedImage = cand;
        else {
          try {
            const baseCandidate = String((api as any)?.defaults?.baseURL ?? window.location.origin);
            const base = baseCandidate.endsWith("/") ? baseCandidate : baseCandidate + "/";
            resolvedImage = new URL(cand.replace(/^\/+/, ""), base).toString();
          } catch {
            try {
              resolvedImage = `${window.location.origin}/storage/${cand.replace(/^\/+/, "")}`;
            } catch {
              resolvedImage = undefined;
            }
          }
        }
      }
    }

    const finalImage = resolvedImage ?? (r.name ? unsplashForCategory(r.name) : SAMPLE_IMG);

    return {
      id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
      category: String(r.name ?? r.category ?? r.title ?? `Category ${i + 1}`),
      image_url: finalImage,
      image: r.image ?? undefined,
      createdAt: r.created_at ?? r.createdAt ?? null,
      productCount: Number.isFinite(parsedCount) ? parsedCount : 0,
    };
  };

  /**
   * fetchCategories
   * - Accepts { search?, q?, page?, per_page? } for backward compatibility.
   * - Uses `search` param when calling API (so backend receives ?search=...).
   */
 const fetchCategories = async (page = 1, search = "") => {
  setLoading(true);
  try {
    const qs = `?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const res = await api.get(`/admin/categories/show${qs}`);
    const body = res?.data ?? res;
    if (!body || typeof body !== "object") throw new Error("Unexpected response from server");

    // try payload shapes similar to products: payload may be body.data (paginated) or body itself
    const payload = body.data ?? body;
    // rows often live in payload.data (pagination) or payload (array) — handle common shapes
    let rows: any[] = [];
    if (Array.isArray(payload)) {
      rows = payload;
    } else if (payload && Array.isArray(payload.data)) {
      rows = payload.data;
    } else if (payload && payload.data && Array.isArray(payload.data?.data)) {
      rows = payload.data.data;
    } else if (payload && Array.isArray(payload.rows)) {
      rows = payload.rows;
    } else if (payload && Array.isArray(payload.categories)) {
      rows = payload.categories;
    } else {
      const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) rows = arr as any[];
    }

    // normalize and set
    const normalized = rows.map((r: any, i: number) => normalizeRow(r, i));
    setCategories(normalized);

    // pagination meta (try to extract from payload sensibly)
    const cp = Number(payload?.current_page ?? payload?.page ?? payload?.currentPage ?? 1);
    const lp = Number(payload?.last_page ?? payload?.total_pages ?? 1);
    const pp = Number(payload?.per_page ?? payload?.perPage ?? perPage);
    const tot = Number(payload?.total ?? payload?.count ?? normalized.length);

    setPage(cp || 1);
    setTotalPages(lp || 1);
    setPerPage(pp || perPage);
    setTotalItems(tot || normalized.length);

    // If user searched and server returned zero rows, ensure cleared state (no accidental fallbacks)
    const userSearched = search !== undefined && String(search).trim() !== "";
    if (userSearched && rows.length === 0) {
      setCategories([]);
      setTotalItems(0);
      setPerPage(pp || perPage);
      setPage(1);
      setTotalPages(1);
    }
  } catch (err: any) {
    console.error("fetchCategories failed:", err, err?.response?.data);
    const message = err?.response?.data?.message ?? err?.message ?? "Failed to load categories";
    toast.error(message);
    setCategories([]);
    setTotalItems(0);
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
};

// initial load
useEffect(() => {
  void fetchCategories(1, query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Watch query and refetch (debounced) — mirrors your products implementation
useEffect(() => {
  const t = window.setTimeout(() => {
    // restart to page 1 whenever search term changes
    void fetchCategories(1, query);
  }, 400);
  return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [query]);

  // file input preview + validation
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Selected file is not an image.");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 5MB).");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setCatForm((p) => ({ ...p, imagePreview: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  // fetch single item (for edit drawer)
  const fetchSingle = async (id: string | number) => {
    const res = await api.get(`/admin/categories/show/${id}`);
    const body = res?.data ?? null;
    const item = body?.data ?? body?.category ?? body ?? null;
    return item ? normalizeRow(item) : null;
  };

  // create (server)
  const createCategory = async (payload: { name: string; file?: File | null }) => {
    const fd = new FormData();
    fd.append("name", payload.name);
    if (payload.file) fd.append("image", payload.file, payload.file.name);
    const res = await api.post("/admin/categories/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res?.data ?? res;
  };

  // update (server) using POST + _method=PUT (your backend uses POST with method override)
  const updateCategory = async (id: string | number, payload: { name: string; file?: File | null }) => {
    const fd = new FormData();
    fd.append("name", payload.name);
    fd.append("_method", "POST");
    if (payload.file) fd.append("image", payload.file, payload.file.name);
    const res = await api.post(`/admin/categories/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res?.data ?? res;
  };

  // delete (server)
  const deleteCategoryReq = async (id: string | number) => {
    const res = await api.delete(`/admin/categories/delete/${id}`);
    return res?.data ?? res;
  };

  const openCreate = () => {
    setEditingId(null);
    setCatForm({ category: "", imagePreview: "" });
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setDrawerOpen(true);
  };

  const openEdit = async (item: CategoryItem) => {
    setEditingId(item.id);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    try {
      const server = await fetchSingle(item.id);
      setCatForm({ category: server?.category ?? item.category, imagePreview: server?.image_url ?? item.image_url ?? "" });
    } catch {
      setCatForm({ category: item.category, imagePreview: item.image_url ?? item.image ?? "" });
    }
    setDrawerOpen(true);
  };

  const prettyDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" }).format(d);
    } catch {
      return iso;
    }
  };

  // submit (create or update) — ALWAYS refresh list after success and use server message
  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    const nameTrim = (catForm.category ?? "").trim();
    if (!nameTrim) {
      toast.error("Please enter a category name.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateCategory(editingId, { name: nameTrim, file: selectedFile ?? undefined });
        const serverMsg = res?.message ?? "Category updated";
        toast.success(serverMsg);
      } else {
        const res = await createCategory({ name: nameTrim, file: selectedFile ?? undefined });
        const serverMsg = res?.message ?? "Category created";
        toast.success(serverMsg);
      }
      // refresh using `search` param so backend receives ?search=...
      await fetchCategories({ search: query, page: 1, per_page: perPage });
      setDrawerOpen(false);
      setCatForm({ category: "", imagePreview: "" });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      console.error("handleSubmit error:", err);
      const serverMsg = err?.response?.data?.message ?? err?.message ?? "Save failed";
      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = window.confirm("Delete this category? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const res = await deleteCategoryReq(id);
      const serverMsg = res?.message ?? "Category deleted";
      toast.success(serverMsg);
      // refresh current page (preserve search) — use `search` param
      await fetchCategories({ search: query, page, per_page: perPage });
    } catch (err: any) {
      console.error("delete error:", err);
      const serverMsg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
      toast.error(serverMsg);
    }
  };

  const goToPage = async (p: number) => {
    const newPage = Math.max(1, Math.min(p, totalPages));
    setPage(newPage);
    await fetchCategories({ search: query, page: newPage });
  };

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 7;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(totalItems / perPage)));
  }, [totalItems, perPage]);

  // Show newest first (reverse server list)
  const tableRows = [...categories].reverse();

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
        </div>

        <div className="flex justify-center">
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative w-full">
              {/* Search auto-triggers backend fetch (debounced) */}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories..."
                className="pl-9 pr-3 py-2 rounded border w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchTimer.current) {
                      window.clearTimeout(searchTimer.current);
                      searchTimer.current = null;
                    }
                    setPage(1);
                    //ts-ignore
                    void fetchCategories({ search: e.currentTarget.value, page: 1, per_page: perPage });
                  }
                }}
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3">
           <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6 bg-white shadow-sm rounded border overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm text-slate-600">Loading...</span>
    </div>
  </div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            {query.trim() ? (
              <>No categories found for <strong className="text-slate-700">"{query.trim()}"</strong>.</>
            ) : (
              <>No categories available.</>
            )}
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">S.no</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Products</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {tableRows.map((c, idx) => {
                // To display correct serial for server driven pagination, compute index relative to current page/perPage
                const serial = (page - 1) * perPage + idx + 1;
                return (
                  <tr key={String(c.id)}>
                    <td className="px-4 py-3 text-sm">{serial}</td>

                    <td className="px-4 py-3">
                      <div className="w-14 h-14 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img
                          src={c.image_url ?? SAMPLE_IMG}
                          alt={c.category}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (!img.dataset.fallback) {
                              img.dataset.fallback = "true";
                              img.src = unsplashForCategory(c.category, "600x400");
                            }
                          }}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{c.category}</div>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {(typeof c.productCount === "number" ? c.productCount : 0) + (c.productCount === 1 ? " Product" : " Products")}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-500">{c.createdAt ? prettyDate(c.createdAt) : "-"}</td>

                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          title="Edit"
                          className="px-3 py-1 rounded-md border hover:bg-indigo-600 hover:text-white transition"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Delete"
                          className="px-3 py-1 rounded-md border hover:bg-red-600 hover:text-white transition"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
        <div className="text-sm text-slate-600">
          Showing page {page} of {totalPages} • {totalItems} items
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => void goToPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">
            First
          </button>
          <button onClick={() => void goToPage(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">
            Prev
          </button>

          {renderPageNumbers().map((p) => (
            <button key={p} onClick={() => void goToPage(p)} className={`px-3 py-1 border rounded ${p === page ? "bg-indigo-600 text-white" : ""}`}>
              {p}
            </button>
          ))}

          <button onClick={() => void goToPage(page + 1)} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">
            Next
          </button>
          <button onClick={() => void goToPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">
            Last
          </button>
        </div>
      </div>

      {/* Drawer */}
      <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
        <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      </div>

      <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium">{editingId ? "Edit Category" : "Add Category"}</h2>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
          </div>

          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Name (Category)</label>
                <input id="category" value={catForm.category} onChange={(e) => setCatForm((s) => ({ ...s, category: e.target.value }))} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Beverages" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image (optional)</label>

                <div className="mt-1 flex items-center gap-3">
                  <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
                    {catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.category || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}
                  </div>

                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500" />
                    <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. Leave empty to keep existing image.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <button type="button" className="px-4 py-2 rounded-md border" onClick={() => { setCatForm({ category: "", imagePreview: "" }); setDrawerOpen(false); setSelectedFile(null); setEditingId(null); if (fileRef.current) fileRef.current.value = ""; }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                {submitting ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}



