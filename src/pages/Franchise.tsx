
// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Building2, RefreshCw, Edit3, Trash2, X } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../../src/api/axios";

// type FranchiseForm = {
//   name: string;
//   businessName: string;
//   address: string;
//   email: string;
//   phone: string;
//   password: string;
//   amount: string;
//   imageFile?: File | null;
// };

// const initialForm: FranchiseForm = {
//   name: "",
//   businessName: "",
//   address: "",
//   email: "",
//   phone: "",
//   password: "",
//   amount: "",
//   imageFile: null,
// };

// type FranchiseItem = {
//   id: string | number;
//   name: string;
//   businessName: string;
//   address: string;
//   email: string;
//   phone: string;
//   amount?: string;
//   status?: string;
//   image_url?: string | null;
// };

// const Spinner = ({ size = 16 }: { size?: number }) => (
//   <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
//     <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
//     <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
//   </svg>
// );

// const formatServerValidation = (payload: any) => {
//   // returns map of field -> string
//   const out: Partial<Record<keyof FranchiseForm, string>> = {};
//   if (!payload) return out;
//   const errors = payload.errors ?? payload.validation ?? payload;
//   if (typeof errors === "object") {
//     for (const k of Object.keys(errors)) {
//       const v = errors[k];
//       const msg = Array.isArray(v) ? v.join(" ") : String(v);
//       const key = k.toLowerCase();
//       if (key.includes("name")) out.name = msg;
//       else if (key.includes("business") || key.includes("company")) out.businessName = msg;
//       else if (key.includes("address")) out.address = msg;
//       else if (key.includes("email")) out.email = msg;
//       else if (key.includes("phone") || key.includes("mobile") || key.includes("contact")) out.phone = msg;
//       else if (key.includes("password")) out.password = msg;
//       else if (key.includes("amount") || key.includes("deposit")) out.amount = msg;
//       else if (key.includes("image")) out.imageFile = msg;
//     }
//   } else if (typeof errors === "string") {
//     out.name = errors;
//   }
//   return out;
// };

// const Franchise: React.FC = () => {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [form, setForm] = useState<FranchiseForm>(initialForm);
//   const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});
//   const [loading, setLoading] = useState(false);

//   const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
//   const [listLoading, setListLoading] = useState(false);
//   const [listError, setListError] = useState<string | null>(null);

//   const [editingId, setEditingId] = useState<string | number | null>(null);

//   // upload progress (0-100)
//   const [uploadProgress, setUploadProgress] = useState<number | null>(null);

//   // validation (note: require image on create)
//   const validate = (): boolean => {
//     const err: Partial<Record<keyof FranchiseForm, string>> = {};
//     if (!form.name.trim()) err.name = "Name is required";
//     if (!form.businessName.trim()) err.businessName = "Business name is required";
//     if (!form.address.trim()) err.address = "Address is required";
//     if (!form.email.trim()) err.email = "Email is required";
//     else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = "Invalid email";
//     if (!form.phone.trim()) err.phone = "Phone is required";
//     else if (!/^\+?\d{7,15}$/.test(form.phone.trim())) err.phone = "Invalid phone number";
//     if (!editingId && !form.password.trim()) err.password = "Password is required";
//     else if (form.password && form.password.trim() && form.password.trim().length < 6) err.password = "Password must be at least 6 characters";
//     if (!form.amount.trim()) err.amount = "Amount is required";
//     else if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim())) err.amount = "Enter a valid amount (e.g. 100 or 99.99)";

//     // Server expects image on create — enforce client-side
//     if (!editingId && !form.imageFile) err.imageFile = "Image is required";

//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

//   // ---------- fetch list ----------
//   const fetchFranchises = async (opts?: { showErrorToast?: boolean }) => {
//     setListLoading(true);
//     setListError(null);
//     try {
//       const res = await api.get("/admin/franchise");
//       const body = res?.data ?? null;
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else if (Array.isArray(body.franchises)) rows = body.franchises;
//       else if (Array.isArray(body.rows)) rows = body.rows;
//       else rows = [];

//       const normalized: FranchiseItem[] = rows.map((r: any, idx: number) => ({
//         id: r.id ?? r._id ?? r.franchise_id ?? `srv-${idx}`,
//         name: r.name ?? r.franchise_name ?? "",
//         businessName: r.business_name ?? r.businessName ?? r.company ?? "",
//         address: r.address ?? r.location ?? "",
//         email: r.email ?? "",
//         phone: r.phone ?? r.contact_number ?? r.mobile ?? "",
//         amount: r.deposit_amount ?? r.amount ?? r.balance ?? r.due ?? "",
//         status: String(r.status ?? "active").toLowerCase(),
//         image_url: r.image_url ?? r.image ?? null,
//       }));

//       setFranchises(normalized);
//     } catch (err: any) {
//       console.error("Fetch franchises error:", err);
//       const msg = err?.response?.data?.message ?? err?.message ?? "Network error";
//       setListError(msg);
//       if (opts?.showErrorToast !== false) toast.error(`Failed to load franchises: ${msg}`);
//       setFranchises([]);
//     } finally {
//       setListLoading(false);
//     }
//   };

//   useEffect(() => {
//     void fetchFranchises();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- Create ----------
//   const createFranchise = async (payload: Partial<FranchiseForm>) => {
//     const formData = new FormData();
//     if (payload.name) formData.append("name", payload.name);
//     if (payload.businessName) formData.append("business_name", payload.businessName);
//     if (payload.address) formData.append("address", payload.address);
//     if (payload.email) formData.append("email", payload.email);
//     if (payload.phone) formData.append("phone", payload.phone);
//     if (payload.password) formData.append("password", payload.password);
//     if (payload.amount) formData.append("deposit_amount", payload.amount);
//     if (payload.imageFile) formData.append("image", payload.imageFile);

//     try {
//       // use axios onUploadProgress to show progress
//       const res = await api.post("/admin/franchise/add", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         //ts-ignore
//         onUploadProgress: (progressEvent: ProgressEvent) => {
//           if (progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             setUploadProgress(percent);
//             // small toast progress update (non-intrusive)
//             toast.dismiss("upload-progress");
//             toast.loading(`Uploading image... ${percent}%`, { id: "upload-progress" });
//           }
//         },
//       });

//       // clear progress toast
//       toast.dismiss("upload-progress");
//       setUploadProgress(null);

//       const parsed = res?.data ?? null;
//       if (parsed?.status === false) {
//         // server responded but with status false
//         const mapped = formatServerValidation(parsed);
//         if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
//         throw new Error(parsed?.message ?? "Create failed");
//       }

//       return parsed?.data ?? parsed?.franchise ?? parsed ?? null;
//     } catch (err: any) {
//       console.error("Create error:", err);
//       toast.dismiss("upload-progress");
//       setUploadProgress(null);

//       const serverMsg = err?.response?.data?.message ?? err?.message ?? "Create failed";
//       const validation = err?.response?.data?.errors ?? err?.response?.data?.validation ?? err?.response?.data ?? null;
//       if (validation) {
//         const mapped = formatServerValidation(validation);
//         if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
//       }
//       throw new Error(serverMsg);
//     }
//   };

//   // ---------- Update ----------
//   const updateFranchise = async (id: string | number, payload: Partial<FranchiseForm>) => {
//     const formData = new FormData();
//     if (payload.name) formData.append("name", payload.name);
//     if (payload.businessName) formData.append("business_name", payload.businessName);
//     if (payload.address) formData.append("address", payload.address);
//     if (payload.email) formData.append("email", payload.email);
//     if (payload.phone) formData.append("phone", payload.phone);
//     if (payload.password) formData.append("password", payload.password);
//     if (payload.amount) formData.append("deposit_amount", payload.amount);
//     if (payload.imageFile) formData.append("image", payload.imageFile);

//     try {
//       const res = await api.post(`/admin/franchise/update/${id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (progressEvent: ProgressEvent) => {
//           if (progressEvent.total) {
//             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             setUploadProgress(percent);
//             toast.dismiss("upload-progress");
//             toast.loading(`Uploading image... ${percent}%`, { id: "upload-progress" });
//           }
//         },
//       });

//       toast.dismiss("upload-progress");
//       setUploadProgress(null);

//       const parsed = res?.data ?? null;
//       if (parsed?.status === false) {
//         const mapped = formatServerValidation(parsed);
//         if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
//         throw new Error(parsed?.message ?? "Update failed");
//       }

//       return parsed?.data ?? parsed?.franchise ?? parsed ?? null;
//     } catch (err: any) {
//       console.error("Update error:", err);
//       toast.dismiss("upload-progress");
//       setUploadProgress(null);

//       const serverMsg = err?.response?.data?.message ?? err?.message ?? "Update failed";
//       const validation = err?.response?.data?.errors ?? err?.response?.data?.validation ?? err?.response?.data ?? null;
//       if (validation) {
//         const mapped = formatServerValidation(validation);
//         if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
//       }
//       throw new Error(serverMsg);
//     }
//   };

//   // ---------- Delete ----------
//   const deleteFranchiseApi = async (id: string | number) => {
//     try {
//       const res = await api.delete(`/admin/franchise/delete/${id}`);
//       const body = res?.data ?? null;
//       if (body?.status === false) throw new Error(body?.message ?? "Delete failed");
//       return true;
//     } catch (err: any) {
//       console.error("Delete franchise error:", err);
//       throw new Error(err?.response?.data?.message ?? err?.message ?? "Delete failed");
//     }
//   };

//   // ---------- UI helpers ----------
//   const openDrawerForCreate = () => {
//     setForm(initialForm);
//     setErrors({});
//     setEditingId(null);
//     setIsDrawerOpen(true);
//   };

//   const openDrawerForEdit = async (item: FranchiseItem) => {
//     setErrors({});
//     setEditingId(item.id);
//     setIsDrawerOpen(true);

//     try {
//       const res = await api.get(`/admin/franchise/show/${item.id}`);
//       const body = res?.data ?? null;
//       const data = body?.data ?? body?.franchise ?? body ?? null;
//       if (data) {
//         setForm({
//           name: data.name ?? data.franchise_name ?? item.name ?? "",
//           businessName: data.business_name ?? data.businessName ?? item.businessName ?? "",
//           address: data.address ?? item.address ?? "",
//           email: data.email ?? item.email ?? "",
//           phone: data.phone ?? item.phone ?? "",
//           amount: (data.deposit_amount ?? data.amount ?? item.amount ?? "") + "",
//           imageFile: null,
//           password: "",
//         });
//       }
//     } catch (err) {
//       console.warn("Could not fetch detail for edit:", err);
//     }
//   };

//   const closeDrawer = () => {
//     setIsDrawerOpen(false);
//     setTimeout(() => {
//       setForm(initialForm);
//       setErrors({});
//       setEditingId(null);
//     }, 200);
//   };

//   const handleChange =
//     (k: keyof FranchiseForm) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//       const value = (e.target as HTMLInputElement).value;
//       setForm((s) => ({ ...s, [k]: value }));
//       setErrors((err) => ({ ...err, [k]: undefined }));
//     };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files && e.target.files[0];
//     setForm((s) => ({ ...s, imageFile: file || null }));
//     setErrors((err) => ({ ...err, imageFile: undefined }));
//   };

//   // ---------- Submit ----------
//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();

//     if (!validate()) {
//       toast.error("Please fix the highlighted errors.");
//       return;
//     }

//     const payload: Partial<FranchiseForm> = {
//       name: form.name.trim(),
//       businessName: form.businessName.trim(),
//       address: form.address.trim(),
//       email: form.email.trim(),
//       phone: form.phone.trim(),
//       ...(form.password.trim() ? { password: form.password.trim() } : {}),
//       amount: form.amount.trim(),
//       imageFile: form.imageFile ?? undefined,
//     };

//     setLoading(true);
//     setUploadProgress(null);

//     if (!editingId) {
//       // optimistic UI
//       const prevList = [...franchises];
//       const optimisticId = `tmp-${Date.now()}`;
//       const optimisticItem: FranchiseItem = {
//         id: optimisticId,
//         name: payload.name ?? "",
//         businessName: payload.businessName ?? "",
//         address: payload.address ?? "",
//         email: payload.email ?? "",
//         phone: payload.phone ?? "",
//         amount: payload.amount ?? "",
//         status: "active",
//       };
//       setFranchises((prev) => [optimisticItem, ...prev]);
//       setIsDrawerOpen(false);

//       try {
//         const created = await createFranchise(payload);
//         setFranchises((prev) => {
//           const withoutOptimistic = prev.filter((p) => p.id !== optimisticId);
//           const newItem: FranchiseItem = {
//             id: created?.id ?? created?._id ?? created?.franchise_id ?? Date.now(),
//             name: created?.name ?? created?.franchise_name ?? payload.name ?? "",
//             businessName: created?.business_name ?? created?.businessName ?? payload.businessName ?? "",
//             address: created?.address ?? payload.address ?? "",
//             email: created?.email ?? payload.email ?? "",
//             phone: created?.phone ?? payload.phone ?? "",
//             amount: created?.deposit_amount ?? created?.amount ?? payload.amount ?? "",
//             status: String(created?.status ?? "active").toLowerCase(),
//             image_url: created?.image_url ?? created?.image ?? null,
//           };
//           toast.success("Franchise created");
//           return [newItem, ...withoutOptimistic];
//         });
//         setForm(initialForm);
//         setErrors({});
//       } catch (err: any) {
//         setFranchises(prevList);
//         console.error("Create franchise error:", err);
//         toast.error(err?.message || "Failed to create franchise");
//         setIsDrawerOpen(true);
//       } finally {
//         setLoading(false);
//         setUploadProgress(null);
//       }
//     } else {
//       // update
//       const idToUpdate = editingId;
//       setIsDrawerOpen(false);
//       const prevSnapshot = [...franchises];
//       setFranchises((prev) => prev.map((p) => (String(p.id) === String(idToUpdate) ? ({ ...p, ...payload } as FranchiseItem) : p)));

//       try {
//         const updated = await updateFranchise(idToUpdate, payload);
//         setFranchises((prev) =>
//           prev.map((p) =>
//             String(p.id) === String(idToUpdate)
//               ? {
//                   id: updated?.id ?? updated?._id ?? updated?.franchise_id ?? p.id,
//                   name: updated?.name ?? updated?.franchise_name ?? payload.name ?? p.name,
//                   businessName: updated?.business_name ?? updated?.businessName ?? payload.businessName ?? p.businessName,
//                   address: updated?.address ?? payload.address ?? p.address,
//                   email: updated?.email ?? payload.email ?? p.email,
//                   phone: updated?.phone ?? payload.phone ?? p.phone,
//                   amount: updated?.deposit_amount ?? updated?.amount ?? payload.amount ?? p.amount,
//                   status: String(updated?.status ?? p.status ?? "active").toLowerCase(),
//                   image_url: updated?.image_url ?? updated?.image ?? p.image_url ?? null,
//                 }
//               : p
//           )
//         );
//         toast.success("Franchise updated");
//         setForm(initialForm);
//         setErrors({});
//       } catch (err: any) {
//         console.error("Update franchise error:", err);
//         setFranchises(prevSnapshot);
//         toast.error(err?.message || "Failed to update franchise");
//         setIsDrawerOpen(true);
//       } finally {
//         setLoading(false);
//         setUploadProgress(null);
//         setEditingId(null);
//       }
//     }
//   };

//   // ---------- Delete ----------
//   const handleDelete = async (id: string | number) => {
//     const yes = window.confirm("Delete this franchise? This action cannot be undone.");
//     if (!yes) return;
//     const prevSnapshot = [...franchises];
//     setFranchises((prev) => prev.filter((f) => String(f.id) !== String(id)));
//     try {
//       await deleteFranchiseApi(id);
//       toast.success("Franchise deleted");
//     } catch (err: any) {
//       console.error("Delete franchise error:", err);
//       setFranchises(prevSnapshot);
//       toast.error(err?.message || "Failed to delete franchise");
//     }
//   };

//   // ---------- Render ----------
//   return (
//     <div className="p-4 md:p-6 space-y-6">
//       <Toaster position="top-right" />

//       <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
//         <div className="flex-1 min-w-0">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 truncate">Franchise</h1>
//         </div>

//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//           <div className="flex items-center justify-end sm:justify-center gap-2">
//             <Button onClick={() => void fetchFranchises({ showErrorToast: true })} className="flex items-center gap-2">
//               <RefreshCw className="w-4 h-4" />
//               {listLoading ? <><Spinner size={14} /> Refreshing...</> : "Refresh"}
//             </Button>

//             <Button onClick={openDrawerForCreate} className="flex items-center gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0" aria-haspopup="dialog">
//               <PlusCircle className="w-4 h-4" />
//               Add Franchise
//             </Button>
//           </div>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Franchise Branches</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {listLoading ? (
//             <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center gap-3">
//               <Spinner />
//               <div>Loading franchises…</div>
//             </div>
//           ) : listError ? (
//             <div className="p-6 text-center text-sm text-red-600">
//               {listError} — <button className="underline" onClick={() => void fetchFranchises()}>Retry</button>
//             </div>
//           ) : (
//             <>
//               <div className="hidden md:block w-full overflow-x-auto">
//                 <table className="w-full text-sm text-left border-collapse">
//                   <thead>
//                     <tr className="border-b">
//                       <th className="py-2 px-3">Name</th>
//                       <th className="py-2 px-3">Business</th>
//                       <th className="py-2 px-3">Address</th>
//                       <th className="py-2 px-3">Email</th>
//                       <th className="py-2 px-3">Phone</th>
//                       <th className="py-2 px-3">Amount</th>
//                       <th className="py-2 px-3">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {franchises.map((f) => (
//                       <tr key={String(f.id)} className="border-b hover:bg-gray-50">
//                         <td className="py-2 px-3">{f.name}</td>
//                         <td className="py-2 px-3">{f.businessName}</td>
//                         <td className="py-2 px-3 truncate max-w-[220px]">{f.address}</td>
//                         <td className="py-2 px-3">{f.email}</td>
//                         <td className="py-2 px-3">{f.phone}</td>
//                         <td className="py-2 px-3">{f.amount || "-"}</td>
//                         <td className="py-2 px-3">
//                           <div className="flex gap-2">
//                             <Button variant="outline" onClick={() => openDrawerForEdit(f)}><Edit3 className="w-4 h-4" /></Button>
//                             <Button variant="destructive" onClick={() => handleDelete(f.id)}><Trash2 className="w-4 h-4" /></Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="md:hidden space-y-3">
//                 {franchises.map((f) => (
//                   <div key={String(f.id)} className="border rounded-lg p-3 bg-white shadow-sm">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2">
//                           <h3 className="text-sm font-medium truncate">{f.name}</h3>
//                           <span className={`text-xs font-semibold px-2 py-0.5 rounded ${f.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
//                             {f.status === "active" ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         <p className="text-xs text-slate-500 mt-1 truncate">{f.businessName}</p>
//                         <p className="text-xs text-slate-500 mt-1 truncate">{f.address}</p>
//                         <p className="text-xs text-slate-500 mt-1">Phone: {f.phone}</p>
//                         <p className="text-xs text-slate-500 mt-1">Email: {f.email}</p>
//                       </div>

//                       <div className="flex flex-col gap-2 items-end">
//                         <div className="flex gap-2">
//                           <Button variant="outline" size="sm" onClick={() => openDrawerForEdit(f)}>Edit</Button>
//                           <Button variant="destructive" size="sm" onClick={() => handleDelete(f.id)}>Delete</Button>
//                         </div>
//                         <div className="text-xs text-slate-400">Amount: {f.amount || "-"}</div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       {/* Drawer overlay */}
//       <div className={`fixed inset-0 z-40 transition-opacity ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isDrawerOpen}>
//         <div onClick={closeDrawer} className={`absolute inset-0 bg-black/40 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`} />
//       </div>

//       {/* Drawer panel */}
//       <aside
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="drawer-title"
//         className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] transform transition-transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
//       >
//         <div className="h-full flex flex-col bg-white shadow-xl">
//           <div className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center gap-3">
//               <div className="rounded-md bg-gray-100 p-2">
//                 <Building2 className="w-5 h-5" />
//               </div>
//               <div>
//                 <h2 id="drawer-title" className="text-lg font-medium">{editingId ? "Edit Franchise" : "Add Franchise"}</h2>
//                 <p className="text-sm text-gray-500">{editingId ? "Update franchise details." : "Fill details to add a new franchise."}</p>
//               </div>
//             </div>
//             <button onClick={closeDrawer} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit} data-testid="franchise-drawer-form">
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
//                 <input id="name" value={form.name} onChange={handleChange("name")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
//               </div>

//               <div>
//                 <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
//                 <input id="businessName" value={form.businessName} onChange={handleChange("businessName")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.businessName && <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>}
//               </div>

//               <div>
//                 <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
//                 <textarea id="address" value={form.address} onChange={handleChange("address")} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//                   <input id="email" type="email" value={form.email} onChange={handleChange("email")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                   {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
//                 </div>

//                 <div>
//                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
//                   <input id="phone" value={form.phone} onChange={handleChange("phone")} placeholder="+919876543210" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                   {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password {editingId ? <span className="text-xs text-gray-400">(leave blank to keep)</span> : null}</label>
//                 <input id="password" type="password" value={form.password} onChange={handleChange("password")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
//               </div>

//               <div>
//                 <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Deposit Amount</label>
//                 <input id="amount" value={form.amount} onChange={handleChange("amount")} placeholder="e.g. 1000 or 99.99" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
//               </div>

//               <div>
//                 <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image {editingId ? <span className="text-xs text-gray-400">(optional)</span> : <span className="text-xs text-red-500">(required)</span>}</label>
//                 <input id="image" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-600" />
//                 {form.imageFile && <p className="text-xs text-slate-500 mt-1">Selected: {form.imageFile.name}</p>}
//                 {errors.imageFile && <p className="text-sm text-red-600 mt-1">{errors.imageFile}</p>}
//                 {uploadProgress !== null && (
//                   <div className="mt-2">
//                     <div className="h-2 bg-gray-200 rounded overflow-hidden">
//                       <div style={{ width: `${uploadProgress}%` }} className="h-full bg-indigo-600 transition-all" />
//                     </div>
//                     <div className="text-xs text-slate-500 mt-1">{uploadProgress}%</div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
//               <Button variant="ghost" onClick={closeDrawer} type="button">Cancel</Button>
//               <Button type="submit" disabled={loading}>
//                 {loading ? <span className="flex items-center gap-2"><Spinner /> {editingId ? "Saving..." : "Adding..."}</span> : (editingId ? "Save Changes" : "Add Franchise")}
//               </Button>
//             </div>
//           </form>
//         </div>
//       </aside>
//     </div>
//   );
// };

// export default Franchise;

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, RefreshCw, Edit3, Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../src/api/axios";

type FranchiseForm = {
  name: string;
  businessName: string;
  address: string;
  email: string;
  phone: string;
  password: string;
  amount: string;
  imageFile?: File | null;
};

const initialForm: FranchiseForm = {
  name: "",
  businessName: "",
  address: "",
  email: "",
  phone: "",
  password: "",
  amount: "",
  imageFile: null,
};

type FranchiseItem = {
  id: string | number;
  name: string;
  businessName: string;
  address: string;
  email: string;
  phone: string;
  amount?: string;
  status?: string;
  image_url?: string | null;
};

const Spinner = ({ size = 16 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const formatServerValidation = (payload: any) => {
  const out: Partial<Record<keyof FranchiseForm, string>> = {};
  if (!payload) return out;
  const errors = payload.errors ?? payload.validation ?? payload;
  if (typeof errors === "object") {
    for (const k of Object.keys(errors)) {
      const v = errors[k];
      const msg = Array.isArray(v) ? v.join(" ") : String(v);
      const key = k.toLowerCase();
      if (key.includes("name")) out.name = msg;
      else if (key.includes("business") || key.includes("company")) out.businessName = msg;
      else if (key.includes("address")) out.address = msg;
      else if (key.includes("email")) out.email = msg;
      else if (key.includes("phone") || key.includes("mobile") || key.includes("contact")) out.phone = msg;
      else if (key.includes("password")) out.password = msg;
      else if (key.includes("amount") || key.includes("deposit")) out.amount = msg;
      else if (key.includes("image")) out.imageFile = msg;
    }
  } else if (typeof errors === "string") {
    out.name = errors;
  }
  return out;
};

const Franchise: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<FranchiseForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});
  const [loading, setLoading] = useState(false);

  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // --- Search & Pagination state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // debounce the search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // validation
  const validate = (): boolean => {
    const err: Partial<Record<keyof FranchiseForm, string>> = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.businessName.trim()) err.businessName = "Business name is required";
    if (!form.address.trim()) err.address = "Address is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = "Invalid email";
    if (!form.phone.trim()) err.phone = "Phone is required";
    else if (!/^\+?\d{7,15}$/.test(form.phone.trim())) err.phone = "Invalid phone number";
    if (!editingId && !form.password.trim()) err.password = "Password is required";
    else if (form.password && form.password.trim() && form.password.trim().length < 6)
      err.password = "Password must be at least 6 characters";
    if (!form.amount.trim()) err.amount = "Amount is required";
    else if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim())) err.amount = "Enter a valid amount (e.g. 100 or 99.99)";
    if (!editingId && !form.imageFile) err.imageFile = "Image is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---------- fetch list ----------
  const fetchFranchises = async (opts?: { showErrorToast?: boolean }) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await api.get("/admin/franchise");
      const body = res?.data ?? null;
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else if (Array.isArray(body.franchises)) rows = body.franchises;
      else if (Array.isArray(body.rows)) rows = body.rows;
      else rows = [];

      const normalized: FranchiseItem[] = rows.map((r: any, idx: number) => ({
        id: r.id ?? r._id ?? r.franchise_id ?? `srv-${idx}`,
        name: r.name ?? r.franchise_name ?? "",
        businessName: r.business_name ?? r.businessName ?? r.company ?? "",
        address: r.address ?? r.location ?? "",
        email: r.email ?? "",
        phone: r.phone ?? r.contact_number ?? r.mobile ?? "",
        amount: r.deposit_amount ?? r.amount ?? r.balance ?? r.due ?? "",
        status: String(r.status ?? "active").toLowerCase(),
        image_url: r.image_url ?? r.image ?? null,
      }));

      setFranchises(normalized);
    } catch (err: any) {
      console.error("Fetch franchises error:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Network error";
      setListError(msg);
      if (opts?.showErrorToast !== false) toast.error(`Failed to load franchises: ${msg}`);
      setFranchises([]);
    } finally {
      setListLoading(false);
      // reset to first page after fetch
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    void fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Create / Update / Delete (kept your implementation) ----------
  const createFranchise = async (payload: Partial<FranchiseForm>) => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.businessName) formData.append("business_name", payload.businessName);
    if (payload.address) formData.append("address", payload.address);
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.password) formData.append("password", payload.password);
    if (payload.amount) formData.append("deposit_amount", payload.amount);
    if (payload.imageFile) formData.append("image", payload.imageFile);

    try {
      const res = await api.post("/admin/franchise/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        //ts-ignore
        onUploadProgress: (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
            toast.dismiss("upload-progress");
            toast.loading(`Uploading image... ${percent}%`, { id: "upload-progress" });
          }
        },
      });

      toast.dismiss("upload-progress");
      setUploadProgress(null);

      const parsed = res?.data ?? null;
      if (parsed?.status === false) {
        const mapped = formatServerValidation(parsed);
        if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
        throw new Error(parsed?.message ?? "Create failed");
      }

      return parsed?.data ?? parsed?.franchise ?? parsed ?? null;
    } catch (err: any) {
      console.error("Create error:", err);
      toast.dismiss("upload-progress");
      setUploadProgress(null);

      const serverMsg = err?.response?.data?.message ?? err?.message ?? "Create failed";
      const validation = err?.response?.data?.errors ?? err?.response?.data?.validation ?? err?.response?.data ?? null;
      if (validation) {
        const mapped = formatServerValidation(validation);
        if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
      }
      throw new Error(serverMsg);
    }
  };

  const updateFranchise = async (id: string | number, payload: Partial<FranchiseForm>) => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.businessName) formData.append("business_name", payload.businessName);
    if (payload.address) formData.append("address", payload.address);
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.password) formData.append("password", payload.password);
    if (payload.amount) formData.append("deposit_amount", payload.amount);
    if (payload.imageFile) formData.append("image", payload.imageFile);

    try {
      const res = await api.post(`/admin/franchise/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
            toast.dismiss("upload-progress");
            toast.loading(`Uploading image... ${percent}%`, { id: "upload-progress" });
          }
        },
      });

      toast.dismiss("upload-progress");
      setUploadProgress(null);

      const parsed = res?.data ?? null;
      if (parsed?.status === false) {
        const mapped = formatServerValidation(parsed);
        if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
        throw new Error(parsed?.message ?? "Update failed");
      }

      return parsed?.data ?? parsed?.franchise ?? parsed ?? null;
    } catch (err: any) {
      console.error("Update error:", err);
      toast.dismiss("upload-progress");
      setUploadProgress(null);

      const serverMsg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      const validation = err?.response?.data?.errors ?? err?.response?.data?.validation ?? err?.response?.data ?? null;
      if (validation) {
        const mapped = formatServerValidation(validation);
        if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
      }
      throw new Error(serverMsg);
    }
  };

  const deleteFranchiseApi = async (id: string | number) => {
    try {
      const res = await api.delete(`/admin/franchise/delete/${id}`);
      const body = res?.data ?? null;
      if (body?.status === false) throw new Error(body?.message ?? "Delete failed");
      return true;
    } catch (err: any) {
      console.error("Delete franchise error:", err);
      throw new Error(err?.response?.data?.message ?? err?.message ?? "Delete failed");
    }
  };

  // ---------- UI helpers ----------
  const openDrawerForCreate = () => {
    setForm(initialForm);
    setErrors({});
    setEditingId(null);
    setIsDrawerOpen(true);
  };

  const openDrawerForEdit = async (item: FranchiseItem) => {
    setErrors({});
    setEditingId(item.id);
    setIsDrawerOpen(true);

    try {
      const res = await api.get(`/admin/franchise/show/${item.id}`);
      const body = res?.data ?? null;
      const data = body?.data ?? body?.franchise ?? body ?? null;
      if (data) {
        setForm({
          name: data.name ?? data.franchise_name ?? item.name ?? "",
          businessName: data.business_name ?? data.businessName ?? item.businessName ?? "",
          address: data.address ?? item.address ?? "",
          email: data.email ?? item.email ?? "",
          phone: data.phone ?? item.phone ?? "",
          amount: (data.deposit_amount ?? data.amount ?? item.amount ?? "") + "",
          imageFile: null,
          password: "",
        });
      }
    } catch (err) {
      console.warn("Could not fetch detail for edit:", err);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setForm(initialForm);
      setErrors({});
      setEditingId(null);
    }, 200);
  };

  const handleChange = (k: keyof FranchiseForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = (e.target as HTMLInputElement).value;
    setForm((s) => ({ ...s, [k]: value }));
    setErrors((err) => ({ ...err, [k]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setForm((s) => ({ ...s, imageFile: file || null }));
    setErrors((err) => ({ ...err, imageFile: undefined }));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    const payload: Partial<FranchiseForm> = {
      name: form.name.trim(),
      businessName: form.businessName.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
      amount: form.amount.trim(),
      imageFile: form.imageFile ?? undefined,
    };

    setLoading(true);
    setUploadProgress(null);

    if (!editingId) {
      const prevList = [...franchises];
      const optimisticId = `tmp-${Date.now()}`;
      const optimisticItem: FranchiseItem = {
        id: optimisticId,
        name: payload.name ?? "",
        businessName: payload.businessName ?? "",
        address: payload.address ?? "",
        email: payload.email ?? "",
        phone: payload.phone ?? "",
        amount: payload.amount ?? "",
        status: "active",
      };
      setFranchises((prev) => [optimisticItem, ...prev]);
      setIsDrawerOpen(false);

      try {
        const created = await createFranchise(payload);
        setFranchises((prev) => {
          const withoutOptimistic = prev.filter((p) => p.id !== optimisticId);
          const newItem: FranchiseItem = {
            id: created?.id ?? created?._id ?? created?.franchise_id ?? Date.now(),
            name: created?.name ?? created?.franchise_name ?? payload.name ?? "",
            businessName: created?.business_name ?? created?.businessName ?? payload.businessName ?? "",
            address: created?.address ?? payload.address ?? "",
            email: created?.email ?? payload.email ?? "",
            phone: created?.phone ?? payload.phone ?? "",
            amount: created?.deposit_amount ?? created?.amount ?? payload.amount ?? "",
            status: String(created?.status ?? "active").toLowerCase(),
            image_url: created?.image_url ?? created?.image ?? null,
          };
          toast.success("Franchise created");
          return [newItem, ...withoutOptimistic];
        });
        setForm(initialForm);
        setErrors({});
      } catch (err: any) {
        setFranchises(prevList);
        console.error("Create franchise error:", err);
        toast.error(err?.message || "Failed to create franchise");
        setIsDrawerOpen(true);
      } finally {
        setLoading(false);
        setUploadProgress(null);
      }
    } else {
      const idToUpdate = editingId;
      setIsDrawerOpen(false);
      const prevSnapshot = [...franchises];
      setFranchises((prev) => prev.map((p) => (String(p.id) === String(idToUpdate) ? ({ ...p, ...payload } as FranchiseItem) : p)));

      try {
        const updated = await updateFranchise(idToUpdate, payload);
        setFranchises((prev) =>
          prev.map((p) =>
            String(p.id) === String(idToUpdate)
              ? {
                  id: updated?.id ?? updated?._id ?? updated?.franchise_id ?? p.id,
                  name: updated?.name ?? updated?.franchise_name ?? payload.name ?? p.name,
                  businessName: updated?.business_name ?? updated?.businessName ?? payload.businessName ?? p.businessName,
                  address: updated?.address ?? payload.address ?? p.address,
                  email: updated?.email ?? payload.email ?? p.email,
                  phone: updated?.phone ?? payload.phone ?? p.phone,
                  amount: updated?.deposit_amount ?? updated?.amount ?? payload.amount ?? p.amount,
                  status: String(updated?.status ?? p.status ?? "active").toLowerCase(),
                  image_url: updated?.image_url ?? updated?.image ?? p.image_url ?? null,
                }
              : p
          )
        );
        toast.success("Franchise updated");
        setForm(initialForm);
        setErrors({});
      } catch (err: any) {
        console.error("Update franchise error:", err);
        setFranchises(prevSnapshot);
        toast.error(err?.message || "Failed to update franchise");
        setIsDrawerOpen(true);
      } finally {
        setLoading(false);
        setUploadProgress(null);
        setEditingId(null);
      }
    }
  };

  const handleDelete = async (id: string | number) => {
    const yes = window.confirm("Delete this franchise? This action cannot be undone.");
    if (!yes) return;
    const prevSnapshot = [...franchises];
    setFranchises((prev) => prev.filter((f) => String(f.id) !== String(id)));
    try {
      await deleteFranchiseApi(id);
      toast.success("Franchise deleted");
    } catch (err: any) {
      console.error("Delete franchise error:", err);
      setFranchises(prevSnapshot);
      toast.error(err?.message || "Failed to delete franchise");
    }
  };

  // ---------- Search & Pagination helpers ----------
  const filtered = useMemo(() => {
    if (!debouncedQuery) return franchises;
    const q = debouncedQuery;
    return franchises.filter((f) => {
      return (
        (f.name || "").toLowerCase().includes(q) ||
        (f.businessName || "").toLowerCase().includes(q) ||
        (f.address || "").toLowerCase().includes(q) ||
        (f.email || "").toLowerCase().includes(q) ||
        (f.phone || "").toLowerCase().includes(q)
      );
    });
  }, [franchises, debouncedQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  // ensure current page within range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const changePage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageButtons = () => {
    // show up to 7 numeric buttons with ellipsis
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

    // large number of pages -> show first, last, neighbors
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
        <span key={`e-${idx}`} className="px-2 text-sm text-slate-500">
          …
        </span>
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

  // ---------- Render ----------
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 truncate">Franchise</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="search" className="sr-only">Search franchises</label>
            <input
              id="search"
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, business, address, email or phone..."
              className="w-full sm:w-80 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button onClick={() => void fetchFranchises({ showErrorToast: true })} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {listLoading ? (
                <>
                  <Spinner size={14} /> Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Button>

            <Button onClick={openDrawerForCreate} className="flex items-center gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0" aria-haspopup="dialog">
              <PlusCircle className="w-4 h-4" />
              Add Franchise
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
            <CardTitle>Franchise Branches</CardTitle>

            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-500 mr-2 hidden sm:inline">Show</div>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border px-2 py-1"
                aria-label="Items per page"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {listLoading ? (
            <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center gap-3">
              <Spinner />
              <div>Loading franchises…</div>
            </div>
          ) : listError ? (
            <div className="p-6 text-center text-sm text-red-600">
              {listError} —{" "}
              <button className="underline" onClick={() => void fetchFranchises()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems || 0)}</span>{" "}
                  to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                  <span className="font-medium">{totalItems}</span> results
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2">{renderPageButtons()}</div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-3 py-1 rounded bg-white border disabled:opacity-50"
                      aria-label="Previous page"
                    >
                      Prev
                    </button>
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

              {/* Desktop table */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Business</th>
                      <th className="py-2 px-3">Address</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((f) => (
                      <tr key={String(f.id)} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{f.name}</td>
                        <td className="py-2 px-3">{f.businessName}</td>
                        <td className="py-2 px-3 truncate max-w-[220px]">{f.address}</td>
                        <td className="py-2 px-3">{f.email}</td>
                        <td className="py-2 px-3">{f.phone}</td>
                        <td className="py-2 px-3">{f.amount || "-"}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => openDrawerForEdit(f)}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" onClick={() => handleDelete(f.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {pageData.map((f) => (
                  <div key={String(f.id)} className="border rounded-lg p-3 bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium truncate">{f.name}</h3>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${f.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                          >
                            {f.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{f.businessName}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">{f.address}</p>
                        <p className="text-xs text-slate-500 mt-1">Phone: {f.phone}</p>
                        <p className="text-xs text-slate-500 mt-1">Email: {f.email}</p>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openDrawerForEdit(f)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(f.id)}>
                            Delete
                          </Button>
                        </div>
                        <div className="text-xs text-slate-400">Amount: {f.amount || "-"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* bottom pagination for mobile */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 rounded bg-white border disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1 rounded bg-white border disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Drawer overlay */}
      <div className={`fixed inset-0 z-40 transition-opacity ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isDrawerOpen}>
        <div onClick={closeDrawer} className={`absolute inset-0 bg-black/40 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`} />
      </div>

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] transform transition-transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-gray-100 p-2">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 id="drawer-title" className="text-lg font-medium">
                  {editingId ? "Edit Franchise" : "Add Franchise"}
                </h2>
                <p className="text-sm text-gray-500">{editingId ? "Update franchise details." : "Fill details to add a new franchise."}</p>
              </div>
            </div>
            <button onClick={closeDrawer} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit} data-testid="franchise-drawer-form">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input id="name" value={form.name} onChange={handleChange("name")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input id="businessName" value={form.businessName} onChange={handleChange("businessName")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.businessName && <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea id="address" value={form.address} onChange={handleChange("address")} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input id="email" type="email" value={form.email} onChange={handleChange("email")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input id="phone" value={form.phone} onChange={handleChange("phone")} placeholder="+919876543210" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password {editingId ? <span className="text-xs text-gray-400">(leave blank to keep)</span> : null}
                </label>
                <input id="password" type="password" value={form.password} onChange={handleChange("password")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Deposit Amount
                </label>
                <input id="amount" value={form.amount} onChange={handleChange("amount")} placeholder="e.g. 1000 or 99.99" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Image {editingId ? <span className="text-xs text-gray-400">(optional)</span> : <span className="text-xs text-red-500">(required)</span>}
                </label>
                <input id="image" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-600" />
                {form.imageFile && <p className="text-xs text-slate-500 mt-1">Selected: {form.imageFile.name}</p>}
                {errors.imageFile && <p className="text-sm text-red-600 mt-1">{errors.imageFile}</p>}
                {uploadProgress !== null && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                      <div style={{ width: `${uploadProgress}%` }} className="h-full bg-indigo-600 transition-all" />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{uploadProgress}%</div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeDrawer} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> {editingId ? "Saving..." : "Adding..."}
                  </span>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Add Franchise"
                )}
              </Button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Franchise;









