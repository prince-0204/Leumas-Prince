import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { productApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { InsertProduct, UpdateProduct } from "@shared/schema";

interface ProductFormProps {
  productId?: number | null;
  onClose: () => void;
}

export default function ProductForm({ productId, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<InsertProduct>>({
    name: "",
    sku: "",
    category: "",
    currentStock: 0,
  });
  const { toast } = useToast();
  const isEditing = productId !== null && productId !== undefined;

  const { data: product } = useQuery({
    queryKey: ["/api/products", productId],
    queryFn: () => productApi.getById(productId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: product.currentStock,
      });
    }
  }, [product]);

  const createMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Product created",
        description: "Product has been successfully created.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Create failed",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProduct }) => 
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Product updated",
        description: "Product has been successfully updated.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.category || formData.currentStock === undefined) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      updateMutation.mutate({ 
        id: productId!, 
        data: formData as UpdateProduct 
      });
    } else {
      createMutation.mutate(formData as InsertProduct);
    }
  };

  const handleInputChange = (field: keyof InsertProduct, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              type="text"
              required
              value={formData.sku || ""}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              placeholder="Enter SKU (e.g., ABC-123)"
            />
          </div>
          
          <div>
            <Label htmlFor="product-category">Category</Label>
            <Select 
              value={formData.category || ""} 
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="office">Office Supplies</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="initial-stock">
              {isEditing ? "Current Stock" : "Initial Stock"}
            </Label>
            <Input
              id="initial-stock"
              type="number"
              required
              min="0"
              value={formData.currentStock || ""}
              onChange={(e) => handleInputChange("currentStock", parseInt(e.target.value) || 0)}
              placeholder="Enter stock quantity"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Product" : "Add Product")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
