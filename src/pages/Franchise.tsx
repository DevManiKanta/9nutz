// import React, { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Building2, BarChart3, X } from "lucide-react";

// type FranchiseForm = {
//   franchise_name: string;
//   location: string;
//   owner_name: string;
//   contact_number: string;
//   email: string;
//   status: "active" | "inactive";
//   address: string;
//    gst_tax_id?: string;
//    bank_account?: string;
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
// };

// const Franchise: React.FC = () => {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [form, setForm] = useState<FranchiseForm>(initialForm);
//   const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});

//   // small mock list for the table (replace with API later)
//   const franchises = useMemo(
//     () => [
//       { id: 1, name: "Warangal Franchise", location: "Warangal, TS", owner: "Kiran Kumar", status: "active" },
//       { id: 2, name: "Hyderabad Franchise", location: "Hyderabad, TS", owner: "Ravi Teja", status: "inactive" },
//       { id: 3, name: "Nizamabad Franchise", location: "Nizamabad, TS", owner: "Swapnil", status: "active" },
//     ],
//     []
//   );

//   const openDrawer = () => {
//     setForm(initialForm);
//     setErrors({});
//     setIsDrawerOpen(true);
//   };
//   const closeDrawer = () => setIsDrawerOpen(false);

//   const handleChange =
//     (k: keyof FranchiseForm) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//       setForm((s) => ({ ...s, [k]: e.target.value }));
//       setErrors((err) => ({ ...err, [k]: undefined }));
//     };

//   const validate = (): boolean => {
//     const err: Partial<Record<keyof FranchiseForm, string>> = {};
//     if (!form.owner_name.trim()) err.name = "Name is required";
//     if (!form.location.trim()) err.location = "Location is required";
//     if (!form.owner.trim()) err.owner = "Owner name is required";
//     if (!form.contact.trim()) err.contact = "Contact is required";
//     if (form.contact && !/^\+?\d{7,15}$/.test(form.contact)) err.contact = "Invalid contact";
//     if (!form.email.trim()) err.email = "Email is required";
//     if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
//     if (!form.address.trim()) err.address = "Address is required";

//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

//   const handleSubmit = (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!validate()) return;
//     // TODO: replace with API call
//     console.log("Franchise submitted:", form);
//     setIsDrawerOpen(false);
//   };

//   return (
//     <div className="p-4 md:p-6 space-y-6">
//       {/* Header with metric cards */}
//       <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
//         <div className="flex-1 min-w-0">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 truncate">Franchise</h1>
//           <p className="text-sm text-gray-500 mt-1">Manage franchise branches and view quick metrics</p>
//         </div>

//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//           {/* Metric cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
//             <Card className="!p-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-sm">
//                   <Building2 className="w-4 h-4" />
//                   Total Franchises
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-lg font-bold">18</p>
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

//           {/* Add Franchise button */}
//           <div className="flex items-center justify-end sm:justify-center">
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

//       {/* Franchise List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Franchise Branches</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {/* Desktop table */}
//           <div className="hidden md:block w-full overflow-x-auto">
//             <table className="w-full text-sm text-left border-collapse">
//               <thead>
//                 <tr className="border-b">
//                   <th className="py-2 px-3">Name</th>
//                   <th className="py-2 px-3">Location</th>
//                   <th className="py-2 px-3">Owner</th>
//                   <th className="py-2 px-3">Status</th>
//                   <th className="py-2 px-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {franchises.map((f) => (
//                   <tr key={f.id} className="border-b hover:bg-gray-50">
//                     <td className="py-2 px-3">{f.name}</td>
//                     <td className="py-2 px-3">{f.location}</td>
//                     <td className="py-2 px-3">{f.owner}</td>
//                     <td className="py-2 px-3">
//                       <span className={f.status === "active" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
//                         {f.status === "active" ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td className="py-2 px-3">
//                       <Button variant="outline" size="sm">
//                         View
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile cards */}
//           <div className="md:hidden space-y-3">
//             {franchises.map((f) => (
//               <div key={f.id} className="border rounded-lg p-3 bg-white shadow-sm">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="min-w-0">
//                     <div className="flex items-center gap-2">
//                       <h3 className="text-sm font-medium truncate">{f.name}</h3>
//                       <span
//                         className={`text-xs font-semibold px-2 py-0.5 rounded ${
//                           f.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
//                         }`}
//                       >
//                         {f.status === "active" ? "Active" : "Inactive"}
//                       </span>
//                     </div>
//                     <p className="text-xs text-slate-500 mt-1 truncate">{f.location}</p>
//                     <p className="text-xs text-slate-500 mt-1">Owner: {f.owner}</p>
//                   </div>

//                   <div className="flex flex-col gap-2 items-end">
//                     <Button variant="outline" size="sm">
//                       View
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Drawer overlay */}
//       <div
//         className={`fixed inset-0 z-40 transition-opacity ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
//         aria-hidden={!isDrawerOpen}
//       >
//         <div
//           onClick={closeDrawer}
//           className={`absolute inset-0 bg-black/40 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
//         />
//       </div>

//       {/* Drawer Panel */}
//       <aside
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="drawer-title"
//         className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] transform transition-transform ${
//           isDrawerOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <div className="h-full flex flex-col bg-white shadow-xl">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center gap-3">
//               <div className="rounded-md bg-gray-100 p-2">
//                 <Building2 className="w-5 h-5" />
//               </div>
//               <div>
//                 <h2 id="drawer-title" className="text-lg font-medium">
//                   Add Franchise
//                 </h2>
//                 <p className="text-sm text-gray-500">Fill in the required details to add a new franchise.</p>
//               </div>
//             </div>
//             <button onClick={closeDrawer} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Form */}
//           <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit} data-testid="franchise-drawer-form">
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                   Franchise Name
//                 </label>
//                 <input
//                   id="name"
//                   value={form.owner_name}
//                   onChange={handleChange("name")}
//                   className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
//               </div>

//               <div>
//                 <label htmlFor="location" className="block text-sm font-medium text-gray-700">
//                   Location
//                 </label>
//                 <input
//                   id="location"
//                   value={form.location}
//                   onChange={handleChange("location")}
//                   className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
//               </div>

//               <div>
//                 <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
//                   Owner Name
//                 </label>
//                 <input
//                   id="owner"
//                   value={form.owner}
//                   onChange={handleChange("owner")}
//                   className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 {errors.owner && <p className="text-sm text-red-600 mt-1">{errors.owner}</p>}
//               </div>

//               <div>
//                 <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
//                   Contact Number
//                 </label>
//                 <input
//                   id="contact"
//                   value={form.contact}
//                   onChange={handleChange("contact")}
//                   placeholder="+919876543210"
//                   className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 {errors.contact && <p className="text-sm text-red-600 mt-1">{errors.contact}</p>}
//               </div>

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                   Email
//                 </label>
//                 <input
//                   id="email"
//                   type="email"
//                   value={form.email}
//                   onChange={handleChange("email")}
//                   className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
//               </div>

//               <div>
//                 <label htmlFor="status" className="block text-sm font-medium text-gray-700">
//                   Status
//                 </label>
//                 <select
//                   id="status"
//                   value={form.status}
//                   onChange={handleChange("status")}
//                   className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//                   Address
//                 </label>
//                 <textarea
//                   id="address"
//                   value={form.address}
//                   onChange={handleChange("address")}
//                   rows={3}
//                   className="mt-1 block w-full rounded-md border px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label htmlFor="gst" className="block text-sm font-medium text-gray-700">
//                     GST / Tax ID
//                   </label>
//                   <input id="gst" value={form.gst} onChange={handleChange("gst")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div>
//                   <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">
//                     Bank Account
//                   </label>
//                   <input id="bankAccount" value={form.bankAccount} onChange={handleChange("bankAccount")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
//               <Button variant="ghost" onClick={closeDrawer} type="button">
//                 Cancel
//               </Button>
//               <Button type="submit" onClick={handleSubmit}>
//                 Save Franchise
//               </Button>
//             </div>
//           </form>
//         </div>
//       </aside>
//     </div>
//   );
// };

// export default Franchise;

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, BarChart3, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type FranchiseForm = {
  franchise_name: string;
  location: string;
  owner_name: string;
  contact_number: string;
  email: string;
  status: "active" | "inactive";
  address: string;
  gst_tax_id?: string;
  bank_account?: string;
};

const initialForm: FranchiseForm = {
  franchise_name: "",
  location: "",
  owner_name: "",
  contact_number: "",
  email: "",
  status: "active",
  address: "",
  gst_tax_id: "",
  bank_account: "",
};

const API_URL = "http://192.168.29.102:5000/api/franchises";

const Franchise: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<FranchiseForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});
  const [loading, setLoading] = useState(false);

  // keep a local list so we can append new items after creation
  const [franchises, setFranchises] = useState<
    Array<{ id: number | string; franchise_name: string; location: string; owner_name: string; status: string }>
  >([
    { id: 1, franchise_name: "Warangal Franchise", location: "Warangal, TS", owner_name: "Kiran Kumar", status: "active" },
    { id: 2, franchise_name: "Hyderabad Franchise", location: "Hyderabad, TS", owner_name: "Ravi Teja", status: "inactive" },
    { id: 3, franchise_name: "Nizamabad Franchise", location: "Nizamabad, TS", owner_name: "Swapnil", status: "active" },
  ]);

  const openDrawer = () => {
    setForm(initialForm);
    setErrors({});
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleChange =
    (k: keyof FranchiseForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = (e.target as HTMLInputElement).value;
      setForm((s) => ({ ...s, [k]: value }));
      setErrors((err) => ({ ...err, [k]: undefined }));
    };

  const validate = (): boolean => {
    const err: Partial<Record<keyof FranchiseForm, string>> = {};
    if (!form.franchise_name || !form.franchise_name.trim()) err.franchise_name = "Franchise name is required";
    if (!form.location || !form.location.trim()) err.location = "Location is required";
    if (!form.owner_name || !form.owner_name.trim()) err.owner_name = "Owner name is required";
    if (!form.contact_number || !form.contact_number.trim()) err.contact_number = "Contact number is required";
    if (form.contact_number && !/^\+?\d{7,15}$/.test(form.contact_number)) err.contact_number = "Invalid contact number";
    if (!form.email || !form.email.trim()) err.email = "Email is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
    if (!form.address || !form.address.trim()) err.address = "Address is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted errors and try again.");
      return;
    }

    // Build JSON payload (backend expects snake_case as provided)
    const payload = {
      franchise_name: form.franchise_name.trim(),
      location: form.location.trim(),
      owner_name: form.owner_name.trim(),
      contact_number: form.contact_number.trim(),
      email: form.email.trim(),
      status: form.status,
      address: form.address.trim(),
      gst_tax_id: form.gst_tax_id?.trim() || null,
      bank_account: form.bank_account?.trim() || null,
    };

    // Optimistic UI id while waiting for server
    const optimisticId = `tmp-${Date.now()}`;
    const optimisticItem = {
      id: optimisticId,
      franchise_name: payload.franchise_name,
      location: payload.location,
      owner_name: payload.owner_name,
      status: payload.status,
    };
    setFranchises((prev) => [optimisticItem, ...prev]);
    setIsDrawerOpen(false);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // remove optimistic item
        setFranchises((prev) => prev.filter((f) => f.id !== optimisticId));

        let errText = `Server error (${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody && (errBody.message || errBody.error || errBody.errors)) {
            errText = errBody.message || errBody.error || JSON.stringify(errBody.errors);
          } else {
            errText = JSON.stringify(errBody);
          }
        } catch {
          try {
            const txt = await res.text();
            if (txt) errText = txt;
          } catch {}
        }

        console.error("Failed to create franchise:", errText);
        toast.error(`Failed to create franchise: ${errText}`);
        setLoading(false);
        return;
      }

      // parse body (backend might return created row under different key)
      const body = await res.json().catch(() => null);
      const created = body && (body.row ?? body.data ?? body.franchise ?? body);

      if (created) {
        // replace optimistic with server-created (match by optimisticId)
        setFranchises((prev) => {
          const withoutOptimistic = prev.filter((f) => f.id !== optimisticId);
          // try to map server fields to local shape
          const newItem = {
            id: created.id ?? created.franchise_id ?? created.franchiseId ?? created._id ?? Date.now(),
            franchise_name: created.franchise_name ?? created.name ?? payload.franchise_name,
            location: created.location ?? payload.location,
            owner_name: created.owner_name ?? created.owner ?? payload.owner_name,
            status: created.status ?? payload.status,
          };
          return [newItem, ...withoutOptimistic];
        });
        toast.success("Franchise created successfully");
      } else {
        // backend didn't return created object — keep optimistic but show success toast
        console.warn("API returned no created object; keeping optimistic item", body);
        toast.success("Franchise added (optimistic)");
      }
    } catch (err: any) {
      // network error, remove optimistic and show toast
      setFranchises((prev) => prev.filter((f) => f.id !== optimisticId));
      console.error("Network error creating franchise:", err);
      toast.error("Network error while creating franchise. Please try again.");
    } finally {
      setLoading(false);
      setForm(initialForm);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hot-toast container */}
      <Toaster position="top-right" />

      {/* Header with metric cards */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 truncate">Franchise</h1>
          <p className="text-sm text-gray-500 mt-1">Manage franchise branches and view quick metrics</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Metric cards */}
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
                  Monthly Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">₹2.3M</p>
              </CardContent>
            </Card>

            <Card className="!p-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">12%</p>
              </CardContent>
            </Card>
          </div>

          {/* Add Franchise button */}
          <div className="flex items-center justify-end sm:justify-center">
            <Button
              onClick={openDrawer}
              className="flex items-center gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0"
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen}
            >
              <PlusCircle className="w-4 h-4" />
              Add Franchise
            </Button>
          </div>
        </div>
      </div>

      {/* Franchise List */}
      <Card>
        <CardHeader>
          <CardTitle>Franchise Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Owner</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {franchises.map((f) => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{f.franchise_name}</td>
                    <td className="py-2 px-3">{f.location}</td>
                    <td className="py-2 px-3">{f.owner_name}</td>
                    <td className="py-2 px-3">
                      <span className={f.status === "active" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {f.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {franchises.map((f) => (
              <div key={f.id} className="border rounded-lg p-3 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate">{f.franchise_name}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          f.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {f.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">{f.location}</p>
                    <p className="text-xs text-slate-500 mt-1">Owner: {f.owner_name}</p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drawer overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isDrawerOpen}
      >
        <div onClick={closeDrawer} className={`absolute inset-0 bg-black/40 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`} />
      </div>

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] transform transition-transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-gray-100 p-2">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 id="drawer-title" className="text-lg font-medium">
                  Add Franchise
                </h2>
                <p className="text-sm text-gray-500">Fill in the required details to add a new franchise.</p>
              </div>
            </div>
            <button onClick={closeDrawer} aria-label="Close drawer" className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form className="flex-1 overflow-auto p-4 sm:p-6" onSubmit={handleSubmit} data-testid="franchise-drawer-form">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="franchise_name" className="block text-sm font-medium text-gray-700">
                  Franchise Name
                </label>
                <input
                  id="franchise_name"
                  value={form.franchise_name}
                  onChange={handleChange("franchise_name")}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.franchise_name && <p className="text-sm text-red-600 mt-1">{errors.franchise_name}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  value={form.location}
                  onChange={handleChange("location")}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700">
                  Owner Name
                </label>
                <input
                  id="owner_name"
                  value={form.owner_name}
                  onChange={handleChange("owner_name")}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.owner_name && <p className="text-sm text-red-600 mt-1">{errors.owner_name}</p>}
              </div>

              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  id="contact_number"
                  value={form.contact_number}
                  onChange={handleChange("contact_number")}
                  placeholder="+919876543210"
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.contact_number && <p className="text-sm text-red-600 mt-1">{errors.contact_number}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={handleChange("status")}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={handleChange("address")}
                  rows={3}
                  className="mt-1 block w-full rounded-md border px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gst_tax_id" className="block text-sm font-medium text-gray-700">
                    GST / Tax ID
                  </label>
                  <input
                    id="gst_tax_id"
                    value={form.gst_tax_id}
                    onChange={handleChange("gst_tax_id")}
                    className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700">
                    Bank Account
                  </label>
                  <input
                    id="bank_account"
                    value={form.bank_account}
                    onChange={handleChange("bank_account")}
                    className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeDrawer} type="button">
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Save Franchise"}
              </Button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Franchise;

