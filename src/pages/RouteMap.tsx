import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock } from "lucide-react";

/**
 * RouteMap (iframe + OpenStreetMap)
 * - No external installs
 * - Uses OpenStreetMap embed iframe: https://www.openstreetmap.org/export/embed.html
 * - Click agent cards to focus the map on that agent
 * - Shows computed route distance and meetings count
 * - Small simulated jitter to demonstrate movement (replace with real telemetry)
 */

type TeamType = "sales" | "delivery";

type Waypoint = { lat: number; lng: number };
type Agent = {
  id: string;
  name: string;
  type: TeamType;
  avatar?: string;
  route: Waypoint[]; // planned route / waypoints
  visitsToday: number;
  currentLocation: Waypoint;
};

const initialAgents: Agent[] = [
  {
    id: "sales_1",
    name: "Rahul (Sales)",
    type: "sales",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b6a5e5ad2d7bbf10ad3bff4f2b9bdf3",
    route: [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 12.9750, lng: 77.6000 },
      { lat: 12.9800, lng: 77.6050 },
    ],
    visitsToday: 6,
    currentLocation: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: "delivery_1",
    name: "Sonia (Delivery)",
    type: "delivery",
    avatar:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2a8b3df1e18f3c0b6f6b9b6b6d9c9f0b",
    route: [
      { lat: 12.9650, lng: 77.5900 },
      { lat: 12.9600, lng: 77.5850 },
    ],
    visitsToday: 3,
    currentLocation: { lat: 12.9650, lng: 77.5900 },
  },
];

function haversineDistance(a: Waypoint, b: Waypoint) {
  // returns meters
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const aa = sinDlat * sinDlat + sinDlon * sinDlon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

function totalRouteDistance(route: Waypoint[]) {
  if (!route || route.length < 2) return 0;
  return Math.round(route.reduce((sum, _, i) => (i === 0 ? 0 : sum + haversineDistance(route[i - 1], route[i])), 0));
}

function fmtDistance(meters: number) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

/** Build an OpenStreetMap embed URL
 * - If `focus` is an agent, center on that agent and add a single marker param.
 * - Otherwise compute bbox that contains all agents to show both on the map.
 */
function buildOsmEmbedUrl(focus?: Waypoint, allPoints?: Waypoint[]) {
  // base: https://www.openstreetmap.org/export/embed.html
  if (focus) {
    // marker param format in OSM embed: &marker=lat%2Clon
    const marker = `marker=${encodeURIComponent(`${focus.lat},${focus.lng}`)}`;
    // small bbox around focus so zoom is decent
    const delta = 0.02;
    const minLon = focus.lng - delta;
    const minLat = focus.lat - delta;
    const maxLon = focus.lng + delta;
    const maxLat = focus.lat + delta;
    const bbox = `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&${marker}`;
  }

  if (allPoints && allPoints.length) {
    let minLat = 90,
      minLon = 180,
      maxLat = -90,
      maxLon = -180;
    allPoints.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lng < minLon) minLon = p.lng;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng > maxLon) maxLon = p.lng;
    });
    // add small padding
    const padLat = (maxLat - minLat || 0.01) * 0.25;
    const padLon = (maxLon - minLon || 0.01) * 0.25;
    const bbox = `${(minLon - padLon).toFixed(6)}%2C${(minLat - padLat).toFixed(6)}%2C${(maxLon + padLon).toFixed(6)}%2C${(maxLat + padLat).toFixed(6)}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  }

  // fallback center Bengaluru
  return "https://www.openstreetmap.org/export/embed.html?bbox=77.56%2C12.94%2C77.62%2C12.99&layer=mapnik";
}

const RouteMap: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [filter, setFilter] = useState<"all" | TeamType | "both">("both");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // compute visible points for bbox
  const visibleAgents = useMemo(
    () => agents.filter((a) => filter === "all" || filter === "both" ? true : a.type === filter),
    [agents, filter]
  );

  // compute total distances per agent
  const agentsWithDistance = useMemo(
    () =>
      agents.map((a) => ({
        ...a,
        distance: totalRouteDistance(a.route),
      })),
    [agents]
  );

  // compute iframe src: if selected agent -> focus marker center on them; else show bbox containing visible agents
  const iframeSrc = useMemo(() => {
    if (selectedAgentId) {
      const ag = agents.find((x) => x.id === selectedAgentId);
      return buildOsmEmbedUrl(ag?.currentLocation, undefined);
    }
    const allPoints = visibleAgents.flatMap((a) => a.route.concat(a.currentLocation));
    return buildOsmEmbedUrl(undefined, allPoints);
  }, [selectedAgentId, agents, visibleAgents]);

  // simulate small movement jitter for demonstration (replace with real telemetry)
  useEffect(() => {
    const t = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => {
          const jitter = (Math.random() - 0.5) * 0.0006;
          const jitter2 = (Math.random() - 0.5) * 0.0006;
          return {
            ...a,
            currentLocation: { lat: a.currentLocation.lat + jitter, lng: a.currentLocation.lng + jitter2 },
          };
        })
      );
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Route Map</h1>
        <p className="text-muted-foreground">Track Sales & Delivery — iframe OpenStreetMap (no installs)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: map iframe */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 rounded-lg overflow-hidden shadow relative">
              <iframe
                title="osm-route-map"
                src={iframeSrc}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* floating controls */}
              <div className="absolute top-3 left-3 flex gap-2 bg-white/75 dark:bg-black/50 p-2 rounded-md shadow-sm">
                <Button size="sm" onClick={() => { setSelectedAgentId(null); setFilter("both"); }}>
                  Show both
                </Button>
                <Button size="sm" onClick={() => { setFilter("sales"); setSelectedAgentId(null); }}>
                  Sales
                </Button>
                <Button size="sm" onClick={() => { setFilter("delivery"); setSelectedAgentId(null); }}>
                  Delivery
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Right: agents list */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Visible</div>
                  <div className="text-lg font-semibold">{visibleAgents.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total meetings</div>
                  <div className="text-lg font-semibold">{visibleAgents.reduce((s, a) => s + a.visitsToday, 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total route (sum)</div>
                  <div className="text-lg font-semibold">
                    {fmtDistance(visibleAgents.reduce((s, a) => s + totalRouteDistance(a.route), 0))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentsWithDistance
                .filter((a) => filter === "both" ? true : filter === "all" ? true : a.type === filter)
                .map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-lg border hover:shadow-md transition cursor-pointer flex items-center gap-3 ${
                      selectedAgentId === agent.id ? "ring-2 ring-offset-1 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.type.toUpperCase()}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">{fmtDistance(agent.distance)}</div>
                          <div className="text-xs text-muted-foreground">{agent.visitsToday} meetings</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Navigation className="w-3 h-3" />
                        <div>{agent.route.length} stops</div>
                        <Clock className="w-3 h-3" />
                        <div>Last seen: just now</div>
                      </div>
                    </div>
                    <div>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAgentId(agent.id); }}>
                        Focus
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button onClick={() => alert("Export CSV (implement)")}>Export meetings CSV</Button>
              <Button variant="outline" onClick={() => alert("Open detailed report (implement)")}>Open detail report</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default RouteMap;
