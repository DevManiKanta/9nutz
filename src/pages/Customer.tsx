
import React, { useEffect, useState, useRef } from "react";
import { Search, PlusCircle, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from "react-hot-toast";

export default function Customer(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  type CustomerForm = {
    image: File | null;
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
    shopBreak: string;
    fridge: string;
    avgSales: string;
    smartPhoneUser: string;
  };

  type CustomerFormErrors = Partial<Record<keyof CustomerForm, string>>;

  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [form, setForm] = useState<CustomerForm>({
    image:null,
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
    shopBreak: "No Break",
    fridge: "",
    avgSales: "",
    smartPhoneUser: "yes",
  });
  console.log("TESTForm",form)
  // sample customers (UI-only)
  const [customers, setCustomers] = useState<any[]>([
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
      avgSales: "1500",
      smartPhoneUser: "yes",
    },
  ]);

  const LABELS: Record<string, string> = {
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

  const [query, setQuery] = useState("");

  // hierarchical static selects
  const STATES = ["Telangana", "State A", "State B"];
  const DISTRICT_MAP: Record<string, string[]> = {
    Telangana: ["Hyderabad", "Nizamabad", "Warangal", "Karimnagar"],
    "State A": ["District A1", "District A2"],
    "State B": ["District B1"],
  };
  const TALUK_MAP: Record<string, string[]> = {
    Hyderabad: ["Medchal", "Ranga Reddy", "Secunderabad"],
    Nizamabad: ["Banswada", "Nizamabad Taluk"],
    Warangal: ["Hanamkonda", "Warangal Rural"],
    Karimnagar: ["Karimnagar", "Husnabad"],
    "District A1": ["Taluk A1-1", "Taluk A1-2"],
    "District A2": ["Taluk A2-1"],
    "District B1": ["Taluk B1-1"],
  };
  const VILLAGE_MAP: Record<string, string[]> = {
    Medchal: ["Uppal", "Kushaiguda", "Borabanda"],
    "Ranga Reddy": ["LB Nagar", "Attapur"],
    Secunderabad: ["Trimulgherry", "Secunderabad City"],
    Banswada: ["Bodhan", "Banswada Town"],
    "Nizamabad Taluk": ["Nizamabad City"],
    Hanamkonda: ["Kazipet", "Hanamkonda Town"],
    "Karimnagar": ["Karimnagar City", "Sircilla"],
    Husnabad: ["Husnabad Town"],
    "Taluk A1-1": ["Village A1-1a"],
    "Taluk A1-2": ["Village A1-2a"],
    "Taluk A2-1": ["Village A2-1a"],
    "Taluk B1-1": ["Village B1-1a"],
  };
  const shopTypes = ["Shop", "Home", "Kirana", "Wholesale", "Temporary Stall"];

  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [talukOptions, setTalukOptions] = useState<string[]>([]);
  const [villageOptions, setVillageOptions] = useState<string[]>([]);

  // Example mapping label -> numeric ID for backend. Update to match your database IDs.
  const STATE_ID_MAP: Record<string, number> = { Telangana: 1, "State A": 2, "State B": 3 };
  const DISTRICT_ID_MAP: Record<string, number> = {
    Hyderabad: 1,
    Nizamabad: 2,
    Warangal: 3,
    Karimnagar: 4,
    "District A1": 11,
    "District A2": 12,
    "District B1": 21,
  };
  const TALUK_ID_MAP: Record<string, number> = {
    Medchal: 1,
    "Ranga Reddy": 2,
    Secunderabad: 3,
    Banswada: 4,
    "Nizamabad Taluk": 5,
    Hanamkonda: 6,
    "Karimnagar": 7,
    Husnabad: 8,
  };
  const VILLAGE_ID_MAP: Record<string, number> = {
    Uppal: 1,
    Kushaiguda: 2,
    Borabanda: 3,
    "LB Nagar": 4,
    Attapur: 5,
  };
  const SHOPTYPE_ID_MAP: Record<string, number> = { Shop: 1, Home: 2, Kirana: 3, Wholesale: 4, "Temporary Stall": 5 };

   useEffect(()=>{
         try {
          const res =  fetch("http://192.168.29.102:5000/api/customers", {
           method: "GET",
            })
          console.log("RES",res)
            // setCustomers()
         } catch (error) {
           console.log("ERROR",error)
          
         }
   },[])
  // update select dependent lists
  useEffect(() => {
    if (!form.state) {
      setDistrictOptions([]);
      setTalukOptions([]);
      setVillageOptions([]);
      setForm((s) => ({ ...s, district: "", taluk: "", village: "" }));
      return;
    }
    const d = DISTRICT_MAP[form.state] ?? [];
    setDistrictOptions(d);
    if (!d.includes(form.district)) setForm((s) => ({ ...s, district: "", taluk: "", village: "" }));
  }, [form.state]);

  useEffect(() => {
    if (!form.district) {
      setTalukOptions([]);
      setVillageOptions([]);
      setForm((s) => ({ ...s, taluk: "", village: "" }));
      return;
    }
    const t = TALUK_MAP[form.district] ?? [];
    setTalukOptions(t);
    if (!t.includes(form.taluk)) setForm((s) => ({ ...s, taluk: "", village: "" }));
  }, [form.district]);

  useEffect(() => {
    if (!form.taluk) {
      setVillageOptions([]);
      setForm((s) => ({ ...s, village: "" }));
      return;
    }
    const v = VILLAGE_MAP[form.taluk] ?? [];
    setVillageOptions(v);
    if (!v.includes(form.village)) setForm((s) => ({ ...s, village: "" }));
  }, [form.taluk]);

  // input change handling
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement;
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

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
  const f = e.target.files?.[0] ?? null;
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
    setForm((s) => ({ ...s, image: f, photoPreview: reader.result as string }));
    setErrors((p) => ({ ...p, photoFile: undefined }));
  };
  reader.readAsDataURL(f);
}

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  // basic validation
  function validateAll() {
    const newErrors: CustomerFormErrors = {};
    (["state", "district", "taluk", "postal", "village", "shopName", "customerName", "phone1"] as Array<
      keyof CustomerForm
    >).forEach((k) => {
      if (!form[k] || String(form[k]).trim() === "") newErrors[k] = `${LABELS[k] || k} is required`;
    });
    if (form.phone1 && !/^\d{10}$/.test(form.phone1)) newErrors.phone1 = "Enter 10-digit phone";
    if (form.postal && !/^\d{6}$/.test(String(form.postal))) newErrors.postal = "Enter 6-digit postal code";
    if (form.pan && !/^[A-Z]{5}\d{4}[A-Z]$/i.test(form.pan)) newErrors.pan = "Invalid PAN";
    if (form.gst && !/^[0-9A-Z]{15}$/i.test(form.gst)) newErrors.gst = "Invalid GST";
    if (form.avgSales && isNaN(Number(form.avgSales))) newErrors.avgSales = "Must be a number";
    return newErrors;
  }

  // helper: label -> id where applicable (returns numeric string or original)
  function labelToId<T extends Record<string, number>>(labelOrId: string, map: T | undefined): string {
    if (!labelOrId) return "";
    if (/^\d+$/.test(labelOrId)) return labelOrId; // already numeric id
    if (!map) return labelOrId;
    const id = map[labelOrId];
    return id !== undefined ? String(id) : labelOrId;
  }

  // Build FormData that matches backend expected keys
  function buildApiFormDataSafe(f: CustomerForm) {
    const fd = new FormData();

    // Append file as 'photo'
    if (f.image) fd.append("image", f.image);

    // helper to always append keys (avoid missing keys server-side)
    const safeAppend = (key: string, val: any) => fd.append(key, val == null ? "" : String(val));

    // Basic fields
    safeAppend("shop_name", f.shopName ?? "");
    safeAppend("customer_name", f.customerName ?? "");
    safeAppend("customer_local_name", f.customerLocalName ?? "");

    // Phones
    safeAppend("phone", f.phone1 ?? "");
    safeAppend("phone2", f.phone2 ?? "");

    // Convert selects to IDs when mappings exist (or pass through numeric ID)
    safeAppend("state_id", labelToId(f.state, STATE_ID_MAP) || "");
    safeAppend("district_id", labelToId(f.district, DISTRICT_ID_MAP) || "");
    safeAppend("taluk_id", labelToId(f.taluk, TALUK_ID_MAP) || "");
    safeAppend("village_id", labelToId(f.village, VILLAGE_ID_MAP) || "");
    safeAppend("pin", f.postal ?? "");

    // Shop type ID (map)
    safeAppend("shop_type_id", labelToId(f.shopType, SHOPTYPE_ID_MAP) || "");

    // Reg numbers / address
    safeAppend("gst_no", f.gst ?? "");
    safeAppend("pan_no", f.pan ?? "");
    safeAppend("address", f.address ?? "");

    // Other attributes
    safeAppend("shop_break", f.shopBreak ?? "");
    safeAppend("fridge", f.fridge ?? "");
    safeAppend("avg_sales", f.avgSales ?? "");

    // Smartphone -> numeric flag 1|0
    const smartphoneFlag = f.smartPhoneUser === "yes" || f.smartPhoneUser === "1" ? "1" : "0";
    safeAppend("smartphone_user", smartphoneFlag);

    // Optional debug/test payload
    safeAppend(
      "testData",
      JSON.stringify({
        source: "frontend-v2",
        ts: new Date().toISOString(),
      })
    );

    return fd;
  }

  // submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ne = validateAll();
    if (Object.keys(ne).length) {
      setErrors(ne);
      const el = document.querySelector(".text-red-500");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload = buildApiFormDataSafe(form);
    console.log("TESTPAYLOAD",payload)
    // Debugging: iterate and log entries (files printed as File objects)
    try {
      console.group("FormData contents before send");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const pair of (payload as any).entries()) {
        const [k, v] = pair;
        if (v instanceof File) {
          console.log(k, "(File):", v.name, v.type, v.size);
        } else {
          console.log(k, ":", v);
        }
      }
      console.groupEnd();
    } catch {
      // ignore if iteration not supported in env
    }

    try {
      // Use fetch and DO NOT set Content-Type header (browser will set the multipart boundary)
      const res = await fetch("http://192.168.29.102:5000/api/customers", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
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
        console.error("Failed to create customer:", errText);
        toast.error(`Failed to create customer: ${errText}`);
        return;
      }

      // parse success response
      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      const created = (body && (body.row ?? body.data ?? body.customer ?? body)) || null;

      if (created) {
        setCustomers((prev) => [created, ...prev]);
        toast.success("Customer created successfully");
      } else {
        const optimistic: any = {
          id: `tmp-${Date.now()}`,
          photoPreview: form.photoPreview || "",
          shopName: form.shopName,
          customerName: form.customerName,
          phone1: form.phone1,
          village: form.village,
          district: form.district,
        };
        setCustomers((prev) => [optimistic, ...prev]);
        console.warn("API did not return created object, added optimistic item", body);
        toast.success("Customer added (optimistic)");
      }

      setDrawerOpen(false);
      setErrors({});
      console.log("Create response:", body);
    } catch (err: any) {
      console.error("Network / unexpected error creating customer:", err);
      // If CORS/preflight blocked the request you'll see a TypeError here
      toast.error("Network error while creating customer. Please try again.");
    }
  }

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
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-6 w-full md:max-w-xl">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Customer Management</h1>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 bg-search-bg border-search-border rounded-full h-10 focus:ring-2 focus:ring-chart-primary focus:border-chart-primary"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="w-full md:w-auto flex justify-end">
          <Button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2" aria-haspopup="dialog">
            <PlusCircle className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

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
                            // populate form for editing; convert server shape if required
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

      {/* DRAWER FORM */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <aside
            className="absolute right-0 top-0 h-full w-full sm:w-[720px] md:w-[900px] lg:w-[1000px] bg-white shadow-2xl p-6 overflow-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-customer-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="add-customer-title" className="text-2xl font-semibold">
                Add Customer
              </h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded hover:bg-slate-100" type="button">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: avatar / upload box */}
              <div className="w-full md:w-56 flex-shrink-0">
                <div className="w-full max-w-[220px] bg-white p-4 rounded-lg border">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center mb-3 border cursor-pointer"
                      onClick={openFileDialog}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload photo"
                    >
                      {form.photoPreview ? (
                        <img
                          src={form.photoPreview}
                          alt={`${form.customerName || "Customer"} avatar`}
                          className="w-full h-full object-cover"
                        />
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
                      <button
                        type="button"
                        onClick={openFileDialog}
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 text-white rounded"
                      >
                        <Camera size={16} /> Upload
                      </button>
                      {form.photoFile && (
                        <button
                          type="button"
                          onClick={() => setForm((s) => ({ ...s, photoFile: null, photoPreview: "" }))}
                          className="mt-2 w-full px-4 py-2 border rounded"
                        >
                          Remove
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e)} className="hidden" />
                      {errors.photoFile && <p className="text-red-500 text-sm mt-2">{errors.photoFile}</p>}
                      <p className="text-xs text-slate-500 mt-2 text-center">JPG / PNG / WEBP — max 5MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: form */}
              <div className="flex-1">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select name="state" value={form.state} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                        <option value="">Select state</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select name="district" value={form.district} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                        <option value="">Select district</option>
                        {districtOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        Taluk / SubDistrict <span className="text-red-500">*</span>
                      </label>
                      <select name="taluk" value={form.taluk} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                        <option value="">Select taluk</option>
                        {talukOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errors.taluk && <p className="text-red-500 text-sm">{errors.taluk}</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        Postal (PIN) <span className="text-red-500">*</span>
                      </label>
                      <input name="postal" value={form.postal} onChange={handleChange} placeholder="6-digit PIN" className="w-full p-3 border rounded" />
                      {errors.postal && <p className="text-red-500 text-sm">{errors.postal}</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        Village <span className="text-red-500">*</span>
                      </label>
                      <select name="village" value={form.village} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                        <option value="">Select village</option>
                        {villageOptions.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                      {errors.village && <p className="text-red-500 text-sm">{errors.village}</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        Shop Type <span className="text-red-500">*</span>
                      </label>
                      <select name="shopType" value={form.shopType} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
                        {shopTypes.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.shopType && <p className="text-red-500 text-sm">{errors.shopType}</p>}
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm text-slate-600">
                        Shop Name <span className="text-red-500">*</span>
                      </label>
                      <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="Enter shop name" className="w-full p-3 border rounded" />
                      {errors.shopName && <p className="text-red-500 text-sm">{errors.shopName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Enter customer name" className="w-full p-3 border rounded" />
                      {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600">Customer Local Name</label>
                      <input name="customerLocalName" value={form.customerLocalName} onChange={handleChange} placeholder="Local name (optional)" className="w-full p-3 border rounded" />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input name="phone1" value={form.phone1} onChange={handleChange} placeholder="10-digit phone" className="w-full p-3 border rounded" />
                      {errors.phone1 && <p className="text-red-500 text-sm">{errors.phone1}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600">Phone 2</label>
                      <input name="phone2" value={form.phone2} onChange={handleChange} placeholder="Alternate phone" className="w-full p-3 border rounded" />
                      {errors.phone2 && <p className="text-red-500 text-sm">{errors.phone2}</p>}
                    </div>

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

                    <div className="md:col-span-3">
                      <label className="block text-sm text-slate-600">Address</label>
                      <input name="address" value={form.address} onChange={handleChange} placeholder="Enter address" className="w-full p-3 border rounded" />
                      {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                    </div>

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

                  <div className="mt-6 flex justify-start gap-3">
                    <button type="button" onClick={() => { setDrawerOpen(false); setErrors({}); }} className="px-4 py-2 rounded border">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
                      Save Customer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}


