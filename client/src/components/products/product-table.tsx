import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Package } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (productId: number) => void;
  onDelete: (productId: number) => void;
}

export default function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const, className: "danger-bg" };
    if (stock <= 5) return { label: "Low Stock", variant: "secondary" as const, className: "warning-bg" };
    return { label: "In Stock", variant: "secondary" as const, className: "success-bg" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-500">
          <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p>No products found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.currentStock);
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">{product.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono text-slate-600">{product.sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">{product.currentStock}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant} className={stockStatus.className}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(product.id)}
                          className="text-primary hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
