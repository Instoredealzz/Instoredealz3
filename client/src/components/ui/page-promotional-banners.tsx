import React from 'react';
import { BannerCarousel } from '@/components/ui/banner-carousel';

interface PagePromotionalBannersProps {
  page: string;
  className?: string;
  height?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

export function PagePromotionalBanners({ 
  page, 
  className = '', 
  height = 'h-64 sm:h-80',
  autoPlay = true,
  showControls = true
}: PagePromotionalBannersProps) {
  return (
    <div className={className}>
      <BannerCarousel 
        page={page}
        height={height}
        autoPlay={autoPlay}
        showControls={showControls}
      />
    </div>
  );
}