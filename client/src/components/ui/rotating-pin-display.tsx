import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Clock, 
  Shield, 
  Copy,
  CheckCircle
} from "lucide-react";

interface RotatingPinDisplayProps {
  dealId: number;
  dealTitle: string;
}

export default function RotatingPinDisplay({ dealId, dealTitle }: RotatingPinDisplayProps) {
  const [showPin, setShowPin] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch current rotating PIN
  const { data: pinData, isLoading, error, refetch } = useQuery({
    queryKey: ['rotatingPin', dealId],
    queryFn: () => apiRequest(`/api/vendors/deals/${dealId}/current-pin`),
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!dealId
  });

  // Calculate time remaining until next rotation
  useEffect(() => {
    if (!pinData?.nextRotationAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const nextRotation = new Date(pinData.nextRotationAt);
      const diff = nextRotation.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Rotating now...");
        refetch(); // Refresh to get new PIN
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [pinData?.nextRotationAt, refetch]);

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
          Current PIN
          <Badge variant="secondary" className="ml-auto">
            Auto-Rotating
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Next rotation in:</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {timeLeft}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Current PIN:</span>
            <div className="font-mono text-lg font-bold">
              {showPin ? pinData?.currentPin : "••••"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPin}
              disabled={!showPin}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Rotates every {pinData?.rotationInterval || 10} minutes
          </div>
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
            <strong>How it works:</strong> This PIN automatically changes every 10 minutes for enhanced security. 
            Share the current PIN with customers when they visit your store to claim their deals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}