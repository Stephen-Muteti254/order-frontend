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
import { RevenueTrend as RevenueTrendType } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function RevenueTrend() {
  const [period, setPeriod] = useState<TrendPeriod>('1month');
  const [data, setData] = useState<RevenueTrendType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = { period };
      if (period === 'custom' && customStartDate && customEndDate) {
        filters.startDate = customStartDate.toISOString();
        filters.endDate = customEndDate.toISOString();
      }
      const response = await analyticsApi.getRevenueTrend(filters);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch revenue trend:', err);
      setError('Failed to load revenue trend');
    } finally {
      setIsLoading(false);
    }
  }, [period, customStartDate, customEndDate]);

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

  const formatXAxis = (date: string) => {
    const d = new Date(date);
    if (period === '1week') {
      return format(d, 'EEE');
    }
    if (period === '1month') {
      return format(d, 'MMM d');
    }
    return format(d, 'MMM d');
  };

  const chartData = data?.data.map(point => ({
    date: point.date,
    revenue: point.revenue,
    orders: point.orders,
    displayDate: formatXAxis(point.date),
  })) || [];

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Revenue Trajectory</CardTitle>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              Total: {formatCurrency(data.total)} • Avg: {formatCurrency(data.averagePerDay)}/day
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(val: TrendPeriod) => setPeriod(val)}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">Last Week</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
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
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-sm text-primary">
                          Revenue: {formatCurrency(payload[0].value as number)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Orders: {payload[0].payload.orders}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
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
