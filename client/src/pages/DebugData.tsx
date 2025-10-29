import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugData() {
  const { data: deals } = useQuery({ queryKey: ['/api/deals'] });
  const { data: vendors } = useQuery({ queryKey: ['/api/vendors'] });
  const { data: users } = useQuery({ queryKey: ['/api/users'] });

  // Group deals by vendor ID
  const dealsByVendor = deals?.reduce((acc: any, deal: any) => {
    if (!acc[deal.vendorId]) {
      acc[deal.vendorId] = [];
    }
    acc[deal.vendorId].push(deal);
    return acc;
  }, {});

  // Map vendor IDs to user IDs
  const vendorUserMap = vendors?.reduce((acc: any, vendor: any) => {
    acc[vendor.id] = {
      userId: vendor.userId,
      businessName: vendor.businessName
    };
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Database Relationship Debug</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Vendor Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users?.filter((u: any) => u.role === 'vendor').map((user: any) => (
              <div key={user.id} className="p-3 border rounded">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendors (Business Profiles)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vendors?.map((vendor: any) => (
              <div key={vendor.id} className="p-3 border rounded">
                <p><strong>Vendor ID:</strong> {vendor.id}</p>
                <p><strong>User ID:</strong> {vendor.userId}</p>
                <p><strong>Business Name:</strong> {vendor.businessName}</p>
                <p><strong>Approved:</strong> {vendor.isApproved ? 'Yes' : 'No'}</p>
                <p><strong>Total Deals:</strong> {vendor.totalDeals}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deals by Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dealsByVendor && Object.entries(dealsByVendor).map(([vendorId, deals]: any) => {
              const vendorInfo = vendorUserMap?.[vendorId];
              return (
                <div key={vendorId} className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-bold text-lg mb-2">
                    Vendor ID: {vendorId} 
                    {vendorInfo && ` - ${vendorInfo.businessName} (User ID: ${vendorInfo.userId})`}
                  </h3>
                  <div className="ml-4 space-y-2">
                    {deals.map((deal: any) => (
                      <div key={deal.id} className="p-2 border rounded bg-white dark:bg-gray-900">
                        <p><strong>Deal ID:</strong> {deal.id}</p>
                        <p><strong>Title:</strong> {deal.title}</p>
                        <p><strong>Vendor ID:</strong> {deal.vendorId}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Total Users with Vendor Role:</strong> {users?.filter((u: any) => u.role === 'vendor').length || 0}</p>
            <p><strong>Total Vendor Profiles:</strong> {vendors?.length || 0}</p>
            <p><strong>Total Deals:</strong> {deals?.length || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Note: A user with role 'vendor' needs to complete vendor registration to create a vendor profile. 
              Only then can they create deals linked to their vendor ID.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
