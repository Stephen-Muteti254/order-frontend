import { useEffect, useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

interface Stats {
  totalClients: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Order {
  id: number;
  orderId: string;
  totalCost: number;
  pagesOrSlides: number;
  client?: {
    clientName: string;
  };
  product?: {
    name: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch clients and products totals
        const [clientsRes, productsRes, ordersSummaryRes, recentOrdersRes] = await Promise.all([
          api.get('/clients', { params: { page: 1, page_size: 1 } }),
          api.get('/products', { params: { page: 1, page_size: 1 } }),
          api.get('/orders/summary'),
          api.get('/orders', { params: { page: 1, page_size: 5, sort: '-createdAt' } }),
        ]);

        setStats({
          totalClients: clientsRes.data?.total ?? 0,
          totalProducts: productsRes.data?.total ?? 0,
          totalOrders: ordersSummaryRes.data?.totalOrders ?? 0,
          totalRevenue: ordersSummaryRes.data?.totalRevenue ?? 0,
        });

        setRecentOrders(recentOrdersRes.data?.data || []);
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
      change: '+12%',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      change: '+3%',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      change: '+18%',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+24%',
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
              <div className="flex items-center gap-1 mt-3 text-sm">
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          <a
            href="/orders"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Client</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Pages</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm">{order.client?.clientName ?? 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">{order.product?.name ?? 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">{order.pagesOrSlides}</td>
                      <td className="py-3 px-4 text-right font-medium text-sm">${order.totalCost.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
