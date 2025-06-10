import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Package } from "lucide-react";
import { productApi, transactionApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertTransaction } from "@shared/schema";

export default function Transactions() {
  const [formData, setFormData] = useState<Partial<InsertTransaction>>({
    productId: undefined,
    type: undefined,
    quantity: undefined,
    notes: "",
  });
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: productApi.getAll,
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const createTransactionMutation = useMutation({
    mutationFn: transactionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      setFormData({
        productId: undefined,
        type: undefined,
        quantity: undefined,
        notes: "",
      });
      setSelectedProductId(null);
      
      toast({
        title: "Transaction recorded",
        description: "Stock transaction has been successfully recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to record transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.type || !formData.quantity) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTransactionMutation.mutate(formData as InsertTransaction);
  };

  const handleInputChange = (field: keyof InsertTransaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "productId") {
      setSelectedProductId(value ? parseInt(value) : null);
    }
  };

  const getAfterTransactionStock = () => {
    if (!selectedProduct || !formData.quantity || !formData.type) return null;
    
    const change = formData.type === 'IN' ? formData.quantity : -formData.quantity;
    return Math.max(0, selectedProduct.currentStock + change);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">New Transaction</h1>
          <p className="mt-1 text-sm text-slate-600">Record stock in/out transactions</p>
        </div>

        {/* Transaction Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="product-select">Product</Label>
                  <Select 
                    value={formData.productId?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("productId", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transaction-type">Transaction Type</Label>
                  <Select 
                    value={formData.type || ""} 
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">Stock In</SelectItem>
                      <SelectItem value="OUT">Stock Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity || ""}
                    onChange={(e) => handleInputChange("quantity", e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    type="text"
                    value={formData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Transaction notes"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={createTransactionMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createTransactionMutation.isPending ? "Recording..." : "Record Transaction"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Information</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Product Name</p>
                  <p className="font-medium text-slate-900">{selectedProduct.name}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Current Stock</p>
                  <p className="font-medium text-slate-900">{selectedProduct.currentStock}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">After Transaction</p>
                  <p className="font-medium text-slate-900">
                    {getAfterTransactionStock() !== null ? getAfterTransactionStock() : "-"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>Select a product to view stock information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
