

// import React, { useEffect, useState, useRef } from "react";
// import { Search, PlusCircle, Camera, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import toast, { Toaster } from "react-hot-toast";

// export default function Customer(): JSX.Element {
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   type CustomerForm = {
//     image: File | null;
//     photoPreview: string;
//     state: string;
//     district: string;
//     taluk: string;
//     postal: string;
//     village: string;
//     shopType: string;
//     shopName: string;
//     customerName: string;
//     customerLocalName: string;
//     villageLocalName: string;
//     phone1: string;
//     phone2: string;
//     gst: string;
//     pan: string;
//     address: string;
//     shopBreak: string;
//     fridge: string;
//     avgSales: string;
//     smartPhoneUser: string;
//     // NEW: lat/lon strings (kept as string for flexible input)
//     latitude?: string;
//     longitude?: string;
//   };

//   type CustomerFormErrors = Partial<Record<keyof CustomerForm, string>>;

//   const [errors, setErrors] = useState<CustomerFormErrors>({});
//   const [form, setForm] = useState<CustomerForm>({
//     image: null,
//     photoPreview: "",
//     state: "",
//     district: "",
//     taluk: "",
//     postal: "",
//     village: "",
//     shopType: "Shop",
//     shopName: "",
//     customerName: "",
//     customerLocalName: "",
//     villageLocalName: "",
//     phone1: "",
//     phone2: "",
//     gst: "",
//     pan: "",
//     address: "",
//     shopBreak: "No Break",
//     fridge: "",
//     avgSales: "",
//     smartPhoneUser: "yes",
//     latitude: "",
//     longitude: "",
//   });

//   // replaced static customers array with fetched data
//   const [customers, setCustomers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingError, setLoadingError] = useState<string | null>(null);

//   const [geoLoading, setGeoLoading] = useState(false); // NEW: loading state for lat/lon lookup

//   // NEW: track currently editing customer's id (null when creating)
//   const [editingId, setEditingId] = useState<string | number | null>(null);

//   const LABELS: Record<string, string> = {
//     state: "State",
//     district: "District",
//     taluk: "Taluk/SubDistrict",
//     postal: "Postal",
//     village: "Village",
//     shopName: "Shop Name",
//     customerName: "Customer Name",
//     phone1: "Phone",
//     phone2: "Phone 2",
//     gst: "GST",
//     pan: "PAN",
//     address: "Address",
//     shopBreak: "Shop Break",
//     avgSales: "Avg Sales",
//     smartPhoneUser: "Smart Phone User",
//   };

//   const [query, setQuery] = useState("");

//   // hierarchical static selects
//   const STATES = ["Telangana", "State A", "State B"];
//   const DISTRICT_MAP: Record<string, string[]> = {
//     Telangana: ["Hyderabad", "Nizamabad", "Warangal", "Karimnagar"],
//     "State A": ["District A1", "District A2"],
//     "State B": ["District B1"],
//   };
//   const TALUK_MAP: Record<string, string[]> = {
//     Hyderabad: ["Medchal", "Ranga Reddy", "Secunderabad"],
//     Nizamabad: ["Banswada", "Nizamabad Taluk"],
//     Warangal: ["Hanamkonda", "Warangal Rural"],
//     Karimnagar: ["Karimnagar", "Husnabad"],
//     "District A1": ["Taluk A1-1", "Taluk A1-2"],
//     "District A2": ["Taluk A2-1"],
//     "District B1": ["Taluk B1-1"],
//   };
//   const VILLAGE_MAP: Record<string, string[]> = {
//     Medchal: ["Uppal", "Kushaiguda", "Borabanda"],
//     "Ranga Reddy": ["LB Nagar", "Attapur"],
//     Secunderabad: ["Trimulgherry", "Secunderabad City"],
//     Banswada: ["Bodhan", "Banswada Town"],
//     "Nizamabad Taluk": ["Nizamabad City"],
//     Hanamkonda: ["Kazipet", "Hanamkonda Town"],
//     "Karimnagar": ["Karimnagar City", "Sircilla"],
//     Husnabad: ["Husnabad Town"],
//     "Taluk A1-1": ["Village A1-1a"],
//     "Taluk A1-2": ["Village A1-2a"],
//     "Taluk A2-1": ["Village A2-1a"],
//     "Taluk B1-1": ["Village B1-1a"],
//   };
//   const shopTypes = ["Shop", "Home", "Kirana", "Wholesale", "Temporary Stall"];

//   const [districtOptions, setDistrictOptions] = useState<string[]>([]);
//   const [talukOptions, setTalukOptions] = useState<string[]>([]);
//   const [villageOptions, setVillageOptions] = useState<string[]>([]);

//   // Example mapping label -> numeric ID for backend. Update to match your database IDs.
//   const STATE_ID_MAP: Record<string, number> = { Telangana: 1, "State A": 2, "State B": 3 };
//   const DISTRICT_ID_MAP: Record<string, number> = {
//     Hyderabad: 1,
//     Nizamabad: 2,
//     Warangal: 3,
//     Karimnagar: 4,
//     "District A1": 11,
//     "District A2": 12,
//     "District B1": 21,
//   };
//   const TALUK_ID_MAP: Record<string, number> = {
//     Medchal: 1,
//     "Ranga Reddy": 2,
//     Secunderabad: 3,
//     Banswada: 4,
//     "Nizamabad Taluk": 5,
//     Hanamkonda: 6,
//     "Karimnagar": 7,
//     Husnabad: 8,
//   };
//   const VILLAGE_ID_MAP: Record<string, number> = {
//     Uppal: 1,
//     Kushaiguda: 2,
//     Borabanda: 3,
//     "LB Nagar": 4,
//     Attapur: 5,
//   };
//   const SHOPTYPE_ID_MAP: Record<string, number> = { Shop: 1, Home: 2, Kirana: 3, Wholesale: 4, "Temporary Stall": 5 };

//   // ---------- NEW: robust GET on mount ----------
//   useEffect(() => {
//     const controller = new AbortController();

//     async function safeReadResponseText(res: Response) {
//       try {
//         const t = await res.text();
//         return t || res.statusText || "Unknown error";
//       } catch {
//         return res.statusText || "Unknown error";
//       }
//     }

//     function normalizeRow(r: any) {
//       if (!r) return null;
//       return {
//         id: r.id ?? r._id ?? r.customer_id ?? r.uuid ?? String(Math.random()).slice(2),
//         photoPreview: r.photoPreview ?? r.photo_url ?? r.imageUrl ?? r.image ?? "",
//         imageUrl: r.photo_url ?? r.imageUrl,
//         state: r.state ?? r.state_name ?? "",
//         district: r.district ?? r.district_name ?? "",
//         taluk: r.taluk ?? r.taluk_name ?? "",
//         postal: r.pin ?? r.postal ?? r.postal_code ?? "",
//         village: r.village ?? r.village_name ?? "",
//         shopType: r.shop_type ?? r.shopType ?? "",
//         shopName: r.shop_name ?? r.shopName ?? "",
//         customerName: r.customer_name ?? r.customerName ?? "",
//         customerLocalName: r.customer_local_name ?? r.customerLocalName ?? "",
//         villageLocalName: r.village_local_name ?? r.villageLocalName ?? "",
//         phone1: r.phone ?? r.phone1 ?? "",
//         phone2: r.phone2 ?? "",
//         gst: r.gst_no ?? r.gst ?? "",
//         pan: r.pan_no ?? r.pan ?? "",
//         address: r.address ?? "",
//         landmark: r.landmark ?? "",
//         shopBreak: r.shop_break ?? r.shopBreak ?? "",
//         fridge: r.fridge ?? "",
//         avgSales: r.avg_sales ?? r.avgSales ?? "",
//         smartPhoneUser: r.smartphone_user ?? r.smartPhoneUser ?? "",
//         ...r,
//       };
//     }

//     const fetchCustomers = async () => {
//       setLoading(true);
//       setLoadingError(null);
//       try {
//         const res = await fetch("http://192.168.29.102:5000/api/customers", { signal: controller.signal });
//         if (!res.ok) {
//           const txt = await safeReadResponseText(res);
//           const msg = `Failed to load customers (${res.status}) — ${txt}`;
//           console.error(msg);
//           setLoadingError(msg);
//           toast.error("Unable to load customers. Check console for details.");
//           setCustomers([]);
//           return;
//         }

//         const body = await res.json().catch(() => null);

//         // Detect array in common payload shapes
//         let rows: any[] = [];
//         if (body?.rows && Array.isArray(body.rows)) rows = body.rows;
//         else if (body?.data && Array.isArray(body.data)) rows = body.data;
//         else if (body?.customers && Array.isArray(body.customers)) rows = body.customers;
//         else if (Array.isArray(body)) rows = body;
//         else {
//           // If API returns object with an inner property for items, log it for debugging.
//           console.warn("Unexpected customers payload shape:", body);
//         }

//         const normalized = rows.map((r) => normalizeRow(r)).filter(Boolean);
//         setCustomers(normalized);
//       } catch (err: any) {
//         if (err.name === "AbortError") return;
//         console.error("Network error fetching customers:", err);
//         setLoadingError("Network error fetching customers");
//         toast.error("Network error while loading customers");
//         setCustomers([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCustomers();
//     return () => controller.abort();
//   }, []);
//   // ---------- end GET ----------

//   // update select dependent lists
//   useEffect(() => {
//     if (!form.state) {
//       setDistrictOptions([]);
//       setTalukOptions([]);
//       setVillageOptions([]);
//       setForm((s) => ({ ...s, district: "", taluk: "", village: "" }));
//       return;
//     }
//     const d = DISTRICT_MAP[form.state] ?? [];
//     setDistrictOptions(d);
//     if (!d.includes(form.district)) setForm((s) => ({ ...s, district: "", taluk: "", village: "" }));
//   }, [form.state]);

//   useEffect(() => {
//     if (!form.district) {
//       setTalukOptions([]);
//       setVillageOptions([]);
//       setForm((s) => ({ ...s, taluk: "", village: "" }));
//       return;
//     }
//     const t = TALUK_MAP[form.district] ?? [];
//     setTalukOptions(t);
//     if (!t.includes(form.taluk)) setForm((s) => ({ ...s, taluk: "", village: "" }));
//   }, [form.district]);

//   useEffect(() => {
//     if (!form.taluk) {
//       setVillageOptions([]);
//       setForm((s) => ({ ...s, village: "" }));
//       return;
//     }
//     const v = VILLAGE_MAP[form.taluk] ?? [];
//     setVillageOptions(v);
//     if (!v.includes(form.village)) setForm((s) => ({ ...s, village: "" }));
//   }, [form.taluk]);

//   // input change handling
//   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
//     const { name, value } = e.target as HTMLInputElement;
//     if (name === "phone1" || name === "phone2") {
//       setForm((s) => ({ ...s, [name]: value.replace(/\D/g, "").slice(0, 10) }));
//       setErrors((p) => ({ ...p, [name]: undefined }));
//       return;
//     }
//     if (name === "avgSales") {
//       setForm((s) => ({ ...s, [name]: value.replace(/[^0-9.]/g, "") }));
//       setErrors((p) => ({ ...p, [name]: undefined }));
//       return;
//     }
//     setForm((s) => ({ ...s, [name]: value }));
//     setErrors((p) => ({ ...p, [name]: undefined }));
//   }

//   function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) return;
//     const okTypes = ["image/jpeg", "image/png", "image/webp"];
//     const maxMB = 5;
//     if (!okTypes.includes(f.type)) {
//       setErrors((p) => ({ ...p, photoFile: "Only JPG / PNG / WEBP allowed" }));
//       return;
//     }
//     if (f.size > maxMB * 1024 * 1024) {
//       setErrors((p) => ({ ...p, photoFile: `Image must be < ${maxMB}MB` }));
//       return;
//     }
//     const reader = new FileReader();
//     reader.onload = () => {
//       setForm((s) => ({ ...s, image: f, photoPreview: reader.result as string }));
//       setErrors((p) => ({ ...p, photoFile: undefined }));
//     };
//     reader.readAsDataURL(f);
//   }

//   function openFileDialog() {
//     fileInputRef.current?.click();
//   }

//   // basic validation
//   function validateAll() {
//     const newErrors: CustomerFormErrors = {};
//     (["state", "district", "taluk", "postal", "village", "shopName", "customerName", "phone1"] as Array<
//       keyof CustomerForm
//     >).forEach((k) => {
//       if (!form[k] || String(form[k]).trim() === "") newErrors[k] = `${LABELS[k] || k} is required`;
//     });
//     if (form.phone1 && !/^\d{10}$/.test(form.phone1)) newErrors.phone1 = "Enter 10-digit phone";
//     if (form.postal && !/^\d{6}$/.test(String(form.postal))) newErrors.postal = "Enter 6-digit postal code";
//     if (form.pan && !/^[A-Z]{5}\d{4}[A-Z]$/i.test(form.pan)) newErrors.pan = "Invalid PAN";
//     if (form.gst && !/^[0-9A-Z]{15}$/i.test(form.gst)) newErrors.gst = "Invalid GST";
//     if (form.avgSales && isNaN(Number(form.avgSales))) newErrors.avgSales = "Must be a number";
//     return newErrors;
//   }

//   // helper: label -> id where applicable (returns numeric string or original)
//   function labelToId<T extends Record<string, number>>(labelOrId: string, map: T | undefined): string {
//     if (!labelOrId) return "";
//     if (/^\d+$/.test(labelOrId)) return labelOrId; // already numeric id
//     if (!map) return labelOrId;
//     const id = map[labelOrId];
//     return id !== undefined ? String(id) : labelOrId;
//   }

//   // Build FormData that matches backend expected keys
//   function buildApiFormDataSafe(f: CustomerForm) {
//     const fd = new FormData();

//     // Append file as 'photo'
//     if (f.image) fd.append("image", f.image);

//     // helper to always append keys (avoid missing keys server-side)
//     const safeAppend = (key: string, val: any) => fd.append(key, val == null ? "" : String(val));

//     // Basic fields
//     safeAppend("shop_name", f.shopName ?? "");
//     safeAppend("customer_name", f.customerName ?? "");
//     safeAppend("customer_local_name", f.customerLocalName ?? "");

//     // Phones
//     safeAppend("phone", f.phone1 ?? "");
//     safeAppend("phone2", f.phone2 ?? "");

//     // Convert selects to IDs when mappings exist (or pass through numeric ID)
//     safeAppend("state_id", labelToId(f.state, STATE_ID_MAP) || "");
//     safeAppend("district_id", labelToId(f.district, DISTRICT_ID_MAP) || "");
//     safeAppend("taluk_id", labelToId(f.taluk, TALUK_ID_MAP) || "");
//     safeAppend("village_id", labelToId(f.village, VILLAGE_ID_MAP) || "");
//     safeAppend("pin", f.postal ?? "");

//     // Shop type ID (map)
//     safeAppend("shop_type_id", labelToId(f.shopType, SHOPTYPE_ID_MAP) || "");

//     // Reg numbers / address
//     safeAppend("gst_no", f.gst ?? "");
//     safeAppend("pan_no", f.pan ?? "");
//     safeAppend("address", f.address ?? "");

//     // Other attributes
//     safeAppend("shop_break", f.shopBreak ?? "");
//     safeAppend("fridge", f.fridge ?? "");
//     safeAppend("avg_sales", f.avgSales ?? "");

//     // Smartphone -> numeric flag 1|0
//     const smartphoneFlag = f.smartPhoneUser === "yes" || f.smartPhoneUser === "1" ? "1" : "0";
//     safeAppend("smartphone_user", smartphoneFlag);

//     // Optionally include lat/lon if present
//     safeAppend("latitude", f.latitude ?? "");
//     safeAppend("longitude", f.longitude ?? "");

//     // Optional debug/test payload
//     safeAppend(
//       "testData",
//       JSON.stringify({
//         source: "frontend-v2",
//         ts: new Date().toISOString(),
//       })
//     );

//     return fd;
//   }

//   // submit handler (POST create or PUT update if editingId set)
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     const ne = validateAll();
//     if (Object.keys(ne).length) {
//       setErrors(ne);
//       const el = document.querySelector(".text-red-500");
//       if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
//       return;
//     }

//     const payload = buildApiFormDataSafe(form);
//     console.log("TESTPAYLOAD", payload);
//     // Debugging: iterate and log entries (files printed as File objects)
//     try {
//       console.group("FormData contents before send");
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       for (const pair of (payload as any).entries()) {
//         const [k, v] = pair;
//         if (v instanceof File) {
//           console.log(k, "(File):", v.name, v.type, v.size);
//         } else {
//           console.log(k, ":", v);
//         }
//       }
//       console.groupEnd();
//     } catch {
//       // ignore if iteration not supported in env
//     }

//     try {
//       // Use fetch and DO NOT set Content-Type header (browser will set the multipart boundary)
//       const url = editingId ? `http://192.168.29.102:5000/api/customers/${editingId}` : "http://192.168.29.102:5000/api/customers";
//       const method = editingId ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         body: payload,
//       });

//       if (!res.ok) {
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
//         console.error("Failed to save customer:", errText);
//         toast.error(`Failed to save customer: ${errText}`);
//         return;
//       }

//       // parse success response
//       let body: any = null;
//       try {
//         body = await res.json();
//       } catch {
//         body = null;
//       }

//       const createdOrUpdated = (body && (body.row ?? body.data ?? body.customer ?? body)) || null;

//       if (editingId) {
//         // update local list: replace the item with server response if available, else merge form into existing
//         setCustomers((prev) =>
//           prev.map((item) => {
//             if (item.id === editingId) {
//               if (createdOrUpdated) {
//                 // try to use returned object
//                 return { ...item, ...createdOrUpdated };
//               }
//               // fallback: merge some fields from form
//               return { ...item, ...form, photoPreview: form.photoPreview || item.photoPreview };
//             }
//             return item;
//           })
//         );
//         toast.success("Customer updated successfully");
//       } else {
//         if (createdOrUpdated) {
//           setCustomers((prev) => [createdOrUpdated, ...prev]);
//         } else {
//           const optimistic: any = {
//             id: `tmp-${Date.now()}`,
//             photoPreview: form.photoPreview || "",
//             shopName: form.shopName,
//             customerName: form.customerName,
//             phone1: form.phone1,
//             village: form.village,
//             district: form.district,
//           };
//           setCustomers((prev) => [optimistic, ...prev]);
//           console.warn("API did not return created object, added optimistic item", body);
//         }
//         toast.success("Customer created successfully");
//       }

//       // reset drawer + editing state
//       setDrawerOpen(false);
//       setErrors({});
//       setEditingId(null);
//       console.log("Save response:", body);
//     } catch (err: any) {
//       console.error("Network / unexpected error saving customer:", err);
//       // If CORS/preflight blocked the request you'll see a TypeError here
//       toast.error("Network error while saving customer. Please try again.");
//     }
//   }

//   const filteredCustomers = customers.filter((c) => {
//     if (!query) return true;
//     const q = query.toLowerCase().trim();
//     return (
//       String(c.shopName || "").toLowerCase().includes(q) ||
//       String(c.customerName || "").toLowerCase().includes(q) ||
//       String(c.phone1 || "").toLowerCase().includes(q) ||
//       String(c.villageLocalName || c.village || "").toLowerCase().includes(q) ||
//       String(c.district || "").toLowerCase().includes(q)
//     );
//   });

//   // ------------------ NEW: reverse-geocoding from lat/lon ------------------
//   const handleLookupFromLatLon = async () => {
//     const lat = (form.latitude ?? "").trim();
//     const lon = (form.longitude ?? "").trim();

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
//       const r = await fetch(nominatimUrl, {
//         headers: {
//           Accept: "application/json",
//         },
//       });

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
//   // ----------------------------------------------------------------------

//   // ---------- DELETE API: call backend then update local state ----------
//   const handleDeleteApi = async (id: string | number) => {
//     if (!confirm("Delete this customer?")) return;
//     try {
//       const res = await fetch(`http://192.168.29.102:5000/api/customers/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         let errText = `Server error (${res.status})`;
//         try {
//           const errBody = await res.json();
//           if (errBody && (errBody.message || errBody.error || errBody.errors)) {
//             errText = errBody.message || errBody.error || JSON.stringify(errBody.errors);
//           }
//         } catch {}
//         throw new Error(errText);
//       }
//       // remove from UI on success
//       setCustomers((prev) => prev.filter((x) => x.id !== id));
//       toast.success("Customer deleted");
//     } catch (err: any) {
//       console.error("Delete error:", err);
//       toast.error("Failed to delete customer. Check console for details.");
//     }
//   };
//   // ----------------------------------------------------------------------

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <Toaster position="top-right" />
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
//         <div className="flex items-center gap-6 w-full md:max-w-xl">
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-900">Customer Management</h1>
//           </div>

//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="pl-9 pr-4 bg-search-bg border-search-border rounded-full h-10 focus:ring-2 focus:ring-chart-primary focus:border-chart-primary"
//               aria-label="Search"
//             />
//           </div>
//         </div>

//         <div className="w-full md:w-auto flex justify-end">
//           <Button
//             onClick={() => {
//               // open drawer in create mode: clear editingId and form (keep behavior similar to original)
//               setEditingId(null);
//               setForm({
//                 image: null,
//                 photoPreview: "",
//                 state: "",
//                 district: "",
//                 taluk: "",
//                 postal: "",
//                 village: "",
//                 shopType: "Shop",
//                 shopName: "",
//                 customerName: "",
//                 customerLocalName: "",
//                 villageLocalName: "",
//                 phone1: "",
//                 phone2: "",
//                 gst: "",
//                 pan: "",
//                 address: "",
//                 shopBreak: "No Break",
//                 fridge: "",
//                 avgSales: "",
//                 smartPhoneUser: "yes",
//                 latitude: "",
//                 longitude: "",
//               });
//               setDrawerOpen(true);
//             }}
//             className="flex items-center gap-2"
//             aria-haspopup="dialog"
//           >
//             <PlusCircle className="w-4 h-4" />
//             Add Customer
//           </Button>
//         </div>
//       </div>

//       {/* Customer List */}
//       <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
//         <h2 className="text-xl font-semibold mb-6">Customer List</h2>

//         {loading ? (
//           <div className="py-8 text-center text-slate-500">Loading customers…</div>
//         ) : loadingError ? (
//           <div className="py-8 text-center">
//             <div className="text-red-600 mb-2">Failed to load customers</div>
//             <div className="text-sm text-slate-500 mb-4">{loadingError}</div>
//             <div>
//               <Button onClick={() => window.location.reload()}>Retry</Button>
//             </div>
//           </div>
//         ) : filteredCustomers.length === 0 ? (
//           <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400">
//             <div className="w-20 h-20 rounded-full bg-slate-100 grid place-items-center mb-4">
//               <Search size={28} />
//             </div>
//             <p className="text-slate-500 mb-1">No customers found</p>
//             <p className="text-slate-400">Try a different search or add a customer</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-slate-50">
//                   <th className="p-3">#</th>
//                   <th className="p-3">Shop</th>
//                   <th className="p-3">Customer</th>
//                   <th className="p-3">Phone</th>
//                   <th className="p-3">Village</th>
//                   <th className="p-3">District</th>
//                   <th className="p-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCustomers.map((c, idx) => (
//                   <tr key={c.id} className="border-b">
//                     <td className="p-3 align-top">{idx + 1}</td>
//                     <td className="p-3 align-top">
//                       <div className="font-medium">{c.shopName}</div>
//                       <div className="text-xs text-slate-500">{c.shopType}</div>
//                     </td>
//                     <td className="p-3 align-top">
//                       <div className="font-medium">{c.customerName}</div>
//                       {c.customerLocalName && <div className="text-xs text-slate-500">{c.customerLocalName}</div>}
//                     </td>
//                     <td className="p-3 align-top">{c.phone1}</td>
//                     <td className="p-3 align-top">{c.villageLocalName || c.village}</td>
//                     <td className="p-3 align-top">{c.district}</td>
//                     <td className="p-3 align-top">
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() => {
//                             // populate form for editing; convert server shape if required
//                             setForm((s) => ({ ...s, ...c, photoPreview: c.photoPreview ?? "" }));
//                             setEditingId(c.id); // NEW: mark editing id
//                             setDrawerOpen(true);
//                           }}
//                           className="px-3 py-1 border rounded text-sm"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             // call API delete
//                             handleDeleteApi(c.id);
//                           }}
//                           className="px-3 py-1 rounded bg-red-500 text-white text-sm"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* DRAWER FORM */}
//       {drawerOpen && (
//         <div className="fixed inset-0 z-40">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
//           <aside
//             className="absolute right-0 top-0 h-full w-full sm:w-[720px] md:w-[900px] lg:w-[1000px] bg-white shadow-2xl p-6 overflow-auto"
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="add-customer-title"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h3 id="add-customer-title" className="text-2xl font-semibold">
//                 {editingId ? "Edit Customer" : "Add Customer"}
//               </h3>
//               <button
//                 onClick={() => {
//                   setDrawerOpen(false);
//                   setEditingId(null);
//                 }}
//                 className="p-2 rounded hover:bg-slate-100"
//                 type="button"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="flex flex-col md:flex-row gap-6">
//               {/* Left: avatar / upload box */}
//               <div className="w-full md:w-56 flex-shrink-0">
//                 <div className="w-full max-w-[220px] bg-white p-4 rounded-lg border">
//                   <div className="flex flex-col items-center">
//                     <div
//                       className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center mb-3 border cursor-pointer"
//                       onClick={openFileDialog}
//                       role="button"
//                       tabIndex={0}
//                       aria-label="Upload photo"
//                     >
//                       {form.photoPreview ? (
//                         <img
//                           src={form.photoPreview}
//                           alt={`${form.customerName || "Customer"} avatar`}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="text-slate-300">
//                           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                             <rect x="3" y="3" width="18" height="14" rx="2" />
//                             <path d="M3 17l4-4 3 3 4-5 5 5" />
//                           </svg>
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex flex-col items-center w-full">
//                       <button
//                         type="button"
//                         onClick={openFileDialog}
//                         className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 text-white rounded"
//                       >
//                         <Camera size={16} /> Upload
//                       </button>
//                       {form.image && (
//                         <button
//                           type="button"
//                           onClick={() => setForm((s) => ({ ...s, image: null, photoPreview: "" }))}
//                           className="mt-2 w-full px-4 py-2 border rounded"
//                         >
//                           Remove
//                         </button>
//                       )}
//                       <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e)} className="hidden" />
//                       {errors.photoFile && <p className="text-red-500 text-sm mt-2">{errors.photoFile}</p>}
//                       <p className="text-xs text-slate-500 mt-2 text-center">JPG / PNG / WEBP — max 5MB</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right: form */}
//               <div className="flex-1">
//                 <form onSubmit={handleSubmit}>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="md:col-span-1">
//                       <label className="block text-sm text-slate-600">
//                         State <span className="text-red-500">*</span>
//                       </label>
//                       <select name="state" value={form.state} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                         <option value="">Select state</option>
//                         {STATES.map((s) => (
//                           <option key={s} value={s}>
//                             {s}
//                           </option>
//                         ))}
//                       </select>
//                       {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
//                     </div>

//                     <div className="md:col-span-1">
//                       <label className="block text-sm text-slate-600">
//                         District <span className="text-red-500">*</span>
//                       </label>
//                       <select name="district" value={form.district} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                         <option value="">Select district</option>
//                         {districtOptions.map((d) => (
//                           <option key={d} value={d}>
//                             {d}
//                           </option>
//                         ))}
//                       </select>
//                       {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
//                     </div>

//                     <div className="md:col-span-1">
//                       <label className="block text-sm text-slate-600">
//                         Taluk / SubDistrict <span className="text-red-500">*</span>
//                       </label>
//                       <select name="taluk" value={form.taluk} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                         <option value="">Select taluk</option>
//                         {talukOptions.map((t) => (
//                           <option key={t} value={t}>
//                             {t}
//                           </option>
//                         ))}
//                       </select>
//                       {errors.taluk && <p className="text-red-500 text-sm">{errors.taluk}</p>}
//                     </div>

//                     <div className="md:col-span-1">
//                       <label className="block text-sm text-slate-600">
//                         Postal (PIN) <span className="text-red-500">*</span>
//                       </label>
//                       <input name="postal" value={form.postal} onChange={handleChange} placeholder="6-digit PIN" className="w-full p-3 border rounded" />
//                       {errors.postal && <p className="text-red-500 text-sm">{errors.postal}</p>}
//                     </div>

//                     <div className="md:col-span-1">
//                       <label className="block text-sm text-slate-600">
//                         Village <span className="text-red-500">*</span>
//                       </label>
//                       <select name="village" value={form.village} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                         <option value="">Select village</option>
//                         {villageOptions.map((v) => (
//                           <option key={v} value={v}>
//                             {v}
//                           </option>
//                         ))}
//                       </select>
//                       {errors.village && <p className="text-red-500 text-sm">{errors.village}</p>}
//                     </div>

//                     <div className="md:col-span-1">
//                       <label className="block text-sm text-slate-600">
//                         Shop Type <span className="text-red-500">*</span>
//                       </label>
//                       <select name="shopType" value={form.shopType} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                         {shopTypes.map((st) => (
//                           <option key={st} value={st}>
//                             {st}
//                           </option>
//                         ))}
//                       </select>
//                       {errors.shopType && <p className="text-red-500 text-sm">{errors.shopType}</p>}
//                     </div>

//                     <div className="md:col-span-3">
//                       <label className="block text-sm text-slate-600">
//                         Shop Name <span className="text-red-500">*</span>
//                       </label>
//                       <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="Enter shop name" className="w-full p-3 border rounded" />
//                       {errors.shopName && <p className="text-red-500 text-sm">{errors.shopName}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">
//                         Customer Name <span className="text-red-500">*</span>
//                       </label>
//                       <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Enter customer name" className="w-full p-3 border rounded" />
//                       {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">Customer Local Name</label>
//                       <input name="customerLocalName" value={form.customerLocalName} onChange={handleChange} placeholder="Local name (optional)" className="w-full p-3 border rounded" />
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">
//                         Phone <span className="text-red-500">*</span>
//                       </label>
//                       <input name="phone1" value={form.phone1} onChange={handleChange} placeholder="10-digit phone" className="w-full p-3 border rounded" />
//                       {errors.phone1 && <p className="text-red-500 text-sm">{errors.phone1}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">Phone 2</label>
//                       <input name="phone2" value={form.phone2} onChange={handleChange} placeholder="Alternate phone" className="w-full p-3 border rounded" />
//                       {errors.phone2 && <p className="text-red-500 text-sm">{errors.phone2}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">GST</label>
//                       <input name="gst" value={form.gst} onChange={handleChange} placeholder="GST (optional)" className="w-full p-3 border rounded" />
//                       {errors.gst && <p className="text-red-500 text-sm">{errors.gst}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">PAN</label>
//                       <input name="pan" value={form.pan} onChange={handleChange} placeholder="PAN (optional)" className="w-full p-3 border rounded" />
//                       {errors.pan && <p className="text-red-500 text-sm">{errors.pan}</p>}
//                     </div>

//                     {/* NEW: Latitude & Longitude + Lookup button */}
//                     <div className="md:col-span-3">
//                       <label className="block text-sm text-slate-600">Address</label>

//                       <div className="mt-1 grid grid-cols-1 gap-2">
//                         <div className="grid grid-cols-2 gap-2">
//                           <input
//                             name="latitude"
//                             value={form.latitude}
//                             onChange={handleChange}
//                             placeholder="Latitude (e.g. 17.3850)"
//                             className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           />
//                           <input
//                             name="longitude"
//                             value={form.longitude}
//                             onChange={handleChange}
//                             placeholder="Longitude (e.g. 78.4867)"
//                             className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           />
//                         </div>

//                         <div className="flex gap-2">
//                           <input
//                             name="address"
//                             value={form.address}
//                             onChange={handleChange}
//                             placeholder="Enter address or use Lookup"
//                             className="flex-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           />
//                           <div className="w-36 flex-shrink-0">
//                             <button
//                               type="button"
//                               onClick={handleLookupFromLatLon}
//                               className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
//                                 geoLoading ? "bg-gray-100" : "bg-white hover:bg-gray-50"
//                               }`}
//                               disabled={geoLoading}
//                             >
//                               {geoLoading ? "Looking…" : "Lookup"}
//                             </button>
//                           </div>
//                         </div>
//                       </div>

//                       {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
//                       <p className="text-xs text-gray-400 mt-1">
//                         Enter latitude and longitude, then click <strong>Lookup</strong> to auto-fill the address via reverse geocoding.
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm text-slate-600">Shop Break</label>
//                         <select name="shopBreak" value={form.shopBreak} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                           <option value="No Break">No Break</option>
//                           <option value="30 mins">30 mins</option>
//                           <option value="1 hour">1 hour</option>
//                         </select>
//                         {errors.shopBreak && <p className="text-red-500 text-sm">{errors.shopBreak}</p>}
//                       </div>

//                       <div>
//                         <label className="block text-sm text-slate-600">Fridge</label>
//                         <select name="fridge" value={form.fridge} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                           <option value="">Select</option>
//                           <option value="Yes">Yes</option>
//                           <option value="No">No</option>
//                         </select>
//                         {errors.fridge && <p className="text-red-500 text-sm">{errors.fridge}</p>}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">Avg Sales (per day)</label>
//                       <input name="avgSales" value={form.avgSales} onChange={handleChange} placeholder="0.00" className="w-full p-3 border rounded" />
//                       {errors.avgSales && <p className="text-red-500 text-sm">{errors.avgSales}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-600">Smart Phone User</label>
//                       <select name="smartPhoneUser" value={form.smartPhoneUser} onChange={handleChange} className="w-full p-3 border rounded bg-slate-50">
//                         <option value="yes">yes</option>
//                         <option value="no">no</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="mt-6 flex justify-start gap-3">
//                     <button type="button" onClick={() => { setDrawerOpen(false); setErrors({}); setEditingId(null); }} className="px-4 py-2 rounded border">
//                       Cancel
//                     </button>
//                     <button type="submit" className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
//                       {editingId ? "Update Customer" : "Save Customer"}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </aside>
//         </div>
//       )}
//     </div>
//   );
// }

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
    latitude?: string;
    longitude?: string;
  };

  type CustomerFormErrors = Partial<Record<keyof CustomerForm, string>>;

  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [form, setForm] = useState<CustomerForm>({
    image: null,
    photoPreview: "",
    state: "",
    district: "",
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
    latitude: "",
    longitude: "",
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const LABELS: Record<string, string> = {
    state: "State",
    district: "District",
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

  // UI state list (state remains a select)
  const STATES = ["Telangana", "State A", "State B"];

  // maps (used to convert strings -> ids for backend)
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

  // numeric id maps (backend)
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
  const VILLAGE_ID_MAP: Record<string, number> = {
    Uppal: 1,
    Kushaiguda: 2,
    Borabanda: 3,
    "LB Nagar": 4,
    Attapur: 5,
  };
  const SHOPTYPE_ID_MAP: Record<string, number> = { Shop: 1, Home: 2, Kirana: 3, Wholesale: 4, "Temporary Stall": 5 };

  // ---------- fetch customers on mount (unchanged) ----------
  useEffect(() => {
    const controller = new AbortController();

    async function safeReadResponseText(res: Response) {
      try {
        const t = await res.text();
        return t || res.statusText || "Unknown error";
      } catch {
        return res.statusText || "Unknown error";
      }
    }

    function normalizeRow(r: any) {
      if (!r) return null;
      return {
        id: r.id ?? r._id ?? r.customer_id ?? r.uuid ?? String(Math.random()).slice(2),
        photoPreview: r.photoPreview ?? r.photo_url ?? r.imageUrl ?? r.image ?? "",
        imageUrl: r.photo_url ?? r.imageUrl,
        state: r.state ?? r.state_name ?? "",
        district: r.district ?? r.district_name ?? "",
        postal: r.pin ?? r.postal ?? r.postal_code ?? "",
        village: r.village ?? r.village_name ?? "",
        shopType: r.shop_type ?? r.shopType ?? "",
        shopName: r.shop_name ?? r.shopName ?? "",
        customerName: r.customer_name ?? r.customerName ?? "",
        customerLocalName: r.customer_local_name ?? r.customerLocalName ?? "",
        villageLocalName: r.village_local_name ?? r.villageLocalName ?? "",
        phone1: r.phone ?? r.phone1 ?? "",
        phone2: r.phone2 ?? "",
        gst: r.gst_no ?? r.gst ?? "",
        pan: r.pan_no ?? r.pan ?? "",
        address: r.address ?? "",
        landmark: r.landmark ?? "",
        shopBreak: r.shop_break ?? r.shopBreak ?? "",
        fridge: r.fridge ?? "",
        avgSales: r.avg_sales ?? r.avgSales ?? "",
        smartPhoneUser: r.smartphone_user ?? r.smartPhoneUser ?? "",
        latitude: r.latitude ?? r.lat ?? "",
        longitude: r.longitude ?? r.lon ?? "",
        ...r,
      };
    }

    const fetchCustomers = async () => {
      setLoading(true);
      setLoadingError(null);
      try {
        const res = await fetch("http://192.168.29.102:5000/api/customers", { signal: controller.signal });
        if (!res.ok) {
          const txt = await safeReadResponseText(res);
          const msg = `Failed to load customers (${res.status}) — ${txt}`;
          console.error(msg);
          setLoadingError(msg);
          toast.error("Unable to load customers. Check console for details.");
          setCustomers([]);
          return;
        }

        const body = await res.json().catch(() => null);
        let rows: any[] = [];
        if (body?.rows && Array.isArray(body.rows)) rows = body.rows;
        else if (body?.data && Array.isArray(body.data)) rows = body.data;
        else if (body?.customers && Array.isArray(body.customers)) rows = body.customers;
        else if (Array.isArray(body)) rows = body;
        else {
          console.warn("Unexpected customers payload shape:", body);
        }

        const normalized = rows.map((r) => normalizeRow(r)).filter(Boolean);
        setCustomers(normalized);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Network error fetching customers:", err);
        setLoadingError("Network error fetching customers");
        toast.error("Network error while loading customers");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    return () => controller.abort();
  }, []);
  // ---------- end GET ----------

  // input handler
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

  // validation (no taluk)
  function validateAll() {
    const newErrors: CustomerFormErrors = {};
    (["state", "district", "postal", "village", "shopName", "customerName", "phone1"] as Array<
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

  // fuzzy matcher used both for display canonicalization and id lookup
  function findBestMatch(candidate: string | undefined, list: string[]) {
    if (!candidate) return "";
    const c = candidate.trim().toLowerCase();
    if (!c) return "";
    const exact = list.find((x) => x.toLowerCase() === c);
    if (exact) return exact;
    const contains = list.find((x) => x.toLowerCase().includes(c) || c.includes(x.toLowerCase()));
    if (contains) return contains;
    const starts = list.find((x) => x.toLowerCase().startsWith(c) || c.startsWith(x.toLowerCase()));
    if (starts) return starts;
    // try removing common suffix words like "district"
    const stripped = c.replace(/\bdistrict\b|\bzone\b|\bdivision\b/gi, "").trim();
    if (stripped && stripped !== c) {
      const strippedMatch = list.find((x) => x.toLowerCase() === stripped || x.toLowerCase().includes(stripped));
      if (strippedMatch) return strippedMatch;
    }
    return "";
  }

  // Enhanced label -> id: tries exact numeric, exact map key, then fuzzy match of map keys
  function labelToIdEnhanced<T extends Record<string, number>>(labelOrId: string, map: T | undefined): string {
    if (!labelOrId) return "";
    const trimmed = String(labelOrId).trim();
    if (!trimmed) return "";
    if (/^\d+$/.test(trimmed)) return trimmed; // already numeric id

    if (!map) return trimmed;

    // direct exact key
    if (map[trimmed] !== undefined) return String(map[trimmed]);

    // try fuzzy match on keys
    const keys = Object.keys(map);
    const best = findBestMatch(trimmed, keys);
    if (best) return String(map[best]);

    // fallback: return original label (server may reject)
    return trimmed;
  }

  // Build FormData and ensure numeric district_id & village_id are sent when possible
  function buildApiFormDataSafe(f: CustomerForm) {
    const fd = new FormData();

    if (f.image) fd.append("image", f.image);

    const safeAppend = (key: string, val: any) => fd.append(key, val == null ? "" : String(val));

    safeAppend("shop_name", f.shopName ?? "");
    safeAppend("customer_name", f.customerName ?? "");
    safeAppend("customer_local_name", f.customerLocalName ?? "");

    safeAppend("phone", f.phone1 ?? "");
    safeAppend("phone2", f.phone2 ?? "");

    // state -> id (try enhanced)
    safeAppend("state_id", labelToIdEnhanced(f.state || "", STATE_ID_MAP) || "");

    // district & village: try to convert to numeric id using maps
    const districtId = labelToIdEnhanced(f.district || "", DISTRICT_ID_MAP);
    const villageId = labelToIdEnhanced(f.village || "", VILLAGE_ID_MAP);

    // append district_id & village_id (server expects these keys)
    safeAppend("district_id", districtId || "");
    safeAppend("village_id", villageId || "");

    // we still append friendly pin and text fields
    safeAppend("pin", f.postal ?? "");
    // safeAppend("shop_type_id", labelToIdEnhanced(f.shopType || "", SHOPTYPE_ID_MAP) || "");
    safeAppend("shop_type_id", f.shopType ?? "");
    safeAppend("gst_no", f.gst ?? "");
    safeAppend("pan_no", f.pan ?? "");
    safeAppend("address", f.address ?? "");
    safeAppend("shop_break", f.shopBreak ?? "");
    safeAppend("fridge", f.fridge ?? "");
    safeAppend("avg_sales", f.avgSales ?? "");
    // const smartphoneFlag = f.smartPhoneUser === "yes" || f.smartPhoneUser === "1" ? "1" : "0";
    // safeAppend("smartphone_user", smartphoneFlag);
    safeAppend("smartphone_user", f.smartPhoneUser ?? "no");
    safeAppend("latitude", f.latitude ?? "");
    safeAppend("longitude", f.longitude ?? "");

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

    // helpful debug log
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
    } catch {}

    try {
      const url = editingId ? `http://192.168.29.102:5000/api/customers/${editingId}` : "http://192.168.29.102:5000/api/customers";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: payload,
      });

      if (!res.ok) {
        // try parse JSON error body
        let errText = `Server error (${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody && (errBody.message || errBody.error || errBody.missing || errBody.errors)) {
            errText = JSON.stringify(errBody);
          } else {
            errText = JSON.stringify(errBody);
          }
        } catch {
          try {
            const txt = await res.text();
            if (txt) errText = txt;
          } catch {}
        }
        console.error("Failed to save customer:", errText);
        // If server says missing ids, give actionable hint
        if (errText && errText.includes("missing") && errText.includes("district_id")) {
          toast.error("Server rejected request: district_id or village_id missing/invalid. Try adjusting district/village text to a known value.");
        } else {
          toast.error(`Failed to save customer: ${errText}`);
        }
        return;
      }

      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      const createdOrUpdated = (body && (body.row ?? body.data ?? body.customer ?? body)) || null;

      if (editingId) {
        setCustomers((prev) =>
          prev.map((item) => {
            if (item.id === editingId) {
              if (createdOrUpdated) {
                return { ...item, ...createdOrUpdated };
              }
              return { ...item, ...form, photoPreview: form.photoPreview || item.photoPreview };
            }
            return item;
          })
        );
        toast.success("Customer updated successfully");
      } else {
        if (createdOrUpdated) {
          setCustomers((prev) => [createdOrUpdated, ...prev]);
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
        }
        toast.success("Customer created successfully");
      }

      setDrawerOpen(false);
      setErrors({});
      setEditingId(null);
      console.log("Save response:", body);
    } catch (err: any) {
      console.error("Network / unexpected error saving customer:", err);
      toast.error("Network error while saving customer. Please try again.");
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

  // ------------------ reverse-geocoding from lat/lon ------------------
  const handleLookupFromLatLon = async () => {
    const lat = (form.latitude ?? "").trim();
    const lon = (form.longitude ?? "").trim();

    if (!lat || !lon) {
      toast.error("Please enter both latitude and longitude.");
      return;
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      toast.error("Please enter valid numeric latitude and longitude values.");
      return;
    }

    setGeoLoading(true);
    toast.loading("Looking up address from coordinates...", { id: "geo" });

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      latNum
    )}&lon=${encodeURIComponent(lonNum)}&addressdetails=1`;

    try {
      const r = await fetch(nominatimUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!r.ok) {
        throw new Error(`Reverse geocode failed (${r.status})`);
      }

      const data = await r.json();
      const display = data.display_name ?? "";
      const addr = data.address ?? {};

      // extract common fields
      const resolvedState = (addr.state || addr.region || addr["state_district"] || "").trim();
      const resolvedDistrict = (addr.county || addr.district || addr.city || "").trim();
      const resolvedVillage = (addr.village || addr.hamlet || addr.town || addr.suburb || addr.neighbourhood || "").trim();
      const resolvedPostal = (addr.postcode || "").trim();

      // try to canonicalize state using your STATES list
      const canonicalState = resolvedState ? (findBestMatch(resolvedState, STATES) || resolvedState) : "";

      // try to canonicalize district & village to keys present in maps (helps labelToIdEnhanced)
      // For district: check known districts for the canonical state (if found), else check global district keys
      const possibleDistrictKeys = canonicalState && DISTRICT_MAP[canonicalState] ? DISTRICT_MAP[canonicalState] : Object.keys(DISTRICT_ID_MAP);
      const canonicalDistrict = resolvedDistrict ? (findBestMatch(resolvedDistrict, possibleDistrictKeys) || resolvedDistrict) : "";

      // For village: we don't have a global village list, but try to fuzzy-match against VILLAGE_ID_MAP keys
      const villageKeys = Object.keys(VILLAGE_ID_MAP);
      const canonicalVillage = resolvedVillage ? (findBestMatch(resolvedVillage, villageKeys) || resolvedVillage) : "";

      // Build partial update
      const newFormPartial: Partial<CustomerForm> = {
        address: display || form.address || "",
        latitude: String(latNum),
        longitude: String(lonNum),
      };

      const filled: string[] = [];

      if (canonicalState) {
        newFormPartial.state = canonicalState;
        filled.push("state");
      } else if (resolvedState) {
        newFormPartial.state = resolvedState;
      }

      if (canonicalDistrict) {
        newFormPartial.district = canonicalDistrict;
        filled.push("district");
      } else if (resolvedDistrict) {
        newFormPartial.district = resolvedDistrict;
      }

      if (resolvedPostal) {
        newFormPartial.postal = resolvedPostal;
        filled.push("postal");
      }

      if (canonicalVillage) {
        newFormPartial.village = canonicalVillage;
        filled.push("village");
      } else if (resolvedVillage) {
        newFormPartial.village = resolvedVillage;
      }

      setForm((s) => ({ ...s, ...newFormPartial }));

      toast.dismiss("geo");
      if (filled.length > 0) {
        toast.success(`Auto-filled: ${filled.join(", ")}`);
      } else {
        toast("Address populated; district/village could not be fully canonicalized. Please confirm before saving.", { icon: "ℹ️" });
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
      toast.dismiss("geo");
      toast.error("Reverse geocoding failed. Please check your network or coordinates.");
    } finally {
      setGeoLoading(false);
    }
  };
  // ----------------------------------------------------------------------

  // delete handler (unchanged)
  const handleDeleteApi = async (id: string | number) => {
    if (!confirm("Delete this customer?")) return;
    try {
      const res = await fetch(`http://192.168.29.102:5000/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let errText = `Server error (${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody && (errBody.message || errBody.error || errBody.errors)) {
            errText = errBody.message || errBody.error || JSON.stringify(errBody.errors);
          }
        } catch {}
        throw new Error(errText);
      }
      setCustomers((prev) => prev.filter((x) => x.id !== id));
      toast.success("Customer deleted");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Failed to delete customer. Check console for details.");
    }
  };

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
          <Button
            onClick={() => {
              setEditingId(null);
              setForm({
                image: null,
                photoPreview: "",
                state: "",
                district: "",
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
                latitude: "",
                longitude: "",
              });
              setDrawerOpen(true);
            }}
            className="flex items-center gap-2"
            aria-haspopup="dialog"
          >
            <PlusCircle className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="text-xl font-semibold mb-6">Customer List</h2>

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading customers…</div>
        ) : loadingError ? (
          <div className="py-8 text-center">
            <div className="text-red-600 mb-2">Failed to load customers</div>
            <div className="text-sm text-slate-500 mb-4">{loadingError}</div>
            <div>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
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
                            setForm((s) => ({ ...s, ...c, photoPreview: c.photoPreview ?? "" }));
                            setEditingId(c.id);
                            setDrawerOpen(true);
                          }}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteApi(c.id);
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
                {editingId ? "Edit Customer" : "Add Customer"}
              </h3>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setEditingId(null);
                }}
                className="p-2 rounded hover:bg-slate-100"
                type="button"
              >
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
                      {form.image && (
                        <button type="button" onClick={() => setForm((s) => ({ ...s, image: null, photoPreview: "" }))} className="mt-2 w-full px-4 py-2 border rounded">
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
  <input
    name="state"
    value={form.state}
    onChange={handleChange}
    placeholder="State"
    className="w-full p-3 border rounded"
  />
  {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
</div>

                    {/* District text input */}
                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        District <span className="text-red-500">*</span>
                      </label>
                      <input name="district" value={form.district} onChange={handleChange} placeholder="District" className="w-full p-3 border rounded" />
                      {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        Postal (PIN) <span className="text-red-500">*</span>
                      </label>
                      <input name="postal" value={form.postal} onChange={handleChange} placeholder="6-digit PIN" className="w-full p-3 border rounded" />
                      {errors.postal && <p className="text-red-500 text-sm">{errors.postal}</p>}
                    </div>

                    {/* Village text input */}
                    <div className="md:col-span-1">
                      <label className="block text-sm text-slate-600">
                        Village <span className="text-red-500">*</span>
                      </label>
                      <input name="village" value={form.village} onChange={handleChange} placeholder="Village" className="w-full p-3 border rounded" />
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

                    {/* Latitude & Longitude + Lookup */}
                    <div className="md:col-span-3">
                      <label className="block text-sm text-slate-600">Address</label>

                      <div className="mt-1 grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude (e.g. 17.3850)" className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude (e.g. 78.4867)" className="block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div className="flex gap-2">
                          <input name="address" value={form.address} onChange={handleChange} placeholder="Enter address or use Lookup" className="flex-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          <div className="w-36 flex-shrink-0">
                            <button type="button" onClick={handleLookupFromLatLon} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${geoLoading ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`} disabled={geoLoading}>
                              {geoLoading ? "Looking…" : "Lookup"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Enter latitude and longitude, then click <strong>Lookup</strong> to auto-fill the address, state, district, village and postal code. The component will attempt to convert district/village to the numeric IDs expected by the server.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <button type="button" onClick={() => { setDrawerOpen(false); setErrors({}); setEditingId(null); }} className="px-4 py-2 rounded border">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
                      {editingId ? "Update Customer" : "Save Customer"}
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










