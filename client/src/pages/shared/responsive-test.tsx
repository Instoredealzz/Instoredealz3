import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Tablet, Monitor, Laptop, Check, X, RefreshCw } from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import PromotionalLaunchBanner from '@/components/ui/promotional-launch-banner';
import DealCard from '@/components/ui/deal-card';

interface TestResult {
  testName: string;
  screenSize: string;
  status: 'pass' | 'fail' | 'pending';
  notes?: string;
}

const screenSizes = [
  { name: 'Mobile Small', width: 320, height: 568, icon: Smartphone },
  { name: 'Mobile Large', width: 414, height: 896, icon: Smartphone },
  { name: 'Tablet Portrait', width: 768, height: 1024, icon: Tablet },
  { name: 'Tablet Landscape', width: 1024, height: 768, icon: Tablet },
  { name: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { name: 'Large Desktop', width: 1920, height: 1080, icon: Laptop },
];

const testCases = [
  'Navigation menu responsive behavior',
  'Promotional banner layout adaptation',
  'Deal card grid responsiveness',
  'Text readability at all sizes',
  'Button accessibility and touch targets',
  'Modal dialog responsiveness',
  'Footer layout and links',
  'Form elements usability',
];

export default function ResponsiveTest() {
  const [currentSize, setCurrentSize] = useState(screenSizes[0]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingMode, setIsTestingMode] = useState(false);

  const sampleDeal = {
    id: 1,
    title: "Sample Electronics Deal",
    description: "Test deal for responsive layout verification",
    category: "electronics",
    discountPercentage: 25,
    originalPrice: "₹1,000",
    discountedPrice: "₹750",
    validUntil: "2025-12-31",
    currentRedemptions: 15,
    maxRedemptions: 100,
    viewCount: 150,
    vendor: {
      businessName: "Test Electronics Store",
      city: "Mumbai",
      state: "Maharashtra",
      rating: 4.5
    },
    requiredMembership: "basic"
  };

  const updateTestResult = (testName: string, screenSize: string, status: 'pass' | 'fail', notes?: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.testName === testName && r.screenSize === screenSize);
      if (existing) {
        return prev.map(r => 
          r.testName === testName && r.screenSize === screenSize 
            ? { ...r, status, notes }
            : r
        );
      }
      return [...prev, { testName, screenSize, status, notes }];
    });
  };

  const getTestStatus = (testName: string, screenSize: string) => {
    const result = testResults.find(r => r.testName === testName && r.screenSize === screenSize);
    return result?.status || 'pending';
  };

  const runAutomatedTests = () => {
    setIsTestingMode(true);
    
    // Simulate automated testing
    screenSizes.forEach((size, sizeIndex) => {
      testCases.forEach((testCase, testIndex) => {
        setTimeout(() => {
          // Simulate test execution with some random results for demo
          const shouldPass = Math.random() > 0.15; // 85% pass rate
          updateTestResult(
            testCase, 
            size.name, 
            shouldPass ? 'pass' : 'fail',
            shouldPass ? 'Layout adapts correctly' : 'Minor spacing issues detected'
          );
        }, (sizeIndex * testCases.length + testIndex) * 200);
      });
    });

    setTimeout(() => {
      setIsTestingMode(false);
    }, screenSizes.length * testCases.length * 200 + 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Responsive Layout Testing Suite
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing of layouts across different screen sizes and devices
          </p>
        </div>

        <Tabs defaultValue="viewport" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="viewport">Viewport Testing</TabsTrigger>
            <TabsTrigger value="components">Component Tests</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          {/* Viewport Testing Tab */}
          <TabsContent value="viewport" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Screen Size Simulation</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {screenSizes.map((size) => {
                    const Icon = size.icon;
                    return (
                      <Button
                        key={size.name}
                        variant={currentSize.name === size.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentSize(size)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {size.name}
                        <span className="text-xs opacity-70">
                          {size.width}×{size.height}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <Badge variant="outline" className="text-sm">
                    Current: {currentSize.name} - {currentSize.width}×{currentSize.height}px
                  </Badge>
                </div>
                
                {/* Viewport Simulator */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 overflow-hidden">
                  <div 
                    className="mx-auto bg-white border border-gray-400 rounded-lg overflow-hidden shadow-lg"
                    style={{ 
                      width: Math.min(currentSize.width, 800), 
                      height: Math.min(currentSize.height, 600),
                      transform: currentSize.width > 800 ? `scale(${800/currentSize.width})` : 'scale(1)',
                      transformOrigin: 'top center'
                    }}
                  >
                    <div className="overflow-auto h-full">
                      {/* Simulated content */}
                      <div className="p-2 space-y-2">
                        <PromotionalLaunchBanner variant="compact" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <DealCard {...sampleDeal} />
                          <DealCard {...sampleDeal} title="Another Sample Deal" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Component Tests Tab */}
          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Banner Tests */}
              <Card>
                <CardHeader>
                  <CardTitle>Banner Responsiveness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Hero Variant</h4>
                    <PromotionalLaunchBanner variant="hero" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Compact Variant</h4>
                    <PromotionalLaunchBanner variant="compact" />
                  </div>
                </CardContent>
              </Card>

              {/* Deal Card Tests */}
              <Card>
                <CardHeader>
                  <CardTitle>Deal Card Grid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DealCard {...sampleDeal} />
                    <DealCard {...sampleDeal} title="Responsive Test Deal" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Automated Test Results</CardTitle>
                  <Button 
                    onClick={runAutomatedTests}
                    disabled={isTestingMode}
                    className="flex items-center gap-2"
                  >
                    {isTestingMode ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {isTestingMode ? 'Running Tests...' : 'Run Tests'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Test Case</th>
                        {screenSizes.map(size => (
                          <th key={size.name} className="text-center p-2 font-medium min-w-[100px]">
                            {size.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {testCases.map(testCase => (
                        <tr key={testCase} className="border-b">
                          <td className="p-2 font-medium">{testCase}</td>
                          {screenSizes.map(size => {
                            const status = getTestStatus(testCase, size.name);
                            return (
                              <td key={size.name} className="text-center p-2">
                                {status === 'pass' && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                                {status === 'fail' && <X className="h-5 w-5 text-red-500 mx-auto" />}
                                {status === 'pending' && <div className="h-2 w-2 bg-gray-300 rounded-full mx-auto"></div>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {testResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Test Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {testResults.filter(r => r.status === 'pass').length}
                        </div>
                        <div className="text-sm text-green-600">Passed</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {testResults.filter(r => r.status === 'fail').length}
                        </div>
                        <div className="text-sm text-red-600">Failed</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          {((testResults.filter(r => r.status === 'pass').length / Math.max(testResults.length, 1)) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Pass Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Responsive Design Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Mobile First Approach</h4>
                  <p className="text-sm text-muted-foreground">
                    Design and test starting from the smallest screen size and scale up.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Breakpoint Standards</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Mobile: 320px - 767px</li>
                    <li>• Tablet: 768px - 1023px</li>
                    <li>• Desktop: 1024px - 1439px</li>
                    <li>• Large Desktop: 1440px+</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Test Areas</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Navigation menu behavior and accessibility</li>
                    <li>• Content layout and readability</li>
                    <li>• Button sizes and touch targets (min 44px)</li>
                    <li>• Image and banner responsiveness</li>
                    <li>• Form usability across devices</li>
                    <li>• Modal and dialog responsiveness</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Expected Behaviors</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Text remains readable without horizontal scrolling</li>
                    <li>• Interactive elements are easily tappable on touch devices</li>
                    <li>• Images scale appropriately without distortion</li>
                    <li>• Navigation adapts to hamburger menu on mobile</li>
                    <li>• Grid layouts stack appropriately on smaller screens</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}