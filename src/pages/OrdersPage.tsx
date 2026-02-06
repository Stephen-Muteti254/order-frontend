import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Order, Client, Product } from '@/types';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import DataTableFilters from '@/components/DataTableFilters';
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader';
import { ordersApi } from '@/lib/ordersApi';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { clientsApi } from '@/lib/clientsApi';

export default function OrdersPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    orderId: '',
    clientId: '',
    productId: '',
    orderClass: '',
    week: '',
    genre: '',
    pagesOrSlides: 1,
    description: '',
    orderDate: new Date().toISOString(),
  });

  const [classOptions, setClassOptions] = useState<{ id: string; name: string }[]>([]);
  const [genreOptions, setGenreOptions] = useState<{ id: string; name: string }[]>([]);

  const [newClass, setNewClass] = useState('');
  const [newGenre, setNewGenre] = useState('');

  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingGenre, setIsAddingGenre] = useState(false);
  const [orderDate, setOrderDate] = useState<Date | undefined>(
    selectedOrder ? new Date(selectedOrder.orderDate) : new Date()
  );

  const [clientOptions, setClientOptions] = useState<Client[]>([]);
  const [clientPage, setClientPage] = useState(1);
  const [clientHasMore, setClientHasMore] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);

  const [filterClientOptions, setFilterClientOptions] = useState<Client[]>([]);
  const [filterClientPage, setFilterClientPage] = useState(1);
  const [filterClientHasMore, setFilterClientHasMore] = useState(true);
  const [filterClientLoading, setFilterClientLoading] = useState(false);

  // Infinite scroll
  const {
    data: orders,
    filters,
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    loadMoreRef,
    loadMore,
    updateFilters,
    refresh,
  } = useInfiniteScroll<Order>({
    fetchFn: ordersApi.getOrders, // replace mockApi
    pageSize: 20,
  });

  const resetClientPagination = () => {
    setClientOptions([]);
    setClientPage(1);
    setClientHasMore(true);
    setLoadingClients(false);
  };


  // Fetch clients and products
  useEffect(() => {
    Promise.all([ordersApi.getAllClients(), ordersApi.getAllProducts()]).then(
      ([clientsData, productsData]) => {
        setClients(clientsData?.data || []);
        setProducts(productsData?.data || []);
      }
    );
  }, []);


  useEffect(() => {
    if (!isDialogOpen) {
      resetClientPagination();
    }
  }, [isDialogOpen]);


  const fetchMoreClients = async () => {
    if (!clientHasMore || loadingClients) return;

    setLoadingClients(true);

    const res = await clientsApi.getClients({
      page: clientPage,
      page_size: 20,
    });

    setClientOptions(prev => [...prev, ...res.data]);
    setClientPage(prev => prev + 1);
    setClientHasMore(res.page < Math.ceil(res.total / res.page_size));

    setLoadingClients(false);
  };



  const openCreateDialog = () => {
    resetForm();
    resetClientPagination();
    fetchMoreClients();
    setIsDialogOpen(true);
  };


  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      orderId: order.orderId,
      clientId: order.clientId,
      productId: order.productId,
      orderClass: order.orderClass,
      week: order.week,
      genre: order.genre,
      pagesOrSlides: order.pagesOrSlides,
      description: order.description || '',
    });

    resetClientPagination();
    fetchMoreClients();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      clientId: '',
      productId: '',
      orderClass: '',
      week: '',
      genre: '',
      pagesOrSlides: 1,
      description: '', // reset description
    });
    setSelectedOrder(null);
  };

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (selectedOrder) {
        await ordersApi.updateOrder(selectedOrder.id, formData);
        toast({ title: 'Order updated successfully' });
      } else {
        await ordersApi.createOrder(formData);
        toast({ title: 'Order created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      resetClientPagination();
      refresh();
    } catch (error) {
      toast({ title: 'Error saving order', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    Promise.all([
      ordersApi.getAllClients(),
      ordersApi.getAllProducts(),
      ordersApi.getClasses(),  // new
      ordersApi.getGenres()    // new
    ]).then(([clientsData, productsData, classesData, genresData]) => {
      setClients(clientsData?.data || []);
      setProducts(productsData?.data || []);
      setClassOptions(classesData || []);
      setGenreOptions(genresData || []);
    });
  }, []);


  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      await ordersApi.deleteOrder(selectedOrder.id);
      toast({ title: 'Order deleted successfully' });
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      refresh();
    } catch (error) {
      toast({ title: 'Error deleting order', variant: 'destructive' });
    }
  };

  const fetchMoreFilterClients = async () => {
    if (!filterClientHasMore || filterClientLoading) return;

    setFilterClientLoading(true);

    const res = await clientsApi.getClients({
      page: filterClientPage,
      page_size: 20,
    });

    setFilterClientOptions(prev => [...prev, ...res.data]);
    setFilterClientPage(prev => prev + 1);
    setFilterClientHasMore(res.page < Math.ceil(res.total / res.page_size));

    setFilterClientLoading(false);
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const estimatedCost = selectedProduct
    ? selectedProduct.pricePerUnit * formData.pagesOrSlides
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage orders and track costs • {total} total
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Order
        </Button>
      </div>

      {/* Filters */}
      <DataTableFilters
        filters={filters}
        onFilterChange={updateFilters}
        placeholder="Search orders..."
        showDateFilters
      >
        <Select
          disabled={isLoading}
          value={filters.clientId || 'all'}
          onOpenChange={(open) => {
            if (open && filterClientOptions.length === 0) {
              fetchMoreFilterClients();
            }
          }}
          onValueChange={(value) =>
            updateFilters({
              ...filters,
              clientId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>

            {filterClientOptions.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.clientName}
              </SelectItem>
            ))}

            {filterClientLoading && (
              <div className="py-2 text-center text-xs text-muted-foreground">
                Loading…
              </div>
            )}

            {filterClientHasMore && !filterClientLoading && (
              <button
                type="button"
                className="w-full py-2 text-xs text-muted-foreground hover:bg-muted"
                onClick={fetchMoreFilterClients}
              >
                Load more clients
              </button>
            )}
          </SelectContent>
        </Select>


        <Select
          value={filters.productId || 'all'}
          onValueChange={(value) =>
            updateFilters({ ...filters, productId: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataTableFilters>

      {/* Table */}
      <Card className="border-border/50 max-h-[70vh] overflow-y-auto">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Class
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Week
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pages
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Updating results…
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && orders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm">{order.client?.clientName || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{order.product?.name || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{order.class?.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{order.week}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{order.genre?.name || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm">{order.pagesOrSlides}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-sm">${order.totalCost.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{order.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(order)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(order)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? 'Edit Order' : 'Add New Order'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="week">Week</Label>
                  <Input
                    id="week"
                    value={formData.week}
                    onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                    placeholder="Week 1"
                    required
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  onOpenChange={(open) => {
                    if (open && clientOptions.length === 0) {
                      fetchMoreClients();
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientOptions.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.clientName}
                      </SelectItem>
                    ))}

                    {loadingClients && (
                      <div className="py-2 text-center text-xs text-muted-foreground">
                        Loading…
                      </div>
                    )}

                    {clientHasMore && !loadingClients && (
                      <button
                        type="button"
                        className="w-full py-2 text-xs text-muted-foreground hover:bg-muted"
                        onClick={fetchMoreClients}
                      >
                        Load more clients
                      </button>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (${product.pricePerUnit}/unit)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <div>
                  <Label htmlFor="class">Class</Label>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={formData.orderClass}
                      onValueChange={(value) => setFormData({ ...formData, orderClass: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>                    
                  </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Add new class */}
                    <Input
                      placeholder="New class"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-36"
                    />
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!newClass.trim()) return;
                        setIsAddingClass(true);
                        try {
                          const addedClass = await ordersApi.addClass({ name: newClass.trim() });
                          setClassOptions([...classOptions, addedClass]);
                          setFormData({ ...formData, orderClass: addedClass.id });
                          setNewClass('');
                          toast({ title: 'Class added successfully' });
                        } catch (error) {
                          toast({ title: 'Error adding class', variant: 'destructive' });
                        } finally {
                          setIsAddingClass(false);
                        }
                      }}
                    >
                      {isAddingClass ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                </div>


                <div className="flex flex-col space-y-2">
                  <div>
                  <Label htmlFor="genre">Genre</Label>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={formData.genre}
                      onValueChange={(value) => setFormData({ ...formData, genre: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genreOptions.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  </div>

                    <div className="flex gap-2">
                    {/* Add new genre */}
                    <Input
                      placeholder="New genre"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-36"
                    />
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!newGenre.trim()) return;
                        setIsAddingGenre(true);
                        try {
                          const addedGenre = await ordersApi.addGenre({ name: newGenre.trim() });
                          setGenreOptions([...genreOptions, addedGenre]);
                          setFormData({ ...formData, genre: addedGenre.id });
                          setNewGenre('');
                          toast({ title: 'Genre added successfully' });
                        } catch (error) {
                          toast({ title: 'Error adding genre', variant: 'destructive' });
                        } finally {
                          setIsAddingGenre(false);
                        }
                      }}
                    >
                      {isAddingGenre ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pagesOrSlides">Pages/Slides</Label>
                <Input
                  id="pagesOrSlides"
                  type="number"
                  min="1"
                  value={formData.pagesOrSlides}
                  onChange={(e) =>
                    setFormData({ ...formData, pagesOrSlides: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Order Date</Label>
                <Calendar
                  mode="single"
                  selected={orderDate}
                  onSelect={(date) => {
                    setOrderDate(date);
                    if (date) {
                      setFormData({
                        ...formData,
                        orderDate: date.toISOString(),
                      });
                    }
                  }}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for the order"
                  rows={3}
                />
              </div>

              {selectedProduct && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Total Cost</span>
                    <span className="text-lg font-bold text-foreground">
                      ${estimatedCost.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProduct.name} × {formData.pagesOrSlides} = ${selectedProduct.pricePerUnit} × {formData.pagesOrSlides}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedOrder ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order {selectedOrder?.orderId}? This action cannot be undone.
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
