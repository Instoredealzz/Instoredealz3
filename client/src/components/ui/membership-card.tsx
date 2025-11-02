import { QrCode, User, Sparkles, Crown, Shield, Star } from "lucide-react";
import { generateCustomerClaimQR } from "@/lib/qr-code";
import { useEffect, useState, useRef } from "react";

interface MembershipCardProps {
  userName: string;
  membershipId: string;
  membershipPlan: string;
  expiryDate?: string;
  totalSavings: string;
  isPromotionalUser?: boolean;
  userId: number;
  profileImage?: string;
  userEmail?: string;
  userPhone?: string;
  createdAt?: string;
}

export default function MembershipCard({
  userName,
  membershipId,
  membershipPlan,
  expiryDate,
  totalSavings,
  isPromotionalUser,
  userId,
  profileImage,
  userEmail,
  userPhone,
  createdAt,
}: MembershipCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);
  const lightOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const customerData = {
          userId,
          userName,
          email: userEmail || `user${userId}@instoredealz.com`,
          membershipPlan,
          membershipId,
          phone: userPhone,
          totalSavings
        };
        
        console.log('🔐 Generating QR Code with customer data:', customerData);
        
        const qrCode = await generateCustomerClaimQR(customerData);
        setQrCodeUrl(qrCode);
        
        console.log('✅ QR Code generated successfully with all customer information including membership tier:', membershipPlan);
      } catch (error) {
        console.error('❌ Error generating QR code:', error);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(membershipId)}`);
      }
    };
    
    generateQR();
  }, [userId, membershipId, userName, userEmail, membershipPlan, userPhone, totalSavings]);

  // Optimized 3D Tilt Effect using direct DOM manipulation
  useEffect(() => {
    const card = cardRef.current;
    const lightOverlay = lightOverlayRef.current;
    if (!card || !lightOverlay) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        const lightX = (x / rect.width) * 100;
        const lightY = (y / rect.height) * 100;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        lightOverlay.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.15) 0%, transparent 50%)`;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      lightOverlay.style.background = 'transparent';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getTierConfig = (plan: string | null | undefined) => {
    const planLower = (plan || 'basic').toLowerCase();
    
    switch (planLower) {
      case "premium":
        return {
          gradient: "from-blue-600 via-purple-600 to-indigo-700",
          glow: "rgba(147, 51, 234, 0.6)",
          accent: "#a855f7",
          icon: Crown,
          name: "PREMIUM"
        };
      case "ultimate":
        return {
          gradient: "from-amber-500 via-orange-500 to-yellow-600",
          glow: "rgba(251, 191, 36, 0.7)",
          accent: "#fbbf24",
          icon: Star,
          name: "ULTIMATE"
        };
      default:
        return {
          gradient: "from-slate-600 via-slate-700 to-slate-800",
          glow: "rgba(148, 163, 184, 0.5)",
          accent: "#94a3b8",
          icon: Shield,
          name: "BASIC"
        };
    }
  };

  const formatSavings = (savings: string) => {
    const amount = parseFloat(savings);
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const tierConfig = getTierConfig(membershipPlan);
  const TierIcon = tierConfig.icon;
  const memberSince = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  const expiryYear = expiryDate ? new Date(expiryDate).getFullYear() : 2025;

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px ${tierConfig.glow}, 0 0 40px ${tierConfig.glow}; }
          50% { box-shadow: 0 0 30px ${tierConfig.glow}, 0 0 60px ${tierConfig.glow}; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .membership-card-3d {
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

      <div className="perspective-1500" data-testid="membership-card-enhanced">
        <div
          ref={cardRef}
          className="membership-card-3d glow-border"
          style={{
            borderRadius: '20px',
          }}
        >
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tierConfig.gradient} text-white shadow-2xl`}>
            {/* Metallic Shine Effect */}
            <div className="metallic-shine" />
            
            {/* Reflection Overlay */}
            <div className="reflection-overlay" />

            {/* Dynamic Light Effect from tilt */}
            <div 
              ref={lightOverlayRef}
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                borderRadius: 'inherit',
              }}
            />

            {/* Card Pattern */}
            <div className="card-pattern absolute inset-0" />

            {/* Card Content */}
            <div className="relative z-10 p-6">
              {/* Header with Logo */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" style={{ color: tierConfig.accent }} />
                    <h3 className="text-lg font-bold tracking-wider" style={{ 
                      textShadow: `0 0 10px ${tierConfig.glow}` 
                    }}>
                      INSTOREDEALZ
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TierIcon className="w-4 h-4" style={{ color: tierConfig.accent }} />
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-90">
                      {tierConfig.name} Member
                    </span>
                  </div>
                </div>
                <div className="glass-effect rounded-lg px-3 py-1">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>

              {/* Member Info */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={userName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                      data-testid="card-profile-image"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                      <User className="w-6 h-6 text-white/60" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold tracking-wide" style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {userName}
                    </h2>
                    <p className="text-xs text-white/70 font-mono tracking-wider">
                      {membershipId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Membership Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass-effect rounded-lg p-2.5">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">Member Since</p>
                  <p className="font-bold text-lg">{memberSince}</p>
                </div>
                <div className="glass-effect rounded-lg p-2.5">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">Expiry</p>
                  <p className="font-bold text-lg">{expiryYear}</p>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="glass-effect rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5" style={{ color: tierConfig.accent }} />
                    <p className="text-xs uppercase tracking-wider font-semibold">
                      Verification Code
                    </p>
                  </div>
                </div>
                {qrCodeUrl ? (
                  <div 
                    className="bg-white rounded-lg p-2 flex items-center justify-center"
                    style={{
                      boxShadow: `0 0 15px ${tierConfig.glow}`,
                    }}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Membership QR Code"
                      className="w-24 h-24"
                      data-testid="card-qr-code"
                    />
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-lg p-6 flex items-center justify-center border-2 border-dashed border-white/30">
                    <QrCode className="w-12 h-12 opacity-40" />
                  </div>
                )}
              </div>

              {/* Savings Footer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center glass-effect rounded-lg p-2.5">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">Total Savings</p>
                  <p className="font-bold text-lg" style={{ color: tierConfig.accent }}>
                    {formatSavings(totalSavings)}
                  </p>
                </div>
                <div className="text-center glass-effect rounded-lg p-2.5">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">Tier Level</p>
                  <p className="font-bold text-lg uppercase" style={{ color: tierConfig.accent }}>
                    {tierConfig.name}
                  </p>
                </div>
              </div>

              {/* Promotional Banner */}
              {isPromotionalUser && expiryDate && (
                <div className="absolute top-2 left-2 right-2 bg-success/20 backdrop-blur-sm rounded-lg p-2 border border-success/30">
                  <p className="text-xs text-center font-medium">
                    🎉 Free Premium until {new Date(expiryDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}

              {/* Decorative Corner Elements */}
              <div className="absolute top-4 right-4 opacity-10">
                <TierIcon className="w-20 h-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
