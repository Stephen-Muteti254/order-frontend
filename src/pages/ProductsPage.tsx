import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/lib/mockData';
import { Product } from '@/types';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import DataTableFilters from '@/components/DataTableFilters';
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader';
import { productsApi } from '@/lib/productsApi';

export default function ProductsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    pricePerUnit: 0,
  });

  const {
  data: products,
  filters,
  isLoading,
  isLoadingMore,
  hasMore,
  total,
  loadMoreRef,
  loadMore,
  updateFilters,
  refresh,
} = useInfiniteScroll<Product>({
  fetchFn: async ({ page, pageSize, filters }) => {
    const params: any = {
      page,
      pageSize,
      search: filters?.search,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
    };
    return productsApi.getProducts(params);
  },
  pageSize: 20,
});


  const resetForm = () => {
    setFormData({
      productId: '',
      name: '',
      pricePerUnit: 0,
    });
    setSelectedProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      productId: product.productId,
      name: product.name,
      pricePerUnit: product.pricePerUnit,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (selectedProduct) {
        await productsApi.updateProduct(selectedProduct.id, formData);
        toast({ title: 'Product updated successfully' });
      } else {
        await productsApi.createProduct(formData);
        toast({ title: 'Product created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      toast({ title: 'Error saving product', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productsApi.deleteProduct(selectedProduct.id); // replace mockApi
      toast({ title: 'Product deleted successfully' });

      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      refresh();
    } catch (error) {
      toast({ title: 'Error deleting product', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and pricing • {total} total
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <DataTableFilters
        filters={filters}
        onFilterChange={updateFilters}
        placeholder="Search products..."
      />

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price Per Unit
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-sm">{product.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-sm">${product.pricePerUnit.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-muted-foreground">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(product)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div ref={loadMoreRef}>
            <InfiniteScrollLoader
              isLoading={isLoadingMore}
              hasMore={hasMore}
              loadMore={loadMore}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Essay"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Price Per Unit ($)</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                  placeholder="15.00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  For products like posters, this is the price for the entire item.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProduct?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
