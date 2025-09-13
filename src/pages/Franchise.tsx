import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, BarChart3, X } from "lucide-react";

type FranchiseForm = {
  name: string;
  location: string;
  owner: string;
  contact: string;
  email: string;
  status: "active" | "inactive";
  address: string;
  gst?: string;
  bankAccount?: string;
};

const initialForm: FranchiseForm = {
  name: "",
  location: "",
  owner: "",
  contact: "",
  email: "",
  status: "active",
  address: "",
  gst: "",
  bankAccount: "",
};

const Franchise: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<FranchiseForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FranchiseForm, string>>>({});

  const openDrawer = () => {
    setForm(initialForm);
    setErrors({});
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleChange =
    (k: keyof FranchiseForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((s) => ({ ...s, [k]: e.target.value }));
    };

  const validate = (): boolean => {
    const err: Partial<Record<keyof FranchiseForm, string>> = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.location.trim()) err.location = "Location is required";
    if (!form.owner.trim()) err.owner = "Owner name is required";
    if (!form.contact.trim()) err.contact = "Contact is required";
    if (form.contact && !/^\+?\d{7,15}$/.test(form.contact)) err.contact = "Invalid contact";
    if (!form.email.trim()) err.email = "Email is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
    if (!form.address.trim()) err.address = "Address is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    console.log("Franchise submitted:", form);
    setIsDrawerOpen(false);
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-franchise">
      {/* Header with inline metric cards */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Franchise</h1>
          </div>
          {/* On small screens these cards will stack below title (they're inside the same `flex` container),
              on larger screens they sit to the right of the title area. */}
        </div>

        <div className="flex items-center gap-3">
          {/* Metric cards placed beside heading */}
          <Card className="!p-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4" />
                Total Franchises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">18</p>
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

          {/* Add Franchise button */}
          <Button onClick={openDrawer} className="flex items-center gap-2 ml-2" aria-haspopup="dialog" aria-expanded={isDrawerOpen}>
            <PlusCircle className="w-4 h-4" />
            Add Franchise
          </Button>
        </div>
      </div>

      {/* Franchise List */}
      <Card>
        <CardHeader>
          <CardTitle>Franchise Branches</CardTitle>
        </CardHeader>
        <CardContent>
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
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">Warangal Franchise</td>
                <td className="py-2 px-3">Warangal, TS</td>
                <td className="py-2 px-3">Kiran Kumar</td>
                <td className="py-2 px-3 text-green-600 font-medium">Active</td>
                <td className="py-2 px-3">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">Hyderabad Franchise</td>
                <td className="py-2 px-3">Hyderabad, TS</td>
                <td className="py-2 px-3">Ravi Teja</td>
                <td className="py-2 px-3 text-red-600 font-medium">Inactive</td>
                <td className="py-2 px-3">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
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
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] transform transition-transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
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
          <form className="flex-1 overflow-auto p-6" onSubmit={handleSubmit} data-testid="franchise-drawer-form">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Franchise Name
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={handleChange("name")}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
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
                <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                  Owner Name
                </label>
                <input
                  id="owner"
                  value={form.owner}
                  onChange={handleChange("owner")}
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.owner && <p className="text-sm text-red-600 mt-1">{errors.owner}</p>}
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  id="contact"
                  value={form.contact}
                  onChange={handleChange("contact")}
                  placeholder="+919876543210"
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.contact && <p className="text-sm text-red-600 mt-1">{errors.contact}</p>}
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
                  <label htmlFor="gst" className="block text-sm font-medium text-gray-700">
                    GST / Tax ID
                  </label>
                  <input id="gst" value={form.gst} onChange={handleChange("gst")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">
                    Bank Account
                  </label>
                  <input id="bankAccount" value={form.bankAccount} onChange={handleChange("bankAccount")} className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeDrawer} type="button">
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit}>
                Save Franchise
              </Button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Franchise;
