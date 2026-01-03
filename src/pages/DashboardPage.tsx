import { useEffect, useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import EarningsComparison from '@/components/analytics/EarningsComparison';
import RevenueTrend from '@/components/analytics/RevenueTrend';
import ClientEarnings from '@/components/analytics/ClientEarnings';
import OrdersTrend from '@/components/analytics/OrdersTrend';

interface Stats {
  totalClients: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [clientsRes, productsRes, ordersSummaryRes] = await Promise.all([
          api.get('/clients', { params: { page: 1, page_size: 1 } }),
          api.get('/products', { params: { page: 1, page_size: 1 } }),
          api.get('/orders/summary'),
        ]);

        setStats({
          totalClients: clientsRes.data?.total ?? 0,
          totalProducts: productsRes.data?.total ?? 0,
          totalOrders: ordersSummaryRes.data?.totalOrders ?? 0,
          totalRevenue: ordersSummaryRes.data?.totalRevenue ?? 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50 hover:border-border transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {isLoading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-2.5 rounded-lg`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Insights & Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track your business performance with detailed analytics
          </p>
        </div>

        {/* First Row: Earnings Comparison + Revenue Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EarningsComparison />
          <OrdersTrend />
        </div>

        {/* Second Row: Revenue Trajectory (Full Width) */}
        <RevenueTrend />

        {/* Third Row: Client Earnings */}
        <ClientEarnings />
      </div>
    </div>
  );
}
