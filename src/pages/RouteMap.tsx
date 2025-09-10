import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Clock } from 'lucide-react';

const RouteMap: React.FC = () => {
  const routes = [
    { id: 1, name: 'Route A', locations: 8, duration: '2h 30m', status: 'Active' },
    { id: 2, name: 'Route B', locations: 12, duration: '3h 45m', status: 'Active' },
    { id: 3, name: 'Route C', locations: 6, duration: '1h 50m', status: 'Completed' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Route Map</h1>
        <p className="text-muted-foreground">Track and manage delivery routes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-chart-primary/10 to-chart-accent/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-chart-primary mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground">Map View</p>
                <p className="text-muted-foreground">Interactive route visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{route.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    route.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {route.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    <span>{route.locations} locations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{route.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteMap;