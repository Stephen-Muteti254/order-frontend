import { useState, useEffect, useCallback } from 'react';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { analyticsApi, TrendPeriod } from '@/lib/analyticsApi';
import { ClientEarningsResponse, Client } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { clientsApi } from '@/lib/clientsApi';

export default function ClientEarnings() {
  const [period, setPeriod] = useState<TrendPeriod>('1month');
  const [data, setData] = useState<ClientEarningsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Fetch clients for filter
  useEffect(() => {
    async function loadClients() {
      try {
        const response = await clientsApi.getClients({ page: 1, page_size: 100 });
        setClients(response.data);
      } catch (err) {
        console.error('Failed to load clients:', err);
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = { period, limit: 10 };
      if (selectedClientId !== 'all') {
        filters.clientId = selectedClientId;
      }
      if (period === 'custom' && customStartDate && customEndDate) {
        filters.startDate = customStartDate.toISOString();
        filters.endDate = customEndDate.toISOString();
      }
      const response = await analyticsApi.getClientEarnings(filters);
      console.log(response);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch client earnings:', err);
      setError('Failed to load client earnings');
    } finally {
      setIsLoading(false);
    }
  }, [period, selectedClientId, customStartDate, customEndDate]);

  useEffect(() => {
    if (period !== 'custom' || (customStartDate && customEndDate)) {
      fetchData();
    }
  }, [fetchData, period, customStartDate, customEndDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = data?.data.map((client, index) => ({
    name: client.clientName.length > 15 
      ? client.clientName.substring(0, 15) + '...' 
      : client.clientName,
    fullName: client.clientName,
    revenue: client.totalRevenue,
    orders: client.orderCount,
    avgValue: client.averageOrderValue,
    rank: index + 1,
  })) || [];

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Client Earnings Rankings</CardTitle>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.period.label} • Top {data.data.length} clients
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Select 
            value={selectedClientId} 
            onValueChange={setSelectedClientId}
            disabled={loadingClients}
          >
            <SelectTrigger className="w-[150px] h-8 text-sm">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(val: TrendPeriod) => setPeriod(val)}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">This Week</SelectItem>
              <SelectItem value="1month">This Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {period === 'custom' && (
            <div className="flex gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {customStartDate ? format(customStartDate, 'MMM d') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {customEndDate ? format(customEndDate, 'MMM d') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            {error}
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium text-foreground">#{data.rank} {data.fullName}</p>
                        <p className="text-sm text-primary">
                          Revenue: {formatCurrency(data.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Orders: {data.orders}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg Order: {formatCurrency(data.avgValue)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--chart-2))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
