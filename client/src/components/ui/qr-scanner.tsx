import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { parseQRCodeData } from "@/lib/qr-code";
import { 
  Scan, 
  Camera, 
  Upload, 
  User, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  X,
  Smartphone
} from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (customerData: any) => void;
  onScanError: (error: string) => void;
  onClose?: () => void;
  className?: string;
}

interface CustomerData {
  userId: number;
  userName: string;
  email: string;
  membershipPlan: string;
  membershipId: string;
  phone?: string;
  totalSavings?: string;
  timestamp: number;
  type: string;
  securityToken: string;
}

export default function QRScanner({ onScanSuccess, onScanError, onClose, className = "" }: QRScannerProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processQRData = async (qrText: string) => {
    setIsProcessing(true);
    
    try {
      const parsedData = parseQRCodeData(qrText);
      
      if (!parsedData) {
        throw new Error('Invalid QR code format');
      }

      // Validate customer QR code
      if (parsedData.type !== 'customer_claim' && parsedData.type !== 'membership_verification') {
        throw new Error('This QR code is not a valid customer membership code');
      }

      // Validate required fields
      if (!parsedData.userId || !parsedData.membershipPlan) {
        throw new Error('QR code is missing required customer information');
      }

      // Check if QR code is not too old (24 hours)
      const qrAge = Date.now() - parsedData.timestamp;
      if (qrAge > 24 * 60 * 60 * 1000) {
        throw new Error('QR code has expired. Please ask customer to generate a new one.');
      }

      setCustomerData(parsedData as CustomerData);
      
      toast({
        title: "Customer Verified",
        description: `${parsedData.userName} - ${parsedData.membershipPlan} member`,
      });

      onScanSuccess(parsedData);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process QR code';
      onScanError(errorMessage);
      
      toast({
        title: "Scan Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onScanError('Please upload an image file');
      return;
    }

    // For demo purposes, we'll simulate QR code reading from uploaded image
    // In production, you'd use a library like jsQR to read QR codes from images
    toast({
      title: "Image Upload",
      description: "QR code scanning from images requires additional setup. Please use manual input or camera.",
      variant: "destructive",
    });
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      onScanError('Please enter QR code data');
      return;
    }
    
    processQRData(manualInput.trim());
  };

  const handleCameraScan = () => {
    // For demo purposes, we'll simulate camera scanning
    // In production, you'd integrate with a camera QR scanning library
    toast({
      title: "Camera Access",
      description: "Camera QR scanning requires additional setup. Please use manual input.",
      variant: "destructive",
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scan Mode Selector */}
      <div className="flex space-x-2">
        <Button
          variant={scanMode === 'camera' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScanMode('camera')}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-2" />
          Camera
        </Button>
        <Button
          variant={scanMode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScanMode('upload')}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <Button
          variant={scanMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScanMode('manual')}
          className="flex-1"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          Manual
        </Button>
      </div>

      {/* Scanner Interface */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Scan className="h-5 w-5 mr-2" />
            Customer QR Scanner
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Scan Mode */}
          {scanMode === 'camera' && (
            <div className="text-center space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Point camera at customer's QR code
                </p>
                <Button onClick={handleCameraScan} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Start Camera Scan'}
                </Button>
              </div>
            </div>
          )}

          {/* Upload Mode */}
          {scanMode === 'upload' && (
            <div className="text-center space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload an image with QR code
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Choose Image'}
                </Button>
              </div>
            </div>
          )}

          {/* Manual Input Mode */}
          {scanMode === 'manual' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-qr">Enter QR Code Data</Label>
                <Input
                  id="manual-qr"
                  placeholder="Paste QR code data here..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleManualSubmit}
                disabled={isProcessing || !manualInput.trim()}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Verify Customer'}
              </Button>
            </div>
          )}

          {/* Customer Data Display */}
          {customerData && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800 dark:text-green-200">
                  Customer Verified
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Name:</span>
                  <p className="text-gray-900 dark:text-gray-100">{customerData.userName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Membership:</span>
                  <Badge variant="secondary" className="capitalize">
                    {customerData.membershipPlan}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Email:</span>
                  <p className="text-gray-900 dark:text-gray-100 text-xs">{customerData.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Total Savings:</span>
                  <p className="text-gray-900 dark:text-gray-100">₹{customerData.totalSavings}</p>
                </div>
                {customerData.phone && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                    <p className="text-gray-900 dark:text-gray-100">{customerData.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>• Ask customer to show their membership QR code from the app</p>
            <p>• QR codes are valid for 24 hours from generation</p>
            <p>• Use manual input if camera is not available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}