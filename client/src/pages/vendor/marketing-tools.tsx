import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Megaphone,
  TrendingUp,
  BarChart3,
  Users,
  Share2,
  Target,
  Smartphone,
  Mail,
  Image as ImageIcon,
  Eye,
  MessageCircle,
  Star,
  Calendar,
  Gift,
  Zap,
  Crown
} from "lucide-react";

export default function MarketingTools() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const marketingFeatures = [
    {
      icon: Megaphone,
      title: "Promotional Banners",
      description: "Create eye-catching banners to highlight your best deals across the platform",
      features: ["Custom banner designs", "Scheduled campaigns", "A/B testing"],
      comingSoon: false
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track your deal performance with detailed insights and metrics",
      features: ["Real-time views", "Conversion rates", "Customer demographics"],
      comingSoon: false
    },
    {
      icon: Share2,
      title: "Social Media Integration",
      description: "Share your deals directly to social media platforms with one click",
      features: ["Auto-posting", "Custom captions", "Performance tracking"],
      comingSoon: true
    },
    {
      icon: Users,
      title: "Customer Insights",
      description: "Understand your customer base with advanced analytics",
      features: ["Buyer personas", "Purchase patterns", "Retention metrics"],
      comingSoon: false
    },
    {
      icon: Target,
      title: "Targeted Campaigns",
      description: "Reach the right customers at the right time with targeted marketing",
      features: ["Location-based targeting", "Category preferences", "Time-based triggers"],
      comingSoon: true
    },
    {
      icon: Mail,
      title: "Email Marketing",
      description: "Send personalized deal notifications to interested customers",
      features: ["Custom templates", "Automated campaigns", "Engagement tracking"],
      comingSoon: true
    }
  ];

  const toolsCategories = [
    {
      icon: ImageIcon,
      title: "Creative Assets",
      description: "Access templates and design tools for your marketing materials",
      link: "#"
    },
    {
      icon: Eye,
      title: "Deal Visibility",
      description: "Optimize your deals to appear in top search results",
      link: "/vendor/deals"
    },
    {
      icon: MessageCircle,
      title: "Customer Engagement",
      description: "Tools to interact with customers and build loyalty",
      link: "#"
    },
    {
      icon: Star,
      title: "Review Management",
      description: "Monitor and respond to customer reviews",
      link: "/vendor/dashboard"
    }
  ];

  const pricingTiers = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "Analytics dashboard",
        "Up to 10 deals",
        "Basic customer insights",
        "Standard support"
      ],
      current: true
    },
    {
      name: "Pro",
      price: "₹999/mo",
      features: [
        "Everything in Basic",
        "Unlimited deals",
        "Promotional banners",
        "Advanced analytics",
        "Priority support",
        "Email campaigns"
      ],
      current: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options",
        "API access",
        "Custom reporting"
      ],
      current: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Marketing Tools for Vendors</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Grow your business with powerful marketing tools designed to help you reach more customers 
            and maximize your deal performance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {marketingFeatures.map((feature) => (
            <Card key={feature.title} className="relative">
              {feature.comingSoon && (
                <Badge className="absolute top-4 right-4" variant="secondary">
                  Coming Soon
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Quick Access Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolsCategories.map((tool) => (
              <Link key={tool.title} to={tool.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 rounded-full bg-primary/10">
                        <tool.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-lg">{tool.title}</CardTitle>
                    <CardDescription className="text-center">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Marketing Packages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={tier.current ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    {tier.current && (
                      <Badge variant="default">Current Plan</Badge>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-primary">{tier.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Crown className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.current ? "outline" : "default"}
                    disabled={tier.current}
                    data-testid={`button-${tier.name.toLowerCase()}-plan`}
                  >
                    {tier.current ? "Current Plan" : tier.price === "Custom" ? "Contact Sales" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-royal/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Need Help Getting Started?</CardTitle>
            <CardDescription>
              Our marketing experts are here to help you create effective campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/help">
                <Button variant="default" data-testid="button-marketing-support">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link to="/vendor/dashboard">
                <Button variant="outline" data-testid="button-view-analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Your Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
