import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Clock, 
  Shield, 
  Copy,
  CheckCircle,
  Users
} from "lucide-react";

interface RotatingPinDisplayProps {
  dealId: number;
  dealTitle: string;
  dealImage?: string;
  dealDescription?: string;
}

export default function RotatingPinDisplay({ dealId, dealTitle, dealImage, dealDescription }: RotatingPinDisplayProps) {
  const [showPin, setShowPin] = useState(true); // Show PIN by default for vendors
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progressValue, setProgressValue] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch current rotating PIN
  const { data: pinData, isLoading, error, refetch } = useQuery({
    queryKey: ['rotatingPin', dealId],
    queryFn: async () => {
      const response = await apiRequest(`/api/vendors/deals/${dealId}/current-pin`, 'GET');
      const data = await response.json();
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !!dealId
  });

  // Calculate time remaining until next rotation
  useEffect(() => {
    if (!pinData?.nextRotationAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const nextRotation = new Date(pinData.nextRotationAt);
      const diff = nextRotation.getTime() - now.getTime();
      const totalInterval = (pinData?.rotationInterval || 30) * 60 * 1000; // Total interval in ms

      if (diff <= 0) {
        setTimeLeft("Rotating now...");
        setProgressValue(100);
        refetch(); // Refresh to get new PIN
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
      
      // Calculate progress (0-100, where 100 means time is up)
      const elapsed = totalInterval - diff;
      const progress = Math.max(0, Math.min(100, (elapsed / totalInterval) * 100));
      setProgressValue(progress);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [pinData?.nextRotationAt, pinData?.rotationInterval, refetch]);

  const handleCopyPin = async () => {
    if (!pinData?.currentPin) return;

    try {
      await navigator.clipboard.writeText(pinData.currentPin);
      setCopied(true);
      toast({
        title: "PIN Copied!",
        description: "The current PIN has been copied to your clipboard.",
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy PIN to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "PIN information has been updated.",
      duration: 2000
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current PIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading current PIN...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current PIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load PIN information</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Deal Information
          <Badge variant="secondary" className="ml-auto">
            Static Codes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deal Information Section */}
        {(dealImage || dealDescription) && (
          <div className="flex items-start gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            {dealImage && (
              <div className="flex-shrink-0">
                <img 
                  src={dealImage} 
                  alt={dealTitle}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 truncate">
                {dealTitle}
              </h4>
              {dealDescription && (
                <p className="text-xs text-blue-700 dark:text-blue-200 mt-1 line-clamp-2">
                  {dealDescription}
                </p>
              )}
            </div>
          </div>
        )}
        {/* Deal Claims Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">Active Claims</span>
            </div>
            
            <div className="font-mono text-5xl font-bold text-blue-700 dark:text-blue-300 mb-3">
              {pinData?.activeClaims || 0}
            </div>
            
            <div className="text-sm text-blue-600 dark:text-blue-400">
              {pinData?.activeClaims === 1 ? 'customer has' : 'customers have'} claimed this deal
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Unique Codes:</strong> Each customer receives a unique 6-character claim code when they claim your deal
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Easy Verification:</strong> Customers show you their code at checkout. Enter it in your POS system to verify
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">
                <strong>No Confusion:</strong> Static codes eliminate timing issues and code mismatches
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How it works:</strong> When customers claim this deal, they receive a unique claim code. 
            Ask them to show you the code, then enter it in your POS verification system to complete the transaction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}