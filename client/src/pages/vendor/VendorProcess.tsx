import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Target,
  Award,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  IdCard,
  Camera,
  Upload,
  Eye,
  Edit,
  BarChart3,
  PlusCircle,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import Navbar from '@/components/ui/navbar';

interface VendorProcessStage {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  icon: React.ComponentType<any>;
  estimatedTime: string;
  requirements: string[];
  actions: { label: string; path: string; type: 'primary' | 'secondary' }[];
}

interface VendorMetrics {
  totalDeals: number;
  activeDeals: number;
  pendingDeals: number;
  totalViews: number;
  totalClaims: number;
  revenue: number;
  rating: number;
  completionRate: number;
}

const VendorProcess = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch vendor data
  const { data: vendor } = useQuery({
    queryKey: ['/api/vendors/me'],
    enabled: isAuthenticated && user?.role === 'vendor',
  });

  // Fetch vendor deals
  const { data: deals = [] } = useQuery({
    queryKey: ['/api/vendors/deals'],
    enabled: isAuthenticated && user?.role === 'vendor',
  });

  // Calculate vendor process stages based on current status
  const getVendorStages = (): VendorProcessStage[] => {
    const isRegistered = !!vendor;
    const isApproved = vendor?.isApproved;
    const hasDeals = deals.length > 0;
    const hasApprovedDeals = deals.some((deal: any) => deal.isApproved);

    return [
      {
        id: 'registration',
        title: 'Business Registration',
        description: 'Complete your vendor registration with business details',
        status: isRegistered ? 'completed' : 'pending',
        icon: Building,
        estimatedTime: '10-15 minutes',
        requirements: [
          'Valid business name and contact information',
          'PAN card for business verification',
          'GST number (if applicable)',
          'Business address and location'
        ],
        actions: isRegistered 
          ? [{ label: 'View Profile', path: '/vendor/profile', type: 'secondary' }]
          : [{ label: 'Register Now', path: '/vendor/register', type: 'primary' }]
      },
      {
        id: 'verification',
        title: 'Account Verification',
        description: 'Admin review and approval of your business credentials',
        status: !isRegistered ? 'blocked' : isApproved ? 'completed' : 'in_progress',
        icon: UserCheck,
        estimatedTime: '1-3 business days',
        requirements: [
          'Complete business registration',
          'Valid PAN card verification',
          'Business authenticity check',
          'Admin approval process'
        ],
        actions: isApproved 
          ? [{ label: 'Verified', path: '', type: 'secondary' }]
          : [{ label: 'Contact Support', path: '/help', type: 'secondary' }]
      },
      {
        id: 'profile',
        title: 'Profile Optimization',
        description: 'Enhance your business profile for better customer attraction',
        status: !isApproved ? 'blocked' : 'in_progress',
        icon: Star,
        estimatedTime: '15-20 minutes',
        requirements: [
          'Business logo and photos',
          'Detailed business description',
          'Operating hours and contact details',
          'Social media and website links'
        ],
        actions: [
          { label: 'Edit Profile', path: '/vendor/profile', type: 'primary' },
          { label: 'Upload Photos', path: '/vendor/gallery', type: 'secondary' }
        ]
      },
      {
        id: 'deals',
        title: 'Deal Creation',
        description: 'Create your first deals to attract customers',
        status: !isApproved ? 'blocked' : hasDeals ? 'completed' : 'pending',
        icon: Package,
        estimatedTime: '5-10 minutes per deal',
        requirements: [
          'Approved vendor account',
          'Deal details and descriptions',
          'Pricing and discount information',
          'Validity period and terms'
        ],
        actions: [
          { label: 'Create Deal', path: '/vendor/deals/create', type: 'primary' },
          { label: 'Manage Deals', path: '/vendor/deals', type: 'secondary' }
        ]
      },
      {
        id: 'optimization',
        title: 'Performance Optimization',
        description: 'Monitor and optimize your deal performance',
        status: !hasApprovedDeals ? 'blocked' : 'in_progress',
        icon: TrendingUp,
        estimatedTime: 'Ongoing',
        requirements: [
          'Active approved deals',
          'Customer engagement monitoring',
          'Performance analytics review',
          'Regular deal updates'
        ],
        actions: [
          { label: 'View Analytics', path: '/vendor/analytics', type: 'primary' },
          { label: 'POS System', path: '/vendor/pos', type: 'secondary' }
        ]
      }
    ];
  };

  const vendorStages = getVendorStages();
  const completedStages = vendorStages.filter(stage => stage.status === 'completed').length;
  const progressPercentage = (completedStages / vendorStages.length) * 100;

  // Calculate vendor metrics
  const vendorMetrics: VendorMetrics = {
    totalDeals: deals.length,
    activeDeals: deals.filter((deal: any) => deal.isActive && deal.isApproved).length,
    pendingDeals: deals.filter((deal: any) => !deal.isApproved).length,
    totalViews: deals.reduce((sum: number, deal: any) => sum + (deal.viewCount || 0), 0),
    totalClaims: deals.reduce((sum: number, deal: any) => sum + (deal.currentRedemptions || 0), 0),
    revenue: deals.reduce((sum: number, deal: any) => sum + ((deal.currentRedemptions || 0) * parseFloat(deal.originalPrice || '0')), 0),
    rating: vendor?.rating || 0,
    completionRate: progressPercentage
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      in_progress: { label: 'In Progress', variant: 'default' as const, icon: AlertCircle },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      blocked: { label: 'Blocked', variant: 'destructive' as const, icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Vendor Process</h1>
              <p className="text-muted-foreground mt-1">
                Complete guide to becoming a successful vendor on Instoredealz
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{completedStages}/{vendorStages.length}</div>
              <div className="text-sm text-muted-foreground">Stages Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stages">Process Stages</TabsTrigger>
            <TabsTrigger value="metrics">Performance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Deals</p>
                      <p className="text-2xl font-bold text-foreground">{vendorMetrics.totalDeals}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Active Deals</p>
                      <p className="text-2xl font-bold text-foreground">{vendorMetrics.activeDeals}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Views</p>
                      <p className="text-2xl font-bold text-foreground">{vendorMetrics.totalViews}</p>
                    </div>
                    <Eye className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Completion</p>
                      <p className="text-2xl font-bold text-foreground">{Math.round(progressPercentage)}%</p>
                    </div>
                    <Award className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorStages
                    .filter(stage => stage.status === 'pending' || stage.status === 'in_progress')
                    .slice(0, 3)
                    .map((stage) => {
                      const Icon = stage.icon;
                      return (
                        <div key={stage.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium text-foreground">{stage.title}</h4>
                              <p className="text-sm text-muted-foreground">{stage.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(stage.status)}
                            {stage.actions.length > 0 && stage.actions[0].path && (
                              <Button asChild size="sm">
                                <Link to={stage.actions[0].path}>
                                  {stage.actions[0].label}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Stages Tab */}
          <TabsContent value="stages" className="space-y-6">
            <div className="space-y-6">
              {vendorStages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <Card key={stage.id} className={`${stage.status === 'completed' ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            stage.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                            stage.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                            stage.status === 'blocked' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{stage.title}</CardTitle>
                            <p className="text-muted-foreground">{stage.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(stage.status)}
                          <Badge variant="outline">{stage.estimatedTime}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-foreground">Requirements:</h4>
                          <ul className="space-y-2">
                            {stage.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-center text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3 text-foreground">Actions:</h4>
                          <div className="space-y-2">
                            {stage.actions.map((action, idx) => (
                              action.path ? (
                                <Button
                                  key={idx}
                                  asChild
                                  variant={action.type === 'primary' ? 'default' : 'outline'}
                                  size="sm"
                                  className="w-full"
                                >
                                  <Link to={action.path}>{action.label}</Link>
                                </Button>
                              ) : (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  disabled
                                >
                                  {action.label}
                                </Button>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Deal Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Deals:</span>
                    <span className="font-medium">{vendorMetrics.totalDeals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Deals:</span>
                    <span className="font-medium text-green-600">{vendorMetrics.activeDeals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Approval:</span>
                    <span className="font-medium text-amber-600">{vendorMetrics.pendingDeals}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Customer Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Views:</span>
                    <span className="font-medium">{vendorMetrics.totalViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Claims:</span>
                    <span className="font-medium">{vendorMetrics.totalClaims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversion Rate:</span>
                    <span className="font-medium">
                      {vendorMetrics.totalViews > 0 ? 
                        Math.round((vendorMetrics.totalClaims / vendorMetrics.totalViews) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                    Revenue & Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Revenue:</span>
                    <span className="font-medium">₹{vendorMetrics.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendor Rating:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {vendorMetrics.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile Completion:</span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Performance analytics coming soon</p>
                    <Button asChild size="sm" className="mt-2">
                      <Link to="/vendor/analytics">View Detailed Analytics</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    Getting Started Guides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/help">
                      <FileText className="h-4 w-4 mr-2" />
                      Vendor Registration Guide
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/help">
                      <Package className="h-4 w-4 mr-2" />
                      Creating Your First Deal
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/help">
                      <Shield className="h-4 w-4 mr-2" />
                      PIN Verification System
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/help">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Understanding Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-500" />
                    Vendor Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/vendor/deals">
                      <Package className="h-4 w-4 mr-2" />
                      Manage Deals
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/vendor/pos">
                      <Store className="h-4 w-4 mr-2" />
                      POS System
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/vendor/analytics">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/vendor/profile">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-purple-500" />
                    Support & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Email Support</h4>
                      <p className="text-sm text-muted-foreground">vendor@instoredealz.com</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Phone className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">+91 9999 888 777</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <HelpCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Help Center</h4>
                      <Button asChild size="sm">
                        <Link to="/help">Visit Help Center</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorProcess;