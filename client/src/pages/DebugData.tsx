import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, KeyIcon, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Deal {
  id: number;
  vendorId: number;
  title: string;
  verificationPin: string;
  isActive: boolean;
  isApproved: boolean;
  discountPercentage: number;
  category: string;
}

interface Vendor {
  id: number;
  userId: number;
  businessName: string;
  isApproved: boolean;
  totalDeals: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  membershipPlan?: string;
}

export default function DebugData() {
  const { data: deals } = useQuery<Deal[]>({ queryKey: ['/api/deals'] });
  const { data: vendors } = useQuery<Vendor[]>({ queryKey: ['/api/vendors'] });
  const { data: users } = useQuery<User[]>({ queryKey: ['/api/users'] });

  // Group deals by vendor ID
  const dealsByVendor = deals?.reduce((acc: any, deal: Deal) => {
    if (!acc[deal.vendorId]) {
      acc[deal.vendorId] = [];
    }
    acc[deal.vendorId].push(deal);
    return acc;
  }, {});

  // Map vendor IDs to user IDs
  const vendorUserMap = vendors?.reduce((acc: any, vendor: Vendor) => {
    acc[vendor.id] = {
      userId: vendor.userId,
      businessName: vendor.businessName,
      isApproved: vendor.isApproved
    };
    return acc;
  }, {});

  const customerUsers = users?.filter(u => u.role === 'customer') || [];
  const vendorUsers = users?.filter(u => u.role === 'vendor') || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Testing Helper - Deal Verification PINs</h1>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Testing Guide</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p>To test the deal claim and verification process:</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Login as a <strong>customer</strong> account (see below)</li>
            <li>Browse and claim a deal</li>
            <li>Use the <strong>verification PIN</strong> shown below for that deal</li>
            <li>Login as the corresponding <strong>vendor</strong> to verify the claim</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-amber-500 dark:border-amber-700">
        <CardHeader className="bg-amber-50 dark:bg-amber-950">
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Deals with Verification PINs (For Testing)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {dealsByVendor && Object.entries(dealsByVendor).map(([vendorId, vendorDeals]: any) => {
              const vendorInfo = vendorUserMap?.[vendorId];
              const vendorUser = vendorUsers.find(u => u.id === vendorInfo?.userId);
              
              return (
                <div key={vendorId} className="p-4 border-2 rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">
                      {vendorInfo?.businessName || `Vendor ${vendorId}`}
                    </h3>
                    {vendorInfo?.isApproved ? (
                      <Badge className="bg-green-500">Approved</Badge>
                    ) : (
                      <Badge className="bg-yellow-500">Pending</Badge>
                    )}
                  </div>
                  
                  {vendorUser && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 p-2 bg-white dark:bg-gray-900 rounded">
                      <p><strong>Vendor Login:</strong> {vendorUser.email}</p>
                      <p><strong>User ID:</strong> {vendorUser.id} | <strong>Vendor ID:</strong> {vendorId}</p>
                    </div>
                  )}
                  
                  <div className="ml-4 space-y-3">
                    {vendorDeals.map((deal: Deal) => (
                      <div 
                        key={deal.id} 
                        className="p-4 border-2 rounded-lg bg-white dark:bg-gray-950"
                        data-testid={`deal-debug-${deal.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{deal.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Deal ID: {deal.id} • {deal.discountPercentage}% off • {deal.category}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {deal.isActive ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-500">Inactive</Badge>
                            )}
                            {deal.isApproved ? (
                              <Badge className="bg-blue-500">Approved</Badge>
                            ) : (
                              <Badge className="bg-yellow-500">Pending</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 dark:border-amber-600 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <KeyIcon className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            <span className="font-semibold text-amber-900 dark:text-amber-200">
                              Verification PIN:
                            </span>
                          </div>
                          <p 
                            className="text-2xl font-mono font-bold text-amber-900 dark:text-amber-100 tracking-wider"
                            data-testid={`pin-${deal.id}`}
                          >
                            {deal.verificationPin}
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                            Use this PIN when claiming this deal as a customer
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {(!dealsByVendor || Object.keys(dealsByVendor).length === 0) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No deals found</AlertTitle>
                <AlertDescription>
                  There are currently no deals in the system. Log in as a vendor to create deals.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Accounts for Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Customer</span>
                Customer Accounts
              </h3>
              <div className="space-y-2">
                {customerUsers.length > 0 ? (
                  customerUsers.map((user) => (
                    <div key={user.id} className="p-3 border rounded bg-blue-50 dark:bg-blue-950">
                      <p className="font-mono text-sm">{user.email}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {user.name} • {user.membershipPlan || 'basic'} plan
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No customer accounts found</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm">Vendor</span>
                Vendor Accounts
              </h3>
              <div className="space-y-2">
                {vendorUsers.length > 0 ? (
                  vendorUsers.map((user) => {
                    const vendor = vendors?.find(v => v.userId === user.id);
                    return (
                      <div key={user.id} className="p-3 border rounded bg-purple-50 dark:bg-purple-950">
                        <p className="font-mono text-sm">{user.email}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.name}
                          {vendor && ` • ${vendor.businessName}`}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No vendor accounts found</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
              <p className="text-2xl font-bold">{customerUsers.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customers</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded">
              <p className="text-2xl font-bold">{vendorUsers.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vendor Users</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
              <p className="text-2xl font-bold">{vendors?.length || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vendor Profiles</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded">
              <p className="text-2xl font-bold">{deals?.length || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Deals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
