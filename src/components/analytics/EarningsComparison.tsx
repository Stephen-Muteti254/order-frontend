import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { analyticsApi, ComparisonPeriod } from '@/lib/analyticsApi';
import { EarningsComparison as EarningsComparisonType } from '@/types';
import { cn } from '@/lib/utils';

export default function EarningsComparison() {
  const [period, setPeriod] = useState<ComparisonPeriod>('month');
  const [data, setData] = useState<EarningsComparisonType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyticsApi.getEarningsComparison(period);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch earnings comparison:', err);
      setError('Failed to load earnings comparison');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const periodLabels: Record<ComparisonPeriod, string> = {
    week: 'Week over Week',
    month: 'Month over Month',
    quarter: 'Quarter over Quarter',
    year: 'Year over Year',
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Earnings Comparison</CardTitle>
        <Select value={period} onValueChange={(val: ComparisonPeriod) => setPeriod(val)}>
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week vs Week</SelectItem>
            <SelectItem value="month">Month vs Month</SelectItem>
            <SelectItem value="quarter">Quarter vs Quarter</SelectItem>
            <SelectItem value="year">Year vs Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            {/* Revenue Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {data.currentPeriod.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(data.currentPeriod.revenue)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.currentPeriod.orders} orders
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {data.previousPeriod.label}
                </p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {formatCurrency(data.previousPeriod.revenue)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.previousPeriod.orders} orders
                </p>
              </div>
            </div>

            {/* Change Indicators */}
            <div className="flex gap-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {getChangeIcon(data.percentageChange)}
                <span className={cn("text-sm font-medium", getChangeColor(data.percentageChange))}>
                  {data.percentageChange > 0 ? '+' : ''}{data.percentageChange.toFixed(1)}% revenue
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getChangeIcon(data.ordersPercentageChange)}
                <span className={cn("text-sm font-medium", getChangeColor(data.ordersPercentageChange))}>
                  {data.ordersPercentageChange > 0 ? '+' : ''}{data.ordersPercentageChange.toFixed(1)}% orders
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {periodLabels[period]} comparison
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
