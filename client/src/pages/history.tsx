import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Package } from "lucide-react";
import { transactionApi, productApi } from "@/lib/api";
import { format } from "date-fns";

interface HistoryFilters {
  productId: string;
  type: string;
  fromDate: string;
  toDate: string;
}

export default function History() {
  const [filters, setFilters] = useState<HistoryFilters>({
    productId: "",
    type: "",
    fromDate: "",
    toDate: "",
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: transactionApi.getAll,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: productApi.getAll,
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesProduct = filters.productId === "" || transaction.productId.toString() === filters.productId;
    const matchesType = filters.type === "" || transaction.type === filters.type;
    
    const transactionDate = new Date(transaction.timestamp);
    const matchesFromDate = filters.fromDate === "" || transactionDate >= new Date(filters.fromDate);
    const matchesToDate = filters.toDate === "" || transactionDate <= new Date(filters.toDate + "T23:59:59");

    return matchesProduct && matchesType && matchesFromDate && matchesToDate;
  });

  const handleFilterChange = (field: keyof HistoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      productId: "",
      type: "",
      fromDate: "",
      toDate: "",
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
          <p className="mt-1 text-sm text-slate-600">View all stock in/out transactions</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                <Select value={filters.productId} onValueChange={(value) => handleFilterChange("productId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                <Input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange("toDate", e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button variant="secondary" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="text-sm text-slate-900">
                            {format(new Date(transaction.timestamp), "MMM dd, yyyy HH:mm:ss")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{transaction.productName}</div>
                            <div className="text-sm text-slate-500">{transaction.productSku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${transaction.type === 'IN' ? 'success-bg' : 'danger-bg'}`}
                          >
                            {transaction.type === 'IN' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {transaction.type === 'IN' ? 'Stock In' : 'Stock Out'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm font-medium ${
                            transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'IN' ? '+' : '-'}{transaction.quantity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">{transaction.notes || '-'}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
