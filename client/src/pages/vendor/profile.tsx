import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Save, MapPin, Globe, Phone, Mail, Building, Star, Award } from "lucide-react";
import VendorRegistrationStatus from "@/components/vendor-registration-status";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { indianStates, getCitiesByState } from "@/lib/cities";
import Navbar from "@/components/ui/navbar";

const STORE_TYPES = [
  { value: "electronics", label: "Electronics Store" },
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "food", label: "Food & Beverage" },
  { value: "travel", label: "Travel & Tourism" },
  { value: "home", label: "Home & Furniture" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "entertainment", label: "Entertainment" },
  { value: "services", label: "Services" },
  { value: "automotive", label: "Automotive" },
  { value: "general", label: "General/Multi-Category" },
];

const updateVendorProfileSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  storeType: z.string().optional(),
  specialtyTags: z.array(z.string()).optional(),
});

type UpdateVendorProfile = z.infer<typeof updateVendorProfileSchema>;

export default function VendorProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current vendor data
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['/api/vendors/me'],
  });

  // Fetch user data for additional info
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const form = useForm<UpdateVendorProfile>({
    resolver: zodResolver(updateVendorProfileSchema),
    defaultValues: {
      businessName: "",
      gstNumber: "",
      panNumber: "",
      logoUrl: "",
      description: "",
      address: "",
      city: "",
      state: "",
      latitude: "",
      longitude: "",
      storeType: "",
      specialtyTags: [],
    },
  });

  // Update form defaults when vendor data loads
  useEffect(() => {
    if (vendor) {
      form.reset({
        businessName: (vendor as any).businessName || "",
        gstNumber: (vendor as any).gstNumber || "",
        panNumber: (vendor as any).panNumber || "",
        logoUrl: (vendor as any).logoUrl || "",
        description: (vendor as any).description || "",
        address: (vendor as any).address || "",
        city: (vendor as any).city || "",
        state: (vendor as any).state || "",
        latitude: (vendor as any).latitude || "",
        longitude: (vendor as any).longitude || "",
        storeType: (vendor as any).storeType || "",
        specialtyTags: (vendor as any).specialtyTags || [],
      });
    }
  }, [vendor, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateVendorProfile) => 
      apiRequest('/api/vendors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Profile updated successfully!",
        description: "Your business profile has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateVendorProfile) => {
    // Filter out empty optional fields
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        if (key === 'specialtyTags') {
          return Array.isArray(value) && value.length > 0;
        }
        if (typeof value === 'string') {
          return value && value.trim() !== "";
        }
        return value !== undefined && value !== null;
      })
    );
    updateMutation.mutate(filteredData);
  };

  const selectedState = form.watch("state");
  const availableCities = selectedState ? getCitiesByState(selectedState) : [];

  const isLoading = vendorLoading || userLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VendorRegistrationStatus showTitle={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            Business Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your business information and settings
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge 
            variant={(vendor as any)?.isApproved ? "default" : "secondary"}
            className={`text-sm ${(vendor as any)?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
          >
            {(vendor as any)?.isApproved ? (
              <>
                <Award className="h-4 w-4 mr-1" />
                Approved Business
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-1" />
                Pending Approval
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Stats */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Total Deals</span>
                  <span className="font-bold text-blue-900">{vendor.totalDeals || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Total Redemptions</span>
                  <span className="font-bold text-green-900">{vendor.totalRedemptions || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-yellow-900">
                      {parseFloat(vendor.rating || "0").toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500 mb-2">Account Details:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user?.email}
                    </div>
                    <div className="text-gray-500">
                      Member since: {new Date(vendor.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Update your business details to attract more customers
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Business Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        Business Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Business Name
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter business name" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Logo URL
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/logo.png" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="storeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-store-type">
                                  <SelectValue placeholder="Select what your store sells" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STORE_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your business and what makes it special..."
                                className="min-h-[80px]"
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialtyTags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty Tags (2-3 items your store sells)</FormLabel>
                            <div className="space-y-2">
                              <div className="flex gap-2 mb-3">
                                <Input
                                  placeholder="Add a specialty tag (e.g., Smartphones, Italian Food)"
                                  id="new-specialty"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const input = e.currentTarget;
                                      const value = input.value.trim();
                                      if (value && (field.value || []).length < 3) {
                                        const newTags = [...(field.value || []), value];
                                        field.onChange(newTags);
                                        input.value = '';
                                      }
                                      e.preventDefault();
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.getElementById('new-specialty') as HTMLInputElement;
                                    const value = input.value.trim();
                                    if (value && (field.value || []).length < 3) {
                                      const newTags = [...(field.value || []), value];
                                      field.onChange(newTags);
                                      input.value = '';
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {(field.value || []).map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="px-3 py-1">
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newTags = (field.value || []).filter((_, i) => i !== idx);
                                        field.onChange(newTags);
                                      }}
                                      className="ml-2 hover:text-destructive"
                                    >
                                      ✕
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              {(field.value || []).length === 0 && (
                                <p className="text-xs text-muted-foreground">Add up to 3 specialties (e.g., Laptops, Tablets for electronics store)</p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Legal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        Legal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="gstNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GST Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter GST number (optional)" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="panNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PAN Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter PAN number" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Location
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter complete business address"
                                className="min-h-[60px]"
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue("city", ""); // Reset city when state changes
                                }} 
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {indianStates.map((state) => (
                                    <SelectItem key={state.name} value={state.name}>
                                      {state.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ""}
                                disabled={!selectedState}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      selectedState ? "Select city" : "Select state first"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableCities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 19.0760" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 72.8777" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                      <Button 
                        type="submit" 
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}