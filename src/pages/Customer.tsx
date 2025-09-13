import React, { useState, useRef } from "react";
import { Search, PlusCircle, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Customer() {
  const fileInputRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  type CustomerForm = {
    photoFile: File | null;
    photoPreview: string;
    state: string;
    district: string;
    taluk: string;
    postal: string;
    village: string;
    shopType: string;
    shopName: string;
    customerName: string;
    customerLocalName: string;
    villageLocalName: string;
    phone1: string;
    phone2: string;
    gst: string;
    pan: string;
    address: string;
    landmark: string;
    shopBreak: string;
    fridge: string;
    qualification: string;
    grade: string;
    avgSales: string;
    smartPhoneUser: string;
  };

  type CustomerFormErrors = Partial<Record<keyof CustomerForm, string>>;

  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [form, setForm] = useState<CustomerForm>({
    photoFile: null,
    photoPreview: "",
    state: "",
    district: "",
    taluk: "",
    postal: "",
    village: "",
    shopType: "Shop",
    shopName: "",
    customerName: "",
    customerLocalName: "",
    villageLocalName: "",
    phone1: "",
    phone2: "",
    gst: "",
    pan: "",
    address: "",
    landmark: "",
    shopBreak: "No Break",
    fridge: "",
    qualification: "",
    grade: "",
    avgSales: "",
    smartPhoneUser: "yes",
  });

  // ----- ADDED: 5 static customer records -----
  const [customers, setCustomers] = useState([
    {
      id: "c1",
      photoPreview:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
      state: "Telangana",
      district: "Hyderabad",
      taluk: "Medchal",
      postal: "500039",
      village: "Uppal",
      shopType: "Shop",
      shopName: "Ravi General Store",
      customerName: "Ravi Kumar",
      customerLocalName: "Ravi",
      villageLocalName: "Uppal",
      phone1: "9848012345",
      phone2: "9000000000",
      gst: "",
      pan: "",
      address: "12/A Main Road, Uppal",
      landmark: "Near Bus Stop",
      shopBreak: "30 mins",
      fridge: "Yes",
      qualification: "Graduate",
      grade: "A",
      avgSales: "1500",
      smartPhoneUser: "yes",
    },
    {
      id: "c2",
      photoPreview:
        "https://images.unsplash.com/photo-1545996124-4ac1d9f0c0b9?q=80&w=400&auto=format&fit=crop",
      state: "Telangana",
      district: "Hyderabad",
      taluk: "Ranga Reddy",
      postal: "500072",
      village: "LB Nagar",
      shopType: "Shop",
      shopName: "Kiran Stores",
      customerName: "Kiran Reddy",
      customerLocalName: "Kiran",
      villageLocalName: "LB Nagar",
      phone1: "9440445566",
      phone2: "",
      gst: "",
      pan: "",
      address: "45/2 Market Road",
      landmark: "Opposite Mall",
      shopBreak: "No Break",
      fridge: "No",
      qualification: "12th",
      grade: "B",
      avgSales: "900",
      smartPhoneUser: "no",
    },
    {
      id: "c3",
      photoPreview: "",
      state: "Telangana",
      district: "Nizamabad",
      taluk: "Banswada",
      postal: "503001",
      village: "Bodhan",
      shopType: "Home",
      shopName: "Ajay Mart",
      customerName: "Ajay Sharma",
      customerLocalName: "Ajay",
      villageLocalName: "Bodhan",
      phone1: "9000000001",
      phone2: "",
      gst: "",
      pan: "",
      address: "Near Temple Road",
      landmark: "Temple",
      shopBreak: "1 hour",
      fridge: "No",
      qualification: "Diploma",
      grade: "C",
      avgSales: "400",
      smartPhoneUser: "yes",
    },
    {
      id: "c4",
      photoPreview:
        "https://images.unsplash.com/photo-1545996124-4ac1d9f0c0b9?q=80&w=400&auto=format&fit=crop",
      state: "Telangana",
      district: "Warangal",
      taluk: "Hanamkonda",
      postal: "506001",
      village: "Kazipet",
      shopType: "Shop",
      shopName: "Suresh Provision",
      customerName: "Suresh Rao",
      customerLocalName: "Suresh",
      villageLocalName: "Kazipet",
      phone1: "9000000002",
      phone2: "",
      gst: "",
      pan: "",
      address: "Market Street",
      landmark: "Near Petrol Pump",
      shopBreak: "30 mins",
      fridge: "Yes",
      qualification: "Graduate",
      grade: "B",
      avgSales: "1200",
      smartPhoneUser: "yes",
    },
    {
      id: "c5",
      photoPreview:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
      state: "Telangana",
      district: "Karimnagar",
      taluk: "Karimnagar",
      postal: "505001",
      village: "Karimnagar City",
      shopType: "Shop",
      shopName: "Meena Kirana",
      customerName: "Meena Devi",
      customerLocalName: "Meena",
      villageLocalName: "Karimnagar City",
      phone1: "9000000003",
      phone2: "",
      gst: "",
      pan: "",
      address: "Shop No 5, Market",
      landmark: "Next to Bank",
      shopBreak: "No Break",
      fridge: "No",
      qualification: "Graduate",
      grade: "A",
      avgSales: "2000",
      smartPhoneUser: "no",
    },
  ]);

  const LABELS = {
    state: "State",
    district: "District",
    taluk: "Taluk/SubDistrict",
    postal: "Postal",
    village: "Village",
    shopName: "Shop Name",
    customerName: "Customer Name",
    phone1: "Phone",
    phone2: "Phone 2",
    gst: "GST",
    pan: "PAN",
    address: "Address",
    shopBreak: "Shop Break",
    avgSales: "Avg Sales",
    smartPhoneUser: "Smart Phone User",
  };

  // small header search term
  const [query, setQuery] = useState("");

  // single handleChange used for all inputs
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "phone1" || name === "phone2") {
      setForm((s) => ({ ...s, [name]: value.replace(/\D/g, "").slice(0, 10) }));
      setErrors((p) => ({ ...p, [name]: undefined }));
      return;
    }
    if (name === "avgSales") {
      setForm((s) => ({ ...s, [name]: value.replace(/[^0-9.]/g, "") }));
      setErrors((p) => ({ ...p, [name]: undefined }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxMB = 5;
    if (!okTypes.includes(f.type)) {
      setErrors((p) => ({ ...p, photoFile: "Only JPG / PNG / WEBP allowed" }));
      return;
    }
    if (f.size > maxMB * 1024 * 1024) {
      setErrors((p) => ({ ...p, photoFile: `Image must be < ${maxMB}MB` }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        //ts-ignore
      setForm((s) => ({ ...s, photoFile: f, photoPreview: reader.result as string }));
      setErrors((p) => ({ ...p, photoFile: undefined }));
    };
    reader.readAsDataURL(f);
  }

  function openFileDialog() {
    fileInputRef.current && fileInputRef.current.click();
  }

  function validateAll() {
    const newErrors = {};
    ["state", "district", "taluk", "postal", "village", "shopName", "customerName", "phone1"].forEach((k) => {
      if (!form[k] || String(form[k]).trim() === "") newErrors[k] = `${LABELS[k] || k} is required`;
    });
    if (form.phone1 && !/^\d{10}$/.test(form.phone1)) newErrors.phone1 = "Enter 10-digit phone";
    if (form.postal && !/^\d{6}$/.test(String(form.postal))) newErrors.postal = "Enter 6-digit postal code";
    if (form.pan && !/^[A-Z]{5}\d{4}[A-Z]$/i.test(form.pan)) newErrors.pan = "Invalid PAN";
    if (form.gst && !/^[0-9A-Z]{15}$/i.test(form.gst)) newErrors.gst = "Invalid GST";
    if (form.avgSales && isNaN(Number(form.avgSales))) newErrors.avgSales = "Must be a number";
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ne = validateAll();
    if (Object.keys(ne).length) {
      setErrors(ne);
      document.querySelector(".text-red-500")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const payload = new FormData();
    Object.keys(form).forEach((k) => {
      if (k === "photoPreview") return;
      if (k === "photoFile") {
        if (form.photoFile) payload.append("photo", form.photoFile);
        return;
      }
      payload.append(k, String(form[k] ?? ""));
    });
    console.log("submit", payload);
    setDrawerOpen(false);
  }

  // filtered customers based on header small search
  const filteredCustomers = customers.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      String(c.shopName || "").toLowerCase().includes(q) ||
      String(c.customerName || "").toLowerCase().includes(q) ||
      String(c.phone1 || "").toLowerCase().includes(q) ||
      String(c.villageLocalName || c.village || "").toLowerCase().includes(q) ||
      String(c.district || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Customer Management</h1>
          </div>
          {/* compact styled search (matches your example). using input fallbacks */}
          {/* <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
              className={
                "pl-9 pr-4 rounded-full h-10 focus:ring-2 focus:ring-chart-primary focus:border-chart-primary bg-white border-slate-200 w-full"
              }
            />
          </div> */}
           <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
                 placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            className="pl-9 pr-4 bg-search-bg border-search-border rounded-full h-10 focus:ring-2 focus:ring-chart-primary focus:border-chart-primary"
            aria-label="Search"
          />
        </div>
        </div>

        <div>
          <Button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2" aria-haspopup="dialog">
            <PlusCircle className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filter bar removed per request */}

      {/* Customer List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="text-xl font-semibold mb-6">Customer List</h2>

        {filteredCustomers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-20 h-20 rounded-full bg-slate-100 grid place-items-center mb-4">
              <Search size={28} />
            </div>
            <p className="text-slate-500 mb-1">No customers found</p>
            <p className="text-slate-400">Try a different search or add a customer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3">#</th>
                  <th className="p-3">Shop</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Village</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, idx) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3 align-top">{idx + 1}</td>
                    <td className="p-3 align-top">
                      <div className="font-medium">{c.shopName}</div>
                      <div className="text-xs text-slate-500">{c.shopType}</div>
                    </td>
                    <td className="p-3 align-top">
                      <div className="font-medium">{c.customerName}</div>
                      {c.customerLocalName && <div className="text-xs text-slate-500">{c.customerLocalName}</div>}
                    </td>
                    <td className="p-3 align-top">{c.phone1}</td>
                    <td className="p-3 align-top">{c.villageLocalName || c.village}</td>
                    <td className="p-3 align-top">{c.district}</td>
                    <td className="p-3 align-top">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ ...c, photoFile: null, photoPreview: c.photoPreview ?? "" });
                            setDrawerOpen(true);
                          }}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm("Delete this customer?")) return;
                            setCustomers((prev) => prev.filter((x) => x.id !== c.id));
                          }}
                          className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
       {drawerOpen && (
  <div className="fixed inset-0 z-40"  >
    <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)}  />
    <aside className="absolute right-0 top-0 h-full  md:w-[1000px] bg-white shadow-2xl p-6 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold">Add Customer</h3>
        <button onClick={() => setDrawerOpen(false)} className="p-2 rounded hover:bg-slate-100" type="button">
          <X size={20} />
        </button>
      </div>
      <div className="w-full max-w-[220px]  md:top-0 bg-white p-4 rounded-lg border">
              <div className="flex flex-col items-center">
                {/* Clickable avatar */}
                <div
                  className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center mb-3 border"
                  onClick={openFileDialog}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload photo"
                >
                  {form.photoPreview ? (
                    <img src={form.photoPreview} alt={`${form.customerName || "Customer"} avatar`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="14" rx="2" />
                        <path d="M3 17l4-4 3 3 4-5 5 5" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center w-full">
                  <button type="button" onClick={openFileDialog} className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 text-white rounded">
                    <Camera size={16} /> Upload
                  </button>
                  {form.photoFile && (
                    <button type="button" onClick={() => setForm((s) => ({ ...s, photoFile: null, photoPreview: "" }))} className="mt-2 w-full px-4 py-2 border rounded">
                      Remove
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e)} className="hidden" />
                  {errors.photoFile && <p className="text-red-500 text-sm mt-2">{errors.photoFile}</p>}
                  <p className="text-xs text-slate-500 mt-2 text-center">JPG / PNG / WEBP — max 5MB</p>
                </div>
              </div>
            </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1  gap-6" >
          {/* LEFT: inputs (span 2 cols on md+) */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1 */}
              <div>
                <label className="block text-sm text-slate-600">State <span className="text-red-500">*</span></label>
                <select name="state" value={form.state} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="">Select state</option>
                  <option value="State A">State A</option>
                  <option value="State B">State B</option>
                </select>
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">District <span className="text-red-500">*</span></label>
                <select name="district" value={form.district} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="">Select district</option>
                </select>
                {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm text-slate-600">Taluk / SubDistrict <span className="text-red-500">*</span></label>
                <select name="taluk" value={form.taluk} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="">Select taluk</option>
                </select>
                {errors.taluk && <p className="text-red-500 text-sm">{errors.taluk}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">Postal (PIN) <span className="text-red-500">*</span></label>
                <input name="postal" value={form.postal} onChange={handleChange} placeholder="6-digit PIN" className="w-full p-3 border rounded" />
                {errors.postal && <p className="text-red-500 text-sm">{errors.postal}</p>}
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm text-slate-600">Village <span className="text-red-500">*</span></label>
                <select name="village" value={form.village} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="">Select village</option>
                </select>
                {errors.village && <p className="text-red-500 text-sm">{errors.village}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">Shop Type <span className="text-red-500">*</span></label>
                <select name="shopType" value={form.shopType} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="Shop">Shop</option>
                  <option value="Home">Home</option>
                </select>
                {errors.shopType && <p className="text-red-500 text-sm">{errors.shopType}</p>}
              </div>

              {/* Shop Name full width */}
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600">Shop Name <span className="text-red-500">*</span></label>
                <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="Enter shop name" className="w-full p-3 border rounded" />
                {errors.shopName && <p className="text-red-500 text-sm">{errors.shopName}</p>}
              </div>

              {/* Customer name pair */}
              <div>
                <label className="block text-sm text-slate-600">Customer Name <span className="text-red-500">*</span></label>
                <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Enter customer name" className="w-full p-3 border rounded" />
                {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">Customer Local Name</label>
                <input name="customerLocalName" value={form.customerLocalName} onChange={handleChange} placeholder="Local name (optional)" className="w-full p-3 border rounded" />
              </div>

              {/* Phone pair */}
              <div>
                <label className="block text-sm text-slate-600">Phone <span className="text-red-500">*</span></label>
                <input name="phone1" value={form.phone1} onChange={handleChange} placeholder="10-digit phone" className="w-full p-3 border rounded" />
                {errors.phone1 && <p className="text-red-500 text-sm">{errors.phone1}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">Phone 2</label>
                <input name="phone2" value={form.phone2} onChange={handleChange} placeholder="Alternate phone" className="w-full p-3 border rounded" />
                {errors.phone2 && <p className="text-red-500 text-sm">{errors.phone2}</p>}
              </div>

              {/* GST / PAN */}
              <div>
                <label className="block text-sm text-slate-600">GST</label>
                <input name="gst" value={form.gst} onChange={handleChange} placeholder="GST (optional)" className="w-full p-3 border rounded" />
                {errors.gst && <p className="text-red-500 text-sm">{errors.gst}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">PAN</label>
                <input name="pan" value={form.pan} onChange={handleChange} placeholder="PAN (optional)" className="w-full p-3 border rounded" />
                {errors.pan && <p className="text-red-500 text-sm">{errors.pan}</p>}
              </div>

              {/* Address full width */}
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600">Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Enter address" className="w-full p-3 border rounded" />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              {/* Shop break / fridge / avg / smartphone */}
              <div>
                <label className="block text-sm text-slate-600">Shop Break</label>
                <select name="shopBreak" value={form.shopBreak} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="No Break">No Break</option>
                  <option value="30 mins">30 mins</option>
                  <option value="1 hour">1 hour</option>
                </select>
                {errors.shopBreak && <p className="text-red-500 text-sm">{errors.shopBreak}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">Fridge</label>
                <select name="fridge" value={form.fridge} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.fridge && <p className="text-red-500 text-sm">{errors.fridge}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">Avg Sales (per day)</label>
                <input name="avgSales" value={form.avgSales} onChange={handleChange} placeholder="0.00" className="w-full p-3 border rounded" />
                {errors.avgSales && <p className="text-red-500 text-sm">{errors.avgSales}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-600">Smart Phone User</label>
                <select name="smartPhoneUser" value={form.smartPhoneUser} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                  <option value="yes">yes</option>
                  <option value="no">no</option>
                </select>
              </div>
            </div>
          </div>
          <div className="md:col-span-1 flex items-start justify-end">
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex justify-start gap-3">
          <button type="button" onClick={() => { setDrawerOpen(false); setErrors({}); }} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
            Save Customer
          </button>
        </div>
      </form>
    </aside>
  </div>
       )}
    </div>
  );
}
