import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, Send, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { majorCities } from "@/lib/cities";

interface WhatsAppCampaign {
  id: number;
  campaignName: string;
  messageContent: string;
  targetAudience: string;
  targetCity?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
}

export default function WhatsAppCampaigns() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: "",
    messageContent: "",
    targetAudience: "all_customers",
    targetCity: "",
  });

  const { data: whatsappStatus } = useQuery<{ enabled: boolean; configured: boolean }>({
    queryKey: ['/api/admin/whatsapp/status'],
  });

  const { data: campaigns, isLoading } = useQuery<WhatsAppCampaign[]>({
    queryKey: ['/api/admin/whatsapp/campaigns'],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin/whatsapp/campaigns', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Campaign created!",
        description: "Your WhatsApp campaign has been created successfully.",
      });
      setShowCreateForm(false);
      setFormData({
        campaignName: "",
        messageContent: "",
        targetAudience: "all_customers",
        targetCity: "",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/whatsapp/campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      return apiRequest(`/api/admin/whatsapp/campaigns/${campaignId}/send`, 'POST');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Campaign sending started!",
        description: `Sending messages to ${data.totalRecipients} customers.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/whatsapp/campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send campaign",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!formData.campaignName || !formData.messageContent) {
      toast({
        title: "Missing fields",
        description: "Please fill in campaign name and message content",
        variant: "destructive",
      });
      return;
    }
    createCampaignMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" data-testid="badge-draft"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'sending':
        return <Badge variant="default" data-testid="badge-sending"><Send className="h-3 w-3 mr-1" />Sending</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500" data-testid="badge-completed"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive" data-testid="badge-failed"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-unknown">{status}</Badge>;
    }
  };

  if (!whatsappStatus?.configured) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card data-testid="card-not-configured">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              WhatsApp Service Not Configured
            </CardTitle>
            <CardDescription>
              WhatsApp messaging is not set up yet. To enable WhatsApp Business messaging, please add the following environment variables:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-muted p-4 rounded-md">
              <p className="font-mono text-sm">TWILIO_ACCOUNT_SID</p>
              <p className="font-mono text-sm">TWILIO_AUTH_TOKEN</p>
              <p className="font-mono text-sm">TWILIO_WHATSAPP_NUMBER</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Get these credentials from your Twilio account at{" "}
              <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                twilio.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Marketing Campaigns</h1>
          <p className="text-muted-foreground">Send promotional messages to your customers via WhatsApp</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} data-testid="button-create-campaign">
          <MessageSquare className="h-4 w-4 mr-2" />
          {showCreateForm ? "Cancel" : "Create Campaign"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6" data-testid="card-create-form">
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
            <CardDescription>Design and schedule a WhatsApp marketing campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                placeholder="e.g., Summer Sale 2025"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                data-testid="input-campaign-name"
              />
            </div>

            <div>
              <Label htmlFor="messageContent">Message Content</Label>
              <Textarea
                id="messageContent"
                placeholder="Enter your message here. Use {name} to personalize with customer name."
                value={formData.messageContent}
                onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })}
                rows={4}
                data-testid="textarea-message"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Use {"{name}"} to automatically insert the customer's name
              </p>
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select
                value={formData.targetAudience}
                onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
              >
                <SelectTrigger id="targetAudience" data-testid="select-target-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_customers">All Customers</SelectItem>
                  <SelectItem value="premium_only">Premium Members Only</SelectItem>
                  <SelectItem value="by_city">By City</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.targetAudience === "by_city" && (
              <div>
                <Label htmlFor="targetCity">Target City</Label>
                <Select
                  value={formData.targetCity}
                  onValueChange={(value) => setFormData({ ...formData, targetCity: value })}
                >
                  <SelectTrigger id="targetCity" data-testid="select-city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {majorCities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleCreateCampaign}
              disabled={createCampaignMutation.isPending}
              className="w-full"
              data-testid="button-save-campaign"
            >
              {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading campaigns...</p>
            </CardContent>
          </Card>
        ) : campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{campaign.campaignName}</CardTitle>
                    <CardDescription className="mt-2">
                      {campaign.messageContent.length > 100
                        ? `${campaign.messageContent.substring(0, 100)}...`
                        : campaign.messageContent}
                    </CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-medium capitalize">{campaign.targetAudience.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recipients</p>
                    <p className="font-medium">{campaign.totalRecipients || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="font-medium">{campaign.sentCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="font-medium text-green-600">{campaign.deliveredCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="font-medium text-red-600">{campaign.failedCount || 0}</p>
                  </div>
                </div>
                {campaign.status === 'draft' && (
                  <Button
                    onClick={() => sendCampaignMutation.mutate(campaign.id)}
                    disabled={sendCampaignMutation.isPending}
                    data-testid={`button-send-${campaign.id}`}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendCampaignMutation.isPending ? "Sending..." : "Send Campaign"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card data-testid="card-no-campaigns">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No campaigns yet. Create your first WhatsApp marketing campaign to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
