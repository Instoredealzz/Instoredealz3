import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Headphones,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  FileText,
  Users,
  TrendingUp,
  Shield,
  HelpCircle,
  Lightbulb,
  Zap
} from "lucide-react";

export default function BusinessSupport() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Get instant help from our support team",
      availability: "Mon-Sat, 9 AM - 6 PM IST",
      responseTime: "< 5 minutes",
      action: "Start Chat",
      link: "/help",
      badge: "Fastest"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed queries via email",
      availability: "24/7",
      responseTime: "< 24 hours",
      action: "Send Email",
      link: "mailto:support@instoredealz.com",
      badge: null
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      availability: "Mon-Sat, 9 AM - 6 PM IST",
      responseTime: "Immediate",
      action: "Call Now",
      link: "tel:+919004408584",
      badge: "Priority"
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Browse our comprehensive help articles",
      availability: "24/7",
      responseTime: "Self-service",
      action: "Browse Articles",
      link: "/help",
      badge: null
    }
  ];

  const businessResources = [
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step guides for getting started",
      topics: ["Account setup", "Creating deals", "Using POS system", "Analytics dashboard"],
      link: "#"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Technical guides and API references",
      topics: ["API integration", "Best practices", "Security guidelines", "Terms of service"],
      link: "/help"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other vendors and share insights",
      topics: ["Success stories", "Tips & tricks", "Feature requests", "Networking"],
      link: "#"
    },
    {
      icon: TrendingUp,
      title: "Growth Resources",
      description: "Learn how to maximize your business potential",
      topics: ["Marketing strategies", "Deal optimization", "Customer retention", "Analytics"],
      link: "/vendor/marketing-tools"
    }
  ];

  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        "How do I create my first deal?",
        "What documents do I need for verification?",
        "How long does approval take?",
        "What are the fees and commissions?"
      ]
    },
    {
      title: "Deal Management",
      questions: [
        "How do I edit an active deal?",
        "Can I pause or deactivate deals?",
        "How do deal redemptions work?",
        "What happens if a customer disputes?"
      ]
    },
    {
      title: "Payment & Billing",
      questions: [
        "When do I receive payments?",
        "What are the payment methods?",
        "How are commissions calculated?",
        "Can I get an invoice for tax purposes?"
      ]
    },
    {
      title: "Technical Support",
      questions: [
        "How do I integrate the POS system?",
        "What if the verification fails?",
        "How do I access API documentation?",
        "What browsers are supported?"
      ]
    }
  ];

  const dedicatedSupport = [
    {
      tier: "Basic",
      features: [
        "Email support",
        "Knowledge base access",
        "Community forum",
        "< 24 hour response"
      ],
      highlight: false
    },
    {
      tier: "Pro",
      features: [
        "Priority email support",
        "Live chat support",
        "Phone support",
        "< 4 hour response",
        "Dedicated account rep"
      ],
      highlight: true
    },
    {
      tier: "Enterprise",
      features: [
        "24/7 priority support",
        "Dedicated success manager",
        "Custom SLA",
        "On-site training",
        "Direct hotline"
      ],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Headphones className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Business Support Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're here to help your business succeed. Get the support you need, when you need it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportChannels.map((channel) => (
            <Card key={channel.title} className="relative hover:shadow-lg transition-shadow">
              {channel.badge && (
                <Badge className="absolute top-4 right-4" variant="default">
                  {channel.badge}
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <channel.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-lg">{channel.title}</CardTitle>
                <CardDescription className="text-center">{channel.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{channel.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">{channel.responseTime}</span>
                </div>
                {channel.link.startsWith('http') || channel.link.startsWith('mailto:') || channel.link.startsWith('tel:') ? (
                  <a href={channel.link}>
                    <Button className="w-full mt-4" data-testid={`button-${channel.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {channel.action}
                    </Button>
                  </a>
                ) : (
                  <Link to={channel.link}>
                    <Button className="w-full mt-4" data-testid={`button-${channel.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {channel.action}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Business Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {businessResources.map((resource) => (
              <Card key={resource.title}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <resource.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{resource.title}</CardTitle>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {resource.topics.map((topic) => (
                      <li key={topic} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <Link to={resource.link}>
                    <Button variant="outline" className="w-full" data-testid={`button-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqCategories.map((category) => (
              <Card key={category.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.questions.map((question) => (
                      <li key={question} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                          {question}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/help">
              <Button variant="outline" data-testid="button-view-all-faqs">
                View All FAQs
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Dedicated Support Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {dedicatedSupport.map((plan) => (
              <Card key={plan.tier} className={plan.highlight ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center justify-between">
                    {plan.tier}
                    {plan.highlight && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Still Need Help?</CardTitle>
            <CardDescription>
              Our support team is ready to assist you with any questions or concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:support@instoredealz.com">
                <Button variant="default" data-testid="button-contact-support">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </a>
              <a href="tel:+919004408584">
                <Button variant="outline" data-testid="button-call-support">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: 90044 08584
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
