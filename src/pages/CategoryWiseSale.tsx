
import React, { useEffect, useRef, useState } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://192.168.29.100:8000/api";
const ENDPOINTS = {
  list: `${API_BASE}/admin/categories/show`,
  create: `${API_BASE}/admin/categories/add`,
  show: (id: string | number) => `${API_BASE}/admin/categories/show/${id}`,
  update: (id: string | number) => `${API_BASE}/admin/categories/update/${id}`,
  delete: (id: string | number) => `${API_BASE}/admin/categories/delete/${id}`,
};

const SAMPLE_IMG = "/mnt/data/54197a23-6bd1-4ec0-9e69-8d2be56a0782.png";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

type CategoryItem = {
  id: string | number;
  category: string;
  image?: string; // full URL
  createdAt?: string;
  productCount?: number;
};

function unsplashForCategory(cat?: string, size = "600x400") {
  const keyword = (cat || "grocery").split(" ").slice(0, 3).join(",");
  return `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(keyword)}`;
}

export default function CategoriesShowcase(): JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Drawer + form states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ category: string; imagePreview?: string }>({ category: "", imagePreview: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // helper: get token or null
  const getToken = (): string | null => {
    try {
      return localStorage.getItem("token");
    } catch (e) {
      console.warn("Failed to read token from localStorage", e);
      return null;
    }
  };

  // normalization helper: prefer image_url (full URL) returned by server
  const normalizeRow = (r: any, i = 0): CategoryItem => ({
    id: r.id ?? r._id ?? r.categoryId ?? `srv-${i}`,
    category: (r.name ?? r.category ?? r.title ?? `Category ${i + 1}`).toString(),
    image: r.image_url ?? r.imageUrl ?? r.image ?? r.photo ?? (r.name ? unsplashForCategory(r.name) : undefined) ?? SAMPLE_IMG,
    createdAt: r.created_at ?? r.createdAt ?? undefined,
    productCount: r.products_count ?? r.count ?? 0,
  });

  // FETCH (GET all)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("No auth token found — showing sample data.");
        setLoading(false);
        return;
      }

      const res = await fetch(ENDPOINTS.list, {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

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
      else {
        const arr = Object.values(body || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      if (rows.length) {
        setCategories(rows.map((r, i) => normalizeRow(r, i)));
      } else {
        // show empty list rather than sample data (you can re-enable SAMPLE if you want)
        setCategories([]);
        toast.success("No categories returned from server.");
      }
    } catch (err) {
      console.error("fetchCategories error:", err);
      toast.error("Network error while loading categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FILE handling (store raw File and preview)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // If user cleared input
    if (!file) {
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    // Content-type check
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Selected file is not an image. Please choose a valid image file.");
      // clear input
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    // Size check
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 5MB). Please select a smaller file.");
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFile(null);
      setCatForm((p) => ({ ...p, imagePreview: "" }));
      return;
    }

    // All good -> set file and preview
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setCatForm((p) => ({ ...p, imagePreview: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  // GET single (used when opening edit, fallback if we need fresh server data)
  const fetchSingle = async (id: string | number) => {
    const token = getToken();
    if (!token) throw new Error("No auth token");
    const res = await fetch(ENDPOINTS.show(id), {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Failed to fetch item (${res.status})`);
    }
    const body = await res.json().catch(() => null);
    const item = body?.data ?? body?.category ?? body ?? null;
    return item ? normalizeRow(item) : null;
  };

  // CREATE (POST with FormData -> /admin/categories/add)
  const createCategory = async (payload: { name: string; file?: File | null }) => {
    const token = getToken();
    if (!token) throw new Error("No auth token");
    const fd = new FormData();
    fd.append("name", payload.name);
    if (payload.file) fd.append("image", payload.file);
    const res = await fetch(ENDPOINTS.create, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // do NOT set Content-Type when sending FormData
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Create failed (${res.status})`);
    }
    const body = await res.json().catch(() => null);
    const serverItem = body?.data ?? body?.category ?? body ?? null;
    return serverItem ? normalizeRow(serverItem) : null;
  };

  // UPDATE (POST with FormData -> /admin/categories/update/:id)
  const updateCategory = async (id: string | number, payload: { name: string; file?: File | null }) => {
    const token = getToken();
    if (!token) throw new Error("No auth token");
    const fd = new FormData();
    fd.append("name", payload.name);
    if (payload.file) fd.append("image", payload.file);
    const res = await fetch(ENDPOINTS.update(id), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Update failed (${res.status})`);
    }
    const body = await res.json().catch(() => null);
    const serverItem = body?.data ?? body?.category ?? body ?? null;
    return serverItem ? normalizeRow(serverItem) : null;
  };

  // DELETE -> /admin/categories/delete/:id
  const deleteCategoryReq = async (id: string | number) => {
    const token = getToken();
    if (!token) throw new Error("No auth token");
    const res = await fetch(ENDPOINTS.delete(id), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Delete failed (${res.status})`);
    }
    return true;
  };

  // open drawer for create
  const openCreate = () => {
    setEditingId(null);
    setCatForm({ category: "", imagePreview: "" });
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setDrawerOpen(true);
  };

  // open drawer for edit (try to fetch fresh server item; fallback to local)
  const openEdit = async (item: CategoryItem) => {
    setEditingId(item.id);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
    try {
      const server = await fetchSingle(item.id);
      setCatForm({ category: server?.category ?? item.category, imagePreview: server?.image ?? item.image ?? "" });
    } catch (err) {
      setCatForm({ category: item.category, imagePreview: item.image ?? "" });
    }
    setDrawerOpen(true);
  };

  // handle submit (create or update)
  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();

    if (!catForm.category.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    // Validation: When creating (editingId === null), require an image file
    if (!editingId) {
      if (!selectedFile) {
        toast.error("Please select an image for the new category (max 5MB).");
        return;
      }
    }

    // For both create and update: if a file is present, we already validated it in handleFile (type + size)
    setSubmitting(true);
    const payload = { name: catForm.category.trim(), file: selectedFile };

    try {
      if (editingId) {
        // update (image optional)
        await updateCategory(editingId, payload);
        toast.success("Category updated");
      } else {
        // create (image required)
        await createCategory(payload);
        toast.success("Category created");
      }

      await fetchCategories();
      setDrawerOpen(false);
      setCatForm({ category: "", imagePreview: "" });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      console.error("submit error:", err);
      toast.error(err?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = window.confirm("Delete this category? This action cannot be undone.");
    if (!confirmed) return;
    const prev = categories;
    setCategories((p) => p.filter((c) => String(c.id) !== String(id)));
    try {
      await deleteCategoryReq(id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (err: any) {
      console.error("delete error:", err);
      setCategories(prev);
      toast.error(err?.message || "Failed to delete category");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={openCreate}       className="bg-chart-primary hover:bg-chart-primary/90 flex items-center py-2 px-4 rounded-md shadow-sm" title="Add Category">
           Add Category
          </button>
        </div>
      </div>
      {/* Grid */}
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
          <div className="flex flex-wrap gap-8">
            {categories.map((c) => (
              <div key={String(c.id)} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex flex-col items-center text-center">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center" style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
                  {c.image ? (
                    <img src={c.image} alt={c.category} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = unsplashForCategory(c.category, "600x400"); }} />
                  ) : (
                    <img src={unsplashForCategory(c.category, "600x400")} alt={c.category} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="mt-4 px-2 w-full">
                  <div className="text-green-800 font-semibold text-lg leading-tight">{c.category}</div>
                  <div className="text-sm text-slate-500 mt-1">{(typeof c.productCount === "number" ? c.productCount : 0) + " Products"}</div>

                  {/* ACTIONS: horizontal row below name */}
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button onClick={() => openEdit(c)} aria-label={`Edit ${c.category}`} title="Edit" className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition">
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>

                    <button onClick={() => handleDelete(c.id)} aria-label={`Delete ${c.category}`} title="Delete" className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 transition">
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
        <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      </div>

      <aside role="dialog" aria-modal="true" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] transform transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-gray-100 p-2"><Plus className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-medium">{editingId ? "Edit Category" : "Add Category"}</h2>
                <p className="text-sm text-gray-500">Add or edit a name and optional image (image is uploaded to server).</p>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
          </div>

          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Name (Category)</label>
                <input id="category" value={catForm.category} onChange={(e) => setCatForm((s) => ({ ...s, category: e.target.value }))} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Beverages" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image {editingId ? <span className="text-xs text-gray-400">(optional)</span> : <span className="text-xs text-red-500">(required)</span>}
                </label>

                <div className="mt-1 flex items-center gap-3">
                  <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
                    {catForm.imagePreview ? <img src={catForm.imagePreview} alt={catForm.category || "preview"} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">No image</div>}
                  </div>

                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500" />
                    <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. {editingId ? "Leave empty to keep existing image." : ""}</p>
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
