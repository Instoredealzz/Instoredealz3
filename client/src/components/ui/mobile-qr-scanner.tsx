import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { parseQRCodeData } from "@/lib/qr-code";
import jsQR from 'jsqr';
import { 
  Scan, 
  Camera, 
  Upload, 
  User, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  X,
  Smartphone,
  RefreshCw,
  Settings,
  Wifi,
  Lock
} from "lucide-react";

interface MobileQRScannerProps {
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

interface ScannerDiagnostics {
  hasUserMedia: boolean;
  isSecureContext: boolean;
  userAgent: string;
  permissions: string;
  cameraDevices: number;
  errorDetails: string;
}

export default function MobileQRScanner({ onScanSuccess, onScanError, onClose, className = "" }: MobileQRScannerProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual' | 'diagnostics'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ScannerDiagnostics | null>(null);
  const [scanningFrequency, setScanningFrequency] = useState(100);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diag: ScannerDiagnostics = {
      hasUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
      permissions: 'unknown',
      cameraDevices: 0,
      errorDetails: ''
    };

    try {
      // Check permissions
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        diag.permissions = permission.state;
      }

      // Enumerate camera devices
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        diag.cameraDevices = cameras.length;
        setCameraDevices(cameras);
        
        // Select back camera by default if available
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear') ||
          camera.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera?.deviceId || cameras[0]?.deviceId || '');
      }
    } catch (error) {
      diag.errorDetails = error instanceof Error ? error.message : 'Unknown error';
    }

    setDiagnostics(diag);
  };

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

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      onScanError('Please enter QR code data');
      return;
    }
    
    processQRData(manualInput.trim());
  };

  const stopCamera = useCallback(() => {
    if (scanningRef.current) {
      clearInterval(scanningRef.current);
      scanningRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      
      if (!diagnostics?.hasUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      if (!diagnostics?.isSecureContext) {
        throw new Error('Camera requires HTTPS connection');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'environment'
        }
      };

      // Use specific camera if selected
      if (selectedCamera) {
        constraints.video = {
          ...constraints.video,
          deviceId: { exact: selectedCamera }
        };
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (backCameraError) {
        console.log('Specific camera failed, trying any camera:', backCameraError);
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 }
          }
        });
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          video.onloadedmetadata = () => {
            video.play()
              .then(() => {
                setIsCameraActive(true);
                resolve();
              })
              .catch(reject);
          };
          video.onerror = reject;
        });
        
        toast({
          title: "Camera Started",
          description: "Point your camera at the QR code to scan it.",
        });

        // Start scanning with more aggressive frequency
        startScanning();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Camera access failed';
      
      toast({
        title: "Camera Access Failed",
        description: `${errorMsg}. Try manual input or check camera permissions.`,
        variant: "destructive",
      });
    }
  };

  const startScanning = () => {
    if (scanningRef.current) {
      clearInterval(scanningRef.current);
    }

    scanningRef.current = setInterval(() => {
      if (!isCameraActive || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width === 0 || canvas.height === 0) {
          return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (qrCode) {
          console.log('QR Code detected:', qrCode.data);
          stopCamera();
          processQRData(qrCode.data);
        }
      } catch (error) {
        console.error('Error during QR scanning:', error);
      }
    }, scanningFrequency);
  };

  const handleCameraScan = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onScanError('Please upload an image file');
      return;
    }

    toast({
      title: "Image Upload",
      description: "QR code scanning from images requires additional setup. Please use manual input or camera.",
      variant: "destructive",
    });
  };

  // Cleanup camera when component unmounts or mode changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (scanMode !== 'camera') {
      stopCamera();
    }
  }, [scanMode, stopCamera]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scan Mode Selector */}
      <div className="grid grid-cols-4 gap-1">
        <Button
          variant={scanMode === 'camera' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScanMode('camera')}
          className="text-xs"
        >
          <Camera className="h-3 w-3 mr-1" />
          Camera
        </Button>
        <Button
          variant={scanMode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScanMode('upload')}
          className="text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          Upload
        </Button>
        <Button
          variant={scanMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScanMode('manual')}
          className="text-xs"
        >
          <Smartphone className="h-3 w-3 mr-1" />
          Manual
        </Button>
        <Button
          variant={scanMode === 'diagnostics' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScanMode('diagnostics')}
          className="text-xs"
        >
          <Settings className="h-3 w-3 mr-1" />
          Debug
        </Button>
      </div>

      {/* Scanner Interface */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">
              <Scan className="h-5 w-5 mr-2" />
              Mobile QR Scanner
            </span>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Scan Mode */}
          {scanMode === 'camera' && (
            <div className="space-y-4">
              {/* Camera Selection */}
              {cameraDevices.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-sm">Select Camera</Label>
                  <select 
                    value={selectedCamera} 
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {cameraDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Camera Interface */}
              <div className="text-center space-y-4">
                {isCameraActive ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full max-w-md mx-auto rounded-lg border-2 border-green-400"
                      autoPlay
                      muted
                      playsInline
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                      Scanning every {scanningFrequency}ms
                    </div>
                    <div className="flex gap-2 mt-4 justify-center">
                      <Button 
                        onClick={handleCameraScan} 
                        variant="destructive"
                        size="sm"
                      >
                        Stop Camera
                      </Button>
                      <Button 
                        onClick={() => setScanningFrequency(prev => prev === 100 ? 500 : 100)} 
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        {scanningFrequency === 100 ? 'Slow' : 'Fast'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Point camera at customer's QR code
                    </p>
                    {diagnostics && !diagnostics.isSecureContext && (
                      <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <Lock className="h-4 w-4 inline mr-1" />
                        HTTPS required for camera access
                      </div>
                    )}
                    <Button onClick={handleCameraScan} disabled={isProcessing}>
                      {isProcessing ? 'Starting...' : 'Start Camera Scan'}
                    </Button>
                  </div>
                )}
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
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleManualSubmit}
                  disabled={isProcessing || !manualInput.trim()}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Verify Customer'}
                </Button>
                <Button 
                  onClick={() => {
                    const testData = JSON.stringify({
                      userId: 4,
                      userName: "Test Customer",
                      email: "demo@demo.com",
                      membershipPlan: "premium",
                      membershipId: "ISD-00000004",
                      timestamp: Date.now(),
                      type: "customer_claim",
                      version: "2.0",
                      securityToken: "test123"
                    });
                    setManualInput(testData);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Test
                </Button>
              </div>
            </div>
          )}

          {/* Diagnostics Mode */}
          {scanMode === 'diagnostics' && diagnostics && (
            <div className="space-y-4">
              <div className="text-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span>Camera Support:</span>
                  <Badge variant={diagnostics.hasUserMedia ? "default" : "destructive"}>
                    {diagnostics.hasUserMedia ? "✓ Supported" : "✗ Not Supported"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>HTTPS Connection:</span>
                  <Badge variant={diagnostics.isSecureContext ? "default" : "destructive"}>
                    {diagnostics.isSecureContext ? "✓ Secure" : "✗ Insecure"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Camera Permission:</span>
                  <Badge variant={diagnostics.permissions === 'granted' ? "default" : "secondary"}>
                    {diagnostics.permissions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Camera Devices:</span>
                  <Badge variant="secondary">
                    {diagnostics.cameraDevices} found
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 break-all">
                  <div>User Agent: {diagnostics.userAgent.slice(0, 100)}...</div>
                  {diagnostics.errorDetails && (
                    <div className="text-red-600 mt-2">Error: {diagnostics.errorDetails}</div>
                  )}
                </div>
              </div>
              <Button onClick={runDiagnostics} size="sm" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Diagnostics
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
            <p>• For mobile scanning, use HTTPS connection</p>
            <p>• Allow camera access when prompted</p>
            <p>• Use "Debug" tab to check camera support</p>
            <p>• QR codes are valid for 24 hours</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}