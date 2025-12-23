export interface Farmer {
  id: string;
  name: string;
  gender: 'male' | 'female';
  ageGroup: '18-25' | '26-35' | '36-45' | '46-55' | '56+';
  county: string;
  ward: string;
  acreage: number;
  crop: string;
  variety: string;
  plantingDate: string;
  harvestWindowStart: string;
  harvestWindowEnd: string;
  estimatedYield: number;
  allocatedQuantity: number;
  unallocatedQuantity: number;
}

export interface Allocation {
  id: string;
  farmerId: string;
  farmerName: string;
  date: string;
  quantity: number;
  status: 'confirmed' | 'pending';
}

export interface DailySupply {
  date: string;
  demand: number;
  allocatedSupply: number;
  balance: number;
  allocatedSuppliers: Array<{
    name: string;
    quantity: number;
    type: 'farmer' | 'internal-aggregator' | 'external-aggregator';
  }>;
}

export interface Aggregator {
  id: string;
  name: string;
  type: 'internal' | 'external';
  county: string;
  reliabilityScore: number;
  averageQuality: number;
  historicalVolume: number;
}

export interface ProcurementRecord {
  id: string;
  date: string;
  supplierName: string;
  sourceType: 'farmer' | 'internal-aggregator' | 'external-aggregator';
  location: string;
  plannedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
  pricePerUnit: number;
  totalValue: number;
  intakeStatus: 'completed' | 'no-intake';
  noIntakeReason?: string;
  paymentStatus: 'paid' | 'pending';
}

export interface Contract {
  id: string;
  supplierName: string;
  supplierType: 'farmer' | 'aggregator';
  contractedAcreage?: number;
  contractedQuantity: number;
  startDate: string;
  endDate: string;
  pricingTerms: string;
  fulfillmentPercentage: number;
  status: 'active' | 'completed' | 'terminated';
}
