import api from './api';
import {
  EarningsComparison,
  RevenueTrend,
  ClientEarningsResponse,
  OrdersTrend,
} from '@/types';

export type ComparisonPeriod = 'week' | 'month' | 'quarter' | 'year';
export type TrendPeriod = '1week' | '1month' | '3months' | '6months' | 'custom';

export interface AnalyticsFilters {
  period?: TrendPeriod;
  comparisonPeriod?: ComparisonPeriod;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  limit?: number;
}

/**
 * Analytics API module for dashboard insights
 * 
 * BACKEND IMPLEMENTATION REQUIRED - See backend-api-docs.md for full specification
 */
export const analyticsApi = {
  /**
   * Get earnings comparison between two periods
   * Compares current period vs previous period (e.g., this week vs last week)
   */
  getEarningsComparison: async (
    period: ComparisonPeriod = 'month'
  ): Promise<EarningsComparison> => {
    const res = await api.get('/analytics/earnings/comparison', {
      params: { period },
    });
    return res.data;
  },

  /**
   * Get revenue trajectory over a time period
   * Returns daily/weekly data points for charting
   */
  getRevenueTrend: async (
    filters: AnalyticsFilters = {}
  ): Promise<RevenueTrend> => {
    const params: Record<string, string | number | undefined> = {
      period: filters.period || '1month',
    };

    if (filters.period === 'custom' && filters.startDate && filters.endDate) {
      params.startDate = filters.startDate;
      params.endDate = filters.endDate;
    }

    const res = await api.get('/analytics/revenue/trend', { params });
    return res.data;
  },

  /**
   * Get client earnings with ranking
   * Returns clients sorted by total revenue for a given period
   */
  getClientEarnings: async (
    filters: AnalyticsFilters = {}
  ): Promise<ClientEarningsResponse> => {
    const params: Record<string, string | number | undefined> = {
      period: filters.period || '1month',
      limit: filters.limit || 10,
    };

    if (filters.clientId) {
      params.clientId = filters.clientId;
    }

    if (filters.period === 'custom' && filters.startDate && filters.endDate) {
      params.startDate = filters.startDate;
      params.endDate = filters.endDate;
    }

    const res = await api.get('/analytics/clients/earnings', { params });
    return res.data;
  },

  /**
   * Get orders trend over time
   * Returns daily order counts for charting
   */
  getOrdersTrend: async (
    filters: AnalyticsFilters = {}
  ): Promise<OrdersTrend> => {
    const params: Record<string, string | number | undefined> = {
      period: filters.period || '1month',
    };

    if (filters.period === 'custom' && filters.startDate && filters.endDate) {
      params.startDate = filters.startDate;
      params.endDate = filters.endDate;
    }

    const res = await api.get('/analytics/orders/trend', { params });
    return res.data;
  },
};
