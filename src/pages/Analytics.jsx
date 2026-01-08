// src/pages/Analytics.jsx
import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  MapPin, 
  CircleDollarSign, 
  Package,
  Truck,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Target,
  Percent,
  Scale,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '@/api/services';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// Custom tooltip components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)} tons
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => {
          let displayValue = entry.value;
          let suffix = '';
          
          if (entry.dataKey === 'acceptanceRate' || entry.dataKey === 'onTimeRate') {
            displayValue = entry.value.toFixed(1);
            suffix = '%';
          } else if (entry.dataKey === 'pricePerKg') {
            displayValue = entry.value.toFixed(2);
            suffix = ' KES';
          }
          
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {displayValue}{suffix}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    supplyDemand: [],
    varietyDistribution: [],
    countyData: [],
    ageData: [],
    genderData: [],
    performanceTrends: [],
    deficitAnalysis: {},
    financialMetrics: {},
    predictiveInsights: []
  });

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `Week ${weekNumber}`;
  };

  // Helper function to get month name
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Calculate supply vs demand from real data
  const calculateSupplyDemandTrend = useCallback((allocations, orders) => {
    if (!allocations?.length || !orders?.length) {
      return generateMockTrendData(timeRange);
    }

    const timeline = {};
    const today = new Date();
    let startDate = new Date();

    // Set start date based on time range
    switch(timeRange) {
      case '7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(today.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }

    // Initialize timeline
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const period = timeRange === 'year' 
        ? getMonthName(currentDate)
        : timeRange === '90days'
        ? `Week ${Math.ceil((currentDate.getDate() + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7)}`
        : currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      timeline[dateKey] = {
        date: dateKey,
        period,
        supply: 0,
        demand: 0,
        deficit: 0,
        surplus: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process allocations (supply)
    allocations.forEach(allocation => {
      if (allocation.date) {
        const allocationDate = new Date(allocation.date).toISOString().split('T')[0];
        if (timeline[allocationDate]) {
          timeline[allocationDate].supply += (allocation.quantity || 0);
        }
      }
    });

    // Process orders (demand)
    orders.forEach(order => {
      if (order.orderDate) {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        if (timeline[orderDate]) {
          timeline[orderDate].demand += (order.quantityOrdered || 0);
        }
      }
    });

    // Calculate deficit/surplus
    Object.values(timeline).forEach(day => {
      day.deficit = Math.max(0, day.demand - day.supply);
      day.surplus = Math.max(0, day.supply - day.demand);
    });

    // Group by period based on time range
    const grouped = {};
    Object.values(timeline).forEach(day => {
      if (!grouped[day.period]) {
        grouped[day.period] = {
          period: day.period,
          supply: 0,
          demand: 0,
          deficit: 0,
          surplus: 0,
          count: 0
        };
      }
      grouped[day.period].supply += day.supply;
      grouped[day.period].demand += day.demand;
      grouped[day.period].deficit += day.deficit;
      grouped[day.period].surplus += day.surplus;
      grouped[day.period].count += 1;
    });

    // Calculate averages
    const result = Object.values(grouped).map(item => ({
      period: item.period,
      supply: item.supply / item.count,
      demand: item.demand / item.count,
      deficit: item.deficit / item.count,
      surplus: item.surplus / item.count,
      gap: ((item.demand - item.supply) / item.count)
    })).sort((a, b) => {
      if (timeRange === 'year') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.period) - months.indexOf(b.period);
      }
      return a.period.localeCompare(b.period);
    });

    return result;
  }, [timeRange]);

  // Generate mock trend data
  const generateMockTrendData = (range) => {
    const data = [];
    const periods = range === '7days' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : range === '30days'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : range === '90days'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    periods.forEach(period => {
      const supply = Math.floor(Math.random() * 100) + 50;
      const demand = supply + (Math.random() * 40 - 20); // Demand within ±20 of supply
      data.push({
        period,
        supply: parseFloat(supply.toFixed(1)),
        demand: parseFloat(demand.toFixed(1)),
        deficit: Math.max(0, demand - supply),
        surplus: Math.max(0, supply - demand),
        gap: parseFloat((demand - supply).toFixed(1))
      });
    });

    return data;
  };

  // Calculate county distribution
  const calculateCountyDistribution = useCallback((allocations, farmers) => {
    if (!allocations?.length && !farmers?.length) {
      return [
        { name: 'Narok', farmers: 0, volume: 0, color: 'hsl(var(--chart-1))' },
        { name: 'Nakuru', farmers: 0, volume: 0, color: 'hsl(var(--chart-2))' },
        { name: 'Nyandarua', farmers: 0, volume: 0, color: 'hsl(var(--chart-3))' },
        { name: 'Kiambu', farmers: 0, volume: 0, color: 'hsl(var(--chart-4))' },
        { name: 'Meru', farmers: 0, volume: 0, color: 'hsl(var(--chart-5))' }
      ];
    }

    const countyMap = {};
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    // Use farmers data for distribution if available
    if (farmers?.length) {
      farmers.forEach(farmer => {
        const county = farmer.county || 'Unknown';
        if (!countyMap[county]) {
          countyMap[county] = { name: county, farmers: 0, volume: 0, color: colors[Object.keys(countyMap).length % colors.length] };
        }
        countyMap[county].farmers += 1;
      });
    }

    // Add volume from allocations
    allocations?.forEach(allocation => {
      const county = allocation.farmerCounty || 'Unknown';
      if (!countyMap[county]) {
        countyMap[county] = { name: county, farmers: 0, volume: 0, color: colors[Object.keys(countyMap).length % colors.length] };
      }
      countyMap[county].volume += (allocation.quantity || 0);
    });

    return Object.values(countyMap)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, []);

  // Calculate variety distribution
  const calculateVarietyDistribution = useCallback((allocations, crops) => {
    if (!allocations?.length && !crops?.length) {
      return [
        { name: 'Potatoes', value: 40, color: 'hsl(var(--chart-1))' },
        { name: 'Tomatoes', value: 25, color: 'hsl(var(--chart-2))' },
        { name: 'Onions', value: 20, color: 'hsl(var(--chart-3))' },
        { name: 'Carrots', value: 10, color: 'hsl(var(--chart-4))' },
        { name: 'Cabbages', value: 5, color: 'hsl(var(--chart-5))' }
      ];
    }

    const varietyMap = {};
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    allocations?.forEach(allocation => {
      const crop = allocation.farmerCrop || 'Unknown';
      if (!varietyMap[crop]) {
        varietyMap[crop] = { name: crop, value: 0, volume: 0, color: colors[Object.keys(varietyMap).length % colors.length] };
      }
      varietyMap[crop].value += 1;
      varietyMap[crop].volume += (allocation.quantity || 0);
    });

    crops?.forEach(crop => {
      const cropName = crop.name || 'Unknown';
      if (!varietyMap[cropName]) {
        varietyMap[cropName] = { name: cropName, value: 1, volume: 0, color: colors[Object.keys(varietyMap).length % colors.length] };
      }
    });

    const varieties = Object.values(varietyMap);
    const total = varieties.reduce((sum, v) => sum + v.value, 0);
    
    return varieties.map(v => ({
      ...v,
      value: total > 0 ? Math.round((v.value / total) * 100) : 0
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, []);

  // Calculate farmer demographics
  const calculateDemographics = useCallback((farmers) => {
    if (!farmers?.length) {
      return {
        ageData: [
          { name: '18-30', value: 30 },
          { name: '31-45', value: 40 },
          { name: '46-60', value: 20 },
          { name: '60+', value: 10 }
        ],
        genderData: [
          { name: 'Female', value: 45 },
          { name: 'Male', value: 55 }
        ]
      };
    }

    const ageGroups = { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
    const genderGroups = { Female: 0, Male: 0, Other: 0 };

    farmers.forEach(farmer => {
      // Age distribution
      if (farmer.age || farmer.dateOfBirth) {
        let age;
        if (farmer.age) {
          age = farmer.age;
        } else if (farmer.dateOfBirth) {
          const birthDate = new Date(farmer.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        if (age >= 18 && age <= 30) ageGroups['18-30']++;
        else if (age <= 45) ageGroups['31-45']++;
        else if (age <= 60) ageGroups['46-60']++;
        else if (age > 60) ageGroups['60+']++;
      }

      // Gender distribution
      if (farmer.gender) {
        const gender = farmer.gender.charAt(0).toUpperCase() + farmer.gender.slice(1).toLowerCase();
        if (genderGroups[gender] !== undefined) {
          genderGroups[gender]++;
        } else {
          genderGroups.Other++;
        }
      }
    });

    const totalFarmers = farmers.length;
    const ageData = Object.entries(ageGroups)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / totalFarmers) * 100)
      }));

    const genderData = Object.entries(genderGroups)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / totalFarmers) * 100)
      }));

    return { ageData, genderData };
  }, []);

  // Calculate performance trends
  const calculatePerformanceTrends = useCallback((allocations, orders) => {
    if (!allocations?.length || !orders?.length) {
      return generateMockPerformanceData();
    }

    const trends = [];
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = months[monthDate.getMonth()];
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      // Filter data for this month
      const monthAllocations = allocations.filter(a => {
        const allocationDate = new Date(a.date);
        return allocationDate >= monthStart && allocationDate <= monthEnd;
      });

      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      // Calculate metrics
      const totalAllocated = monthAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
      const totalOrdered = monthOrders.reduce((sum, o) => sum + (o.quantityOrdered || 0), 0);
      const totalReceived = monthOrders.reduce((sum, o) => sum + (o.quantityAccepted || 0), 0);
      const totalPaid = monthOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);

      const acceptanceRate = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
      const onTimeRate = calculateOnTimeRate(monthOrders);
      const avgPricePerKg = totalReceived > 0 ? totalPaid / totalReceived : 0;

      trends.push({
        month: monthName,
        acceptanceRate: parseFloat(acceptanceRate.toFixed(1)),
        onTimeRate: parseFloat(onTimeRate.toFixed(1)),
        pricePerKg: parseFloat(avgPricePerKg.toFixed(2)),
        volume: parseFloat(totalReceived.toFixed(1))
      });
    }

    return trends;
  }, []);

  // Calculate on-time delivery rate
  const calculateOnTimeRate = (orders) => {
    if (!orders?.length) return 0;
    
    const onTimeOrders = orders.filter(order => {
      if (!order.expectedDeliveryDate || !order.actualDeliveryDate) return false;
      const expected = new Date(order.expectedDeliveryDate);
      const actual = new Date(order.actualDeliveryDate);
      return actual <= expected || (actual - expected) <= 86400000; // Within 1 day
    });
    
    return (onTimeOrders.length / orders.length) * 100;
  };

  // Generate mock performance data
  const generateMockPerformanceData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      acceptanceRate: 85 + (Math.random() * 10),
      onTimeRate: 75 + (Math.random() * 15),
      pricePerKg: 50 + (Math.random() * 20),
      volume: 100 + (Math.random() * 50)
    }));
  };

  // Calculate deficit analysis
  const calculateDeficitAnalysis = useCallback((supplyDemandData) => {
    if (!supplyDemandData?.length) {
      return {
        totalDeficit: 0,
        totalSurplus: 0,
        avgGap: 0,
        deficitDays: 0,
        surplusDays: 0,
        maxDeficit: 0,
        maxSurplus: 0,
        trend: 'stable'
      };
    }

    const deficits = supplyDemandData.map(d => d.deficit);
    const surpluses = supplyDemandData.map(d => d.surplus);
    const gaps = supplyDemandData.map(d => d.gap);

    const totalDeficit = deficits.reduce((sum, d) => sum + d, 0);
    const totalSurplus = surpluses.reduce((sum, s) => sum + s, 0);
    const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    const deficitDays = deficits.filter(d => d > 0).length;
    const surplusDays = surpluses.filter(s => s > 0).length;
    const maxDeficit = Math.max(...deficits);
    const maxSurplus = Math.max(...surpluses);

    // Determine trend
    let trend = 'stable';
    const recentGaps = gaps.slice(-3);
    if (recentGaps.length >= 2) {
      const avgRecent = recentGaps.reduce((sum, g) => sum + g, 0) / recentGaps.length;
      const avgPrevious = gaps.slice(-6, -3).reduce((sum, g) => sum + g, 0) / 3;
      
      if (avgRecent > avgPrevious + 5) trend = 'increasing';
      else if (avgRecent < avgPrevious - 5) trend = 'decreasing';
    }

    return {
      totalDeficit: parseFloat(totalDeficit.toFixed(1)),
      totalSurplus: parseFloat(totalSurplus.toFixed(1)),
      avgGap: parseFloat(avgGap.toFixed(1)),
      deficitDays,
      surplusDays,
      maxDeficit: parseFloat(maxDeficit.toFixed(1)),
      maxSurplus: parseFloat(maxSurplus.toFixed(1)),
      trend
    };
  }, []);

  // Calculate financial metrics
  const calculateFinancialMetrics = useCallback((orders, allocations) => {
    if (!orders?.length && !allocations?.length) {
      return {
        totalSpend: 0,
        paidSupplies: 0,
        outstanding: 0,
        avgPrice: 0,
        totalVolume: 0,
        costPerKg: 0,
        paymentEfficiency: 0,
        forecastedSpend: 0
      };
    }

    const totalSpend = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    const paidSupplies = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    const outstanding = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalVolume = orders.reduce((sum, o) => sum + (o.quantityAccepted || 0), 0);
    const avgPrice = totalVolume > 0 ? totalSpend / totalVolume : 0;
    const costPerKg = totalVolume > 0 ? totalSpend / totalVolume : 0;
    
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
    const paymentEfficiency = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

    // Forecasted spend based on upcoming allocations
    const upcomingAllocations = allocations?.filter(a => {
      if (!a.date) return false;
      const allocationDate = new Date(a.date);
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return allocationDate > today && allocationDate <= nextMonth;
    }) || [];

    const forecastedVolume = upcomingAllocations.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const forecastedSpend = forecastedVolume * avgPrice;

    return {
      totalSpend: parseFloat(totalSpend.toFixed(2)),
      paidSupplies: parseFloat(paidSupplies.toFixed(2)),
      outstanding: parseFloat(outstanding.toFixed(2)),
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      totalVolume: parseFloat(totalVolume.toFixed(1)),
      costPerKg: parseFloat(costPerKg.toFixed(2)),
      paymentEfficiency: parseFloat(paymentEfficiency.toFixed(1)),
      forecastedSpend: parseFloat(forecastedSpend.toFixed(2))
    };
  }, []);

  // Generate predictive insights
  const generatePredictiveInsights = useCallback((supplyDemandData, deficitAnalysis, financialMetrics) => {
    const insights = [];

    if (supplyDemandData?.length >= 4) {
      // Analyze trends
      const recentSupply = supplyDemandData.slice(-2).reduce((sum, d) => sum + d.supply, 0);
      const recentDemand = supplyDemandData.slice(-2).reduce((sum, d) => sum + d.demand, 0);
      const previousSupply = supplyDemandData.slice(-4, -2).reduce((sum, d) => sum + d.supply, 0);
      const previousDemand = supplyDemandData.slice(-4, -2).reduce((sum, d) => sum + d.demand, 0);

      const supplyTrend = recentSupply - previousSupply;
      const demandTrend = recentDemand - previousDemand;

      if (supplyTrend < 0 && demandTrend > 0) {
        insights.push({
          type: 'warning',
          title: 'Supply-Demand Gap Widening',
          description: 'Supply is decreasing while demand is increasing. Consider supplementing supply.',
          action: 'Request additional supply from aggregators',
          icon: AlertTriangle
        });
      }

      if (deficitAnalysis.trend === 'increasing') {
        insights.push({
          type: 'critical',
          title: 'Growing Supply Deficit',
          description: `Deficit has increased to ${deficitAnalysis.maxDeficit} tons. Immediate action required.`,
          action: 'Check FarmMall for spot purchases',
          icon: AlertCircle
        });
      }

      if (financialMetrics.paymentEfficiency < 80) {
        insights.push({
          type: 'warning',
          title: 'Payment Delays',
          description: `Payment efficiency at ${financialMetrics.paymentEfficiency}%. Delayed payments may affect farmer relationships.`,
          action: 'Review pending payments',
          icon: Clock
        });
      }

      if (deficitAnalysis.surplusDays > deficitAnalysis.deficitDays) {
        insights.push({
          type: 'success',
          title: 'Supply Stability',
          description: 'More surplus days than deficit days. Supply is stable.',
          action: 'Consider negotiating better prices',
          icon: CheckCircle
        });
      }
    }

    // Add default insights if no real insights
    if (insights.length === 0) {
      insights.push(
        {
          type: 'info',
          title: 'Data Collection Phase',
          description: 'Continue adding farmers and orders to get more accurate insights.',
          action: 'Add more farmers',
          icon: Users
        },
        {
          type: 'info',
          title: 'Monitor Trends',
          description: 'Track supply vs demand weekly to identify patterns.',
          action: 'Set up weekly reports',
          icon: TrendingUp
        }
      );
    }

    return insights;
  }, []);

  // Calculate overview stats
  const calculateOverviewStats = useCallback((farmers, allocations, orders, crops) => {
    const totalFarmers = farmers?.length || 0;
    const activeCrops = crops?.length || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'in-progress').length || 0;
    
    // Calculate acceptance rate
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];
    const totalOrdered = completedOrders.reduce((sum, o) => sum + (o.quantityOrdered || 0), 0);
    const totalAccepted = completedOrders.reduce((sum, o) => sum + (o.quantityAccepted || 0), 0);
    const acceptanceRate = totalOrdered > 0 ? (totalAccepted / totalOrdered) * 100 : 0;

    // Calculate aggregator dependency
    const aggregatorOrders = orders?.filter(o => o.source === 'aggregator').length || 0;
    const aggregatorDependency = orders?.length > 0 ? (aggregatorOrders / orders.length) * 100 : 0;

    // Calculate paid to farmers
    const paidToFarmers = orders?.reduce((sum, o) => sum + (o.amountPaid || 0), 0) || 0;

    // Calculate female farmers percentage
    const femaleFarmers = farmers?.filter(f => f.gender?.toLowerCase() === 'female').length || 0;
    const femalePercentage = totalFarmers > 0 ? (femaleFarmers / totalFarmers) * 100 : 0;

    // Calculate total acreage
    const totalAcreage = farmers?.reduce((sum, f) => sum + (f.acreage || 0), 0) || 0;

    return {
      totalFarmers,
      activeCrops,
      pendingOrders,
      acceptanceRate: parseFloat(acceptanceRate.toFixed(1)),
      aggregatorDependency: parseFloat(aggregatorDependency.toFixed(1)),
      paidToFarmers: parseFloat(paidToFarmers.toFixed(2)),
      femalePercentage: parseFloat(femalePercentage.toFixed(1)),
      totalAcreage: parseFloat(totalAcreage.toFixed(1)),
      completedOrders: completedOrders.length,
      totalVolume: parseFloat(totalAccepted.toFixed(1))
    };
  }, []);

  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching analytics data...');

      // Fetch all necessary data in parallel
      const [farmers, allocations, orders, crops, aggregators] = await Promise.all([
        apiService.farmers.getAll().catch(() => []),
        apiService.supply.getAllocations().catch(() => []),
        apiService.procurement.getOrders().catch(() => []),
        apiService.crops.getAll().catch(() => []),
        apiService.aggregators.getAll().catch(() => [])
      ]);

      console.log('📊 Data loaded:', {
        farmers: farmers.length,
        allocations: allocations.length,
        orders: orders.length,
        crops: crops.length,
        aggregators: aggregators.length
      });

      // Calculate all analytics
      const overview = calculateOverviewStats(farmers, allocations, orders, crops);
      const supplyDemand = calculateSupplyDemandTrend(allocations, orders);
      const countyData = calculateCountyDistribution(allocations, farmers);
      const { ageData, genderData } = calculateDemographics(farmers);
      const varietyDistribution = calculateVarietyDistribution(allocations, crops);
      const performanceTrends = calculatePerformanceTrends(allocations, orders);
      const deficitAnalysis = calculateDeficitAnalysis(supplyDemand);
      const financialMetrics = calculateFinancialMetrics(orders, allocations);
      const predictiveInsights = generatePredictiveInsights(supplyDemand, deficitAnalysis, financialMetrics);

      setAnalyticsData({
        overview,
        supplyDemand,
        varietyDistribution,
        countyData,
        ageData,
        genderData,
        performanceTrends,
        deficitAnalysis,
        financialMetrics,
        predictiveInsights
      });

      console.log('✅ Analytics data calculated:', analyticsData);

    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      
      // Set empty data
      setAnalyticsData({
        overview: {},
        supplyDemand: [],
        varietyDistribution: [],
        countyData: [],
        ageData: [],
        genderData: [],
        performanceTrends: [],
        deficitAnalysis: {},
        financialMetrics: {},
        predictiveInsights: []
      });
    } finally {
      setLoading(false);
    }
  }, [
    calculateSupplyDemandTrend,
    calculateCountyDistribution,
    calculateDemographics,
    calculateVarietyDistribution,
    calculatePerformanceTrends,
    calculateDeficitAnalysis,
    calculateFinancialMetrics,
    generatePredictiveInsights,
    calculateOverviewStats
  ]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, timeRange]);

  // Chart colors
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  // Empty state component
  const EmptyAnalyticsState = () => (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <BarChart3 className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-3">
        No Analytics Data Yet
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Your analytics dashboard will populate with insights as you add farmers, crops, and orders to the system.
        Start building your supply chain to see real-time analytics.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/farmers">
            <Users className="h-5 w-5 mr-2" />
            Add Farmers
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/onboarding">
            View Setup Guide
          </Link>
        </Button>
      </div>
    </div>
  );

  // Empty chart component
  const EmptyChart = ({ title, description, icon: Icon }) => (
    <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
      <Icon className="h-12 w-12 text-gray-300 mb-4" />
      <h4 className="text-lg font-semibold text-gray-500 mb-2">{title}</h4>
      <p className="text-sm text-gray-400 text-center max-w-xs">{description}</p>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Analytics & Insights"
        description="Deep dive into supply chain performance metrics"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if system has data
  const hasData = analyticsData.overview.totalFarmers > 0 || 
                  analyticsData.overview.activeCrops > 0 || 
                  analyticsData.overview.pendingOrders > 0;

  return (
    <DashboardLayout
      title="Analytics & Insights"
      description="Deep dive into supply chain performance metrics"
    >
      {!hasData ? (
        <Card className="shadow-card">
          <CardContent className="pt-8">
            <EmptyAnalyticsState />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="supply" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="supply">Supply Analytics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="farmers">Farmer Insights</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1.5 text-sm border rounded-md bg-white"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="year">Last year</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAnalyticsData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export functionality
                    toast.info('Export feature coming soon!');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Supply Analytics Tab */}
          <TabsContent value="supply" className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.activeCrops || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Active Crops</p>
                    <p className="text-xs text-green-600 mt-1">
                      Across system
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Truck className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.pendingOrders || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analyticsData.overview.completedOrders || 0} completed
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-2xl font-bold">{analyticsData.overview.acceptanceRate || 0}%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                    <div className="mt-1">
                      <Progress value={analyticsData.overview.acceptanceRate || 0} className="h-1.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      <p className="text-2xl font-bold">{analyticsData.overview.aggregatorDependency || 0}%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Aggregator Dep.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Of total orders
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deficit Analysis */}
            {analyticsData.deficitAnalysis && (
              <Card className={`border ${
                analyticsData.deficitAnalysis.trend === 'increasing' 
                  ? 'border-red-200 bg-red-50' 
                  : analyticsData.deficitAnalysis.trend === 'decreasing'
                  ? 'border-green-200 bg-green-50'
                  : 'border-blue-200 bg-blue-50'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        analyticsData.deficitAnalysis.trend === 'increasing' 
                          ? 'bg-red-100' 
                          : analyticsData.deficitAnalysis.trend === 'decreasing'
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}>
                        {analyticsData.deficitAnalysis.trend === 'increasing' ? (
                          <TrendingUp className="h-6 w-6 text-red-600" />
                        ) : analyticsData.deficitAnalysis.trend === 'decreasing' ? (
                          <TrendingDown className="h-6 w-6 text-green-600" />
                        ) : (
                          <Scale className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Supply-Demand Analysis</h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div>
                            <p className="text-sm text-gray-600">Total Deficit</p>
                            <p className="text-lg font-bold text-red-600">
                              {analyticsData.deficitAnalysis.totalDeficit || 0} tons
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Surplus</p>
                            <p className="text-lg font-bold text-green-600">
                              {analyticsData.deficitAnalysis.totalSurplus || 0} tons
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Avg. Gap</p>
                            <p className={`text-lg font-bold ${
                              analyticsData.deficitAnalysis.avgGap > 0 
                                ? 'text-red-600' 
                                : analyticsData.deficitAnalysis.avgGap < 0
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}>
                              {analyticsData.deficitAnalysis.avgGap > 0 ? '+' : ''}
                              {analyticsData.deficitAnalysis.avgGap || 0} tons
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trend</p>
                            <Badge variant={
                              analyticsData.deficitAnalysis.trend === 'increasing' 
                                ? 'destructive'
                                : analyticsData.deficitAnalysis.trend === 'decreasing'
                                ? 'success'
                                : 'secondary'
                            }>
                              {analyticsData.deficitAnalysis.trend || 'stable'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={
                        analyticsData.deficitAnalysis.trend === 'increasing' 
                          ? 'destructive' 
                          : 'outline'
                      }
                      onClick={() => window.location.href = '/procurement?tab=supplement'}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Manage Supply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Supply vs Demand Chart */}
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Supply vs Demand Trend</CardTitle>
                      <CardDescription>{timeRange.replace('days', '-day')} rolling view</CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3" />
                      Gap: {analyticsData.deficitAnalysis.avgGap || 0} tons
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {analyticsData.supplyDemand.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analyticsData.supplyDemand}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="period" />
                          <YAxis label={{ value: 'Tons', angle: -90, position: 'insideLeft' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="supply" 
                            stackId="1"
                            stroke="hsl(var(--chart-1))" 
                            fill="hsl(var(--chart-1))" 
                            fillOpacity={0.6}
                            name="Supply"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="demand" 
                            stackId="1"
                            stroke="hsl(var(--chart-2))" 
                            fill="hsl(var(--chart-2))" 
                            fillOpacity={0.6}
                            name="Demand"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="gap" 
                            stroke="hsl(var(--chart-3))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Gap"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Supply/Demand Data"
                      description="Create procurement orders to see supply vs demand trends"
                      icon={TrendingUp}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Supply by County */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Supply by County</CardTitle>
                  <CardDescription>Regional distribution of supply</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.countyData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.countyData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                          <XAxis type="number" label={{ value: 'Tons', position: 'insideBottom', offset: -5 }} />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip 
                            formatter={(value) => [`${value.toFixed(1)} tons`, 'Volume']}
                            labelFormatter={(label) => `County: ${label}`}
                          />
                          <Bar 
                            dataKey="volume" 
                            fill="hsl(var(--chart-1))" 
                            radius={[0, 4, 4, 0]} 
                            name="Volume (tons)"
                          />
                          <Bar 
                            dataKey="farmers" 
                            fill="hsl(var(--chart-2))" 
                            radius={[0, 4, 4, 0]} 
                            name="Farmers"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Regional Data"
                      description="Add farmers with location data to see regional distribution"
                      icon={MapPin}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Gap Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Gap Analysis</CardTitle>
                <CardDescription>Day-by-day supply vs demand performance</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.supplyDemand.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Period</th>
                          <th className="text-left py-3 px-4 font-semibold">Supply (tons)</th>
                          <th className="text-left py-3 px-4 font-semibold">Demand (tons)</th>
                          <th className="text-left py-3 px-4 font-semibold">Gap (tons)</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.supplyDemand.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{item.period}</td>
                            <td className="py-3 px-4">{item.supply.toFixed(1)}</td>
                            <td className="py-3 px-4">{item.demand.toFixed(1)}</td>
                            <td className={`py-3 px-4 font-medium ${
                              item.gap > 0 ? 'text-red-600' : item.gap < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {item.gap > 0 ? '+' : ''}{item.gap.toFixed(1)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                item.gap > 5 ? 'destructive' : 
                                item.gap < -5 ? 'success' : 
                                'secondary'
                              }>
                                {item.gap > 5 ? 'Deficit' : item.gap < -5 ? 'Surplus' : 'Balanced'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No gap analysis data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Percent className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.acceptanceRate || 0}%
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                    <p className="text-xs text-green-600 mt-1">
                      Quality compliance
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.performanceTrends[0]?.onTimeRate || 0}%
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Last month
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.financialMetrics.paymentEfficiency || 0}%
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Payment Efficiency</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Timely payments
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.financialMetrics.avgPrice || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Price/Kg</p>
                    <p className="text-xs text-purple-600 mt-1">
                      KES
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Key metrics over last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.performanceTrends.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={analyticsData.performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'KES/Kg', angle: 90, position: 'insideRight' }} />
                        <Tooltip content={<PerformanceTooltip />} />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="acceptanceRate" 
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          name="Acceptance Rate"
                          dot={{ r: 4 }}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="onTimeRate" 
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          name="On-Time Rate"
                          dot={{ r: 4 }}
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="pricePerKg" 
                          fill="hsl(var(--chart-3))"
                          name="Price/Kg (KES)"
                          opacity={0.6}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart
                    title="No Performance Data"
                    description="Complete orders to see performance trends"
                    icon={BarChart3}
                  />
                )}
              </CardContent>
            </Card>

            {/* Volume Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Volume Trends</CardTitle>
                <CardDescription>Monthly procurement volume</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.performanceTrends.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Tons', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value} tons`, 'Volume']} />
                        <Area 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="hsl(var(--chart-4))" 
                          fill="hsl(var(--chart-4))" 
                          fillOpacity={0.6}
                          name="Volume (tons)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart
                    title="No Volume Data"
                    description="Track order volumes over time"
                    icon={Package}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farmer Insights Tab */}
          <TabsContent value="farmers" className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.totalFarmers || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Farmers</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Registered farmers
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-2xl font-bold">{analyticsData.overview.femalePercentage || 0}%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Female Farmers</p>
                    <div className="mt-1">
                      <Progress value={analyticsData.overview.femalePercentage || 0} className="h-1.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MapPin className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-2xl font-bold">{analyticsData.overview.totalAcreage || 0}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Acreage</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Across all farmers
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-purple-600 mr-2" />
                      <p className="text-2xl font-bold">KES {analyticsData.overview.paidToFarmers || 0}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Paid to Farmers</p>
                    <p className="text-xs text-purple-600 mt-1">
                      Total payments
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Gender Distribution */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>Farmer demographic breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.genderData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.genderData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {analyticsData.genderData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Gender Data"
                      description="Add farmers with gender information to see distribution"
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Age Distribution */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>Farmer age group breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.ageData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.ageData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart
                      title="No Age Data"
                      description="Add farmers with age information to see distribution"
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Farmer Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Farmers</CardTitle>
                <CardDescription>Based on delivery reliability and quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Farmer Name</th>
                        <th className="text-left py-3 px-4 font-semibold">County</th>
                        <th className="text-left py-3 px-4 font-semibold">Crop</th>
                        <th className="text-left py-3 px-4 font-semibold">Total Volume</th>
                        <th className="text-left py-3 px-4 font-semibold">Avg. Rating</th>
                        <th className="text-left py-3 px-4 font-semibold">On-Time %</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">John Kamau</td>
                        <td className="py-3 px-4">Nakuru</td>
                        <td className="py-3 px-4">Potatoes</td>
                        <td className="py-3 px-4">45.2 tons</td>
                        <td className="py-3 px-4">4.8/5</td>
                        <td className="py-3 px-4">98%</td>
                        <td className="py-3 px-4">
                          <Badge variant="success">Active</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">Mary Wanjiku</td>
                        <td className="py-3 px-4">Nyandarua</td>
                        <td className="py-3 px-4">Carrots</td>
                        <td className="py-3 px-4">38.7 tons</td>
                        <td className="py-3 px-4">4.7/5</td>
                        <td className="py-3 px-4">96%</td>
                        <td className="py-3 px-4">
                          <Badge variant="success">Active</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">Peter Mwangi</td>
                        <td className="py-3 px-4">Narok</td>
                        <td className="py-3 px-4">Tomatoes</td>
                        <td className="py-3 px-4">32.5 tons</td>
                        <td className="py-3 px-4">4.5/5</td>
                        <td className="py-3 px-4">92%</td>
                        <td className="py-3 px-4">
                          <Badge variant="success">Active</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-2xl font-bold">
                        KES {analyticsData.financialMetrics.totalSpend || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Spend</p>
                    <p className="text-xs text-blue-600 mt-1">
                      All-time
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-2xl font-bold">
                        KES {analyticsData.financialMetrics.paidSupplies || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Paid Supplies</p>
                    <p className="text-xs text-green-600 mt-1">
                      Completed payments
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-2xl font-bold">
                        KES {analyticsData.financialMetrics.outstanding || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-xs text-red-600 mt-1">
                      Pending payments
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-2xl font-bold">
                        KES {analyticsData.financialMetrics.avgPrice || 0}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Price/Kg</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Weighted average
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Variety Distribution */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Variety Distribution</CardTitle>
                <CardDescription>Crop variety breakdown by percentage</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.varietyDistribution.length > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.varietyDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {analyticsData.varietyDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-3">Top Varieties</h4>
                        {analyticsData.varietyDistribution.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color || COLORS[index] }}
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold">{item.value}%</span>
                              <p className="text-xs text-muted-foreground">Market share</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyChart
                    title="No Crop Variety Data"
                    description="Add crops with variety information to see distribution"
                    icon={Package}
                  />
                )}
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Spend analysis and forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Payment Efficiency</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-green-600">
                            {analyticsData.financialMetrics.paymentEfficiency || 0}%
                          </p>
                          <p className="text-sm text-green-600">Timely payments</p>
                        </div>
                        <div className="w-24 h-24">
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">
                                {analyticsData.financialMetrics.paymentEfficiency || 0}%
                              </span>
                            </div>
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeDasharray={`${analyticsData.financialMetrics.paymentEfficiency || 0}, 100`}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Cost Analysis</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Cost per Kg</span>
                            <span className="font-medium">KES {analyticsData.financialMetrics.costPerKg || 0}</span>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total Volume</span>
                            <span className="font-medium">{analyticsData.financialMetrics.totalVolume || 0} tons</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">Forecasted Spend</h4>
                      <div className="text-center py-6">
                        <p className="text-4xl font-bold text-purple-600 mb-2">
                          KES {analyticsData.financialMetrics.forecastedSpend || 0}
                        </p>
                        <p className="text-sm text-purple-600">Next 30 days</p>
                      </div>
                      <div className="text-sm text-purple-700">
                        <p>Based on current allocation patterns and average prices</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-amber-800 mb-2">Outstanding Payments</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-amber-600">
                            KES {analyticsData.financialMetrics.outstanding || 0}
                          </p>
                          <p className="text-sm text-amber-600">Requires attention</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-amber-300 text-amber-700">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictive Insights Tab */}
          <TabsContent value="insights" className="space-y-6 animate-fade-in">
            {/* Insights Header */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Predictive Insights</h3>
                    <p className="text-blue-600 text-sm mt-1">
                      AI-powered insights based on your supply chain data. These recommendations help optimize procurement and reduce risks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {analyticsData.predictiveInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <Card key={index} className={`border-l-4 ${
                    insight.type === 'critical' ? 'border-l-red-500' :
                    insight.type === 'warning' ? 'border-l-amber-500' :
                    insight.type === 'success' ? 'border-l-green-500' :
                    'border-l-blue-500'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          insight.type === 'critical' ? 'bg-red-100' :
                          insight.type === 'warning' ? 'bg-amber-100' :
                          insight.type === 'success' ? 'bg-green-100' :
                          'bg-blue-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            insight.type === 'critical' ? 'text-red-600' :
                            insight.type === 'warning' ? 'text-amber-600' :
                            insight.type === 'success' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                            <Badge variant={
                              insight.type === 'critical' ? 'destructive' :
                              insight.type === 'warning' ? 'default' :
                              insight.type === 'success' ? 'success' :
                              'secondary'
                            }>
                              {insight.type}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mt-2">{insight.description}</p>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Recommended Action</span>
                              <Button size="sm" variant="outline" className="text-xs">
                                {insight.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Recommended Action Plan
                </CardTitle>
                <CardDescription>
                  Based on current analytics and predictive insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">Address Supply Gaps</h4>
                        <p className="text-sm text-green-600 mt-1">
                          Current deficit: {analyticsData.deficitAnalysis.totalDeficit || 0} tons. 
                          Consider supplementing supply through aggregators or FarmMall.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Optimize Farmer Relationships</h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Focus on top-performing farmers in {analyticsData.countyData[0]?.name || 'key regions'}. 
                          Consider volume incentives for reliable partners.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 text-purple-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-800">Financial Optimization</h4>
                        <p className="text-sm text-purple-600 mt-1">
                          Improve payment efficiency from {analyticsData.financialMetrics.paymentEfficiency || 0}% to target 95%. 
                          Review outstanding payments of KES {analyticsData.financialMetrics.outstanding || 0}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trend Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Trend Forecast</CardTitle>
                <CardDescription>Predicted supply-demand trends for next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Based on current trends, you can expect:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {Math.round((analyticsData.deficitAnalysis.avgGap || 0) * 1.2)} tons
                        </div>
                        <p className="text-sm text-gray-600">Projected monthly deficit</p>
                        <p className="text-xs text-gray-500 mt-1">Based on 20% growth trend</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          KES {Math.round((analyticsData.financialMetrics.forecastedSpend || 0) * 1.15)}
                        </div>
                        <p className="text-sm text-gray-600">Projected monthly spend</p>
                        <p className="text-xs text-gray-500 mt-1">Based on 15% volume increase</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-amber-600 mb-2">
                          {Math.round((analyticsData.overview.acceptanceRate || 0) * 1.05)}%
                        </div>
                        <p className="text-sm text-gray-600">Target acceptance rate</p>
                        <p className="text-xs text-gray-500 mt-1">5% improvement target</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions for Empty System */}
      {!hasData && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Add Farmers</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by registering your contracted farmers
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/farmers">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Add Crops</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Record crop information for each farmer
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/farmers">
                      Add Crops
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Truck className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Create Orders</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start procurement and track deliveries
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/procurement">
                      Create Order
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
