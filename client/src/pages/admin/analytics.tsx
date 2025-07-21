import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Store, 
  Ticket, 
  TrendingUp,
  MapPin,
  DollarSign,
  BarChart3,
  RefreshCw,
  Calendar,
  Activity,
  Target,
  PieChart as PieChartIcon
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [chartType, setChartType] = useState("bar");
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setRefreshing(true);
    setAnimationKey(prev => prev + 1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast({
      title: "Analytics Refreshed",
      description: "Analytics data has been updated with the latest information.",
    });
  };

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  // Sample chart data for visualization
  const monthlyData = [
    { month: "Jan", users: 120, vendors: 15, deals: 85, revenue: 25000 },
    { month: "Feb", users: 150, vendors: 18, deals: 95, revenue: 28000 },
    { month: "Mar", users: 180, vendors: 22, deals: 110, revenue: 32000 },
    { month: "Apr", users: 210, vendors: 25, deals: 125, revenue: 38000 },
    { month: "May", users: 245, vendors: 28, deals: 140, revenue: 42000 },
    { month: "Jun", users: 280, vendors: 32, deals: 155, revenue: 48000 },
  ];

  const categoryData = [
    { name: "Electronics", value: 35, color: "#3b82f6" },
    { name: "Fashion", value: 25, color: "#8b5cf6" },
    { name: "Food", value: 20, color: "#f59e0b" },
    { name: "Travel", value: 15, color: "#ef4444" },
    { name: "Others", value: 5, color: "#06b6d4" },
  ];

  const cityData = [
    { city: "Mumbai", deals: 45, users: 320 },
    { city: "Delhi", deals: 38, users: 280 },
    { city: "Bangalore", deals: 42, users: 310 },
    { city: "Chennai", deals: 35, users: 250 },
    { city: "Hyderabad", deals: 30, users: 220 },
    { city: "Pune", deals: 28, users: 200 },
  ];

  const performanceData = [
    { metric: "User Growth", current: 85, target: 100, color: "#10b981" },
    { metric: "Deal Conversion", current: 72, target: 80, color: "#3b82f6" },
    { metric: "Vendor Satisfaction", current: 90, target: 95, color: "#8b5cf6" },
    { metric: "Revenue Growth", current: 68, target: 75, color: "#f59e0b" },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{analytics?.totalUsers || 0}</p>
                  <p className="text-blue-100 text-xs mt-1">+12% vs last month</p>
                </div>
                <Users className="w-12 h-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Vendors</p>
                  <p className="text-3xl font-bold">{analytics?.totalVendors || 0}</p>
                  <p className="text-purple-100 text-xs mt-1">+8% vs last month</p>
                </div>
                <Store className="w-12 h-12 text-purple-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Total Deals</p>
                  <p className="text-3xl font-bold">{analytics?.totalDeals || 0}</p>
                  <p className="text-amber-100 text-xs mt-1">+15% vs last month</p>
                </div>
                <Ticket className="w-12 h-12 text-amber-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Claims</p>
                  <p className="text-3xl font-bold">{analytics?.totalClaims || 0}</p>
                  <p className="text-green-100 text-xs mt-1">+22% vs last month</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Monthly Trends
                </CardTitle>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' && (
                      <BarChart data={monthlyData} key={animationKey}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="users" fill="#3b82f6" name="Users" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="vendors" fill="#8b5cf6" name="Vendors" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="deals" fill="#f59e0b" name="Deals" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                    {chartType === 'line' && (
                      <LineChart data={monthlyData} key={animationKey}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 6 }} />
                        <Line type="monotone" dataKey="vendors" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 6 }} />
                        <Line type="monotone" dataKey="deals" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 6 }} />
                      </LineChart>
                    )}
                    {chartType === 'area' && (
                      <AreaChart data={monthlyData} key={animationKey}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="vendors" stackId="1" stroke="#8b5cf6" fill="url(#colorVendors)" />
                        <Area type="monotone" dataKey="deals" stackId="1" stroke="#f59e0b" fill="url(#colorDeals)" />
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    )}
                    {chartType === 'combined' && (
                      <ComposedChart data={monthlyData} key={animationKey}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", r: 6 }} />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {performanceData.map((metric) => (
                <Card key={metric.metric}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{metric.metric}</span>
                      <Badge variant="outline" style={{ color: metric.color }}>
                        {metric.current}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span>Target: {metric.target}%</span>
                      </div>
                      <Progress 
                        value={metric.current} 
                        className="h-2"
                        style={{ 
                          backgroundColor: `${metric.color}20`,
                        }}
                      />
                      <div className="text-xs text-gray-500">
                        {metric.current >= metric.target ? "Target achieved!" : `${metric.target - metric.current}% to target`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* City Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  City Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" />
                      <YAxis dataKey="city" type="category" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="deals" fill="#10b981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="users" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-purple-500" />
                  Deal Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <ChartContainer config={{}} className="lg:w-1/2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="space-y-4 lg:w-1/2">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Badge variant="outline">{category.value}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}