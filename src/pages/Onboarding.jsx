// src/pages/Onboarding.jsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Truck, 
  FileText, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  PlayCircle,
  BookOpen,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: 1,
    title: 'Add Your Farmers',
    description: 'Start by registering your contracted farmers. Track their details, locations, and contact information.',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
    action: '/farmers',
    status: 'ready'
  },
  {
    step: 2,
    title: 'Record Crops',
    description: 'Add crop information for each farmer. Track varieties, acreage, and expected harvest dates.',
    icon: Package,
    color: 'bg-green-100 text-green-600',
    action: '/farmers', // From farmers page
    status: 'ready'
  },
  {
    step: 3,
    title: 'Create Procurement Orders',
    description: 'Manage orders and track deliveries, quantities, and payments in real-time.',
    icon: Truck,
    color: 'bg-purple-100 text-purple-600',
    action: '/procurement',
    status: 'ready'
  },
  {
    step: 4,
    title: 'Monitor Dashboard',
    description: 'Watch your supply chain come to life with real-time analytics and insights.',
    icon: BarChart3,
    color: 'bg-amber-100 text-amber-600',
    action: '/dashboard',
    status: 'ready'
  }
];

const features = [
  {
    title: 'Real-time Tracking',
    description: 'Monitor your supply chain activities as they happen with live updates.',
    icon: Zap
  },
  {
    title: 'Data Security',
    description: 'Your data is securely stored and accessible only to authorized users.',
    icon: Shield
  },
  {
    title: 'Smart Analytics',
    description: 'Get insights into supply-demand trends, crop distribution, and performance metrics.',
    icon: Target
  },
  {
    title: 'Easy Export',
    description: 'Export your data to Excel or PDF for reporting and analysis.',
    icon: FileText
  }
];

export default function Onboarding() {
  return (
    <DashboardLayout
      title="Getting Started"
      description="Learn how to set up and use your supply chain management system"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-8 pb-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <PlayCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Your Supply Chain Dashboard
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Let's set up your agricultural supply chain management system in 4 simple steps.
                Your dashboard will populate with insights as you add data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link to="/">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/farmers">
                    <Users className="h-5 w-5 mr-2" />
                    Add First Farmer
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-gray-700" />
            Getting Started Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <Card key={step.step} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full"></div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${step.color}`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Step {step.step}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={step.action}>
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              Quick Tips for Success
            </CardTitle>
            <CardDescription>
              Best practices to make the most of your supply chain system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Start with Farmers</h4>
                    <p className="text-sm text-gray-600">
                      Add all your contracted farmers first. Include their contact information and locations for better tracking.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Add Crop Details</h4>
                    <p className="text-sm text-gray-600">
                      For each farmer, record their crops, varieties, and acreage. This will populate your analytics.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Create Orders Regularly</h4>
                    <p className="text-sm text-gray-600">
                      Create procurement orders as deliveries happen. Update quantities and payment status in real-time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Monitor Dashboard</h4>
                    <p className="text-sm text-gray-600">
                      Check your dashboard regularly to track supply-demand trends and identify opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Features */}
        <div>
          <h2 className="text-2xl font-bold mb-6">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`p-3 rounded-lg w-fit mb-4 ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-green-100 text-green-600' :
                    index === 2 ? 'bg-purple-100 text-purple-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you get the most out of your supply chain system.
                Contact us for setup assistance or technical support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline">
                  View Documentation
                </Button>
                <Button>
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}