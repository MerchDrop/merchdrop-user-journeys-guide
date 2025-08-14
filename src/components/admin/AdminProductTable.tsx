import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';

// Mock data
const mockProducts = [
  {
    id: 'P001',
    title: 'Mystic Forest Poster',
    artist: 'Maya Rodriguez',
    status: 'live',
    price: 29.99,
    stock: 15,
    sales: 42,
    image: '/placeholder.svg'
  },
  {
    id: 'P002',
    title: 'Urban Dreams Print',
    artist: 'Alex Chen',
    status: 'draft',
    price: 24.99,
    stock: 0,
    sales: 0,
    image: '/placeholder.svg'
  },
  {
    id: 'P003',
    title: 'Galaxy Cat T-Shirt',
    artist: 'Luna Martinez',
    status: 'live',
    price: 34.99,
    stock: 8,
    sales: 28,
    image: '/placeholder.svg'
  },
  {
    id: 'P004',
    title: 'Retro Wave Mug',
    artist: 'David Kim',
    status: 'disabled',
    price: 19.99,
    stock: 5,
    sales: 15,
    image: '/placeholder.svg'
  },
];

export const AdminProductTable = () => {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'live':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'disabled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleStatusChange = (productId: string, newStatus: string) => {
    // TODO: Call API to update product status
    toast({
      title: "Status Updated",
      description: `Product ${productId} status changed to ${newStatus}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.artist}</TableCell>
                <TableCell>
                  <Select
                    value={product.status}
                    onValueChange={(value) => handleStatusChange(product.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell>{product.sales}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminProductTable;