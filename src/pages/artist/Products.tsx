import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProductsTable from '@/components/artist/ProductsTable';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock product data
const mockProducts = [
  {
    id: 'PRD-001',
    name: 'Artist Signature T-Shirt',
    image: '/placeholder.svg',
    price: 25.99,
    status: 'active' as const,
    sales: 124,
    revenue: 3224,
    stock: 67,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'PRD-002',
    name: 'Limited Edition Hoodie',
    image: '/placeholder.svg',
    price: 49.99,
    status: 'active' as const,
    sales: 89,
    revenue: 4449,
    stock: 23,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'PRD-003',
    name: 'Concert Poster Print',
    image: '/placeholder.svg',
    price: 15.99,
    status: 'draft' as const,
    sales: 0,
    revenue: 0,
    stock: 0,
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'PRD-004',
    name: 'Logo Sticker Pack',
    image: '/placeholder.svg',
    price: 8.99,
    status: 'pending_approval' as const,
    sales: 0,
    revenue: 0,
    stock: 100,
    createdAt: '2024-01-18T00:00:00Z',
  },
];

export default function Products() {
  const [loading, setLoading] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Products</h1>
            <p className="text-muted-foreground">
              Manage your merch catalog and track performance
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button asChild>
              <Link to="/create-merch">
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <ProductsTable products={mockProducts} loading={loading} />
      </div>
    </DashboardLayout>
  );
}