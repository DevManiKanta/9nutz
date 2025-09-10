import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

const Products: React.FC = () => {
  const sampleProducts = [
    { id: 1, name: 'Premium Dashboard', price: '$99', category: 'Software' },
    { id: 2, name: 'Analytics Tool', price: '$149', category: 'Software' },
    { id: 3, name: 'Design System', price: '$79', category: 'UI Kit' },
    { id: 4, name: 'API Integration', price: '$199', category: 'Service' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button className="bg-chart-primary hover:bg-chart-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add New Product Card */}
        <Card className="border-2 border-dashed border-muted hover:border-chart-primary transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Add New Product</h3>
            <p className="text-sm text-muted-foreground">Create a new product listing</p>
          </CardContent>
        </Card>

        {/* Product Cards */}
        {sampleProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="w-full h-32 bg-gradient-to-br from-chart-primary to-chart-accent rounded-lg mb-3 flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm font-medium">{product.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-lg font-bold text-chart-primary">{product.price}</span>
              </div>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Products;