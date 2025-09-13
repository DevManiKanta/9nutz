import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Mock hierarchical data (unchanged)
 */
const areas = {
  Warangal: {
    locations: [
      { name: "Kazipet", sales: [{ name: "Arun", targets: 5, completed: 3 }] },
      { name: "Hanamkonda", sales: [{ name: "Ravi", targets: 8, completed: 6 }] },
    ],
  },
  Hyderabad: {
    locations: [
      { name: "Uppal", sales: [{ name: "Suresh", targets: 10, completed: 7 }] },
      { name: "LB Nagar", sales: [{ name: "Kiran", targets: 6, completed: 4 }] },
    ],
  },
  Nizamabad: {
    locations: [
      { name: "Bodhan", sales: [{ name: "Ajay", targets: 4, completed: 2 }] },
      { name: "Armoor", sales: [{ name: "Naresh", targets: 7, completed: 5 }] },
    ],
  },
};

export default function Customer() {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [tab, setTab] = useState("sales"); // "sales" | "delivery"

  // assignment inputs for admin
  const [selectedSalesperson, setSelectedSalesperson] = useState(""); // select from existing sales
  const [customSalesperson, setCustomSalesperson] = useState(""); // or type custom name
  const [target, setTarget] = useState("");

  // assignments: { area, location, salesperson, target }
  const [assignments, setAssignments] = useState([]);

  const areaOptions = Object.keys(areas);
  const locationOptions = selectedArea ? areas[selectedArea].locations : [];
  const selectedSales = (locationOptions.find((l) => l.name === selectedLocation)?.sales) || [];

  // flatten unique sales names for a location (to populate select)
  const salespersonOptions = useMemo(
    () => selectedSales.map((s) => s.name),
    [selectedSales]
  );

  // Assign handler for admin
  function handleAssign() {
    const salesperson = customSalesperson.trim() || selectedSalesperson.trim();
    if (!selectedArea) return alert("Please select an Area.");
    if (!selectedLocation) return alert("Please select a Location.");
    if (!salesperson) return alert("Please select or enter a Salesperson name.");
    if (!target || isNaN(Number(target)) || Number(target) <= 0) return alert("Enter a valid numeric target.");

    setAssignments((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        area: selectedArea,
        location: selectedLocation,
        salesperson,
        target: Number(target),
      },
    ]);

    // reset inputs but keep area & location (so admin can add multiple quickly)
    setSelectedSalesperson("");
    setCustomSalesperson("");
    setTarget("");
  }

  function handleDeleteAssignment(id) {
    if (!confirm("Remove this assignment?")) return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  // Export assignments to CSV
  function exportAssignmentsCsv() {
    if (!assignments.length) return alert("No assignments to export.");
    const rows = [["S.No", "Area", "Location", "Salesperson", "Target"]];
    assignments.forEach((a, i) => rows.push([String(i + 1), a.area, a.location, a.salesperson, String(a.target)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assignments.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Open simple detail report of assignments in a new window
  function openAssignmentsReport() {
    if (!assignments.length) return alert("No assignments to show.");
    const rowsHtml = assignments
      .map(
        (a, i) =>
          `<tr>
             <td style="padding:6px;border:1px solid #ddd;text-align:center">${i + 1}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.area}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.location}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.salesperson}</td>
             <td style="padding:6px;border:1px solid #ddd;text-align:right">${a.target}</td>
           </tr>`
      )
      .join("");
    const html = `
      <html>
        <head>
          <title>Assignments</title>
          <style>body{font-family:system-ui, -apple-system, Roboto, 'Segoe UI', sans-serif; padding:16px} table{border-collapse:collapse;width:100%} td, th{border:1px solid #ddd;padding:8px}</style>
        </head>
        <body>
          <h2>Assignments</h2>
          <table>
            <thead>
              <tr>
                <th style="padding:6px;border:1px solid #ddd">S.No</th>
                <th style="padding:6px;border:1px solid #ddd">Area</th>
                <th style="padding:6px;border:1px solid #ddd">Location</th>
                <th style="padding:6px;border:1px solid #ddd">Salesperson</th>
                <th style="padding:6px;border:1px solid #ddd">Target</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const w = window.open();
    if (w) {
      w.document.write(html);
      w.document.close();
    } else {
      alert("Popup blocked — allow popups or export CSV instead.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tracking Dashboard</h1>
          <p className="text-slate-500 mt-1">Assign locations to salespeople & track targets</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportAssignmentsCsv} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm" type="button">
            Export Assignments
          </button>

          <button onClick={openAssignmentsReport} className="px-3 py-2 border rounded text-sm" type="button">
            Open Assignments Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button variant={tab === "sales" ? "default" : "outline"} onClick={() => setTab("sales")}>Sales</Button>
        <Button variant={tab === "delivery" ? "default" : "outline"} onClick={() => setTab("delivery")}>Delivery</Button>
      </div>

      {/* Filters + Admin assign area */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Area</label>
          <select
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              setSelectedLocation("");
            }}
            className="w-full p-3 border rounded bg-slate-50"
          >
            <option value="">-- Select Area --</option>
            {areaOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Select Location</label>
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedSalesperson("");
              setCustomSalesperson("");
            }}
            className="w-full p-3 border rounded bg-slate-50"
            disabled={!selectedArea}
          >
            <option value="">-- Select Location --</option>
            {locationOptions.map((loc) => (
              <option key={loc.name} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Admin assign: salesperson select or custom + target + assign button */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Assign Salesperson & Target (Admin)</label>
          <div className="flex gap-2">
            <select
              value={selectedSalesperson}
              onChange={(e) => { setSelectedSalesperson(e.target.value); setCustomSalesperson(""); }}
              disabled={!selectedLocation}
              className="flex-1 p-3 border rounded bg-slate-50"
            >
              <option value="">-- choose salesperson (or type) --</option>
              {salespersonOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Or type name"
              value={customSalesperson}
              onChange={(e) => { setCustomSalesperson(e.target.value); setSelectedSalesperson(""); }}
              className="flex-1 p-3 border rounded"
              disabled={!selectedLocation}
            />
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="p-3 border rounded w-36"
              min={0}
              disabled={!selectedLocation}
            />
            <button onClick={handleAssign} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!selectedLocation}>
              Assign
            </button>
          </div>
          <p className="text-xs text-slate-400">Select area & location first. Choose an existing salesperson or type a new name.</p>
        </div>
      </div>

      {/* Assignments table (shows S.No, Area, Location, Salesperson, Target) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Assignments</h2>
          <div className="text-sm text-slate-500">{assignments.length} assigned</div>
        </div>

        {assignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No assignments yet. Create one using the panel above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 w-12">S.No</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Salesperson</th>
                  <th className="p-3">Target</th>
                  <th className="p-3 w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => (
                  <tr key={a.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 align-top">{i + 1}</td>
                    <td className="p-3 align-top">{a.area}</td>
                    <td className="p-3 align-top">{a.location}</td>
                    <td className="p-3 align-top">{a.salesperson}</td>
                    <td className="p-3 align-top">{a.target}</td>
                    <td className="p-3 align-top">
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteAssignment(a.id)} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Show sales table for selected location (existing sales) under Sales tab */}
      {selectedLocation && tab === "sales" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border mt-6">
          <h2 className="text-xl font-semibold mb-4">Salespersons in {selectedLocation}</h2>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2">Name</th>
                <th className="p-2">Target</th>
                <th className="p-2">Completed</th>
                <th className="p-2">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {selectedSales.map((s, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.targets}</td>
                  <td className="p-2">{s.completed}</td>
                  <td className="p-2">{s.targets - s.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "delivery" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border mt-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Report</h2>
          <p className="text-slate-500">Delivery data will be shown here.</p>
        </div>
      )}
    </div>
  );
}
