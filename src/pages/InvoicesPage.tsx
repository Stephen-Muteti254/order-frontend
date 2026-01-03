import { useState, useEffect } from 'react';
import { FileDown, FileSpreadsheet, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Client, Order } from '@/types';
import { cn } from '@/lib/utils';
import { exportToPDF, exportToExcel, exportReportToPDF, exportReportToExcel } from '@/lib/exportUtils';

import { clientsApi } from '@/lib/clientsApi';
import { ordersApi } from '@/lib/ordersApi';
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subDays,
  subMonths
} from 'date-fns';
import { formatEAT } from '@/lib/dateUtils';

type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

export default function InvoicesPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsHasMore, setClientsHasMore] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [loadingClients, setLoadingClients] = useState(false);
  const [clientOptions, setClientOptions] = useState<Client[]>([]);


  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [datePreset, setDatePreset] = useState<DatePreset>('thisMonth');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('invoice');

  useEffect(() => {
    clientsApi
      .getClients({ page: 1, page_size: 100 })
      .then((res) => setClients(res.data))
      .catch(() =>
        toast({ title: 'Failed to load clients', variant: 'destructive' })
      );
  }, []);


  const fetchMoreClients = async (reset = false) => {
    if (loadingClients || (!clientsHasMore && !reset)) return;

    setLoadingClients(true);

    try {
      const res = await clientsApi.getClients({
        page: reset ? 1 : clientsPage,
        page_size: 20,
      });

      setClientOptions(prev => reset ? res.data : [...prev, ...res.data]);
      setClientsPage(reset ? 2 : clientsPage + 1);
      setClientsHasMore(res.page < Math.ceil(res.total / res.page_size));
    } catch {
      toast({ title: 'Failed to load clients', variant: 'destructive' });
    } finally {
      setLoadingClients(false);
    }
  };


  const getPresetRange = (preset: DatePreset) => {
    const now = new Date();

    switch (preset) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };

      case 'yesterday': {
        const y = subDays(now, 1);
        return {
          start: startOfDay(y),
          end: endOfDay(y),
        };
      }

      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };

      case 'lastWeek': {
        const lw = subDays(now, 7);
        return {
          start: startOfWeek(lw, { weekStartsOn: 1 }),
          end: endOfWeek(lw, { weekStartsOn: 1 }),
        };
      }

      case 'thisMonth':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };

      case 'lastMonth': {
        const lm = subMonths(now, 1);
        return {
          start: startOfMonth(lm),
          end: endOfMonth(lm),
        };
      }

      default:
        return null;
    }
  };

  const applyPreset = (preset: DatePreset) => {
    setDatePreset(preset);

    if (preset === 'custom') return;

    const range = getPresetRange(preset);
    if (!range) return;

    setStartDate(range.start);
    setEndDate(range.end);
  };


  useEffect(() => {
    fetchMoreClients(true);
  }, []);


  const fetchData = async () => {
    if (activeTab === 'invoice' && !selectedClientId) {
      toast({ title: 'Please select a client', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      let start = startDate;
      let end = endDate;

      if (datePreset !== 'custom') {
        const range = getPresetRange(datePreset);
        if (range) {
          start = range.start;
          end = range.end;
        }
      }

      const filters = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        ...(activeTab === 'invoice' && { clientId: selectedClientId }),
        page: 1,
        pageSize: 1000,
      };

      console.log('Sending filters:', filters);

      const res = await ordersApi.getOrders(filters);
      setOrders(res.data);
    } catch {
      toast({ title: 'Error fetching data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };


  const fetchClients = async (page = 1, reset = false) => {
    if (clientsLoading || (!clientsHasMore && !reset)) return;

    setClientsLoading(true);

    try {
      const res = await clientsApi.getClients({
        page,
        page_size: 20,
      });

      setClients((prev) =>
        reset ? res.data : [...prev, ...res.data]
      );

      setClientsHasMore(page < res.totalPages);
      setClientsPage(page);
    } catch {
      toast({ title: 'Failed to load clients', variant: 'destructive' });
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1, true);
  }, []);


  useEffect(() => {
    setClients([]);
    setClientsPage(1);
    setClientsHasMore(true);
    fetchClients(1, true);
  }, [activeTab]);


  const handleClientsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isNearBottom && clientsHasMore && !clientsLoading) {
      fetchClients(clientsPage + 1);
    }
  };



  const handleExportPDF = () => {
    if (orders.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }

    if (activeTab === 'invoice') {
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) return;
      exportToPDF(orders, client, startDate.toISOString(), endDate.toISOString());
    } else {
      exportReportToPDF(orders, startDate.toISOString(), endDate.toISOString());
    }
    toast({ title: 'PDF exported successfully' });
  };

  const handleExportExcel = () => {
    if (orders.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }

    if (activeTab === 'invoice') {
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) return;
      exportToExcel(orders, client, startDate.toISOString(), endDate.toISOString());
    } else {
      exportReportToExcel(orders, startDate.toISOString(), endDate.toISOString());
    }
    toast({ title: 'Excel file exported successfully' });
  };

  const totalAmount = orders.reduce((sum, order) => sum + order.totalCost, 0);
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const presetOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Invoices & Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate invoices for clients or export order reports
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="invoice">Client Invoice</TabsTrigger>
          <TabsTrigger value="report">General Report</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice" className="space-y-6 mt-6">
          {/* Filters Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  onOpenChange={(open) => {
                    if (open && clientOptions.length === 0) {
                      fetchMoreClients(true);
                    }
                  }}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>

                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {clientOptions.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.clientName} ({client.clientId})
                      </SelectItem>
                    ))}

                    {loadingClients && (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {clientsHasMore && !loadingClients && (
                      <button
                        type="button"
                        className="w-full py-2 text-xs text-muted-foreground hover:bg-muted"
                        onClick={() => fetchMoreClients()}
                      >
                        Load more clients
                      </button>
                    )}

                    {!clientsHasMore && clientOptions.length === 0 && (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        No clients found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filters */}
              <div className="space-y-4">
                <Label>Date Range</Label>
                <div className="flex flex-wrap gap-2">
                  {presetOptions.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={datePreset === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyPreset(preset.value as DatePreset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                {datePreset === 'custom' && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-[200px] justify-start text-left font-normal',
                              !startDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? formatEAT(startDate) : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => date && setStartDate(date)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-[200px] justify-start text-left font-normal',
                              !endDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => date && setEndDate(date)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={fetchData} disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Generate Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Invoice Preview */}
          {orders.length > 0 && selectedClient && (
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Invoice Preview</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedClient.clientName} • {formatEAT(startDate)} - {formatEAT(endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                    <FileDown className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Class
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Week
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Product
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Description
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Pages/Slides/Questions
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Unit Price
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-muted-foreground">{order.class?.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{order.week}</td>
                          <td className="py-3 px-4 text-sm">{order.product?.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-center">{order.description}</td>
                          <td className="py-3 px-4 text-sm text-center">{order.pagesOrSlides}</td>
                          <td className="py-3 px-4 text-sm text-right">
                            ${order.product?.pricePerUnit.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium">
                            ${order.totalCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/30">
                        <td colSpan={5} className="py-4 px-4 text-right font-semibold">
                          Total Amount:
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-lg">
                          ${totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="report" className="space-y-6 mt-6">
          {/* Report Filters */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Filters */}
              <div className="space-y-4">
                <Label>Date Range</Label>
                <div className="flex flex-wrap gap-2">
                  {presetOptions.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={datePreset === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyPreset(preset.value as DatePreset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                {datePreset === 'custom' && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-[200px] justify-start text-left font-normal',
                              !startDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? formatEAT(startDate) : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => date && setStartDate(date)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-[200px] justify-start text-left font-normal',
                              !endDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => date && setEndDate(date)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={fetchData} disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Report Preview */}
          {orders.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Report Preview</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {orders.length} orders • {formatEAT(startDate)} - {formatEAT(endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                    <FileDown className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Client
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Class
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Week
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Product
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Description
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Pages/Slides/Questions
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Unit Price
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.slice(0, 50).map((order) => (
                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm">{order.client?.clientName || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{order.class?.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{order.week}</td>
                          <td className="py-3 px-4 text-sm">{order.product?.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-center">{order.description}</td>
                          <td className="py-3 px-4 text-sm text-center">{order.pagesOrSlides}</td>
                          <td className="py-3 px-4 text-sm text-right">
                            ${order.product?.pricePerUnit.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium">
                            ${order.totalCost.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatEAT(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/30">
                        <td colSpan={4} className="py-4 px-4 text-right font-semibold">
                          Total Revenue:
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-lg">
                          ${totalAmount.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {orders.length > 50 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Showing first 50 of {orders.length} orders. Export to see all.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
