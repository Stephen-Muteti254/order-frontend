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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import DataTableFilters from '@/components/DataTableFilters';
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader';
import { clientsApi } from '@/lib/clientsApi';

export default function ClientsPage() {
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    institution: '',
    phone: '',
    email: '',
  });

  const {
    data: clients,
    filters,
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    loadMoreRef,
    loadMore,
    updateFilters,
    refresh,
  } = useInfiniteScroll<Client>({
    pageSize: 20,
    fetchFn: async ({ page, pageSize, search, startDate, endDate }) => {
      const params: any = {
        page,
        page_size: pageSize,
      };

      if (search) params.search = search;
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();

      return clientsApi.getClients(params);
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      refresh();
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters.search]);



  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      institution: '',
      phone: '',
      email: '',
    });
    setSelectedClient(null);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    updateFilters(newFilters);
    refresh();
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (selectedClient) {
        await clientsApi.updateClient(selectedClient.id, formData);
        toast({ title: 'Client updated successfully' });
      } else {
        await clientsApi.createClient(formData);
        toast({ title: 'Client created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();

      // Refresh table from first page
      refresh(); // this will re-fetch data and reset pagination
    } catch {
      toast({
        title: 'Error saving client',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      await clientsApi.deleteClient(selectedClient.id);
      toast({ title: 'Client deleted successfully' });
      setIsDeleteDialogOpen(false);
      resetForm();

      // Refresh table from first page
      refresh();
    } catch {
      toast({
        title: 'Error deleting client',
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients • {total} total
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Filters */}
      <DataTableFilters
        filters={filters || { search: '', startDate: undefined, endDate: undefined }}
        onFilterChange={handleFilterChange}
        placeholder="Search clients..."
        showDateFilters
        disabled={isLoading}
      />

      {/* Table */}
      <Card className="max-h-[70vh] overflow-y-auto">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Updating results…
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No clients found
                  </td>
                </tr>
              )}
                {!isLoading &&
                  clients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">{client.clientName}</td>
                    <td className="px-4 py-3">{client.institution}</td>
                    <td className="px-4 py-3">{client.phone}</td>
                    <td className="px-4 py-3">{client.email}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedClient(client);
                          setFormData({
                            clientId: client.clientId,
                            clientName: client.clientName,
                            institution: client.institution,
                            phone: client.phone,
                            email: client.email,
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

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
              {selectedClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Harvard University"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234-567-8900"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedClient ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedClient?.clientName}? This action cannot be undone.
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
