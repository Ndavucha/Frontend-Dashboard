// src/pages/FarmMall.jsx
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin,
  Phone,
  ShoppingCart,
  Filter,
  User,
  Star,
  CheckCircle,
  Package,
  ExternalLink,
  Calendar,
  Leaf
} from 'lucide-react';
import { toast } from 'sonner';

export default function FarmMall() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('all');
  
  // Potato varieties with maturity days
  const potatoVarieties = [
    { value: 'Annet', label: 'Annet', days: 90 },
    { value: 'Arizona', label: 'Arizona', days: 90 },
    { value: 'Arnova', label: 'Arnova', days: 90 },
    { value: 'Unica', label: 'Unica', days: 90 },
    { value: 'Asante', label: 'Asante', days: 100 },
    { value: 'Tigoni', label: 'Tigoni', days: 100 },
    { value: 'Nyota', label: 'Nyota', days: 100 },
    { value: 'Sherekea', label: 'Sherekea', days: 100 },
    { value: 'Challenger', label: 'Challenger', days: 120 },
    { value: 'Jelly', label: 'Jelly', days: 120 },
    { value: 'Manitou', label: 'Manitou', days: 120 },
    { value: 'Voyager', label: 'Voyager', days: 120 }
  ];

  // Simple dummy potato farmers from farmmall.co.ke
  const dummyFarmers = [
    {
      id: 1,
      name: 'Green Valley Potato Farmers',
      county: 'Nakuru',
      varieties: ['Annet', 'Arizona', 'Asante'],
      phone: '+254 712 345 678',
      rating: 4.8,
      verified: true,
      price: 'KES 45,000 - 52,000 / ton'
    },
    {
      id: 2,
      name: 'Meru Highlands Potato Co-op',
      county: 'Meru',
      varieties: ['Arnova', 'Unica', 'Tigoni'],
      phone: '+254 723 456 789',
      rating: 4.5,
      verified: true,
      price: 'KES 48,000 - 55,000 / ton'
    },
    {
      id: 3,
      name: 'Eldoret Potato Traders',
      county: 'Uasin Gishu',
      varieties: ['Annet', 'Challenger', 'Manitou'],
      phone: '+254 734 567 890',
      rating: 4.7,
      verified: true,
      price: 'KES 42,000 - 48,000 / ton'
    },
    {
      id: 4,
      name: 'Kiambu Potato Growers',
      county: 'Kiambu',
      varieties: ['Tigoni', 'Nyota', 'Sherekea'],
      phone: '+254 745 678 901',
      rating: 4.3,
      verified: false,
      price: 'KES 50,000 - 58,000 / ton'
    },
    {
      id: 5,
      name: 'Naivasha Potato Farm',
      county: 'Naivasha',
      varieties: ['Unica', 'Asante', 'Jelly'],
      phone: '+254 756 789 012',
      rating: 4.9,
      verified: true,
      price: 'KES 55,000 - 65,000 / ton'
    },
    {
      id: 6,
      name: 'Nyandarua Potato Alliance',
      county: 'Nyandarua',
      varieties: ['Voyager', 'Challenger', 'Arizona'],
      phone: '+254 767 890 123',
      rating: 4.6,
      verified: true,
      price: 'KES 40,000 - 46,000 / ton'
    }
  ];

  // Filter farmers
  const filteredFarmers = dummyFarmers.filter(farmer => {
    const matchesSearch = searchQuery === '' || 
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.varieties.some(variety => variety.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesVariety = selectedVariety === 'all' || 
      farmer.varieties.some(variety => variety === selectedVariety);
    
    return matchesSearch && matchesVariety;
  });

  // Handle selecting a farmer
  const handleSelectFarmer = (farmer) => {
    toast.success(`Selected ${farmer.name} for procurement`);
    // In real app, this would navigate to procurement page
    console.log('Selected farmer:', farmer);
  };

  return (
    <DashboardLayout
      title="FarmMall Marketplace"
      description="Browse potato farmers from farmmall.co.ke"
    >
      {/* Hero Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">FarmMall - Potato Farmers</h1>
              <p className="text-gray-600">
                Browse potato farmers and varieties from <a href="https://farmmall.co.ke" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">farmmall.co.ke</a>
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.open('https://farmmall.co.ke', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Visit FarmMall
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search farmers by name, county, or potato variety..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Variety Filter */}
            <div>
              <p className="text-sm font-medium mb-2">Filter by Potato Variety:</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedVariety === 'all' ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedVariety('all')}
                >
                  All Varieties
                </Badge>
                {potatoVarieties.map((variety) => (
                  <Badge
                    key={variety.value}
                    variant={selectedVariety === variety.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedVariety(variety.value)}
                  >
                    {variety.label}
                    <span className="ml-1 text-xs opacity-70">({variety.days}d)</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Potato Farmers ({filteredFarmers.length})
        </h2>
        <p className="text-gray-600 text-sm">
          Select a farmer to create a procurement order
        </p>
      </div>

      {/* Farmers Grid */}
      {filteredFarmers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No potato farmers found
            </h3>
            <p className="text-gray-500">
              Try different search terms or clear filters
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedVariety('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFarmers.map((farmer) => (
            <Card key={farmer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Farmer Info */}
                <div className="space-y-4">
                  {/* Name and Rating */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{farmer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {farmer.verified && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 font-semibold">{farmer.rating}</span>
                    </div>
                  </div>

                  {/* Location and Contact */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{farmer.county} County</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{farmer.phone}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-semibold text-green-700">{farmer.price}</p>
                  </div>

                  {/* Potato Varieties */}
                  <div>
                    <p className="text-sm font-medium mb-2">Available Potato Varieties:</p>
                    <div className="flex flex-wrap gap-2">
                      {farmer.varieties.map((variety) => {
                        const varietyInfo = potatoVarieties.find(v => v.value === variety);
                        return (
                          <Badge key={variety} variant="secondary" className="gap-1">
                            <Leaf className="h-3 w-3" />
                            {variety}
                            {varietyInfo && (
                              <span className="text-xs opacity-70 ml-1">({varietyInfo.days}d)</span>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleSelectFarmer(farmer)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Select Farmer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Potato Varieties Info Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Potato Varieties Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Here are the available potato varieties with their maturity periods:
            </p>
            
            {/* Early Varieties (90 days) */}
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Early Varieties (90 days):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {potatoVarieties
                  .filter(v => v.days === 90)
                  .map(variety => (
                    <Badge key={variety.value} variant="outline" className="justify-center">
                      {variety.label}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Mid-Season Varieties (100 days) */}
            <div>
              <h4 className="font-semibold text-amber-700 mb-2">Mid-Season Varieties (100 days):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {potatoVarieties
                  .filter(v => v.days === 100)
                  .map(variety => (
                    <Badge key={variety.value} variant="outline" className="justify-center">
                      {variety.label}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Late Varieties (120 days) */}
            <div>
              <h4 className="font-semibold text-red-700 mb-2">Late Varieties (120 days):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {potatoVarieties
                  .filter(v => v.days === 120)
                  .map(variety => (
                    <Badge key={variety.value} variant="outline" className="justify-center">
                      {variety.label}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* FarmMall Info */}
            <div className="p-3 bg-blue-50 rounded-lg mt-4">
              <p className="text-sm">
                All farmers are sourced from <a href="https://farmmall.co.ke" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">farmmall.co.ke</a> - Kenya's digital agricultural marketplace.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}