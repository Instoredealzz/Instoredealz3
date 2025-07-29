import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  dealId?: number;
  socialMediaLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  autoSlideDelay: number;
  priority: number;
}

interface BannerCarouselProps {
  page?: string;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  height?: string;
}

export function BannerCarousel({ 
  page = 'home', 
  className = '', 
  autoPlay = true, 
  showControls = true,
  height = 'h-64 sm:h-80'
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch banners for this page
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['/api/promotional-banners/active', page],
    queryFn: () => fetch(`/api/promotional-banners/active/${page}`).then(res => res.json())
  });

  const currentBanner = banners[currentIndex];
  const currentDelay = currentBanner?.autoSlideDelay || 5000;

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return;

    autoSlideRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, currentDelay);

    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [isPlaying, banners.length, currentDelay, currentIndex]);

  // Navigation functions
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrevious();
  };

  // Video player component
  const VideoPlayer = ({ url }: { url: string }) => {
    const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop()?.split('?')[0]
          : url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
      }
      if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`;
      }
      return url;
    };

    return (
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <iframe
          src={getEmbedUrl(url)}
          className="absolute inset-0 w-full h-full object-cover"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${height} bg-muted animate-pulse rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!banners.length) {
    return null;
  }

  return (
    <div className={`relative w-full ${height} ${className}`}>
      <Card className="h-full overflow-hidden">
        <CardContent 
          className="relative h-full p-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main banner content */}
          <div className="relative h-full bg-background">
            {currentBanner?.imageUrl && (
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            
            {currentBanner?.videoUrl && (
              <div className="absolute inset-0">
                <VideoPlayer url={currentBanner.videoUrl} />
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4 sm:p-6">
              {/* Top content */}
              <div className="text-white">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
                  {currentBanner?.title}
                </h2>
                {currentBanner?.description && (
                  <p className="text-sm sm:text-base opacity-90 max-w-md">
                    {currentBanner.description}
                  </p>
                )}
              </div>

              {/* Bottom actions */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {currentBanner?.dealId && (
                  <Button asChild variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black">
                    <Link to={`/deals/${currentBanner.dealId}`}>
                      View Deal
                    </Link>
                  </Button>
                )}
                
                {currentBanner?.socialMediaLinks?.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentBanner.socialMediaLinks?.website, '_blank')}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {showControls && banners.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/30 h-8 w-8 sm:h-10 sm:w-10"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/30 h-8 w-8 sm:h-10 sm:w-10"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}

          {/* Play/Pause button */}
          {showControls && banners.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-white/30 h-8 w-8"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}

          {/* Dots indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}