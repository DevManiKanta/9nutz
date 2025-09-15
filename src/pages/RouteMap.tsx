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
  const [selectedSalesperson, setSelectedSalesperson] = useState(""); // select from global list
  const [customSalesperson, setCustomSalesperson] = useState(""); // or type custom name
  const [target, setTarget] = useState("");
  const [completed, setCompleted] = useState(""); // completed count when assigning/editing

  // assignments: { id, area, location, salesperson, target, completed, assignedAt, updatedAt }
  const [assignments, setAssignments] = useState<
    Array<{
      id: string;
      area: string;
      location: string;
      salesperson: string;
      target: number;
      completed: number;
      assignedAt: string; // ISO
      updatedAt?: string; // ISO
    }>
  >([]);

  // editing flow
  const [editingId, setEditingId] = useState<string | null>(null);

  const areaOptions = Object.keys(areas);
  const locationOptions = selectedArea ? areas[selectedArea].locations : [];
  const selectedSales = (locationOptions.find((l) => l.name === selectedLocation)?.sales) || [];

  // flatten unique sales names across all areas (global list)
  const allSalespeople = useMemo(() => {
    const set = new Set<string>();
    Object.values(areas).forEach((a: any) =>
      (a.locations || []).forEach((loc: any) => (loc.sales || []).forEach((s: any) => set.add(s.name)))
    );
    return Array.from(set);
  }, []);

  // populate salesperson select options: prefer global list (admin can pick any)
  const salespersonOptions = allSalespeople;

  // Convert assignment to formatted date/time for display
  const formatDateTime = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // Assign handler for admin (create or update)
  function handleAssign() {
    const salesperson = (customSalesperson || selectedSalesperson).trim();
    if (!selectedArea) return alert("Please select an Area.");
    if (!selectedLocation) return alert("Please select a Location.");
    if (!salesperson) return alert("Please select or enter a Salesperson name.");
    if (!target || isNaN(Number(target)) || Number(target) <= 0) return alert("Enter a valid numeric target.");
    if (completed && (isNaN(Number(completed)) || Number(completed) < 0))
      return alert("Completed must be a non-negative integer.");

    const payload = {
      salesperson,
      target: Number(target),
      completed: completed ? Number(completed) : 0,
    };

    if (editingId) {
      // update existing assignment
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                salesperson: payload.salesperson,
                target: payload.target,
                completed: payload.completed,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );
      // clear editing mode
      setEditingId(null);
    } else {
      // create new assignment
      const newAssignment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        area: selectedArea,
        location: selectedLocation,
        salesperson: payload.salesperson,
        target: payload.target,
        completed: payload.completed,
        assignedAt: new Date().toISOString(),
      };
      setAssignments((prev) => [newAssignment, ...prev]);
    }

    // reset inputs but keep area & location for convenience
    setSelectedSalesperson("");
    setCustomSalesperson("");
    setTarget("");
    setCompleted("");
  }

  function handleEditAssignment(id: string) {
    const a = assignments.find((x) => x.id === id);
    if (!a) return;
    // populate form with assignment values
    setSelectedArea(a.area);
    setSelectedLocation(a.location);
    setSelectedSalesperson(a.salesperson);
    setCustomSalesperson("");
    setTarget(String(a.target));
    setCompleted(String(a.completed));
    setEditingId(a.id);
    // scroll to top or focus first input if desired
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteAssignment(id: string) {
    if (!confirm("Remove this assignment?")) return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) {
      // cancel edit if we deleted the item being edited
      setEditingId(null);
      setSelectedSalesperson("");
      setCustomSalesperson("");
      setTarget("");
      setCompleted("");
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setSelectedSalesperson("");
    setCustomSalesperson("");
    setTarget("");
    setCompleted("");
  }

  // Export assignments to CSV (now includes Assigned At and Completed)
  function exportAssignmentsCsv() {
    if (!assignments.length) return alert("No assignments to export.");
    const rows = [
      ["S.No", "Area", "Location", "Salesperson", "Target", "Completed", "Remaining", "Assigned At", "Updated At"],
    ];
    assignments.forEach((a, i) =>
      rows.push([
        String(i + 1),
        a.area,
        a.location,
        a.salesperson,
        String(a.target),
        String(a.completed),
        String(Math.max(0, a.target - a.completed)),
        formatDateTime(a.assignedAt),
        a.updatedAt ? formatDateTime(a.updatedAt) : "-",
      ])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assignments.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Open simple detail report of assignments in a new window (includes Assigned At + Completed)
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
             <td style="padding:6px;border:1px solid #ddd;text-align:right">${a.completed}</td>
             <td style="padding:6px;border:1px solid #ddd;text-align:right">${Math.max(0, a.target - a.completed)}</td>
             <td style="padding:6px;border:1px solid #ddd">${formatDateTime(a.assignedAt)}</td>
             <td style="padding:6px;border:1px solid #ddd">${a.updatedAt ? formatDateTime(a.updatedAt) : "-"}</td>
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
                <th style="padding:6px;border:1px solid #ddd">Completed</th>
                <th style="padding:6px;border:1px solid #ddd">Remaining</th>
                <th style="padding:6px;border:1px solid #ddd">Assigned At</th>
                <th style="padding:6px;border:1px solid #ddd">Updated At</th>
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Tracking Dashboard</h1>
          <p className="text-slate-500 mt-1">Assign locations to salespeople & track targets</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={exportAssignmentsCsv}
            className="w-full sm:w-auto px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm"
            type="button"
          >
            Export Assignments
          </button>

          <button
            onClick={openAssignmentsReport}
            className="w-full sm:w-auto px-3 py-2 border rounded text-sm bg-white"
            type="button"
          >
            Open Assignments Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button variant={tab === "sales" ? "default" : "outline"} onClick={() => setTab("sales")}>
          Sales
        </Button>
        <Button variant={tab === "delivery" ? "default" : "outline"} onClick={() => setTab("delivery")}>
          Delivery
        </Button>
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
              <option key={a} value={a}>
                {a}
              </option>
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
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Admin assign: salesperson select or custom + target + assign button */}
        <div className="space-y-3">
          <label className="block text-sm font-medium mb-1">Assign Salesperson & Target</label>

          {/* salesperson selection: responsive stack on small screens */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedSalesperson}
              onChange={(e) => {
                setSelectedSalesperson(e.target.value);
                setCustomSalesperson("");
              }}
              disabled={!selectedLocation}
              className="flex-1 p-3 border rounded bg-slate-50"
            >
              <option value="">-- choose salesperson (or type) --</option>
              {salespersonOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Or type name"
              value={customSalesperson}
              onChange={(e) => {
                setCustomSalesperson(e.target.value);
                setSelectedSalesperson("");
              }}
              className="flex-1 p-3 border rounded"
              disabled={!selectedLocation}
            />
          </div>

          {/* target/completed + actions: responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="number"
              placeholder="Target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="p-3 border rounded w-full sm:w-36"
              min={0}
              disabled={!selectedLocation}
            />
            <input
              type="number"
              placeholder="Completed"
              value={completed}
              onChange={(e) => setCompleted(e.target.value)}
              className="p-3 border rounded w-full sm:w-36"
              min={0}
              disabled={!selectedLocation}
            />

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleAssign}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded"
                disabled={!selectedLocation}
                aria-label={editingId ? "Update Assignment" : "Assign"}
              >
                {editingId ? "Update Assignment" : "Assign"}
              </button>

              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-2 border border-red-500 rounded text-sm bg-red-500 text-white hover:bg-red-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Select area & location first. Choose an existing salesperson or type a new name. You can also edit assignments.
          </p>
        </div>
      </div>

      {/* Assignments table (desktop) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Assignments</h2>
          <div className="text-sm text-slate-500">{assignments.length} assigned</div>
        </div>

        {assignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No assignments yet. Create one using the panel above.</div>
        ) : (
          <>
            {/* Desktop / large: table (hidden on very small screens if cards below are used) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 w-12">S.No</th>
                    <th className="p-3">Area</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Salesperson</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Completed</th>
                    <th className="p-3">Remaining</th>
                    <th className="p-3">Assigned At</th>
                    <th className="p-3 w-32">Action</th>
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
                      <td className="p-3 align-top">{a.completed}</td>
                      <td className="p-3 align-top">{Math.max(0, a.target - a.completed)}</td>
                      <td className="p-3 align-top">{formatDateTime(a.assignedAt)}</td>
                      <td className="p-3 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAssignment(a.id)}
                            className="px-3 py-1 rounded bg-yellow-500 text-white text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(a.id)}
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

            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
              {assignments.map((a, i) => (
                <div key={a.id} className="border rounded-lg p-3 bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-slate-400">#{i + 1} • {a.area} / {a.location}</div>
                      <div className="text-base font-medium mt-1">{a.salesperson}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Target: <span className="font-semibold">{a.target}</span> • Completed: <span className="font-semibold">{a.completed}</span> • Remaining: <span className="font-semibold">{Math.max(0, a.target - a.completed)}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Assigned: {formatDateTime(a.assignedAt)}</div>
                      {a.updatedAt && <div className="text-xs text-slate-400">Updated: {formatDateTime(a.updatedAt)}</div>}
                    </div>

                    <div className="ml-3 flex-shrink-0 flex flex-col gap-2">
                      <button
                        onClick={() => handleEditAssignment(a.id)}
                        className="px-3 py-1 rounded bg-yellow-500 text-white text-sm whitespace-nowrap"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="px-3 py-1 rounded bg-red-500 text-white text-sm whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Show sales table for selected location (existing sales) under Sales tab */}
      {selectedLocation && tab === "sales" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border mt-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Salespersons in {selectedLocation}</h2>
          <table className="w-full border-collapse text-left min-w-[480px]">
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
