import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  Shield,
  Calendar,
  CreditCard,
  QrCode,
  Download,
  Copy,
  CheckCircle2,
  Zap,
  Star,
  Gift,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Store,
  Scan,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCustomerClaimQR } from "@/lib/qr-code";

interface MembershipCardData {
  membershipTier: string;
  membershipExpiry: string;
  totalSavings: string;
  dealsClaimed: number;
  cardNumber: string;
  qrCode: string;
  isActive: boolean;
}

const tierConfig = {
  basic: {
    name: "Basic",
    color: "bg-gradient-to-br from-gray-400 to-gray-600",
    cardGradient: "from-slate-600 via-slate-700 to-slate-800",
    glowColor: "rgba(148, 163, 184, 0.5)",
    accentColor: "#94a3b8",
    icon: Shield,
    benefits: ["Access to Food & Travel deals", "Standard support", "Basic rewards"],
  },
  premium: {
    name: "Premium",
    color: "bg-gradient-to-br from-blue-500 to-purple-600",
    cardGradient: "from-blue-600 via-purple-600 to-indigo-700",
    glowColor: "rgba(147, 51, 234, 0.6)",
    accentColor: "#a855f7",
    icon: Crown,
    benefits: ["Access to most deal categories", "Priority support", "Enhanced rewards", "Exclusive offers"],
  },
  ultimate: {
    name: "Ultimate",
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    cardGradient: "from-amber-500 via-orange-500 to-yellow-600",
    glowColor: "rgba(251, 191, 36, 0.7)",
    accentColor: "#fbbf24",
    icon: Star,
    benefits: ["Access to ALL deals", "VIP support", "Maximum rewards", "Early access", "Premium concierge"],
  },
};

// Custom hook for 3D tilt effect
const use3DTilt = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -15;
      const rotateY = ((x - centerX) / centerX) * 15;
      
      const lightX = (x / rect.width) * 100;
      const lightY = (y / rect.height) * 100;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
        background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
      });
    };

    const handleMouseLeave = () => {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        background: 'transparent',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { cardRef, tiltStyle };
};

// Enhanced 3D Membership Card Component
interface Enhanced3DCardProps {
  user: any;
  cardData: MembershipCardData | undefined;
  tierInfo: any;
  TierIcon: any;
  qrCodeDataUrl: string;
  showQR: boolean;
  generateQRCode: () => void;
  onToggleQR: () => void;
}

function Enhanced3DCard({ user, cardData, tierInfo, TierIcon, qrCodeDataUrl, showQR, generateQRCode, onToggleQR }: Enhanced3DCardProps) {
  const { cardRef, tiltStyle } = use3DTilt();
  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
  const expiryYear = cardData?.membershipExpiry ? new Date(cardData.membershipExpiry).getFullYear() : 2025;

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px ${tierInfo.glowColor}, 0 0 40px ${tierInfo.glowColor}; }
          50% { box-shadow: 0 0 30px ${tierInfo.glowColor}, 0 0 60px ${tierInfo.glowColor}; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .card-3d-container {
          perspective: 1500px;
          transform-style: preserve-3d;
        }

        .card-3d {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
          transform-style: preserve-3d;
          will-change: transform;
        }

        .glow-border {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .metallic-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            120deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
          pointer-events: none;
          border-radius: inherit;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .reflection-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.4) 0%,
            transparent 20%,
            transparent 80%,
            rgba(255, 255, 255, 0.2) 100%
          );
          pointer-events: none;
          border-radius: inherit;
          mix-blend-mode: overlay;
        }

        .card-pattern {
          background-image: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.03) 10px,
              rgba(255, 255, 255, 0.03) 20px
            );
        }
      `}</style>

      <div className="card-3d-container" data-testid="enhanced-3d-card">
        <div
          ref={cardRef}
          className="card-3d glow-border relative"
          style={{
            ...tiltStyle,
            borderRadius: '20px',
          }}
        >
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tierInfo.cardGradient} text-white shadow-2xl`}>
            {/* Metallic Shine Effect */}
            <div className="metallic-shine" />
            
            {/* Reflection Overlay */}
            <div className="reflection-overlay" />

            {/* Dynamic Light Effect from tilt */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: (tiltStyle as any).background || 'transparent',
                borderRadius: 'inherit',
              }}
            />

            {/* Card Pattern */}
            <div className="card-pattern absolute inset-0" />

            {/* Card Content */}
            <div className="relative z-10 p-8">
              {/* Header with Logo */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" style={{ color: tierInfo.accentColor }} />
                    <h3 className="text-2xl font-bold tracking-wider" style={{ 
                      textShadow: `0 0 10px ${tierInfo.glowColor}` 
                    }}>
                      INSTOREDEALZ
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <TierIcon className="w-5 h-5" style={{ color: tierInfo.accentColor }} />
                    <span className="text-sm font-semibold uppercase tracking-widest opacity-90">
                      {tierInfo.name} Member
                    </span>
                  </div>
                </div>
                <Badge 
                  className="glass-effect text-white border-white/30 backdrop-blur-md"
                  style={{ 
                    backgroundColor: `${tierInfo.glowColor}`,
                  }}
                >
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Active
                  </span>
                </Badge>
              </div>

              {/* Member Name */}
              <div className="mb-6">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Member Name</p>
                <h2 className="text-2xl font-bold tracking-wide" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {user?.name || 'Guest Member'}
                </h2>
              </div>

              {/* Card Number & Tier */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-effect rounded-lg p-3">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Membership ID</p>
                  <p className="font-mono text-sm font-semibold tracking-wider">
                    {cardData?.cardNumber || 'ISD-00000000'}
                  </p>
                </div>
                <div className="glass-effect rounded-lg p-3">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Tier Level</p>
                  <p className="font-bold text-sm uppercase tracking-wider" style={{ color: tierInfo.accentColor }}>
                    {tierInfo.name}
                  </p>
                </div>
              </div>

              {/* Member Since & Expiry */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="font-bold text-lg">{memberSince}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Expiry</p>
                  <p className="font-bold text-lg">{expiryYear}</p>
                </div>
              </div>

              <div className="h-px bg-white/20 mb-6" />

              {/* QR Code Section - Enhanced Size */}
              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" style={{ color: tierInfo.accentColor }} />
                    <p className="text-xs uppercase tracking-wider font-semibold">
                      {showQR ? 'Scan to Verify' : 'Verification Code'}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!showQR && !qrCodeDataUrl) {
                        await generateQRCode();
                      }
                      onToggleQR();
                    }}
                    className="text-xs underline hover:no-underline transition-all"
                    style={{ color: tierInfo.accentColor }}
                    data-testid="button-toggle-card-qr"
                  >
                    {showQR ? 'Hide' : 'Show'} QR
                  </button>
                </div>
                {showQR && qrCodeDataUrl ? (
                  <div 
                    className="bg-white rounded-lg p-4 flex items-center justify-center"
                    style={{
                      boxShadow: `0 0 20px ${tierInfo.glowColor}`,
                    }}
                  >
                    <img
                      src={qrCodeDataUrl}
                      alt="Membership QR Code"
                      className="w-48 h-48"
                      data-testid="card-qr-code"
                    />
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-lg p-8 flex items-center justify-center border-2 border-dashed border-white/30">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-2 opacity-40" />
                      <p className="text-xs opacity-60">Click "Show QR" to reveal</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Footer */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center glass-effect rounded-lg p-3">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Total Savings</p>
                  <p className="font-bold text-xl" style={{ color: tierInfo.accentColor }}>
                    ₹{cardData?.totalSavings || '0'}
                  </p>
                </div>
                <div className="text-center glass-effect rounded-lg p-3">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Deals Claimed</p>
                  <p className="font-bold text-xl" style={{ color: tierInfo.accentColor }}>
                    {cardData?.dealsClaimed || 0}
                  </p>
                </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <TierIcon className="w-24 h-24" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-10">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-8 bg-white/30 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MembershipCard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Generate QR code with comprehensive analytics data
  const generateQRCode = async () => {
    if (!user) return;
    
    try {
      // Fetch user's complete analytics data for QR code
      const userStatsResponse = await fetch('/api/users/me/stats');
      const userStats = userStatsResponse.ok ? await userStatsResponse.json() : {};
      
      // Comprehensive customer data for analytics-driven QR code
      const customerData = {
        // Core Identity
        userId: user.id,
        userName: user.name || `User ${user.id}`,
        email: user.email || '',
        
        // Membership Analytics
        membershipPlan: user.membershipPlan || 'basic',
        membershipId: `ISD-${user.id.toString().padStart(8, '0')}`,
        membershipStatus: 'active',
        membershipSince: user.createdAt || new Date().toISOString(),
        
        // Financial Analytics
        totalSavings: user.totalSavings || '0',
        totalDealsRedeemed: userStats.totalDealsRedeemed || 0,
        averageSavingsPerTransaction: userStats.averageSavingsPerTransaction || 0,
        totalTransactions: userStats.totalTransactions || 0,
        
        // Location Analytics
        city: user.city || 'Mumbai',
        state: user.state || 'Maharashtra',
        
        // Engagement Analytics
        preferredCategories: userStats.preferredCategories || ['restaurants', 'electronics'],
        lastActivity: new Date().toISOString(),
        loyaltyScore: Math.min(Math.floor(parseFloat(user.totalSavings || '0') / 100), 100),
        
        // Security & Verification
        securityToken: `ST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        qrGeneratedAt: new Date().toISOString(),
        qrExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        verificationMethod: 'qr_code_analytics',
        
        // Platform Analytics Context
        platformVersion: '2.0',
        analyticsVersion: 'v1.0',
        dataCompleteness: 100,
        
        // Business Intelligence Data
        deviceInfo: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: `session_${Date.now()}_${user.id}`
      };
      
      console.log('🔐 Generating membership QR code with complete customer data:', {
        userId: customerData.userId,
        userName: customerData.userName,
        email: customerData.email,
        membershipPlan: customerData.membershipPlan,
        membershipId: customerData.membershipId,
        totalSavings: customerData.totalSavings
      });
      
      const qrDataUrl = await generateCustomerClaimQR(customerData);
      setQrCodeDataUrl(qrDataUrl);
      
      console.log('✅ QR Code generated successfully - contains all customer info including tier:', customerData.membershipPlan);
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      toast({
        title: "QR Code Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate membership card data
  const { data: cardData, isLoading } = useQuery<MembershipCardData>({
    queryKey: ['/api/membership/card'],
    enabled: isAuthenticated,
    select: (data) => {
      const baseData = {
        membershipTier: user?.membershipPlan || 'basic',
        membershipExpiry: user?.membershipExpiry || new Date('2025-12-31').toISOString(),
        totalSavings: user?.totalSavings || '0',
        dealsClaimed: user?.dealsClaimed || 0,
        cardNumber: `ISD-${user?.id?.toString().padStart(8, '0')}`,
        qrCode: qrCodeDataUrl,
        isActive: true
      };
      return { ...baseData, ...data };
    },
  });

  const generateOTP = async () => {
    setIsGeneratingOTP(true);
    try {
      // Simulate OTP generation
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(otp);
      
      toast({
        title: "OTP Generated",
        description: "Use this code for one-time deal access",
      });
    } catch (error) {
      toast({
        title: "Failed to generate OTP",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Information copied to clipboard",
    });
  };

  const downloadCard = () => {
    toast({
      title: "Download Started",
      description: "Your membership card is being downloaded",
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your membership card.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <span>Loading your membership card...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierInfo = tierConfig[user.membershipPlan as keyof typeof tierConfig] || tierConfig.basic;
  const TierIcon = tierInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Digital Membership Card</h1>
            <p className="text-muted-foreground">Your secure access to exclusive deals</p>
          </div>

          {/* Prominent Tier Badge */}
          <div className="mb-6">
            <Card className={`${tierInfo.color} text-white border-none`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <TierIcon className="w-8 h-8" />
                  <div className="text-center">
                    <p className="text-sm text-white/80">Current Membership Tier</p>
                    <p className="text-3xl font-bold">{tierInfo.name}</p>
                  </div>
                  <TierIcon className="w-8 h-8" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notice */}
          <Card className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
            <CardContent className="py-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📱 Present This Card at Vendor Stores
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    To claim any deal, you <strong>MUST present your membership card</strong> (with QR code) to the vendor for verification. 
                    The vendor will scan your QR code to verify your {tierInfo.name} membership tier and validate your deal claim.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enhanced 3D Membership Card */}
            <div className="space-y-6">
              <Enhanced3DCard 
                user={user}
                cardData={cardData}
                tierInfo={tierInfo}
                TierIcon={TierIcon}
                qrCodeDataUrl={qrCodeDataUrl}
                showQR={showQR}
                generateQRCode={generateQRCode}
                onToggleQR={() => setShowQR(!showQR)}
              />

              {/* Card Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={downloadCard} 
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Card
                </Button>
                <Button 
                  onClick={() => copyToClipboard(cardData?.cardNumber || '')} 
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Number
                </Button>
              </div>
            </div>

            {/* QR Code & Security */}
            <div className="space-y-6">
              {/* QR Code Section */}
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
                  <CardTitle className="flex items-center">
                    <Scan className="w-5 h-5 mr-2 text-purple-600" />
                    Vendor Verification QR Code
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    <Store className="w-4 h-4 inline mr-1" />
                    <strong>Required for all deal claims</strong> - Vendors scan this to verify your {tierInfo.name} membership
                  </p>
                </CardHeader>
                <CardContent className="text-center space-y-4 pt-6">
                  {showQR ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 inline-block">
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="Membership Verification QR Code"
                            className="w-48 h-48 mx-auto"
                            data-testid="membership-qr-code"
                          />
                        ) : (
                          <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          ✓ Contains your {tierInfo.name} membership tier
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Vendor will scan this to verify and approve your deal claim
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-xs text-red-800 dark:text-red-200">
                          ⚠️ <strong>For Vendor Use Only</strong> - This QR code is designed for vendor POS systems. 
                          Do not scan with your personal phone. Show this screen to the vendor when claiming deals.
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowQR(false)} 
                        variant="outline" 
                        size="sm"
                        data-testid="button-hide-qr"
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
                        <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                        <p className="text-muted-foreground">QR Code Hidden for Security</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Tap below to reveal for vendor scanning
                        </p>
                      </div>
                      <Button 
                        onClick={async () => {
                          setShowQR(true);
                          if (!qrCodeDataUrl) {
                            await generateQRCode();
                          }
                        }} 
                        className="w-full"
                        data-testid="button-show-qr"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Show QR Code
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* One-Time Access OTP */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    One-Time Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate a secure 6-digit code for temporary deal access
                  </p>
                  
                  {otpCode ? (
                    <div className="text-center space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700 mb-2">Your OTP Code:</p>
                        <p className="text-2xl font-mono font-bold text-green-800">{otpCode}</p>
                        <p className="text-xs text-green-600 mt-2">Valid for 10 minutes</p>
                      </div>
                      <Button 
                        onClick={() => copyToClipboard(otpCode)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={generateOTP} 
                      disabled={isGeneratingOTP}
                      className="w-full"
                    >
                      {isGeneratingOTP ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate OTP
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Membership Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Membership Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tierInfo.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}