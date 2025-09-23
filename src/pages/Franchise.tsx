
// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Building2, BarChart3, X, RefreshCw } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// type FranchiseForm = {
//   franchise_name: string;
//   location: string;
//   owner_name: string;
//   contact_number: string;
//   email: string;
//   status: "active" | "inactive";
//   address: string;
//   gst_tax_id?: string;
//   bank_account?: string;
//   latitude?: string;
//   longitude?: string;
// };

// const initialForm: FranchiseForm = {
//   franchise_name: "",
//   location: "",
//   owner_name: "",
//   contact_number: "",
//   email: "",
//   status: "active",
//   address: "",
//   gst_tax_id: "",
//   bank_account: "",
//   latitude: "",
//   longitude: "",
// };

// // your API base (already in your code)
// const API_URL = "http://192.168.29.102:5000/api/franchises";

// const Franchise: React.FC = () => {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [form, setForm] = useState<FranchiseForm>(initialForm);
//   const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});
//   const [loading, setLoading] = useState(false); // submission loading
//   const [geoLoading, setGeoLoading] = useState(false); // reverse geocode

//   // list state (now fetched via GET)
//   const [franchises, setFranchises] = useState<
//     Array<{ id: number | string; franchise_name: string; location: string; owner_name: string; status: string }>
//   >([]);
//   const [listLoading, setListLoading] = useState<boolean>(false);
//   const [listError, setListError] = useState<string | null>(null);

//   // helper to open/close drawer
//   const openDrawer = () => {
//     setForm(initialForm);
//     setErrors({});
//     setIsDrawerOpen(true);
//   };
//   const closeDrawer = () => setIsDrawerOpen(false);

//   const handleChange =
//     (k: keyof FranchiseForm) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//       const value = (e.target as HTMLInputElement).value;
//       setForm((s) => ({ ...s, [k]: value }));
//       setErrors((err) => ({ ...err, [k]: undefined }));
//     };

//   const validate = (): boolean => {
//     const err: Partial<Record<keyof FranchiseForm, string>> = {};
//     if (!form.franchise_name || !form.franchise_name.trim()) err.franchise_name = "Franchise name is required";
//     if (!form.location || !form.location.trim()) err.location = "Location is required";
//     if (!form.owner_name || !form.owner_name.trim()) err.owner_name = "Owner name is required";
//     if (!form.contact_number || !form.contact_number.trim()) err.contact_number = "Contact number is required";
//     if (form.contact_number && !/^\+?\d{7,15}$/.test(form.contact_number)) err.contact_number = "Invalid contact number";
//     if (!form.email || !form.email.trim()) err.email = "Email is required";
//     if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
//     if (!form.address || !form.address.trim()) err.address = "Address is required";
//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

//   // ------------------ GET franchises from API ------------------
//   const fetchFranchises = async (opts?: { showErrorToast?: boolean }) => {
//     setListLoading(true);
//     setListError(null);

//     // allow token from localStorage if used
//     const token = localStorage.getItem("token");

//     const controller = new AbortController();
//     const signal = controller.signal;

//     try {
//       const res = await fetch(API_URL, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         signal,
//       });

//       if (!res.ok) {
//         let errTxt = `Failed to load (${res.status})`;
//         try {
//           const body = await res.json().catch(() => null);
//           if (body && (body.message || body.error)) errTxt = body.message || body.error;
//         } catch {}
//         setListError(errTxt);
//         if (opts?.showErrorToast !== false) toast.error(`Failed to load franchises: ${errTxt}`);
//         // keep fallback empty list
//         setFranchises([]);
//         return;
//       }

//       const body = await res.json().catch(() => null);

//       // the server shape may vary. try common shapes:
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.rows)) rows = body.rows;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else if (Array.isArray(body.franchises)) rows = body.franchises;
//       else if (Array.isArray(body.franchise)) rows = body.franchise;
//       else if (body && body.data && Array.isArray(body.data.rows)) rows = body.data.rows;
//       else rows = [];

//       // normalize rows into the simple shape used by UI
//       const normalized = rows.map((r: any, idx: number) => ({
//         id: r.id ?? r._id ?? r.franchise_id ?? `srv-${idx}`,
//         franchise_name: r.franchise_name ?? r.name ?? r.title ?? "Unnamed",
//         location: r.location ?? r.address ?? r.city ?? "-",
//         owner_name: r.owner_name ?? r.owner ?? r.contact_name ?? "-",
//         status: (r.status ?? "active").toLowerCase(),
//       }));

//       setFranchises(normalized);
//     } catch (err: any) {
//       if (err?.name === "AbortError") {
//         // ignore abort
//         return;
//       }
//       console.error("Fetch franchises error:", err);
//       setListError("Network error");
//       toast.error("Network error while loading franchises");
//       setFranchises([]);
//     } finally {
//       setListLoading(false);
//     }

//     // no explicit return of controller, we do not expose it here.
//   };

//   useEffect(() => {
//     void fetchFranchises();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ------------------ POST (create) franchise (your previous code, slightly adapted) ------------------
//   const handleSubmit = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!validate()) {
//       toast.error("Please fix the highlighted errors and try again.");
//       return;
//     }

//     const payload = {
//       franchise_name: form.franchise_name.trim(),
//       location: form.location.trim(),
//       owner_name: form.owner_name.trim(),
//       contact_number: form.contact_number.trim(),
//       email: form.email.trim(),
//       status: form.status,
//       address: form.address.trim(),
//       gst_tax_id: form.gst_tax_id?.trim() || null,
//       bank_account: form.bank_account?.trim() || null,
//       latitude: form.latitude?.trim() || null,
//       longitude: form.longitude?.trim() || null,
//     };

//     const optimisticId = `tmp-${Date.now()}`;
//     const optimisticItem = {
//       id: optimisticId,
//       franchise_name: payload.franchise_name,
//       location: payload.location,
//       owner_name: payload.owner_name,
//       status: payload.status,
//     };
//     setFranchises((prev) => [optimisticItem, ...prev]);
//     setIsDrawerOpen(false);
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         setFranchises((prev) => prev.filter((f) => f.id !== optimisticId));
//         let errText = `Server error (${res.status})`;
//         try {
//           const errBody = await res.json();
//           if (errBody && (errBody.message || errBody.error || errBody.errors)) {
//             errText = errBody.message || errBody.error || JSON.stringify(errBody.errors);
//           } else {
//             errText = JSON.stringify(errBody);
//           }
//         } catch {
//           try {
//             const txt = await res.text();
//             if (txt) errText = txt;
//           } catch {}
//         }
//         console.error("Failed to create franchise:", errText);
//         toast.error(`Failed to create franchise: ${errText}`);
//         setLoading(false);
//         return;
//       }

//       const body = await res.json().catch(() => null);
//       const created = body && (body.row ?? body.data ?? body.franchise ?? body);

//       if (created) {
//         setFranchises((prev) => {
//           const withoutOptimistic = prev.filter((f) => f.id !== optimisticId);
//           const newItem = {
//             id: created.id ?? created.franchise_id ?? created.franchiseId ?? created._id ?? Date.now(),
//             franchise_name: created.franchise_name ?? created.name ?? payload.franchise_name,
//             location: created.location ?? payload.location,
//             owner_name: created.owner_name ?? created.owner ?? payload.owner_name,
//             status: created.status ?? payload.status,
//           };
//           return [newItem, ...withoutOptimistic];
//         });
//         toast.success("Franchise created successfully");
//       } else {
//         // keep optimistic and inform
//         toast.success("Franchise added (optimistic)");
//         // optionally re-fetch to sync with server
//         void fetchFranchises();
//       }
//     } catch (err: any) {
//       setFranchises((prev) => prev.filter((f) => f.id !== optimisticId));
//       console.error("Network error creating franchise:", err);
//       toast.error("Network error while creating franchise. Please try again.");
//     } finally {
//       setLoading(false);
//       setForm(initialForm);
//     }
//   };

//   // ------------------ reverse geocode helper ------------------
//   const handleLookupFromLatLon = async () => {
//     const lat = form.latitude?.trim();
//     const lon = form.longitude?.trim();

//     if (!lat || !lon) {
//       toast.error("Please enter both latitude and longitude.");
//       return;
//     }

//     const latNum = Number(lat);
//     const lonNum = Number(lon);
//     if (Number.isNaN(latNum) || Number.isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
//       toast.error("Please enter valid numeric latitude and longitude values.");
//       return;
//     }

//     setGeoLoading(true);
//     toast.loading("Looking up address from coordinates...", { id: "geo" });

//     const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
//       latNum
//     )}&lon=${encodeURIComponent(lonNum)}&addressdetails=1`;

//     try {
//       const r = await fetch(nominatimUrl, { headers: { Accept: "application/json" } });

//       if (!r.ok) {
//         throw new Error(`Reverse geocode failed (${r.status})`);
//       }

//       const data = await r.json();
//       const display = data.display_name ?? "";

//       if (display) {
//         setForm((s) => ({ ...s, address: display }));
//         toast.dismiss("geo");
//         toast.success("Address populated from coordinates");
//       } else {
//         toast.dismiss("geo");
//         toast.error("Could not determine address from given coordinates.");
//       }
//     } catch (err) {
//       console.error("Reverse geocode error:", err);
//       toast.dismiss("geo");
//       toast.error("Reverse geocoding failed. Please check your network or coordinates.");
//     } finally {
//       setGeoLoading(false);
//     }
//   };

//   // ------------------ UI ------------------
//   return (
//     <div className="p-4 md:p-6 space-y-6">
//       <Toaster position="top-right" />

//       <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
//         <div className="flex-1 min-w-0">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 truncate">Franchise</h1>
//         </div>

//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
//             <Card className="!p-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-sm">
//                   <Building2 className="w-4 h-4" />
//                   Total Franchises
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-lg font-bold">{franchises.length}</p>
//               </CardContent>
//             </Card>

//             <Card className="!p-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-sm">
//                   <BarChart3 className="w-4 h-4" />
//                   Monthly Sales
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-lg font-bold">₹2.3M</p>
//               </CardContent>
//             </Card>

//             <Card className="!p-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-sm">
//                   <BarChart3 className="w-4 h-4" />
//                   Growth Rate
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-lg font-bold">12%</p>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="flex items-center justify-end sm:justify-center gap-2">
//             <Button onClick={() => void fetchFranchises({ showErrorToast: true })} className="flex items-center gap-2">
//               <RefreshCw className="w-4 h-4" />
//               {listLoading ? "Refreshing..." : "Refresh"}
//             </Button>

//             <Button
//               onClick={openDrawer}
//               className="flex items-center gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0"
//               aria-haspopup="dialog"
//               aria-expanded={isDrawerOpen}
//             >
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
//             <div className="p-6 text-center text-sm text-gray-500">Loading franchises…</div>
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
//                       <th className="py-2 px-3">Location</th>
//                       <th className="py-2 px-3">Owner</th>
//                       <th className="py-2 px-3">Status</th>
//                       {/* <th className="py-2 px-3">Actions</th> */}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {franchises.map((f) => (
//                       <tr key={f.id} className="border-b hover:bg-gray-50">
//                         <td className="py-2 px-3">{f.franchise_name}</td>
//                         <td className="py-2 px-3">{f.location}</td>
//                         <td className="py-2 px-3">{f.owner_name}</td>
//                         <td className="py-2 px-3">
//                           <span className={f.status === "active" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
//                             {f.status === "active" ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         {/* <td className="py-2 px-3">
//                           <Button variant="outline" size="sm">View</Button>
//                         </td> */}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="md:hidden space-y-3">
//                 {franchises.map((f) => (
//                   <div key={f.id} className="border rounded-lg p-3 bg-white shadow-sm">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2">
//                           <h3 className="text-sm font-medium truncate">{f.franchise_name}</h3>
//                           <span
//                             className={`text-xs font-semibold px-2 py-0.5 rounded ${f.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
//                           >
//                             {f.status === "active" ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         <p className="text-xs text-slate-500 mt-1 truncate">{f.location}</p>
//                         <p className="text-xs text-slate-500 mt-1">Owner: {f.owner_name}</p>
//                       </div>

//                       <div className="flex flex-col gap-2 items-end">
//                         <Button variant="outline" size="sm">View</Button>
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

//       {/* Drawer panel (form) */}
//       <aside role="dialog" aria-modal="true" aria-labelledby="drawer-title" className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] transform transition-transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
//         <div className="h-full flex flex-col bg-white shadow-xl">
//           <div className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center gap-3">
//               <div className="rounded-md bg-gray-100 p-2">
//                 <Building2 className="w-5 h-5" />
//               </div>
//               <div>
//                 <h2 id="drawer-title" className="text-lg font-medium">Add Franchise</h2>
//                 <p className="text-sm text-gray-500">Fill details to add a new franchise.</p>
//               </div>
//             </div>
//             <button onClick={closeDrawer} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit} data-testid="franchise-drawer-form">
//             <div className="grid grid-cols-1 gap-4">
//               {/* fields (same as before) */}
//               <div>
//                 <label htmlFor="franchise_name" className="block text-sm font-medium text-gray-700">Franchise Name</label>
//                 <input id="franchise_name" value={form.franchise_name} onChange={handleChange("franchise_name")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.franchise_name && <p className="text-sm text-red-600 mt-1">{errors.franchise_name}</p>}
//               </div>

//               <div>
//                 <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
//                 <input id="location" value={form.location} onChange={handleChange("location")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
//               </div>

//               <div>
//                 <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700">Owner Name</label>
//                 <input id="owner_name" value={form.owner_name} onChange={handleChange("owner_name")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.owner_name && <p className="text-sm text-red-600 mt-1">{errors.owner_name}</p>}
//               </div>

//               <div>
//                 <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">Contact Number</label>
//                 <input id="contact_number" value={form.contact_number} onChange={handleChange("contact_number")} placeholder="+919876543210" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.contact_number && <p className="text-sm text-red-600 mt-1">{errors.contact_number}</p>}
//               </div>

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//                 <input id="email" type="email" value={form.email} onChange={handleChange("email")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
//               </div>

//               <div>
//                 <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
//                 <select id="status" value={form.status} onChange={handleChange("status")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
//                 <div className="mt-1 grid grid-cols-1 gap-2">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <input id="latitude" placeholder="Latitude (e.g. 17.3850)" value={form.latitude} onChange={handleChange("latitude")} className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                     </div>
//                     <div>
//                       <input id="longitude" placeholder="Longitude (e.g. 78.4867)" value={form.longitude} onChange={handleChange("longitude")} className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <div className="flex-1">
//                       <textarea id="address" value={form.address} onChange={handleChange("address")} rows={3} className="block w-full rounded-md border px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                     </div>
//                     <div className="w-36 flex-shrink-0">
//                       <button type="button" onClick={handleLookupFromLatLon} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${geoLoading ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`} disabled={geoLoading}>
//                         {geoLoading ? "Looking…" : "Lookup"}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//                 {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
//                 <p className="text-xs text-gray-400 mt-1">Enter latitude and longitude, then click <strong>Lookup</strong> to auto-fill the address.</p>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label htmlFor="gst_tax_id" className="block text-sm font-medium text-gray-700">GST / Tax ID</label>
//                   <input id="gst_tax_id" value={form.gst_tax_id} onChange={handleChange("gst_tax_id")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div>
//                   <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700">Bank Account</label>
//                   <input id="bank_account" value={form.bank_account} onChange={handleChange("bank_account")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
//               <Button variant="ghost" onClick={closeDrawer} type="button">Cancel</Button>
//               <Button type="submit" onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Save Franchise"}</Button>
//             </div>
//           </form>
//         </div>
//       </aside>
//     </div>
//   );
// };

// export default Franchise;

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, BarChart3, X, RefreshCw, Edit3, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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

// API endpoints (adjust host if needed)
// list -> GET    : /admin/franchise
// create -> POST : /admin/franchise/add
// update -> POST : /admin/franchise/update/:id
// show   -> GET  : /admin/franchise/show/:id
// delete -> DELETE: /admin/franchise/delete/:id
const API_HOST = "http://192.168.29.102:5000/api"; // change to your host
const API_BASE = `${API_HOST}/admin/franchise`;

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

const Franchise: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<FranchiseForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});
  const [loading, setLoading] = useState(false);

  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | number | null>(null);

  // ---------- Helpers ----------
  const tokenHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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

    // Try to fetch latest details (show endpoint) -- optional but useful
    try {
      const res = await fetch(`${API_BASE}/show/${item.id}`, {
        method: "GET",
        headers: { ...tokenHeader() },
      });
      if (res.ok) {
        const body = await res.json().catch(() => null);
        const data = body?.data ?? body?.franchise ?? body ?? null;
        if (data) {
          setForm((s) => ({
            ...s,
            name: data.name ?? data.franchise_name ?? item.name ?? "",
            businessName: data.business_name ?? data.businessName ?? item.businessName ?? "",
            address: data.address ?? item.address ?? "",
            email: data.email ?? item.email ?? "",
            phone: data.phone ?? item.phone ?? "",
            amount: (data.amount ?? item.amount ?? "") + "",
            imageFile: null,
          }));
        }
      }
    } catch (err) {
      // ignore - we'll still use the passed item data
      console.warn("Could not fetch detail for edit:", err);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setForm(initialForm);
      setErrors({});
      setEditingId(null);
    }, 180);
  };

  const handleChange =
    (k: keyof FranchiseForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement).value;
      setForm((s) => ({ ...s, [k]: value }));
      setErrors((err) => ({ ...err, [k]: undefined }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setForm((s) => ({ ...s, imageFile: file || null }));
    setErrors((err) => ({ ...err, imageFile: undefined }));
  };

  // Validation
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
    else if (form.password && form.password.trim() && form.password.trim().length < 6) err.password = "Password must be at least 6 characters";
    if (!form.amount.trim()) err.amount = "Amount is required";
    else if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim())) err.amount = "Enter a valid amount (e.g. 100 or 99.99)";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---------- Fetch list ----------
  const fetchFranchises = async (opts?: { showErrorToast?: boolean }) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch(`${API_BASE}`, {
        method: "GET",
        headers: { "Accept": "application/json", ...tokenHeader() },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
        setListError(msg);
        if (opts?.showErrorToast !== false) toast.error(`Failed to load franchises: ${msg}`);
        setFranchises([]);
        return;
      }
      const body = await res.json().catch(() => null);
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
        status: (r.status ?? "active").toLowerCase(),
        image_url: r.image_url ?? r.image ?? null,
      }));

      setFranchises(normalized);
    } catch (err) {
      console.error("Fetch franchises error:", err);
      setListError("Network error");
      toast.error("Network error while loading franchises");
      setFranchises([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Create (multipart/form-data) ----------
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

    const res = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { ...tokenHeader() }, // do NOT set Content-Type with FormData
      body: formData,
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }
    return body?.data ?? body?.franchise ?? body ?? null;
  };

  // ---------- Update (POST /update/:id) ----------
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

    const res = await fetch(`${API_BASE}/update/${id}`, {
      method: "POST",
      headers: { ...tokenHeader() },
      body: formData,
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }
    return body?.data ?? body?.franchise ?? body ?? null;
  };

  // ---------- Delete ----------
  const deleteFranchiseApi = async (id: string | number) => {
    const res = await fetch(`${API_BASE}/delete/${id}`, {
      method: "DELETE",
      headers: { "Accept": "application/json", ...tokenHeader() },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }
    return true;
  };

  // ---------- Submit handler ----------
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

    if (!editingId) {
      // optimistic add
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
            status: (created?.status ?? "active").toLowerCase(),
            image_url: created?.image_url ?? created?.image ?? null,
          };
          return [newItem, ...withoutOptimistic];
        });
        toast.success("Franchise created");
      } catch (err: any) {
        setFranchises((prev) => prev.filter((p) => !String(p.id).startsWith("tmp-")));
        console.error("Create franchise error:", err);
        toast.error(err?.message || "Failed to create franchise");
      } finally {
        setLoading(false);
        setForm(initialForm);
      }
    } else {
      const idToUpdate = editingId;
      setIsDrawerOpen(false);
      const prevSnapshot = [...franchises];
      setFranchises((prev) => prev.map((p) => (String(p.id) === String(idToUpdate) ? { ...p, ...payload } as FranchiseItem : p)));

      try {
        const updated = await updateFranchise(idToUpdate, payload);
        setFranchises((prev) => prev.map((p) => (String(p.id) === String(idToUpdate) ? {
          id: updated?.id ?? updated?._id ?? updated?.franchise_id ?? p.id,
          name: updated?.name ?? updated?.franchise_name ?? payload.name ?? p.name,
          businessName: updated?.business_name ?? updated?.businessName ?? payload.businessName ?? p.businessName,
          address: updated?.address ?? payload.address ?? p.address,
          email: updated?.email ?? payload.email ?? p.email,
          phone: updated?.phone ?? payload.phone ?? p.phone,
          amount: updated?.deposit_amount ?? updated?.amount ?? payload.amount ?? p.amount,
          status: (updated?.status ?? p.status ?? "active").toLowerCase(),
          image_url: updated?.image_url ?? updated?.image ?? p.image_url ?? null,
        } : p)));
        toast.success("Franchise updated");
      } catch (err: any) {
        console.error("Update franchise error:", err);
        setFranchises(prevSnapshot);
        toast.error(err?.message || "Failed to update franchise");
      } finally {
        setLoading(false);
        setForm(initialForm);
        setEditingId(null);
      }
    }
  };

  // ---------- Delete ----------
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

  // ---------- UI ----------
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 truncate">Franchise</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            <Card className="!p-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4" />
                  Total Franchises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{franchises.length}</p>
              </CardContent>
            </Card>

            <Card className="!p-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  ₹{franchises.reduce((s, f) => s + Number((f.amount ?? "0").toString().replace(/[^\d.]/g, "") || 0), 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="!p-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{franchises.filter((f) => f.status === "active").length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end sm:justify-center gap-2">
            <Button onClick={() => void fetchFranchises({ showErrorToast: true })} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {listLoading ? "Refreshing..." : "Refresh"}
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
          <CardTitle>Franchise Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading franchises…</div>
          ) : listError ? (
            <div className="p-6 text-center text-sm text-red-600">
              {listError} — <button className="underline" onClick={() => void fetchFranchises()}>Retry</button>
            </div>
          ) : (
            <>
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
                    {franchises.map((f) => (
                      <tr key={String(f.id)} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{f.name}</td>
                        <td className="py-2 px-3">{f.businessName}</td>
                        <td className="py-2 px-3 truncate max-w-[220px]">{f.address}</td>
                        <td className="py-2 px-3">{f.email}</td>
                        <td className="py-2 px-3">{f.phone}</td>
                        <td className="py-2 px-3">{f.amount || "-"}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => openDrawerForEdit(f)}><Edit3 className="w-4 h-4" /></Button>
                            <Button variant="destructive" onClick={() => handleDelete(f.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {franchises.map((f) => (
                  <div key={String(f.id)} className="border rounded-lg p-3 bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium truncate">{f.name}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${f.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
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
                          <Button variant="outline" size="sm" onClick={() => openDrawerForEdit(f)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(f.id)}>Delete</Button>
                        </div>
                        <div className="text-xs text-slate-400">Amount: {f.amount || "-"}</div>
                      </div>
                    </div>
                  </div>
                ))}
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
                <h2 id="drawer-title" className="text-lg font-medium">{editingId ? "Edit Franchise" : "Add Franchise"}</h2>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input id="name" value={form.name} onChange={handleChange("name")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
                <input id="businessName" value={form.businessName} onChange={handleChange("businessName")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.businessName && <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea id="address" value={form.address} onChange={handleChange("address")} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input id="email" type="email" value={form.email} onChange={handleChange("email")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input id="phone" value={form.phone} onChange={handleChange("phone")} placeholder="+919876543210" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password {editingId ? <span className="text-xs text-gray-400">(leave blank to keep)</span> : null}</label>
                <input id="password" type="password" value={form.password} onChange={handleChange("password")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Deposit Amount</label>
                <input id="amount" value={form.amount} onChange={handleChange("amount")} placeholder="e.g. 1000 or 99.99" className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image (optional)</label>
                <input id="image" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-600" />
                {form.imageFile && <p className="text-xs text-slate-500 mt-1">Selected: {form.imageFile.name}</p>}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeDrawer} type="button">Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? (editingId ? "Saving..." : "Adding...") : (editingId ? "Save Changes" : "Add Franchise")}</Button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Franchise;





